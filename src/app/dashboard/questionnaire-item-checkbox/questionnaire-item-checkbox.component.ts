import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,  Router } from '@angular/router';
import{ FormControl, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import{ QuestionnaireService, QuestionnaireAnswer, Questionnaire } from '../questionnaire.service';
import { SharedService } from '../../shared/services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-questionnaire-item-checkbox',
  templateUrl: './questionnaire-item-checkbox.component.html',
  styleUrls: ['./questionnaire-item-checkbox.component.scss']
})
export class QuestionnaireItemCheckboxComponent implements OnInit {

  public questionnaire: Questionnaire;
  public isInvalid: boolean = false;
  public isFirstQuestion: boolean = true;
  public isLastQuestion: boolean = false;

  public form: FormGroup;
  public optionStyle: string; 

  private type: string;
  private subscription: Subscription = null;

  constructor(
    private _qService: QuestionnaireService,
    private _sharedService: SharedService,
    private _route: ActivatedRoute,
    private _router: Router,
    _fb: FormBuilder,
  ) { 
    this.form = _fb.group({ root: new FormArray([]) });
  }

  ngDestroy(){ if(!!this.subscription){ this.subscription.unsubscribe(); } }

  ngOnInit(): void {
    this._route.data.subscribe(data=>{
      this.type = data.q;
      this.optionStyle = data.style;

      this._qService.setCurrentQuestionnaireType(this.type);
      this.isFirstQuestion = this._qService.isFirstQuestion();
      this.isLastQuestion = this._qService.isLastQuestion();
    
      this.questionnaire = this._qService.getQuestionnaire();
      this.initForm();

      if(!this.questionnaire){
        this.subscription = this._qService.observeQuestionnaire().subscribe(q => {
          this.questionnaire = q;
          this.initForm();
        },
        (err) => { this._router.navigate(['../', err.backTo], {relativeTo: this._route}); });  
      }
    });
  }

  initForm(){
    if(this.questionnaire && this.questionnaire.answers){
      this.questionnaire.answers.forEach((a:QuestionnaireAnswer)=>{
        this.getFormArray('root').push(new FormControl(a.active));

        if(a.subans && a.subansData){
          this.addChildForm(a._id, a.subansData);
        }
      });
    }
  }

  addChildForm(parentId: string, answersChild: QuestionnaireAnswer[]){
    this.form.addControl(parentId, new FormArray([]));
    answersChild.forEach(a=>{
      this.getFormArray(parentId).push(new FormControl(a.active));
    });
  }

  getFormArray(name: string){ return this.form.controls[name] as FormArray; }

  changeCheck(target: QuestionnaireAnswer, formArrayName: string, i: number){
    this.isInvalid = false;

    target.active = this.getFormArray(formArrayName).controls[i].value;
    // if(target.subans && !target.subansData){ this.getChildCategories(target); }
  }

  // getChildCategories(parent: QuestionnaireAnswer){
  //   const path = `questionare/get-answer/${parent._id}`;
  //     this._sharedService.get(path).subscribe((res: any) => {
  //       if (res.statusCode === 200) {
  //         var subansData: QuestionnaireAnswer[] = [];

  //         res.data.forEach((a: any)=>{
  //           subansData.push({
  //             _id: a._id,
  //             item_text: a.item_text,
  //             active: false,
  //             subans: a.subans,
  //           });
  //         });

  //         parent.subansData = subansData;
  //         this.addChildForm(parent._id, subansData);

  //       } else {
  //         this._sharedService.checkAccessToken(res.message);
  //       }
  //     }, err => {

  //       this._sharedService.checkAccessToken(err);
  //     });
  // }

  cancel(){
    this.isInvalid = false;

    var preRoute = this._qService.getQuestionnaireTypePre();
    if(preRoute){ this.goto(preRoute, true); }
    
    return;
  }

  submit(){
    var isInvalid = true;
    this.getFormArray('root').value.forEach(val=>{ if(val){ isInvalid = false; } });

    this.isInvalid = isInvalid;
    if(isInvalid){ return; }
 
    var nextRoute = this._qService.getQuestionnaireTypeNext();
    if(nextRoute){ this.goto(nextRoute); }
    else{ this._qService.emitSubmit(); }
    
    return;
  }

  goto(route: string, replaceUrl: boolean = false){
    this._router.navigate(['../', route], {relativeTo: this._route, replaceUrl: replaceUrl});
  }
}
