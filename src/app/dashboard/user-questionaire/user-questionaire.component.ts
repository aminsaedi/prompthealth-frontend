import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { SharedService } from '../../shared/services/shared.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { QuestionnaireAnswer, QuestionnaireService, QuestionnaireType } from '../questionnaire.service';
import { CategoryService } from '../../shared/services/category.service';

@Component({
  selector: 'app-user-questionaire',
  templateUrl: './user-questionaire.component.html',
  styleUrls: ['./user-questionaire.component.scss']
})
export class UserQuestionaireComponent implements OnInit {

  ansIDs = [];
  myForm: any;
  public questionnaire: any;
  public type = window.localStorage.getItem('roles');
  typical_hours = [];
  public selectedItems = [];
  userSavePayload;
  subRes = {
    question: '',
    quesId: '',
    options: []
  };

  public subOptions = true;
  showlevel2SubAns = false;
  ageQuestion;
  profile;

  sublevel2Res = {
    question: '',
    quesId: '',
    options: []
  };
  personalMatch = {
    ids: [],
    services: [],
    customer_health: [],
    age_range: [],
    type: 'service',
    typical_hours: [],
    latLong: `${localStorage.getItem('ipLong')}, ${localStorage.getItem('ipLat')}`,
  };
  @Output() ActiveNextTab = new EventEmitter<string>();

  public currentQuestionnaire: string;
  public idxCurrentQuestionnaire = 0;
  public questionnaireTypes: QuestionnaireType[];

  private subscriptionCurrentType: Subscription;
  private subscriptionSubmit: Subscription;

  constructor(
    private toastr: ToastrService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _sharedService: SharedService,
    private _catService: CategoryService,
    private _qService: QuestionnaireService,
    _changeDetector: ChangeDetectorRef,
  ) {
    this.questionnaireTypes = _qService.getQuestionnaireTypes();

    this.subscriptionCurrentType = _qService.observeCurrentQuestionnaireType().subscribe(([type, idx]) => {
      this.currentQuestionnaire = type;
      this.idxCurrentQuestionnaire = idx;
      _changeDetector.detectChanges();
    });

    this.subscriptionSubmit = _qService.observeSubmit().subscribe(() => {
      this.submitQuestionnaire();
    });
  }

  ngOnDestroy() {
    if (this.subscriptionCurrentType) { this.subscriptionCurrentType.unsubscribe(); }
    if (this.subscriptionSubmit) { this.subscriptionSubmit.unsubscribe(); }
  }

  ngOnInit(): void {
    this.userSavePayload = {
      _id: localStorage.getItem('loginID'),
      answers: [],
    };

    this.type = localStorage.getItem('roles');
    if (!this.type) { this.type = 'U'; }
    else { this.getProfileDetails(); }  /* todo: need async await ?*/

    localStorage.removeItem('typical_hours');

    // if questionaire data is set yet, set data.
    if (!this._qService.getQuestionnaireAll()) { this.getUserQuestionnaire(); }

  }

  /** no need for new UI */
  getSubAns(evt, subOption, questType) {
    const parentId = evt.target.id;

    console.log('--', parentId, subOption, questType);

    if (evt.target.checked) {
      this.subOptions = true;
      if (this.selectedItems.indexOf(parentId) === -1) {
        if (questType === 'availability') {
          this.typical_hours.push(parentId);
          this.personalMatch.typical_hours = this.typical_hours;
        } else {
          console.log('parentId', this.selectedItems);
          this.selectedItems.push(parentId);

          console.log('SELECTEDITEMS', this.personalMatch.ids, this.selectedItems);
        }
      }
      if (subOption) {
        this.subRes.question = evt.target.name;
        this.subRes.quesId = parentId;
        const path = `questionare/get-answer/${evt.target.id}`;
        this._sharedService.get(path).subscribe((res: any) => {
          if (res.statusCode === 200) {
            this.subRes.options = res.data;
            console.log(res.data);

          } else {
            this._sharedService.checkAccessToken(res.message);
          }
        }, err => {

          this._sharedService.checkAccessToken(err);
        });
      } else {
        this.subRes.question = '';
        this.subRes.quesId = '';
        this.subRes.options = [];
      }
    } else {
      console.log('unchecked');
      this.subOptions = false;
      const index = this.personalMatch.ids.indexOf(parentId);
      if (index > -1) { this.personalMatch.ids.splice(index, 1); }
      const index2 = this.selectedItems.indexOf(parentId);
      if (index2 > -1) { this.selectedItems.splice(index2, 1); }
      if (questType === 'availability') {
        const index = this.personalMatch.typical_hours.indexOf(parentId);
        if (index > -1) { this.personalMatch.typical_hours.splice(index, 1); }
      }

    }

    const uniqueArr = [... new Set([...this.personalMatch.ids, ...this.selectedItems])];
    this.personalMatch.ids = uniqueArr;
    console.log('personalMatch>>>', this.personalMatch.ids);

  }

