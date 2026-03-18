/**
 * Shared appointment services list used across BookAppointment and ManageAppointments
 */
export const APPOINTMENT_SERVICES = [
  // Consultations
  { value: 'Doctor Consultation',        label: 'Doctor Consultation' },
  { value: 'Pharmacist Consultation',    label: 'Pharmacist Consultation' },
  { value: 'Online Consultation',        label: 'Online Consultation (Telemedicine)' },
  { value: 'Dermatology',               label: 'Dermatology / Skin Consultation' },
  { value: 'Nutrition and Wellness',     label: 'Nutrition and Wellness Consultation' },
  { value: 'Eye Care',                   label: 'Eye Care Consultation' },
  { value: 'Heart Health Consultation',  label: 'Heart Health Consultation' },
  { value: 'Diabetes Management',        label: 'Diabetes Management Consultation' },
  { value: 'Weight Management',          label: 'Weight Management Programs' },
  // Lab & Testing
  { value: 'Laboratory Tests',           label: 'Laboratory Tests' },
  { value: 'Blood Tests',                label: 'Blood Tests' },
  { value: 'Malaria Testing',            label: 'Malaria Testing' },
  { value: 'HIV Testing Support',        label: 'HIV Testing Support' },
  { value: 'Cholesterol Testing',        label: 'Cholesterol Testing' },
  // Screening & Monitoring
  { value: 'Full Health Screening',      label: 'Full Health Screening' },
  { value: 'Blood Pressure Check',       label: 'Blood Pressure Check' },
  { value: 'Blood Glucose Testing',      label: 'Blood Glucose Testing' },
  { value: 'BMI Measurement',            label: 'BMI Measurement' },
  // Other Services
  { value: 'Vaccinations',               label: 'Vaccinations / Immunization Services' },
  { value: 'Family Planning',            label: 'Family Planning / Contraception Services' },
  { value: 'Ear Piercing',               label: 'Ear Piercing' },
];

/** For filter dropdowns — includes "All Services" as first option */
export const APPOINTMENT_SERVICE_FILTER_OPTIONS = [
  { value: '', label: 'All Services' },
  ...APPOINTMENT_SERVICES,
];
