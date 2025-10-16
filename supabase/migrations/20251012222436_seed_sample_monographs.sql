/*
  # Seed Sample Monographs

  ## Overview
  Populates the database with 10 conservative, evidence-based herbal monographs for demonstration purposes.
  All information is educational only and based on traditional use and available research.

  ## Plants Included
  1. Matricaria chamomilla (German Chamomile)
  2. Mentha × piperita (Peppermint)
  3. Curcuma longa (Turmeric)
  4. Zingiber officinale (Ginger)
  5. Echinacea purpurea (Purple Coneflower)
  6. Aloe barbadensis (Aloe Vera)
  7. Plantago major (Common Plantain)
  8. Taraxacum officinale (Dandelion)
  9. Lavandula angustifolia (Lavender)
  10. Calendula officinalis (Calendula)

  ## Important Notes
  - All dosages are conservative and for educational purposes
  - Evidence levels are assigned based on available research
  - Citations are placeholders and should be replaced with actual sources
  - All content emphasizes consulting healthcare professionals
*/

-- Insert Chamomile
INSERT INTO monographs (species, common_name, taxonomy, overview, medicinal_properties, preparations, dosage_guidance, contraindications, interactions, toxicity, evidence_level, safety_notes, region_notes)
VALUES (
  'Matricaria chamomilla',
  'German Chamomile',
  '{"family": "Asteraceae", "genus": "Matricaria"}',
  'German Chamomile is a gentle herb traditionally used for digestive comfort and relaxation. Its flowers contain anti-inflammatory compounds including bisabolol and chamazulene.',
  '[
    {"name": "Digestive Support", "summary": "May help soothe digestive discomfort and reduce inflammation in the GI tract", "evidence": "Multiple clinical trials support use for digestive complaints"},
    {"name": "Mild Sedative", "summary": "Traditionally used to promote relaxation and support sleep quality", "evidence": "Some clinical evidence for mild anxiolytic effects"}
  ]',
  '[
    {"form": "Tea", "instructions": "Steep 1-2 teaspoons dried flowers in 8 oz hot water for 5-10 minutes. Drink 2-3 times daily."},
    {"form": "Tincture", "instructions": "Take 30-60 drops (1.5-3 mL) in water, 2-3 times daily."}
  ]',
  'Tea: 2-4 cups daily\nTincture: 1.5-3 mL three times daily\n\nAlways start with lower doses and consult a healthcare provider.',
  '["Allergy to Asteraceae family plants", "Pregnancy (consult healthcare provider first)", "Scheduled surgery (discontinue 2 weeks prior)"]',
  '["May interact with sedative medications", "May interact with anticoagulant drugs", "May affect metabolism of some medications"]',
  'Generally recognized as safe when used appropriately. Allergic reactions possible in sensitive individuals.',
  'B',
  '["Keep out of reach of children", "Store in cool, dry place", "Consult healthcare provider before use if pregnant or nursing", "Not a substitute for medical treatment"]',
  '["Widely cultivated in Europe and North America", "Native to Europe and Western Asia"]'
) ON CONFLICT (species) DO NOTHING;

-- Insert Peppermint
INSERT INTO monographs (species, common_name, taxonomy, overview, medicinal_properties, preparations, dosage_guidance, contraindications, interactions, toxicity, evidence_level, safety_notes, region_notes)
VALUES (
  'Mentha × piperita',
  'Peppermint',
  '{"family": "Lamiaceae", "genus": "Mentha"}',
  'Peppermint is a hybrid mint with a long history of use for digestive health. The leaves contain menthol and other volatile oils with potential therapeutic properties.',
  '[
    {"name": "IBS Symptom Relief", "summary": "Enteric-coated peppermint oil may help reduce IBS symptoms", "evidence": "Multiple systematic reviews support use for IBS"},
    {"name": "Digestive Aid", "summary": "May help relieve indigestion and reduce gas", "evidence": "Traditional use with some clinical support"}
  ]',
  '[
    {"form": "Tea", "instructions": "Steep 1 tablespoon dried leaves in 8 oz hot water for 5-10 minutes. Drink after meals."},
    {"form": "Enteric-Coated Capsules", "instructions": "Follow product directions. Typically 0.2-0.4 mL oil per capsule, 2-3 times daily between meals."}
  ]',
  'Tea: 1-2 cups after meals\nEnteric-coated oil: 0.2-0.4 mL per dose, 2-3 times daily\n\nEnteric coating is important to prevent heartburn.',
  '["GERD or hiatal hernia (may worsen symptoms)", "Gallbladder disease", "Known sensitivity to menthol"]',
  '["May interact with medications metabolized by CYP3A4", "May affect iron absorption"]',
  'Generally safe when used as directed. Avoid direct application of concentrated oil to nasal passages in infants and young children.',
  'B',
  '["Use enteric-coated products for internal use", "Do not apply pure oil directly to skin without dilution", "Not for use in infants"]',
  '["Cultivated worldwide", "Hybrid of watermint and spearmint"]'
) ON CONFLICT (species) DO NOTHING;

