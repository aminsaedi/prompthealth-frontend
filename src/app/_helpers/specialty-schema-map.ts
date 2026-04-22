/** Maps practitioner specialty names to their schema.org type URLs. */
export const SPECIALTY_SCHEMA_MAP: Record<string, string> = {
  // Direct schema.org types
  'Dentist':                          'https://schema.org/Dentist',
  'Dental Hygienist':                 'https://schema.org/Dentist',
  'Medical Doctor':                   'https://schema.org/Physician',
  'Neuropsychologist':                'https://schema.org/Physician',
  'Nurse Practitioner':               'https://schema.org/Physician',
  'Chiropractor':                     'https://schema.org/Chiropractor',
  'Physiotherapist':                  'https://schema.org/Physiotherapist',
  'Pharmacist':                       'https://schema.org/Pharmacy',
  'Optometrist':                      'https://schema.org/Optician',
  // MedicalBusiness
  'Acupuncturist':                    'https://schema.org/MedicalBusiness',
  'Athletic Therapist':               'https://schema.org/MedicalBusiness',
  'Audiologist':                      'https://schema.org/MedicalBusiness',
  'Certified Exercise Physiologist':  'https://schema.org/MedicalBusiness',
  'Counsellor':                       'https://schema.org/MedicalBusiness',
  'Doula':                            'https://schema.org/MedicalBusiness',
  'Homeopath':                        'https://schema.org/MedicalBusiness',
  'Kinesiologist':                    'https://schema.org/MedicalBusiness',
  'Midwife':                          'https://schema.org/MedicalBusiness',
  'Naturopath':                       'https://schema.org/MedicalBusiness',
  'Nurse':                            'https://schema.org/MedicalBusiness',
  'Nutritionist':                     'https://schema.org/MedicalBusiness',
  'Occupational Therapist':           'https://schema.org/MedicalBusiness',
  'Osteopath':                        'https://schema.org/MedicalBusiness',
  'Pedortist':                        'https://schema.org/MedicalBusiness',
  'Psychologist':                     'https://schema.org/MedicalBusiness',
  'Registered Dietician':             'https://schema.org/MedicalBusiness',
  'Registered Massage Therapist':     'https://schema.org/MedicalBusiness',
  'Social Worker':                    'https://schema.org/MedicalBusiness',
  'Traditional Chinese Medicine':     'https://schema.org/MedicalBusiness',
  'Speech therapist':                 'https://schema.org/MedicalBusiness',
  // HealthAndBeautyBusiness
  'Body Worker':                      'https://schema.org/HealthAndBeautyBusiness',
  'Energy Healer':                    'https://schema.org/HealthAndBeautyBusiness',
  'Life/Wellness Coach':              'https://schema.org/HealthAndBeautyBusiness',
  'Meditation /Yoga Instructor':      'https://schema.org/HealthAndBeautyBusiness',
  'Personal Trainer':                 'https://schema.org/HealthAndBeautyBusiness',
  'Pilates Instructor':               'https://schema.org/HealthAndBeautyBusiness',
  'Sleep consultant':                 'https://schema.org/HealthAndBeautyBusiness',
  'Sports Coach':                     'https://schema.org/HealthAndBeautyBusiness',
};

/**
 * Case-insensitive lookup against SPECIALTY_SCHEMA_MAP.
 * Tries exact match first, then falls back to case-insensitive comparison.
 */
export function lookupSpecialtySchema(name: string): string | undefined {
  if (SPECIALTY_SCHEMA_MAP[name]) return SPECIALTY_SCHEMA_MAP[name];
  const lower = name.toLowerCase();
  const key = Object.keys(SPECIALTY_SCHEMA_MAP).find(k => k.toLowerCase() === lower);
  return key ? SPECIALTY_SCHEMA_MAP[key] : undefined;
}

/** Priority order for choosing a primary schema.org type when multiple match. */
export const TYPE_PRIORITY = [
  'https://schema.org/Physician', 'https://schema.org/Dentist',
  'https://schema.org/Chiropractor', 'https://schema.org/Physiotherapist',
  'https://schema.org/Pharmacy', 'https://schema.org/Optician',
  'https://schema.org/MedicalBusiness', 'https://schema.org/HealthAndBeautyBusiness',
];
