'use strict';

/**
 * utils/posImportRules.js
 *
 * Classification / exclusion / image-matching rules used to turn a raw
 * Afymis POS medicine record into a website `products` row. Shared by
 * scripts/import-pos-catalog.js and any future re-import/backfill tooling.
 */

// ── Exclusion rules ──────────────────────────────────────────────────────────
// Institutional/clinical/lab items with no sane retail-storefront category.
// Deliberately narrow — anything that could plausibly map to an existing
// retail category (syringes, gloves, bandages, mobility aids, monitors) is
// kept and classified instead of excluded.
const EXCLUDE_KEYWORDS = [
  'bed pan', 'bedpan', 'beaker', 'autoclave', 'dissect', 'forceps', 'scalpel',
  'speculum', 'laboratory', 'lab coat', 'microscope', 'centrifuge',
  'culture medium', 'petri dish', 'specimen bottle', 'mortuary', 'ambulance',
  'x-ray', 'xray', 'ultrasound machine', 'ecg machine', 'dialysis',
  'ventilator', 'examination couch', 'examination table', 'ot table',
  'hospital bed', 'stretcher', 'trolley', 'ward screen', 'operating light',
  'incubator', 'suction machine', 'sterilizer', 'autopsy',
];

// ── Category classification rules ───────────────────────────────────────────
// Ordered — first matching rule wins. Falls back to 'OTC'.
// Values must match backend/utils/categories.js VALID_CATEGORIES exactly.
const CATEGORY_RULES = [
  { value: 'Antimalarials', keywords: ['malaria', 'artemether', 'lumefantrine', 'artesunate', 'quinine', 'artequick', 'coartem'] },
  { value: 'Antibiotics', keywords: ['amoxicillin', 'azithromycin', 'ciprofloxacin', 'metronidazole', 'doxycycline', 'cefixime', 'clarithromycin', 'erythromycin', 'ampiclox', 'augmentin', 'flucloxacillin', 'cotrimoxazole', 'co-trimoxazole', 'penicillin', 'clindamycin', 'antibiotic'] },
  { value: 'Dewormers', keywords: ['albendazole', 'mebendazole', 'deworm', 'praziquantel', 'ivermectin'] },
  { value: 'DiabetesCare', keywords: ['diabet', 'insulin', 'metformin', 'glimepiride', 'glucophage', 'gliclazide'] },
  { value: 'Glucometers', keywords: ['glucometer', 'glucose meter', 'blood glucose monitor', 'test strip glucose'] },
  { value: 'BPMonitors', keywords: ['bp monitor', 'blood pressure monitor', 'sphygmomanometer'] },
  { value: 'Thermometers', keywords: ['thermometer'] },
  { value: 'Nebulizers', keywords: ['nebulizer', 'nebuliser', 'inhaler', 'salbutamol', 'ventolin', 'asthma'] },
  { value: 'TestKits', keywords: ['test kit', 'pregnancy test', 'malaria test', 'rapid test', 'hiv test', 'urine test strip'] },
  { value: 'HeartAndBP', keywords: ['amlodipine', 'losartan', 'atorvastatin', 'hydrochlorothiazide', 'bisoprolol', 'enalapril', 'hypertension', 'cardiac', 'statin'] },
  { value: 'DigestiveHealth', keywords: ['antacid', 'omeprazole', 'ranitidine', 'gaviscon', 'indigestion', 'flatulence', 'probiotic', 'laxative', 'bisacodyl', 'constipation', 'mebeverine', 'colofac'] },
  { value: 'Diarrhoea', keywords: ['diarrhoea', 'diarrhea', 'oral rehydration', 'ors ', 'loperamide'] },
  { value: 'ColdAndFlu', keywords: ['cough', 'flu', 'cold ', 'expectorant', 'catarrh', 'bronchodilator', 'ambroxol', 'decongestant', 'sore throat', 'lozenge', 'vicks', 'strepsils'] },
  { value: 'Allergy', keywords: ['cetirizine', 'loratadine', 'antihistamine', 'allergy', 'chlorpheniramine', 'piriton', 'desloratadine', 'aerius', 'clarityne'] },
  { value: 'PainRelief', keywords: ['paracetamol', 'ibuprofen', 'diclofenac', 'aspirin', 'panadol', 'analgesic', 'pain relief', 'naproxen', 'celecoxib', 'aceclofenac'] },
  { value: 'SkinConditions', keywords: ['eczema', 'psoriasis', 'fungal', 'antifungal', 'clotrimazole', 'miconazole', 'ketoconazole', 'ringworm', 'candid'] },
  { value: 'MedicatedSkinCare', keywords: ['betamethasone', 'hydrocortisone', 'steroid cream', 'acne', 'tretinoin', 'benzyl benzoate', 'scabies', 'cerave', 'moisturi', 'cleanser cream'] },
  { value: 'EyeAndEarCare', keywords: ['eye drop', 'ear drop', 'eye ointment', 'conjunctivitis', 'optic', 'otic'] },
  { value: 'OralHealth', keywords: ['toothpaste', 'mouthwash', 'dental', 'oral rinse', 'gum ', 'teething'] },
  { value: 'WoundCare', keywords: ['wound', 'dressing', 'gauze', 'burn cream', 'silver sulfadiazine'] },
  { value: 'Antiseptics', keywords: ['antiseptic', 'povidone iodine', 'dettol', 'savlon', 'hydrogen peroxide', 'disinfectant', 'hand sanitizer', 'sanitiser'] },
  { value: 'Bandages', keywords: ['bandage', 'plaster', 'cotton wool', 'crepe bandage', 'elastic bandage', 'sticking plaster'] },
  { value: 'BabyFormula', keywords: ['infant formula', 'baby formula', 'aptamil', 'nan ', 'lactogen', 'infant milk'] },
  { value: 'BabyMedicines', keywords: ['baby', 'infant', 'paediatric', 'pediatric', 'gripe water', 'colic'] },
  { value: 'PrenatalCare', keywords: ['prenatal', 'pregnancy', 'folic acid', 'pregnant', 'antenatal'] },
  { value: 'Contraceptives', keywords: ['condom', 'contracepti', 'pregnancy prevention', 'iud', 'postinor'] },
  { value: 'FertilitySupport', keywords: ['fertility', 'ovulation'] },
  { value: 'FeminineHealth', keywords: ['sanitary', 'menstrual', 'feminine', 'vaginal', 'tampon', 'candid-v'] },
  { value: 'Omega3', keywords: ['omega 3', 'omega-3', 'fish oil', 'cod liver'] },
  { value: 'ImmuneSupport', keywords: ['immune', 'immunity', 'vitamin c', 'zinc', 'echinacea'] },
  { value: 'Supplements', keywords: ['vitamin', 'multivitamin', 'supplement', 'calcium', 'iron tablet', 'mineral', 'biotin', 'collagen', 'protein powder'] },
  { value: 'MosquitoProtection', keywords: ['mosquito', 'insect repellent', 'mosquito net', 'mosquito coil'] },
  { value: 'PersonalCare', keywords: ['soap', 'lotion', 'shampoo', 'deodorant', 'sunscreen', 'lip balm', 'petroleum jelly', 'baby powder', 'talcum', 'face mask', 'wipes'] },
  { value: 'Chronic', keywords: ['long term', 'chronic'] },
  { value: 'Prescription', keywords: ['rx only', 'prescription only'] },
];