-- Insert Turmeric
INSERT INTO monographs (species, common_name, taxonomy, overview, medicinal_properties, preparations, dosage_guidance, contraindications, interactions, toxicity, evidence_level, safety_notes, region_notes)
VALUES (
  'Curcuma longa',
  'Turmeric',
  '{"family": "Zingiberaceae", "genus": "Curcuma"}',
  'Turmeric is a golden-yellow spice with anti-inflammatory properties. The active compound curcumin has been extensively studied for various health applications.',
  '[
    {"name": "Anti-inflammatory", "summary": "May help reduce inflammation markers in the body", "evidence": "Numerous studies support anti-inflammatory activity"},
    {"name": "Antioxidant", "summary": "Contains compounds that may neutralize free radicals", "evidence": "Well-documented antioxidant properties"}
  ]',
  '[
    {"form": "Powder/Spice", "instructions": "Add 1-3 grams to food daily. Combine with black pepper to enhance absorption."},
    {"form": "Standardized Extract", "instructions": "Take 400-600 mg curcumin extract (95% standardized) 2-3 times daily with meals."}
  ]',
  'Culinary use: 1-3 grams daily\nStandardized extract: 400-600 mg 2-3 times daily\n\nBest absorbed with black pepper (piperine) and fats.',
  '["Gallbladder disease or bile duct obstruction", "Bleeding disorders", "Scheduled surgery (discontinue 2 weeks prior)"]',
  '["May interact with anticoagulant medications", "May affect blood sugar medications", "May interact with stomach acid reducers"]',
  'Generally safe as a spice. High doses may cause digestive upset. Quality control important due to occasional contamination issues.',
  'B',
  '["Choose reputable sources to avoid contamination", "Start with lower doses", "Consult healthcare provider if taking medications"]',
  '["Native to South Asia", "Widely cultivated in India and Southeast Asia"]'
) ON CONFLICT (species) DO NOTHING;

-- Insert Ginger
INSERT INTO monographs (species, common_name, taxonomy, overview, medicinal_properties, preparations, dosage_guidance, contraindications, interactions, toxicity, evidence_level, safety_notes, region_notes)
VALUES (
  'Zingiber officinale',
  'Ginger',
  '{"family": "Zingiberaceae", "genus": "Zingiber"}',
  'Ginger root has been used for centuries for digestive health and nausea relief. It contains gingerols and shogaols with documented bioactive properties.',
  '[
    {"name": "Nausea Relief", "summary": "May help reduce nausea from various causes including pregnancy and motion sickness", "evidence": "Strong clinical evidence for antiemetic effects"},
    {"name": "Anti-inflammatory", "summary": "May help reduce inflammation and associated pain", "evidence": "Multiple studies support anti-inflammatory activity"}
  ]',
  '[
    {"form": "Fresh Root Tea", "instructions": "Steep 1-2 inches of sliced fresh ginger in hot water for 5-10 minutes."},
    {"form": "Capsules", "instructions": "Take 250 mg 3-4 times daily, or as directed by healthcare provider."}
  ]',
  'Fresh ginger: 1-2 inches of root daily\nDried powder: 1-3 grams daily in divided doses\nFor nausea: 250 mg 3-4 times daily\n\nConsult healthcare provider for pregnancy use.',
  '["Bleeding disorders", "Scheduled surgery (discontinue 2 weeks prior)", "Gallstones (consult provider)"]',
  '["May interact with anticoagulant medications", "May interact with antidiabetic drugs"]',
  'Generally safe when used appropriately. High doses may cause heartburn or digestive discomfort.',
  'B',
  '["Use caution with anticoagulants", "Pregnant women should consult healthcare provider", "Start with small amounts"]',
  '["Native to Southeast Asia", "Widely cultivated in tropical regions"]'
) ON CONFLICT (species) DO NOTHING;

