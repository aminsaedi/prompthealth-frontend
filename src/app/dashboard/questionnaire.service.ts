import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireService {


  constructor() { }
  private questionnaireObserver = new Subject<any>();
  private currentQuestionnaireTypeObserver = new Subject<[string, number]>();
  private submitObserver = new Subject<void>();

  private currentQuestionnaireType: string;
  private questionnaire: Questionnaire[];

  private questionnaireTypes: QuestionnaireType[] = [
    { id: 'age', label: 'Age', slug: 'age-range-of-clients', personalMatchTarget: 'age_range' },
    { id: 'background', label: 'Health Background', slug: 'who-are-your-customers', personalMatchTarget: 'customer_health' },
    { id: 'goal', label: 'Goal', slug: 'your-goal-specialties', personalMatchTarget: 'services' },
    { id: 'availability', label: 'Availability', slug: 'typical-hours', personalMatchTarget: 'typical_hours' },
  ];

  public observeQuestionnaire(): Observable<any> { return this.questionnaireObserver; }
  private emitQuestionnaire() { this.questionnaireObserver.next(this.getQuestionnaire()); }
  private throwQuestionnaire(i: number, status: string) { this.questionnaireObserver.error({ idxBackTo: i, backTo: this.questionnaireTypes[i].label, status }); }

  public observeCurrentQuestionnaireType(): Observable<[string, number]> { return this.currentQuestionnaireTypeObserver; }
  private emitCurrentQuestionnaireType() {
    this.currentQuestionnaireTypeObserver.next([this.currentQuestionnaireType, this.getCurrentIdxQuestionnaire()]);
  }

  public observeSubmit(): Observable<void> { return this.submitObserver; } public emitSubmit() { this.submitObserver.next(); }

  isFirstQuestion() { return (this.getCurrentIdxQuestionnaire() === 0); }
  isLastQuestion() { return (this.getCurrentIdxQuestionnaire() === this.questionnaireTypes.length - 1); }

  getQuestionnaireTypes() { return this.questionnaireTypes; }

  setCurrentQuestionnaireType(type: string) {
    this.currentQuestionnaireType = type;
    this.emitCurrentQuestionnaireType();
  }

  getQuestionnaire(type?: string): Questionnaire {
    if (!this.questionnaire || this.questionnaire.length === 0 || !this.currentQuestionnaireType) { return null; }
    if (!type) { type = this.currentQuestionnaireType; }

    let qType: QuestionnaireType;
    for (let i = 0; i < this.questionnaireTypes.length; i++) {
      if (this.questionnaireTypes[i].id === type) { qType = this.questionnaireTypes[i]; break; }
    }

    let q: any = null;
    for (let i = 0; i < this.questionnaire.length; i++) {
      if (this.questionnaire[i].slug === qType.slug) { q = this.questionnaire[i]; break; }
    }
    return q;
  }
  getQuestionnaireAll() { return this.questionnaire; }

  setQuestionnaire(q: any[], emit: boolean = true) {
    this.questionnaire = q;

    const idxCurrent = this.getCurrentIdxQuestionnaire();
    if (idxCurrent > 0) {
      for (let i = 0; i < idxCurrent; i++) {
        let isAnswered = false;
        this.questionnaire[i].answers.forEach(a => {
          if (a.active) { isAnswered = true; }
        });
        if (!isAnswered) {
          this.throwQuestionnaire(i, 'not answered some question before');
          return;
        }
      }
    }
    if (emit) { this.emitQuestionnaire(); }
  }

  getCurrentIdxQuestionnaire() {
    let idxCurrentQuestionnaire: number = null;
    for (let i = 0; i < this.questionnaireTypes.length; i++) {
      if (this.questionnaireTypes[i].id === this.currentQuestionnaireType) {
        idxCurrentQuestionnaire = i;
        break;
      }
    }
    return idxCurrentQuestionnaire;
  }
  getQuestionnaireTypePre() {
    const i = this.getCurrentIdxQuestionnaire();
    if (i === 0) { return null; } else { return this.questionnaireTypes[i - 1].id; }
  }
  getQuestionnaireTypeNext() {
    const i = this.getCurrentIdxQuestionnaire();
    if (i >= this.questionnaireTypes.length - 1) { return null; } else { return this.questionnaireTypes[i + 1].id; }
  }

}

export interface QuestionnaireType { id: string; label: string; personalMatchTarget: string; slug: string; }

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
  slug: string;
  question_type?: string;
  c_question: string;
}