  /** get questionaire from server */
  async getUserQuestionnaire() {
    this._sharedService.loader('show');
    const categories = await this._catService.getCategoryAsync();

    //    let path = `questionare/get-questions?type=${this.type}&filter=${this.currentQuestionnaire}`;
    const path = `questionare/get-questions?type=${this.type}`;
    this._sharedService.getNoAuth(path).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.questionnaire = res.data;

        for (let q of this.questionnaire) {
          /** substitute service using categories */
          if(q.slug === 'your-goal-specialties'){
            q.answers = [];
            categories.forEach(c=>{
              const a = {
                _id: c._id,
                item_text: c.item_text,
                subans: true,
                active: false,
                subansData: [],
              }
              c.subCategory.forEach(cSub=>{
                a.subansData.push({
                  _id: cSub._id,
                  item_text: cSub.item_text,
                  subans: false,
                  active: false,
                });
              });
              q.answers.push(a);
            });
          }
          q.answers.forEach((obj: any) => { obj.active = false; });
        }

        this.setAnsChecked();
        this._qService.setQuestionnaire(this.questionnaire);
      } else {
        this._sharedService.checkAccessToken(res.message);
      }
      this._sharedService.loader('hide');
    }, err => {
      this._sharedService.loader('hide');
      this._sharedService.checkAccessToken(err);
    });
  }

  /** set default answer if the user logged in*/
  setAnsChecked() {
    this.questionnaire.forEach(element => {
      if (element.c_question === 'What is your age range?' && this.profile?.customer_age_group) {
        element.answers.forEach(ele => {
          if (ele._id === this.profile.customer_age_group) {
            ele.active = true;
          }
        });
      }

      if (element.c_question === 'Are you looking for your loved one?' && this.profile?.customer_loved) {
        element.answers.forEach(el => {
          if (el._id === this.profile?.customer_loved) {
            el.active = true;
          }
        });
      }

      if (element.c_question === 'Check the status of your health' && this.profile?.customer_health.length) {
        element.answers.forEach(el => {
          this.profile?.customer_health.forEach(save => {
            if (el._id === save) {
              el.active = true;
            }
          });
        });
      }
    });
  }

  getProfileDetails() {
    console.log('calling.....');
    const path = `user/get-profile/${localStorage.getItem('loginID')}`;
    this._sharedService.get(path).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.profile = res.data[0];
      } else {
        this._sharedService.checkAccessToken(res.message);
      }
    }, err => {
      this._sharedService.checkAccessToken(err);
    });
  }


  submitQuestionnaire() {
    this.questionnaireTypes.forEach(type => {
      let q = this._qService.getQuestionnaire(type.id);
      this.setPersonalMatchIfAnswersActive(q.answers, type.personalMatchTarget);
    });

    this.saveQuestionnaire();
  }

  setPersonalMatchIfAnswersActive(answers: QuestionnaireAnswer[], personalMatchTarget: string) {
    answers.forEach(a => {
      if (a.active) {
        this.personalMatch[personalMatchTarget].push(a._id);
      }
      if (a.subans && a.subansData) {
        this.setPersonalMatchIfAnswersActive(a.subansData, personalMatchTarget);
      }
    });
  }


  saveQuestionnaire() {

    this._sharedService.loader('show');
    let payload;
    const path = 'user/updateServices';
    this._sharedService.post(payload, path).subscribe((res: any) => {
      if (res.statusCode === 200) {
        localStorage.setItem('typical_hours', this.typical_hours.toString());
        this.toastr.success(res.message);
      } else {
        this.toastr.error(res.message);

      }
      this._sharedService.loader('hide');
    }, err => {
      this._sharedService.loader('hide');
    });

    this._sharedService.setPersonalMatch(this.personalMatch);

    this._router.navigate(['/dashboard/listing']);
  }
  /*
  nextTabEvent() {
    switch (this.currentQuestionnaire) {
      case 'age': {
        this.currentQuestionnaire = 'health';
        break;
      }
      case 'health': {
        this.currentQuestionnaire = 'goal';
        break;
      }
      case 'goal': {
        this.currentQuestionnaire = 'availability';
        break;
      }
    }
    this.getUserQuestionnaire();
  }
  */
  addQuestion(question, ansID) {
    let data;
    if (question === '5eb1a4e199957471610e6cd5') {
      data = {
        customer_age_group: ansID
      };
    }
    this.updateProfile(data);
  }
  getMultiAns(question_id, event) {
    let data;
    if (event.target.checked) {
      if (this.ansIDs.indexOf(event.target.id) === -1) {
        this.ansIDs.push(event.target.id);
      }
    } else {
      const find = this.ansIDs.indexOf(event.target.id);
      if (find > -1) {
        this.ansIDs.splice(find, 1);
      }
    }
    if (question_id == 'CHECK THE STATUS OF YOUR HEALTH') {
      data = {
        customer_health: this.ansIDs
      };
    }
    this.updateProfile(data);
  }
  updateProfile(data) {
    const payload = {
      _id: localStorage.getItem('loginID'),
      ...data,
    };
    if (data.customer_age_group && data.customer_age_group !== '5eb1a4e199957471610e6cd7' && this.personalMatch.age_range.indexOf(data.customer_age_group) === -1) {
      this.personalMatch.age_range.push(data.customer_age_group);
    }
    // if(data.customer_loved && this.personalMatch.age_range.indexOf(data.customer_loved) === -1) {
    //   this.personalMatch.age_range.push(data.customer_loved);
    // }


    this._sharedService.post(payload, 'user/updateProfile').subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.profile = res.data;
      } else {
        this.toastr.error(res.message);

      }
    }, err => {
    });

  }
  // previousTabEvent() {
  //   if (this.currentQuestionnaire === 'availability') {
  //     this.currentQuestionnaire = 'goal'
  //   }
  //   if (this.currentQuestionnaire === 'goal') {
  //     this.currentQuestionnaire = 'health'
  //   }
  //   if (this.currentQuestionnaire === 'health') {
  //     this.currentQuestionnaire = 'age'
  //   }
  // }

  getSubSubAns(evt, subans) {
    const parentId = evt.target.id;
    console.log('IDS', parentId);
    if (evt.target.checked) {
      if (this.selectedItems.indexOf(parentId) === -1) {
        this.selectedItems.push(parentId);
      }
      if (subans) {
        this.sublevel2Res.question = evt.target.name;
        this.sublevel2Res.quesId = parentId;
        const path = `questionare/get-sub-answer/${parentId}`;
        this._sharedService.get(path).subscribe((res: any) => {
          if (res.statusCode === 200) {
            this.sublevel2Res.options = res.data;
          } else {
            this._sharedService.checkAccessToken(res.message);
          }
        }, err => {

          this._sharedService.checkAccessToken(err);
        });
      } else {
        this.sublevel2Res.question = '';
        this.sublevel2Res.quesId = '';
        this.sublevel2Res.options = [];

      }
    } else {

      console.log('unchecked');
      const index = this.personalMatch.ids.indexOf(parentId);
      if (index > -1) { this.personalMatch.ids.splice(index, 1); }
      const index2 = this.selectedItems.indexOf(parentId);
      if (index2 > -1) { this.selectedItems.splice(index2, 1); }

    }



    const uniqueArr = [... new Set([...this.personalMatch.ids, ...this.selectedItems])];
    this.personalMatch.ids = uniqueArr;
    console.log('Sub ans personalMatch>>>', this.personalMatch.ids);

  }
}