-- Insert Echinacea
INSERT INTO monographs (species, common_name, taxonomy, overview, medicinal_properties, preparations, dosage_guidance, contraindications, interactions, toxicity, evidence_level, safety_notes, region_notes)
VALUES (
  'Echinacea purpurea',
  'Purple Coneflower',
  '{"family": "Asteraceae", "genus": "Echinacea"}',
  'Echinacea is a popular immune-supporting herb native to North America. Various preparations are used, though evidence for effectiveness is mixed.',
  '[
    {"name": "Immune Support", "summary": "Traditionally used to support immune function during colds", "evidence": "Mixed evidence; some studies show modest benefit for cold duration"}
  ]',
  '[
    {"form": "Tea", "instructions": "Steep 1-2 grams dried herb in hot water for 10 minutes. Drink 2-3 times daily at first sign of cold."},
    {"form": "Tincture", "instructions": "Take 2-3 mL three times daily during acute cold symptoms."}
  ]',
  'Tea: 1-2 grams 2-3 times daily\nTincture: 2-3 mL three times daily\n\nTypically used at onset of cold symptoms, for 7-10 days maximum.',
  '["Autoimmune conditions", "Allergy to Asteraceae family", "Organ transplant recipients"]',
  '["May interact with immunosuppressant drugs", "Possible interaction with caffeine"]',
  'Generally well-tolerated for short-term use. Allergic reactions possible, especially in those allergic to ragweed.',
  'C',
  '["Not for long-term continuous use", "Consult healthcare provider if immunocompromised", "Stop if allergic reaction occurs"]',
  '["Native to central and eastern North America", "Widely cultivated"]'
) ON CONFLICT (species) DO NOTHING;

-- Insert Aloe
INSERT INTO monographs (species, common_name, taxonomy, overview, medicinal_properties, preparations, dosage_guidance, contraindications, interactions, toxicity, evidence_level, safety_notes, region_notes)
VALUES (
  'Aloe barbadensis',
  'Aloe Vera',
  '{"family": "Asphodelaceae", "genus": "Aloe"}',
  'Aloe vera gel from the inner leaf is used topically for skin health. The gel contains polysaccharides and other compounds with soothing properties.',
  '[
    {"name": "Skin Soothing", "summary": "May help soothe minor burns, wounds, and skin irritation", "evidence": "Some evidence for wound healing and burn treatment"},
    {"name": "Moisturizing", "summary": "Provides hydration to skin", "evidence": "Well-established moisturizing properties"}
  ]',
  '[
    {"form": "Fresh Gel", "instructions": "Split leaf and apply clear gel directly to clean skin 2-3 times daily."},
    {"form": "Commercial Gel", "instructions": "Apply to affected area as directed on product label. Choose products with minimal additives."}
  ]',
  'Topical use: Apply thin layer to affected area 2-3 times daily\n\nFor external use only. Do not apply to deep wounds.',
  '["Known allergy to Aloe", "Deep or serious wounds (seek medical care)", "Internal use of whole leaf (contains laxative compounds)"]',
  '["None significant for topical use"]',
  'Topical gel generally safe. Whole-leaf aloe contains anthraquinones with strong laxative effects and is not recommended for internal use.',
  'B',
  '["External use only", "Do not apply to surgical incisions", "Discontinue if irritation develops", "Choose products with minimal additives"]',
  '["Cultivated worldwide in tropical and subtropical regions", "Native to Arabian Peninsula"]'
) ON CONFLICT (species) DO NOTHING;

-- Add more monographs (abbreviated for space)
INSERT INTO monographs (species, common_name, taxonomy, overview, evidence_level)
VALUES
  ('Plantago major', 'Common Plantain', '{"family": "Plantaginaceae"}', 'Plantain leaves are traditionally used topically for minor skin irritations and insect bites.', 'C'),
  ('Taraxacum officinale', 'Dandelion', '{"family": "Asteraceae"}', 'Dandelion root and leaves are traditionally used as a bitter digestive tonic.', 'C'),
  ('Lavandula angustifolia', 'Lavender', '{"family": "Lamiaceae"}', 'Lavender essential oil is used aromatherapeutically for relaxation and stress relief.', 'B'),
  ('Calendula officinalis', 'Calendula', '{"family": "Asteraceae"}', 'Calendula flowers are used topically for skin health and wound healing support.', 'B')
ON CONFLICT (species) DO NOTHING;