// Terms that carry no brand/product-identity signal — stripped before
// computing image-match similarity so two unrelated products don't match
// just because both say "cream 15g".
const GENERIC_TOKENS = new Set([
  'mg', 'ml', 'g', 'mcg', 'iu', 'tablet', 'tablets', 'tabs', 'tab', 'capsule',
  'capsules', 'caps', 'cap', 'syrup', 'suspension', 'solution', 'cream',
  'ointment', 'gel', 'lotion', 'drops', 'drop', 'spray', 'inhaler', 'oral',
  'injection', 'suppository', 'suppositories', 'sachet', 'sachets', 'strip',
  'strips', 'blister', 'pack', 'box', 'bottle', 'tube', 'per', 'of', 'the',
  'and', 'with', 'for', 'x', 'film', 'coated', 'effervescent', 'plus',
  'extra', 'forte', 'new', 'price', 'each', 's', 'usp', 'bp', 'ip',
]);

const FUZZY_THRESHOLD = 0.34;

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/\.(webp|jpg|jpeg|png)$/i, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function significantTokens(str) {
  return new Set(
    normalize(str)
      .split(' ')
      .filter(t => t.length > 1 && !GENERIC_TOKENS.has(t) && !/^\d+$/.test(t))
  );
}

function jaccard(aTokens, bTokens) {
  if (aTokens.size === 0 || bTokens.size === 0) return 0;
  let intersection = 0;
  for (const t of aTokens) if (bTokens.has(t)) intersection++;
  const union = new Set([...aTokens, ...bTokens]).size;
  return union === 0 ? 0 : intersection / union;
}

function isExcluded(name) {
  const lower = name.toLowerCase();
  return EXCLUDE_KEYWORDS.some(kw => lower.includes(kw));
}

function classifyCategory(name) {
  const lower = ` ${name.toLowerCase()} `;
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) return rule.value;
  }
  return 'OTC';
}

/**
 * Build a match index once from the image file list, then call
 * findBestImageMatch(name, index) per product.
 */
function buildImageIndex(imageFiles) {
  return imageFiles.map(f => ({ file: f, tokens: significantTokens(f) }));
}

function findBestImageMatch(name, imageIndex) {
  const medNorm = normalize(name);
  const medTokens = significantTokens(name);
  if (medTokens.size === 0) return null;

  let best = null;
  let bestScore = 0;
  for (const entry of imageIndex) {
    if (normalize(entry.file) === medNorm) return { file: entry.file, score: 1, type: 'exact' };
    const score = jaccard(medTokens, entry.tokens);
    if (score > bestScore) {
      bestScore = score;
      best = entry.file;
    }
  }
  if (best && bestScore >= FUZZY_THRESHOLD) {
    return { file: best, score: bestScore, type: 'fuzzy' };
  }
  return null;
}

module.exports = {
  isExcluded,
  classifyCategory,
  buildImageIndex,
  findBestImageMatch,
  normalize,
};
