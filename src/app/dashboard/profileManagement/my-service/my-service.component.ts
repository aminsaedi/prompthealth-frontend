import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../shared/services/shared.service';
import { BehaviorService } from '../../../shared/services/behavior.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Questionnaire, Answer } from '../../../models/questionnaire';
import { Professional } from '../../../models/professional';
import { FormControl, FormBuilder, FormGroup, FormArray } from '@angular/forms';

import { CategoryService, Category } from '../../../shared/services/category.service';

@Component({
  selector: 'app-my-service',
  templateUrl: './my-service.component.html',
  styleUrls: ['./my-service.component.scss']
})
export class MyServiceComponent implements OnInit {

  public submitted = false;
  public editFields = false;
  public userInfo: any;
  public profile: any;
  public roles = '';
  public form: FormGroup;

  public profileQuestions: any;

  public questionnaires: {id: string, itemText: string, slug: string, data: Questionnaire}[] = [
    {id: 'service', itemText: 'service', slug: 'serviceCategory', data: null},
    {id: 'healthStatus', itemText: 'status of customer\'s health', slug: 'who-are-your-customers', data: null},
    {id: 'offer', itemText: 'your offer', slug: 'your-offering', data: null},
    {id: 'treatmentModality', itemText: 'treatment modality', slug: 'treatment-modalities', data: null},
    {id: 'typeOfProvider', itemText: 'type of provider', slug: 'providers-are-you', data: null},
  ];

  constructor(
    private _toastr: ToastrService,
    private _bs: BehaviorService,
    private _sharedService: SharedService,
    private _modalService: NgbModal,
    private _spinner: NgxSpinnerService,
    private _catService: CategoryService,
    private _fb: FormBuilder,
    ) { 
      this.form = _fb.group({});
    }

  getFormArray(name: string){ return this.form.controls[name] as FormArray; }
  getQuestionnaire(id: string){
    const questionnaires = this.questionnaires;
    let result: Questionnaire;
    questionnaires.forEach(q=>{if(id === q.id){ result = q.data; }});
    return result;
  }

  async ngOnInit(): Promise<void> {
    this.userInfo = JSON.parse(localStorage.getItem('user'));
    this.roles = localStorage.getItem('roles');
    const cat = await this._catService.getCategoryAsync();

    this.setQuestionnareService(cat);

    const promiseAll = [
      this.setServiceQuestion(),
      this.setProfileDetails(),
    ];

    Promise.all(promiseAll).then(()=>{
      this.initForm();
    }).catch(err => {
      if(err && err.length > 0){ this._toastr.error(err); }
    })
    .finally(()=>{  this._sharedService.loader('hide'); })
  }

  setQuestionnareService(cats: Category[]){
    for(let q of this.questionnaires){
      if(q.id == 'service'){
        const answers: Answer[] = [];
        cats.forEach(c=>{
          const a = new Answer(c);
          a.setSubAnswers(c.subCategory);
          answers.push(a);
        });

        q.data = new Questionnaire({ _id: 'service' });
        q.data.setAnswers(answers);
      }
    }
  }

  updateFields() {
    this.editFields = !this.editFields;

    if (this.editFields) {
      this.submitted = true;
    } else {
      this.submitted = false;
    }
  }


