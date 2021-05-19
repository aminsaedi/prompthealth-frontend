import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireService {


  private personalMatch: QuestionnaireMapPersonalMatch;
  private profileService: QuestionnairesProfileService;
  private profilePractitioner: QuestionnaireMapProfilePractitioner;

  constructor(
    private http: HttpClient,
  ) { }

  /** get selected answer labels (subanswers are NOT nested) */
  public getSelectedLabel(q: Questionnaire, ids: string[], includeSub: boolean = true): string[] {
    const selected = this.getSelectedAnswers(q, ids, includeSub);
    const selectedLabels = [];
    selected.forEach(a => {
      selectedLabels.push(a.item_text);
    });
    return selectedLabels;
  }

  /** get selected answers (subanswers are NOT nested) */
  private getSelectedAnswers(q: Questionnaire, ids: string[], includeSub: boolean = true) {
    const selected: QuestionnaireAnswer[] = []
    q.answers.forEach(a => {
      if(ids.includes(a._id)) {
        selected.push(a);
        if(includeSub && a.subans && a.subansData) {
          a.subansData.forEach(aSub => {
            if(ids.includes(aSub._id)) {
              selected.push(a);
            }
          });
        }
      }
    });
    return selected
  }

  /** get questionnaire for myService tab in profileManagement */
  public getProfileService(role: RoleType): Promise<QuestionnairesProfileService> {
    return new Promise( async (resolve, reject) => {
      if(this.profileService) {
        resolve(this.profileService);
      }else{
        try {
          const qs = await this.getQuestionnaires(role);
          const data: QuestionnairesProfileService = {customerHealth: null, treatmentModality: null, typeOfProvider: null};
          for (const q of qs) {
            let isSet = false;
            switch(q.slug){
              case 'who-are-your-customers':
                data.customerHealth = q;
                isSet = true;
                break;
              case 'treatment-modalities':
                data.treatmentModality = q;
                isSet = true;
                break;
              case 'providers-are-you':
                data.typeOfProvider = q;
                break;
            }

            if(isSet){
              for (const a of q.answers) {
                if(a.subans) {
                  const subAns = await this.getSubAnswers(a._id);
                  a.subansData = subAns;
                }
              }  
            }
          }
          this.profileService = data;
          resolve(data)
        }catch(err){
          reject(err);
        }
      }
    })
  }

  /** get questionnaire for profile-practitioner page */
  public getProfilePractitioner(role: RoleType): Promise<QuestionnaireMapProfilePractitioner> {
    return new Promise( async (resolve, reject) => {
      if(this.profilePractitioner) {
        resolve(this.profilePractitioner);
      }else {
        const promiseAll = [
          this.getQuestionnaires(role),
          this.getProfileQuestionnaires(),
        ];
        Promise.all(promiseAll).then( async values => {
          const data: QuestionnaireMapProfilePractitioner = {
            typeOfProvider: null, 
            treatmentModality: null, 
            customerHealth: null, 
            serviceDelivery: null, 
            language: null, 
            availability: null, 
          }
          
          for(const qs of values){
            let isSet = false;
            for(const q of qs){
              if(q.question_type == 'health' && q.slug == 'who-are-your-customers') {
                data.customerHealth = q;
                isSet = true;
              }else if(q.question_type == 'service' && q.slug == 'treatment-modalities') {
                data.treatmentModality = q;
                isSet = true;
              }else if(q.question_type == 'service' && q.slug == 'providers-are-you') {
                data.typeOfProvider = q;
                isSet = true;
              }else if(q.question_type == 'service' && q.slug == 'offer-your-services') {
                data.serviceDelivery = q;
                isSet = true;
              }else if(q.question_type == 'availability' && q.slug == 'typical-hours') {
                data.availability = q;
                isSet = true;
              }else if(q.question_type == 'service' && q.slug == 'languages-you-offer') {
                data.language = q;
                isSet = true;
              }

              if(isSet) {
                for (const a of q.answers) {
                  if(a.subans) {
                    const subAns = await this.getSubAnswers(a._id);
                    a.subansData = subAns;
                  }
                }    
              }
            }            
          }
          this.profilePractitioner = data;
          resolve(this.profilePractitioner);
        }).catch(err => {
          console.log(err);
          reject(err);
        });
      }
    });
  }

  public getPersonalMatch(): Promise<QuestionnaireMapPersonalMatch> {
    return new Promise( async (resolve, reject) => {
      if(this.personalMatch) {
        resolve(this.personalMatch);
      }else{
        try {
          const qs = await this.getQuestionnaires('U');
          const data: QuestionnaireMapPersonalMatch = {gender: null, spGender: null, health: null}
          qs.forEach(q => {
            switch(q.question_type){
              case 'health':
              case 'spGender':
              case 'gender':
                data[q.question_type] = q;
                q.answers.forEach(async a => {
                  if(a.subans){
                    const subAns = await this.getSubAnswers(a._id);
                    a.subansData = subAns;
                  }
                });
                break;
            }
          });
          this.personalMatch = data;
          resolve(this.personalMatch);
        }catch(err){
          reject(err);
        }
      }
    });
  }

  private getQuestionnaires(type: RoleType = null, filter: QuestionnaireFilter = null): Promise<Questionnaire[]> {
    return new Promise((resolve, reject) => {
      let path = `questionare/get-questions`;
      if(type) { path = path + `?type=${type}`}
      if(filter){
        path = path + '&filter=' + filter;
      }
      this.getNoAuth(path).subscribe((res: any) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res.message); 
        }
      }, (err: any) => {
        console.log(err);
        reject(err);
      });
    });
  }

  private getProfileQuestionnaires(): Promise<Questionnaire[]> {
    return new Promise((resolve, reject) => {
      const path = `questionare/get-profile-questions`;
      this.getNoAuth(path).subscribe((res: any) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else { 
          reject(res.message); 
        }
      }, err => {
        console.log(err);
        reject(err);
      });
    })
  }

  private getSubAnswers(parentId: string): Promise<QuestionnaireAnswer[]> {
    return new Promise((resolve, reject) => {
      const path = `questionare/get-answer/${parentId}`;
      this.getNoAuth(path).subscribe((res: any) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else { 
          reject(res.message); 
        }
      }, (err: any) => {
        console.log(err);
        reject(err);
      });
    });
  }

  private getNoAuth(path: string) {
    return this.http.get(environment.config.API_URL + path);
  }
}

