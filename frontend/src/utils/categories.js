/**
 * Shared product category definitions for Esena Pharmacy.
 * The `value` must match exactly what is stored in the database.
 * The `label` is what is displayed in the UI.
 */

export const CATEGORIES = [
  // Medicines
  { value: 'Prescription',        label: 'Prescription Medicines',      group: 'Medicines' },
  { value: 'OTC',                 label: 'Over-the-Counter (OTC)',       group: 'Medicines' },
  { value: 'Chronic',             label: 'Chronic Illness Medicines',    group: 'Medicines' },
  { value: 'Antibiotics',         label: 'Antibiotics',                  group: 'Medicines' },
  { value: 'Antimalarials',       label: 'Antimalarials',                group: 'Medicines' },
  { value: 'Dewormers',           label: 'Dewormers',                    group: 'Medicines' },

  // By Condition
  { value: 'PainRelief',          label: 'Pain Relief',                  group: 'By Condition' },
  { value: 'ColdAndFlu',          label: 'Cold and Flu',                 group: 'By Condition' },
  { value: 'Allergy',             label: 'Allergy',                      group: 'By Condition' },
  { value: 'DigestiveHealth',     label: 'Digestive Health',             group: 'By Condition' },
  { value: 'Diarrhoea',           label: 'Diarrhoea Treatment',          group: 'By Condition' },
  { value: 'SkinConditions',      label: 'Skin Conditions',              group: 'By Condition' },
  { value: 'EyeAndEarCare',       label: 'Eye and Ear Care',             group: 'By Condition' },
  { value: 'OralHealth',          label: 'Oral Health',                  group: 'By Condition' },
  { value: 'DiabetesCare',        label: 'Diabetes Care',                group: 'By Condition' },
  { value: 'HeartAndBP',          label: 'Heart and Blood Pressure',     group: 'By Condition' },

  // Supplements
  { value: 'Supplements',         label: 'Vitamins and Supplements',     group: 'Supplements' },
  { value: 'ImmuneSupport',       label: 'Immune Support',               group: 'Supplements' },
  { value: 'Omega3',              label: 'Omega 3 and Fish Oils',        group: 'Supplements' },

  // Medical Devices
  { value: 'Thermometers',        label: 'Thermometers',                 group: 'Medical Devices' },
  { value: 'BPMonitors',          label: 'Blood Pressure Monitors',      group: 'Medical Devices' },
  { value: 'Glucometers',         label: 'Glucometers',                  group: 'Medical Devices' },
  { value: 'Nebulizers',          label: 'Nebulizers',                   group: 'Medical Devices' },
  { value: 'TestKits',            label: 'Test Kits',                    group: 'Medical Devices' },

  // First Aid
  { value: 'Bandages',            label: 'Bandages and Plasters',        group: 'First Aid' },
  { value: 'Antiseptics',         label: 'Antiseptics',                  group: 'First Aid' },
  { value: 'WoundCare',           label: 'Wound Care',                   group: 'First Aid' },

  // Mother and Baby
  { value: 'BabyMedicines',       label: 'Baby Medicines',               group: 'Mother and Baby' },
  { value: 'BabyFormula',         label: 'Baby Formula',                 group: 'Mother and Baby' },
  { value: 'PrenatalCare',        label: 'Prenatal Care',                group: 'Mother and Baby' },

  // Sexual Health
  { value: 'Contraceptives',      label: 'Contraceptives',               group: 'Sexual Health' },
  { value: 'FertilitySupport',    label: 'Fertility Support',            group: 'Sexual Health' },

  // Personal Care
  { value: 'PersonalCare',        label: 'Personal Care',                group: 'Personal Care' },
  { value: 'FeminineHealth',      label: 'Feminine Health',              group: 'Personal Care' },
  { value: 'MedicatedSkinCare',   label: 'Medicated Skin Care',          group: 'Personal Care' },

  // Local Needs
  { value: 'MosquitoProtection',  label: 'Mosquito Protection',          group: 'Local Needs' },
];

// Flat list of just the values — used for backend validation
export const CATEGORY_VALUES = CATEGORIES.map(c => c.value);

// For dropdowns: grouped options
export const CATEGORY_OPTIONS_FLAT = CATEGORIES.map(c => ({
  value: c.value,
  label: c.label,
}));
