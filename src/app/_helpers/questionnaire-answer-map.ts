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
  svc: {
    full: 'services',
    abbrs: {
      /** customer health */
      hc: '', //clonic health
      hp: '', //pregnant  

      /** category */
      ca: '',
      ca1: '',
      ca2: '',
      ca3: '',
      ca4: '',
      cb: '',
      cb1: '',

      /** type of provider */
      p1: '',
      p2: '',

      /** treatment modality */
      t1: '',
    }
  },
}

type QuestionnaireAnswerAbbrGroupName = 'gndr' | 'lng' | 'aval' | 'offr' | 'age' | 'svc';