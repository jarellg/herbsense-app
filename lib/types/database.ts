export interface Profile {
  id: string;
  created_at: string;
  plan: 'free' | 'pro';
  updated_at: string;
}

export interface Entitlement {
  user_id: string;
  is_pro: boolean;
  period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  updated_at: string;
}

export interface Scan {
  id: string;
  user_id: string;
  created_at: string;
  top_species: string | null;
  top_common_name: string | null;
  confidence: number | null;
  thumbnail_url: string | null;
  raw_json: any;
}

export interface Favorite {
  id: string;
  user_id: string;
  species: string;
  common_name: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

export interface Monograph {
  id: string;
  species: string;
  common_name: string;
  taxonomy: any;
  overview: string | null;
  medicinal_properties: MedicinalProperty[];
  preparations: Preparation[];
  dosage_guidance: string | null;
  contraindications: string[];
  interactions: string[];
  toxicity: string | null;
  evidence_level: 'A' | 'B' | 'C' | 'D' | null;
  safety_notes: string[];
  region_notes: string[];
  created_at: string;
  updated_at: string;
}

export interface MedicinalProperty {
  name: string;
  summary: string;
  evidence: string;
}

export interface Preparation {
  form: string;
  instructions: string;
}

export interface Citation {
  id: string;
  monograph_id: string;
  source_name: string;
  authors: string | null;
  year: string | null;
  url: string | null;
  publisher: string | null;
  pages: string | null;
  note: string | null;
  created_at: string;
}

export interface IdentificationCandidate {
  species: string;
  commonName: string;
  confidence: number;
  thumbnailUrl?: string;
}

export interface IdentificationResponse {
  requestId: string;
  candidates: IdentificationCandidate[];
  needsUpgrade?: boolean;
}