  setServiceQuestion(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const path = `questionare/get-questions?type=${this.roles}`;
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if(res.statusCode === 200){
          const promiseAll = [];

          this.questionnaires.forEach(q=>{
            res.data.forEach((el: any)=>{
              if(q.slug === el.slug){ 
                q.data = new Questionnaire(el);
                q.data.answers.forEach(a=>{
                  if(a.hasChild){ promiseAll.push(this.setChildQuestion(a)); }
                })
              }
            });
          });
          if(promiseAll.length > 0){
            Promise.all(promiseAll).then(()=> { resolve(true); }).catch((err) => { reject(err); });
          }else{
            resolve(true)            
          }
        }
        else{ reject(res.message); }
      }, 
      (err) => {
        console.log(err);
        reject('Something went wrong');
      });
    });
  }


  /** get sub answer if parent answer has sub answer */
  setChildQuestion(parent: Answer): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const path = `questionare/get-answer/${parent.id}`;
      this._sharedService.get(path).subscribe((res: any) => {
        if (res.statusCode === 200) {
          parent.setSubAnswers(res.data);
          resolve(true);
        } 
        else { reject(res.message); }
      }, err => {
        console.log(err);
        // this._sharedService.checkAccessToken(err);
        reject('Something went wrong');
      });

    })
  }


  setProfileDetails(): Promise<boolean> {
    return new Promise((resolve, reject)=>{
      const path = `user/get-profile/${this.userInfo._id}`;
      this._sharedService.get(path).subscribe((res: any) => {
        if (res.statusCode === 200) {
          if(res.data[0]){
            this.profile = new Professional(res.data[0]._id, res.data[0]);
          }
          resolve(true);
        }
        else{ 
          this._sharedService.checkAccessToken(res);
          reject(res.message); 
        }
      }, err => {
        console.log(err);
        this._sharedService.checkAccessToken(err);
        reject('Something went wrong');
      });
    })
  }

  initForm(){
    const ids = this.profile.allServiceId;

    this.questionnaires.forEach(q=>{
      this.form.setControl(q.id, new FormArray([]));

      q.data.answers.forEach(a=>{
        a.activate(!!(ids.indexOf(a.id) > -1));
        this.getFormArray(q.id).push(new FormControl(a.isActive));

        if(a.hasChild){
          this.form.setControl(`${q.id}_${a.id}`, new FormArray([]));
          a.subAnswers.forEach(aSub=>{
            aSub.activate(!!(ids.indexOf(aSub.id) > -1));
            this.getFormArray(`${q.id}_${a.id}`).push(new FormControl(aSub.isActive));
          });
        }
      });
    });
  }



  save(){
    console.log(this.profile)
    this.questionnaires.forEach(q=>{
      const vals = this.getFormArray(q.id).value as boolean[];
      vals.forEach((val, i)=>{
        /** sync root answers in questionnaire */
        q.data.answers[i].activate(val);

        /** if sub answers exist, sync sub answers in questionnaire */
        if(q.data.answers[i].hasChild){
          const formArraySub = this.getFormArray(`${q.id}_${q.data.answers[i].id}`);

          /** if root answer is unchecked, sub uncheck all sub answers */
          if(!val && formArraySub){
            (formArraySub.controls as FormControl[]).forEach(control=>{ control.setValue(false); })
          }

          /** sync sub answers in questionnare */
          (formArraySub.value as boolean[]).forEach((valSub, j)=>{
            q.data.answers[i].subAnswers[j].activate(valSub);
          });
        }
      });
//      this.profile.populateByQuestionnaire(q.data);
    });

    const services = [];
    const serviceList = ['healthStatus', 'offer', 'treatmentModality', 'service', 'typeOfProvider'];
    serviceList.forEach(id=>{
      const f = this.getQuestionnaire(id);
      f.answers.forEach(a=>{
        if(a.isActive){ services.push(a.id); }
        if(a.hasChild){
          a.subAnswers.forEach(aSub=>{
            if(aSub.isActive){ services.push(aSub.id); }
          });
        }
      });
    });

    const data = {
      _id: this.profile.id,
      services: services
    }
    this._sharedService.post(data, 'user/updateProfile').subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.profile = new Professional(res.data._id, res.data);
        this.initForm();

        this._toastr.success(res.message);
        this._bs.setUserData(res.data);
        this.editFields = false;
      } else {
        this._toastr.error(res.message);
      }
    }, err => {
      this._toastr.error('There are some errors, please try again after some time !', 'Error');
    });
  }

}