type QuestionnaireFilter = 'health' | 'gender' | 'age' | 'goal';
type QuestionnaireType = 'typeOfProvider';
type RoleType = 'U' | 'SP' | 'C';

export interface QuestionnaireAnswer {
  _id: string;
  item_text: string;
  active?: boolean;
  subans?: boolean;
  subansData?: QuestionnaireAnswer[];
}

export interface Questionnaire {
  _id: string;
  answers: QuestionnaireAnswer[];
  type: RoleType[];

  slug: string;
  question_type?: string;
  category_type: string;
  choice_type: 'single' | 'multiple';

  c_question: string;
  center_question: string;
  sp_question: string;
}


type QuestionnaireMapPersonalMatch = {
  gender: Questionnaire, /** customer gender */
  spGender: Questionnaire, /** prefered gender to see */
  health: Questionnaire, /** customer_health */
  //service: it's not set here. it will be set in formItemService individually using categoryService.
}

export type QuestionnaireMapProfilePractitioner = {
  typeOfProvider: Questionnaire; 
  treatmentModality: Questionnaire; 
  customerHealth: Questionnaire; 
  serviceDelivery: Questionnaire; 
  language: Questionnaire; 
  availability: Questionnaire; 
  //service: it's not set here. it will be set in formItemService individually using categoryService.
}


export type QuestionnairesProfileService = {
  typeOfProvider: Questionnaire,
  treatmentModality: Questionnaire,
  customerHealth: Questionnaire,
  //service: it's not set here. it will be set in formItemService individually using categoryService.
}