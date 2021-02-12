export class Questionnaire {
  private _id: string;
  private _answers: Answer[];
  private _slug: string;
  private _questionType: string;
  private _questionC: string;
  private _questionSP: string;
  private _choiceType: 'multiple' | string;

  get id() { return this._id; }
  get answers() { return this._answers; }
  get slug() { return this._slug; }
  get choiceType() { return this._choiceType; }

  constructor(o: any) {
    this._id = o._id;
    this._slug = o.slug || null;
    this._questionType = o.question_type || null;
    this._questionC = o.c_question || null;
    this._questionSP = o.sp_question || null;
    this._choiceType = o.choice_type || 'multiple';

    if (o.answers) {
      this._answers = [];
      o.answers.forEach(ans => {
        const a = new Answer(ans);
        if (ans.subans) { a.setHasChild(true); }
        this._answers.push(a);
      });
    }
  }

  setAnswers(answers: Answer[]) { this._answers = answers; }
}

export class Answer {
  private _id: string;
  private _itemText: string;
  private _isActive?: boolean;
  private _hasChild: boolean;
  private _subAnswers: Answer[];
  private _level: number;

  get id() { return this._id; }
  get itemText() { return this._itemText; }

  get hasChild() { return this._hasChild; }
  get subAnswers() { return this._subAnswers; }

  get isActive() { return this._isActive; }
  get isRoot() { return (this._level === 0); }
  get isChild() { return (this._level === 1); }

  constructor(o: any) {
    this._id = o._id;
    this._itemText = o.item_text;
    this._isActive = false;
    this._level = 0;
    this._subAnswers = null;
    this._hasChild = false;
  }

  activate(isActive: boolean = true) { this._isActive = isActive; }

  setAsChild() { this._level = 1; }
  setHasChild(hasChild: boolean) { this._hasChild = hasChild; }

  setSubAnswers(aSubs: any[]) {
    this._hasChild = true;
    this._subAnswers = [];
    aSubs.forEach(aSub => {
      const a = new Answer(aSub);
      a.setAsChild();
      this._subAnswers.push(a);
    });
  }

}
