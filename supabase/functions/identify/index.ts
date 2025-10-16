import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface IdentificationCandidate {
  species: string;
  commonName: string;
  confidence: number;
  thumbnailUrl?: string;
}

interface IdentificationResponse {
  requestId: string;
  candidates: IdentificationCandidate[];
  needsUpgrade?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: entitlement } = await supabase
      .from("entitlements")
      .select("is_pro, period_end")
      .eq("user_id", user.id)
      .maybeSingle();

    const isPro = entitlement?.is_pro && 
      entitlement.period_end && 
      new Date(entitlement.period_end) > new Date();

    if (!isPro) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("scans")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", oneDayAgo);

      const freeScansPerDay = parseInt(Deno.env.get("FREE_SCANS_PER_DAY") || "5", 10);
      
      if (count && count >= freeScansPerDay) {
        return new Response(
          JSON.stringify({ 
            error: "Daily scan limit reached",
            needsUpgrade: true,
            scansRemaining: 0
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    let imageBase64: string;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      imageBase64 = body.imageBase64;
      
      if (!imageBase64) {
        return new Response(
          JSON.stringify({ error: "Missing imageBase64 in request body" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("image") as File;
      
      if (!file) {
        return new Response(
          JSON.stringify({ error: "Missing image file" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      imageBase64 = btoa(String.fromCharCode(...bytes));
    } else {
      return new Response(
        JSON.stringify({ error: "Unsupported content type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageSize = (imageBase64.length * 3) / 4;
    if (imageSize > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "Image size exceeds 5MB limit" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const provider = Deno.env.get("PLANT_PROVIDER") || "mock";
    let candidates: IdentificationCandidate[] = [];

    if (provider === "plantid") {
      candidates = await identifyWithPlantId(imageBase64);
    } else if (provider === "plantnet") {
      candidates = await identifyWithPlantNet(imageBase64);
    } else {
      candidates = getMockCandidates();
    }

    const requestId = crypto.randomUUID();

    if (candidates.length > 0) {
      const topCandidate = candidates[0];
      await supabase.from("scans").insert({
        user_id: user.id,
        top_species: topCandidate.species,
        top_common_name: topCandidate.commonName,
        confidence: topCandidate.confidence,
        thumbnail_url: topCandidate.thumbnailUrl,
        raw_json: { requestId, candidates, provider },
      });
    }

    const response: IdentificationResponse = {
      requestId,
      candidates,
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Identification error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function identifyWithPlantId(imageBase64: string): Promise<IdentificationCandidate[]> {
  const apiKey = Deno.env.get("PLANTID_API_KEY");
  if (!apiKey) {
    throw new Error("PLANTID_API_KEY not configured");
  }

  const response = await fetch("https://api.plant.id/v2/identify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": apiKey,
    },
    body: JSON.stringify({
      images: [`data:image/jpeg;base64,${imageBase64}`],
      modifiers: ["similar_images"],
      plant_details: ["common_names"],
    }),
  });

  if (!response.ok) {
    throw new Error(`Plant.id API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  return (data.suggestions || []).slice(0, 5).map((suggestion: any) => ({
    species: suggestion.plant_name,
    commonName: suggestion.plant_details?.common_names?.[0] || suggestion.plant_name,
    confidence: suggestion.probability,
    thumbnailUrl: suggestion.similar_images?.[0]?.url,
  }));
}

async function identifyWithPlantNet(imageBase64: string): Promise<IdentificationCandidate[]> {
  const apiKey = Deno.env.get("PLANTNET_API_KEY");
  if (!apiKey) {
    throw new Error("PLANTNET_API_KEY not configured");
  }

  const blob = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));
  const formData = new FormData();
  formData.append("images", new Blob([blob], { type: "image/jpeg" }));
  formData.append("organs", "auto");

  const response = await fetch(
    `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Pl@ntNet API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  return (data.results || []).slice(0, 5).map((result: any) => ({
    species: result.species.scientificNameWithoutAuthor,
    commonName: result.species.commonNames?.[0] || result.species.scientificNameWithoutAuthor,
    confidence: result.score,
    thumbnailUrl: result.images?.[0]?.url?.s,
  }));
}

function getMockCandidates(): IdentificationCandidate[] {
  const mockPlants = [
    { species: "Matricaria chamomilla", commonName: "German Chamomile", confidence: 0.92 },
    { species: "Mentha × piperita", commonName: "Peppermint", confidence: 0.85 },
    { species: "Curcuma longa", commonName: "Turmeric", confidence: 0.78 },
    { species: "Zingiber officinale", commonName: "Ginger", confidence: 0.71 },
    { species: "Echinacea purpurea", commonName: "Purple Coneflower", confidence: 0.64 },
  ];

  return mockPlants;
}
