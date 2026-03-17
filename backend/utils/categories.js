/**
 * Valid product categories — must match the database ENUM.
 * Keep in sync with frontend/src/utils/categories.js
 */
const VALID_CATEGORIES = [
  'Prescription', 'OTC', 'Chronic', 'Antibiotics', 'Antimalarials', 'Dewormers',
  'PainRelief', 'ColdAndFlu', 'Allergy', 'DigestiveHealth', 'Diarrhoea',
  'SkinConditions', 'EyeAndEarCare', 'OralHealth', 'DiabetesCare', 'HeartAndBP',
  'Supplements', 'ImmuneSupport', 'Omega3',
  'Thermometers', 'BPMonitors', 'Glucometers', 'Nebulizers', 'TestKits',
  'Bandages', 'Antiseptics', 'WoundCare',
  'BabyMedicines', 'BabyFormula', 'PrenatalCare',
  'Contraceptives', 'FertilitySupport',
  'PersonalCare', 'FeminineHealth', 'MedicatedSkinCare',
  'MosquitoProtection',
];

module.exports = { VALID_CATEGORIES };
