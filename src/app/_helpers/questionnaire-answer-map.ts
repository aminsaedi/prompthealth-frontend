export function findFullnameByAbbrOf(abbr: string, groupName: QuestionnaireAnswerAbbrGroupName) {
  const group = questionnaireAnswerMap[groupName].abbrs;
  return (group && group[abbr]) ? group[abbr] : null;
}

export function findAbbrByFullnameOf(fullname: string, groupName: QuestionnaireAnswerAbbrGroupName) {
  const group = questionnaireAnswerMap[groupName].abbrs;
  let res: string = null;
  for(let abbr in group) {
    if(group[abbr] == fullname) {
      res = abbr;
    }
  }
  return res;
}

export const questionnaireAnswerMap = {
  gndr: {
    full: 'gender',
    abbrs: {
      m: 'male',
      f: 'female',
      o: 'nonbinary',  
    },
  },
  //language
  lng: {
    full: 'languageId',
    abbrs: {
      en: "5eb1a4e199957471610e6d4d", //english
      cn: "5eb1a4e199957471610e6d52", //cantonese
      fr: "5eb1a4e199957471610e6d4e", //french
      fa: "5eb1a4e199957471610e6d54", //farsi
      it: "5eb1a4e199957471610e6d50", //italian
      mn: "5eb1a4e199957471610e6d51", //mandarin
      pj: "5eb1a4e199957471610e6d53", //punjabi
      sp: "5eb1a4e199957471610e6d4f", //spanish  
      kr: "6180198dd86c9ae70b13cac8", //korean
    },
  },
  //availability
  aval: {
    full: 'typical_hours',
    abbrs: {
      1: "5eb1a4e199957471610e6d23", //between 9-5
      2: "5eb1a4e199957471610e6d22", //early morning
      3: "5eb1a4e199957471610e6d24", //evenings
      4: "5eb1a4e199957471610e6d25", //saturday
      5: "5eb1a4e199957471610e6d26", //sunday  
    }
  },
  //service type
  offr: {
    full: 'serviceOfferIds',
    abbrs: {
      1: "5eb1a4e199957471610e6cf4", //direct billing
      2: "5eb1a4e199957471610e6cef", //groups
      3: "5eb1a4e199957471610e6cf0", //in centre
      4: "5eb1a4e199957471610e6cee", //individually
      5: "5eb1a4e199957471610e6cf1", //mobile (on-demand)
      6: "5eb1a4e199957471610e6cf2", //virtual/online
      7: "5f5666292147340c05afdb24", //in person  
    }
  },
  //age range
  age: {
    full: 'age_range',
    abbrs: {
      // na: "5eb1a4e199957471610e6cd7", //not critical
      c: "5eb1a4e199957471610e6cd8", //child,
      y: "5eb1a4e199957471610e6cd9", //adolescent
      a: "5eb1a4e199957471610e6cda", //adult
      s: "5eb1a4e199957471610e6cdb", //senior  
    }
  },
  cat: {
    full: 'category',
    abbrs: {
      ca: '5eb1a4e199957471610e6ce8', //Women’s/Men’s Health
      ca1: '5eb1b4f8c573d5029f9293e1', //Hormones
      ca2: '5eb1b4f8c573d5029f9293e2', //PMS
      ca3: '5eb1b4f8c573d5029f9293e3', //Maternity/Pre and Postnatal
      ca4: '5eb1b4f8c573d5029f9293e4', //Menopause
      ca5: '5eb1b4f8c573d5029f9293e5', //Sexual Health
      ca6: '5eb1b4f7c573d5029f9293e0', //Reproductive Health/Fertility

      cb: '5eb1a4e199957471610e6ce5', //Skin Health
      cb1: '5eb1b3a2f818697f49f01b14', //Natural Remedies
      cb2: '5eb1b3a2f818697f49f01b15', //Laser Treatments
      cb3: '5eb1b3a2f818697f49f01b16', //Skin Treatments
      
      cc: '5eb1a4e199957471610e6ce6', //Immune System and Energy
      cc1:'5eb1a5ec84bc5b731e39044a', //Immunization
      cc2:'5eb1b3f957f7577fa8b839e3', //Supplements
      cc3:'5eb1b3f957f7577fa8b839e4', //IV Therapy
      cc4:'5eb1b3f957f7577fa8b839e2', //Natural Remedies
      cc5:'5eb1b3f957f7577fa8b839e5', //Energy Healing

      cd: '5eb1a4e199957471610e6ce2', //Nutrition
      cd1: '5eb1b277d61a8c7d96e13450', //Weight Management
      cd2: '5eb1b277d61a8c7d96e13451', //Digestion and Gut Health
      cd3: '5eb1b277d61a8c7d96e13452', //Food Sensitivities
      cd4: '5eb1b277d61a8c7d96e13454', //Eating Disorder Recovery
      cd5: '5eb1b277d61a8c7d96e13455', //Hormone Imbalance
      cd6: '5eb1b277d61a8c7d96e13453', //Chronic Disease Management

      ce: '5eb1a4e199957471610e6ce0', // Preventative Health
      ce1: '5eb1a68313e89a73b8a32ce3', //Foot Care
      ce2: '5eb1b105aecbaa79d585ee95', //Medical Care
      ce3: '5eb1b105aecbaa79d585ee96', //Oral Care
      ce4: '5eb1b105aecbaa79d585ee97', //Hearing Care
      ce5: '5eb1b105aecbaa79d585ee98', //Vision Care

      cf: '5eb1a4e199957471610e6ce4', //Sleep
      cf1: '5eb1b997c23117074347931f', //Natural/Holistic Remedies
      cf2: '5eb1b997c231170743479320', //Medical Treatments
      
      cg: '5eb1a4e199957471610e6ce1', //Mood/Mental Health
      cg1: '5eb1b200d1e3f67b4106646c', //Motivation
      cg2: '5eb1b888906b5605e762d3ee', //Attention/Focus
      cg3: '5eb1b888906b5605e762d3ef', //Memory
      cg4: '5eb1b888906b5605e762d3f0', //Behavioural
      cg5: '5eb1b888906b5605e762d3f1', //Learning Disability
      cg6: '5eb1b888906b5605e762d3f2', //Stress/Anxiety
      cg7: '5eb1b888906b5605e762d3f3', //Depression
      cg8: '5eb1b888906b5605e762d3f4', //Eating Disorder
      cg9: '5eb1b888906b5605e762d3f6', //Health Condition
      cga: '5eb1b888906b5605e762d3f7', //Fertility/Adoption
      cgb: '5eb1b888906b5605e762d3f8', //Couples/Family
      cgc: '5eb1b888906b5605e762d3f9', //Addiction
      cgd: '5eb1b888906b5605e762d3fa', //Anger
      cge: '5eb1b888906b5605e762d3fb', //Trauma
      cgf: '5eb1b888906b5605e762d3fc', //Mindfulness
      cgg: '5eb1b888906b5605e762d3fd', //Sexual Health

      ch: '5eb1a4e199957471610e6ce7', //Pain Management
      ch1: '5eb1bb714df91809d832d4ee', //Headache
      ch2: '5eb1bb714df91809d832d4ef', //Back
      ch3: '5eb1bb714df91809d832d4f0', //Neck
      ch4: '5eb1bb714df91809d832d4f1', //Shoulder
      ch5: '5eb1bb714df91809d832d4f2', //Wrist/Hand
      ch6: '5eb1bb714df91809d832d4f3', //Elbow
      ch7: '5eb1bb714df91809d832d4f4', //Knee
      ch8: '5eb1bb714df91809d832d4f5', //Hip
      ch9: '5eb1bb714df91809d832d4f6', //Ankle/Foot
      cha: '5eb1bb714df91809d832d4f7', //Jaw

      ci: '5eb1a4e199957471610e6ce3', //Fitness
      ci1: '5eb1b2ab3beb2d7e05c37cf4', //Yoga
      ci2: '5eb1b2ab3beb2d7e05c37cf5', //Sports Specific Conditioning
      ci3: '5eb1b93a64bf63066da83586', //Strength Training/Toning
      ci4: '5eb1b93a64bf63066da83587', //High Intensity Interval Training
      ci5: '5eb1b93a64bf63066da83588', //Running
      ci6: '5eb1b93a64bf63066da83589', //Spin/Cycling
      ci7: '5eb1b93a64bf63066da83585', //Pilates
    }
  },
  cnd: {
    full: 'customerHealth',
    abbrs: {
      hc: '5eb1a4e199957471610e6cd4', //clonic health
      hc1: '5eb1a771c73c4f748f4581c3', //Cancer
      hc2: '5eb1a771c73c4f748f4581bc', //Cardiopulmonary Condition
      hc3: '607a18c7e8fa3c0ea4435f66', //Cardiovascular Disease
      hc4: '5eb1a771c73c4f748f4581be', //Diabetes
      hc5: '5eb1a771c73c4f748f4581c2', //Fibromyalgia
      hc6: '5eb1a771c73c4f748f4581bd', //Heart Disease
      hc7: '5eb1a771c73c4f748f4581c1', //Osteoporosis
      hc8: '5eb1a771c73c4f748f4581bf', //Pulmonary Disease
      hc9: '5eb1a771c73c4f748f4581c0', //Rheumatoid/Osteoarthritis

      hp: '5eb1a4e199957471610e6cd2', //pregnant
      // hn: '5eb1a4e199957471610e6cd1', //not cricical
    }
  },
  type: {
    full: 'typeOfProvider',
    abbrs: {
      p00: '5eb1a4e199957471610e6d3e', //Acupuncturist
      p01: '5eb1a4e199957471610e6d34', //Athletic Therapist
      p02: '5eb1a4e199957471610e6d2d', //Audiologist
      p03: '5eb1a4e199957471610e6d49', //Body Worker
      p04: '5eb1a4e199957471610e6d31', //Certified Exercise Physiologist
      p05: '5eb1a4e199957471610e6d39', //Chiropractor
      p06: '5eb1a4e199957471610e6d41', //Counsellor
      p07: '5eb1a4e199957471610e6d2f', //Dental Hygienist
      p08: '5eb1a4e199957471610e6d2e', //Dentist
      p09: '5eb1a4e199957471610e6d4b', //Doula
      p10: '5eb1a4e199957471610e6d48', //Energy Healer
      p11: '5eb1a4e199957471610e6d40', //Homeopath
      p12: '5eb1a4e199957471610e6d30', //Kinesiologist
      p13: '5eb1a4e199957471610e6d45', //Life/Wellness Coach
      p14: '5eb1a4e199957471610e6d28', //Medical Doctor
      p15: '5eb1a4e199957471610e6d46', //Meditation /Yoga Instructor
      p16: '5eb1a4e199957471610e6d4a', //Midwife
      p17: '5eb1a4e199957471610e6d3d', //Naturopath
      p18: '5eb1a4e199957471610e6d43', //Neuropsychologist
      p19: '5eb1a4e199957471610e6d2b', //Nurse
      p20: '5eb1a4e199957471610e6d2a', //Nurse Practitioner
      p21: '5eb1a4e199957471610e6d36', //Nutritionist
      p22: '5eb1a4e199957471610e6d38', //Occupational Therapist
      p23: '5eb1a4e199957471610e6d2c', //Optometrist
      p24: '5eb1a4e199957471610e6d3c', //Osteopath
      p25: '5eb1a4e199957471610e6d3a', //Pedortist
      p26: '5eb1a4e199957471610e6d32', //Personal Trainer
      p27: '5eb1a4e199957471610e6d29', //Pharmacist
      p28: '5eb1a4e199957471610e6d37', //Physiotherapist
      p29: '5eb1a4e199957471610e6d47', //Pilates Instructor
      p30: '5eb1a4e199957471610e6d42', //Psychologist
      p31: '5eb1a4e199957471610e6d35', //Registered Dietician
      p32: '5eb1a4e199957471610e6d3b', //Registered Massage Therapist
      p33: '5eb1a4e199957471610e6d44', //Social Worker
      p34: '5eb1a4e199957471610e6d33', //Sports Coach
      p35: '5eb1a4e199957471610e6d3f', //Traditional Chinese Medicine
      p36: '5f47ff0fb6eaa8aaaa53fb44', //Speech therapist
      p37: '5f47ff41b6eaa8aaaa53fb45', //Sleep consultant
      p38: '61266c22ed810ffdd0b588e7', //Speech therapist
    }
  }

  // svc: {
  //   full: 'services',
  //   abbrs: {
  //     /** customer health */
  //     hc: '5eb1a4e199957471610e6cd4', //clonic health
  //     hc1: '5eb1a771c73c4f748f4581c3', //Cancer
  //     hc2: '5eb1a771c73c4f748f4581bc', //Cardiopulmonary Condition
  //     hc3: '607a18c7e8fa3c0ea4435f66', //Cardiovascular Disease
  //     hc4: '5eb1a771c73c4f748f4581be', //Diabetes
  //     hc5: '5eb1a771c73c4f748f4581c2', //Fibromyalgia
  //     hc6: '5eb1a771c73c4f748f4581bd', //Heart Disease
  //     hc7: '5eb1a771c73c4f748f4581c1', //Osteoporosis
  //     hc8: '5eb1a771c73c4f748f4581bf', //Pulmonary Disease
  //     hc9: '5eb1a771c73c4f748f4581c0', //Rheumatoid/Osteoarthritis

  //     hp: '5eb1a4e199957471610e6cd2', //pregnant
  //     // hn: '5eb1a4e199957471610e6cd1', //not cricical

  //     /** category */
  //     ca: '5eb1a4e199957471610e6ce8', //Women’s/Men’s Health
  //     ca1: '5eb1b4f8c573d5029f9293e1', //Hormones
  //     ca2: '5eb1b4f8c573d5029f9293e2', //PMS
  //     ca3: '5eb1b4f8c573d5029f9293e3', //Maternity/Pre and Postnatal
  //     ca4: '5eb1b4f8c573d5029f9293e4', //Menopause
  //     ca5: '5eb1b4f8c573d5029f9293e5', //Sexual Health
  //     ca6: '5eb1b4f7c573d5029f9293e0', //Reproductive Health/Fertility

  //     cb: '5eb1a4e199957471610e6ce5', //Skin Health
  //     cb1: '5eb1b3a2f818697f49f01b14', //Natural Remedies
  //     cb2: '5eb1b3a2f818697f49f01b15', //Laser Treatments
  //     cb3: '5eb1b3a2f818697f49f01b16', //Skin Treatments
      
  //     cc: '5eb1a4e199957471610e6ce6', //Immune System and Energy
  //     cc1:'5eb1a5ec84bc5b731e39044a', //Immunization
  //     cc2:'5eb1b3f957f7577fa8b839e3', //Supplements
  //     cc3:'5eb1b3f957f7577fa8b839e4', //IV Therapy
  //     cc4:'5eb1b3f957f7577fa8b839e2', //Natural Remedies
  //     cc5:'5eb1b3f957f7577fa8b839e5', //Energy Healing

  //     cd: '5eb1a4e199957471610e6ce2', //Nutrition
  //     cd1: '5eb1b277d61a8c7d96e13450', //Weight Management
  //     cd2: '5eb1b277d61a8c7d96e13451', //Digestion and Gut Health
  //     cd3: '5eb1b277d61a8c7d96e13452', //Food Sensitivities
  //     cd4: '5eb1b277d61a8c7d96e13454', //Eating Disorder Recovery
  //     cd5: '5eb1b277d61a8c7d96e13455', //Hormone Imbalance
  //     cd6: '5eb1b277d61a8c7d96e13453', //Chronic Disease Management

  //     ce: '5eb1a4e199957471610e6ce0', // Preventative Health
  //     ce1: '5eb1a68313e89a73b8a32ce3', //Foot Care
  //     ce2: '5eb1b105aecbaa79d585ee95', //Medical Care
  //     ce3: '5eb1b105aecbaa79d585ee96', //Oral Care
  //     ce4: '5eb1b105aecbaa79d585ee97', //Hearing Care
  //     ce5: '5eb1b105aecbaa79d585ee98', //Vision Care

  //     cf: '5eb1a4e199957471610e6ce4', //Sleep
  //     cf1: '5eb1b997c23117074347931f', //Natural/Holistic Remedies
  //     cf2: '5eb1b997c231170743479320', //Medical Treatments
      
  //     cg: '5eb1a4e199957471610e6ce1', //Mood/Mental Health
  //     cg1: '5eb1b200d1e3f67b4106646c', //Motivation
  //     cg2: '5eb1b888906b5605e762d3ee', //Attention/Focus
  //     cg3: '5eb1b888906b5605e762d3ef', //Memory
  //     cg4: '5eb1b888906b5605e762d3f0', //Behavioural
  //     cg5: '5eb1b888906b5605e762d3f1', //Learning Disability
  //     cg6: '5eb1b888906b5605e762d3f2', //Stress/Anxiety
  //     cg7: '5eb1b888906b5605e762d3f3', //Depression
  //     cg8: '5eb1b888906b5605e762d3f4', //Eating Disorder
  //     cg9: '5eb1b888906b5605e762d3f6', //Health Condition
  //     cga: '5eb1b888906b5605e762d3f7', //Fertility/Adoption
  //     cgb: '5eb1b888906b5605e762d3f8', //Couples/Family
  //     cgc: '5eb1b888906b5605e762d3f9', //Addiction
  //     cgd: '5eb1b888906b5605e762d3fa', //Anger
  //     cge: '5eb1b888906b5605e762d3fb', //Trauma
  //     cgf: '5eb1b888906b5605e762d3fc', //Mindfulness
  //     cgg: '5eb1b888906b5605e762d3fd', //Sexual Health

  //     ch: '5eb1a4e199957471610e6ce7', //Pain Management
  //     ch1: '5eb1bb714df91809d832d4ee', //Headache
  //     ch2: '5eb1bb714df91809d832d4ef', //Back
  //     ch3: '5eb1bb714df91809d832d4f0', //Neck
  //     ch4: '5eb1bb714df91809d832d4f1', //Shoulder
  //     ch5: '5eb1bb714df91809d832d4f2', //Wrist/Hand
  //     ch6: '5eb1bb714df91809d832d4f3', //Elbow
  //     ch7: '5eb1bb714df91809d832d4f4', //Knee
  //     ch8: '5eb1bb714df91809d832d4f5', //Hip
  //     ch9: '5eb1bb714df91809d832d4f6', //Ankle/Foot
  //     cha: '5eb1bb714df91809d832d4f7', //Jaw

  //     ci: '5eb1a4e199957471610e6ce3', //Fitness
  //     ci1: '5eb1b2ab3beb2d7e05c37cf4', //Yoga
  //     ci2: '5eb1b2ab3beb2d7e05c37cf5', //Sports Specific Conditioning
  //     ci3: '5eb1b93a64bf63066da83586', //Strength Training/Toning
  //     ci4: '5eb1b93a64bf63066da83587', //High Intensity Interval Training
  //     ci5: '5eb1b93a64bf63066da83588', //Running
  //     ci6: '5eb1b93a64bf63066da83589', //Spin/Cycling
  //     ci7: '5eb1b93a64bf63066da83585', //Pilates

  //     /** type of provider */
  //     p1: '',
  //     p2: '',

  //     /** treatment modality */
  //     t1: '',
  //   }
  // },
}

type QuestionnaireAnswerAbbrGroupName = 'gndr' | 'lng' | 'aval' | 'offr' | 'age' | 'cat' | 'cnd' |'type';