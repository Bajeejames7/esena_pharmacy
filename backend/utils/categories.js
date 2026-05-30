/**
 * Valid product categories — must match frontend/src/utils/categories.js exactly.
 * The `value` fields here must be identical to the `value` fields in the frontend CATEGORIES array.
 */
const VALID_CATEGORIES = [
  // Medicines
  'Prescription', 'OTC', 'Chronic', 'Antibiotics', 'Antimalarials', 'Dewormers',

  // By Condition
  'PainRelief', 'ColdAndFlu', 'Allergy', 'DigestiveHealth', 'Diarrhoea',
  'SkinConditions', 'EyeAndEarCare', 'OralHealth', 'DiabetesCare', 'HeartAndBP',

  // Supplements
  'Supplements', 'ImmuneSupport', 'Omega3',

  // Medical Devices
  'Thermometers', 'BPMonitors', 'Glucometers', 'Nebulizers', 'TestKits',

  // First Aid
  'Bandages', 'Antiseptics', 'WoundCare',

  // Mother and Baby
  'BabyMedicines', 'BabyFormula', 'PrenatalCare',

  // Sexual Health
  'Contraceptives', 'FertilitySupport',

  // Personal Care
  'PersonalCare', 'FeminineHealth', 'MedicatedSkinCare',

  // Local Needs
  'MosquitoProtection',
];

module.exports = { VALID_CATEGORIES };
