import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { SharedService } from '../../shared/services/shared.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { QuestionnaireItemData, RegisterQuestionnaireService } from '../register-questionnaire.service';
import { IUserDetail } from 'src/app/models/user-detail';

@Component({
  selector: 'app-user-questionaire',
  templateUrl: './user-questionaire.component.html',
  styleUrls: ['./user-questionaire.component.scss']
})
export class UserQuestionaireComponent implements OnInit {

  public data: QuestionnaireItemData[] = [
    {route: 'gender', label: 'Gender', isComplete: false},
    {route: 'age', label: 'Age', isComplete: false},
    {route: 'background', label: 'Health Background', isComplete: false},
    {route: 'goal', label: 'Goal', isComplete: false},
    // {route: 'availability', label: 'Availability', isComplete: false},
  ];
  public currentIdx = 0;

  // ansIDs = [];
  // myForm: any;
  // public questionnaire: any;
  // public type = window.localStorage.getItem('roles');
  // typical_hours = [];
  // public selectedItems = [];
  // userSavePayload;
  // subRes = {
  //   question: '',
  //   quesId: '',
  //   options: []
  // };

  // public subOptions = true;
  // showlevel2SubAns = false;
  // ageQuestion;
  // profile;

  // sublevel2Res = {
  //   question: '',
  //   quesId: '',
  //   options: []
  // };
  // personalMatch = {
  //   ids: [],
  //   services: [],
  //   customer_health: [],
  //   age_range: [],
  //   type: 'service',
  //   typical_hours: [],
  //   latLong: `${localStorage.getItem('ipLong')}, ${localStorage.getItem('ipLat')}`,
  // };
  // @Output() ActiveNextTab = new EventEmitter<string>();


  // public currentQuestionnaire: string;
  // public idxCurrentQuestionnaire = 0;
  // public questionnaireTypes: QuestionnaireType[];

  // private subscriptionCurrentType: Subscription;
  // private subscriptionSubmit: Subscription;
  private subscriptionIndex: Subscription;
  private subscriptionFinish: Subscription;

  constructor(
    private _toastr: ToastrService,
    private _router: Router,
    // private _route: ActivatedRoute,
    private _sharedService: SharedService,
    // private _catService: CategoryService,
    // private _qService: QuestionnaireService,
    private _qService: RegisterQuestionnaireService,
    private _changeDetector: ChangeDetectorRef,
  ) {}

  ngOnDestroy() {
    if(this.subscriptionIndex) { this.subscriptionIndex.unsubscribe(); }
    if(this.subscriptionFinish) { this.subscriptionFinish.unsubscribe(); }
  }

  ngOnInit(): void {
    this._qService.init(this.data, {});

    this.subscriptionIndex = this._qService.observeIndex().subscribe((i: number) => {
      this.currentIdx = i;
      this._changeDetector.detectChanges();
    });

    this.subscriptionFinish = this._qService.observeFinish().subscribe((isCompleteAll: boolean) => {
      if(!isCompleteAll){
        this._toastr.error('You haven\'t enter some sections. Please review from beginning.');
      }
      else{ 
        this._sharedService.loader('show');
        try{
          this._sharedService.setPersonalMatch(this._qService.getUser());

          const data = this._qService.getUserTracking();

          const [ipLat, ipLng] = [localStorage.getItem('ipLat'), localStorage.getItem('ipLong')];
          if(ipLat && ipLng){ data.location = [Number(ipLat), Number(ipLng)]}

          const user:IUserDetail = JSON.parse(localStorage.getItem('user'));
          data.roles = user ? user.roles : 'U';

          this._router.navigate(['/dashboard/listing']);          
        }catch(err){
          this._toastr.error(err);
        }finally{
          this._sharedService.loader('hide');
        }
      }
    });
  }

  onClickNavigation(type: string){ this._qService.navigateByParent(type); }



  // saveQuestionnaire() {

  //   this._sharedService.loader('show');
  //   let payload;
  //   const path = 'user/updateServices';
  //   this._sharedService.post(payload, path).subscribe((res: any) => {
  //     if (res.statusCode === 200) {
  //       localStorage.setItem('typical_hours', this.typical_hours.toString());
  //       this._toastr.success(res.message);
  //     } else {
  //       this._toastr.error(res.message);

  //     }
  //     this._sharedService.loader('hide');
  //   }, err => {
  //     this._sharedService.loader('hide');
  //   });

  //   this._sharedService.setPersonalMatch(this.personalMatch);

  //   this._router.navigate(['/dashboard/listing']);
  // }

  // addQuestion(question, ansID) {
  //   let data;
  //   if (question === '5eb1a4e199957471610e6cd5') {
  //     data = {
  //       customer_age_group: ansID
  //     };
  //   }
  //   this.updateProfile(data);
  // }
  // getMultiAns(question_id, event) {
  //   let data;
  //   if (event.target.checked) {
  //     if (this.ansIDs.indexOf(event.target.id) === -1) {
  //       this.ansIDs.push(event.target.id);
  //     }
  //   } else {
  //     const find = this.ansIDs.indexOf(event.target.id);
  //     if (find > -1) {
  //       this.ansIDs.splice(find, 1);
  //     }
  //   }
  //   if (question_id == 'CHECK THE STATUS OF YOUR HEALTH') {
  //     data = {
  //       customer_health: this.ansIDs
  //     };
  //   }
  //   this.updateProfile(data);
  // }
  // updateProfile(data) {
  //   const payload = {
  //     _id: localStorage.getItem('loginID'),
  //     ...data,
  //   };
  //   if (data.customer_age_group && data.customer_age_group !== '5eb1a4e199957471610e6cd7' && this.personalMatch.age_range.indexOf(data.customer_age_group) === -1) {
  //     this.personalMatch.age_range.push(data.customer_age_group);
  //   }
  //   // if(data.customer_loved && this.personalMatch.age_range.indexOf(data.customer_loved) === -1) {
  //   //   this.personalMatch.age_range.push(data.customer_loved);
  //   // }


  //   this._sharedService.post(payload, 'user/updateProfile').subscribe((res: any) => {
  //     if (res.statusCode === 200) {
  //       this.profile = res.data;
  //     } else {
  //       this._toastr.error(res.message);

  //     }
  //   }, err => {
  //   });

  // }
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

  // getSubSubAns(evt, subans) {
  //   const parentId = evt.target.id;
  //   console.log('IDS', parentId);
  //   if (evt.target.checked) {
  //     if (this.selectedItems.indexOf(parentId) === -1) {
  //       this.selectedItems.push(parentId);
  //     }
  //     if (subans) {
  //       this.sublevel2Res.question = evt.target.name;
  //       this.sublevel2Res.quesId = parentId;
  //       const path = `questionare/get-sub-answer/${parentId}`;
  //       this._sharedService.get(path).subscribe((res: any) => {
  //         if (res.statusCode === 200) {
  //           this.sublevel2Res.options = res.data;
  //         } else {
  //           this._sharedService.checkAccessToken(res.message);
  //         }
  //       }, err => {

  //         this._sharedService.checkAccessToken(err);
  //       });
  //     } else {
  //       this.sublevel2Res.question = '';
  //       this.sublevel2Res.quesId = '';
  //       this.sublevel2Res.options = [];

  //     }
  //   } else {

  //     console.log('unchecked');
  //     const index = this.personalMatch.ids.indexOf(parentId);
  //     if (index > -1) { this.personalMatch.ids.splice(index, 1); }
  //     const index2 = this.selectedItems.indexOf(parentId);
  //     if (index2 > -1) { this.selectedItems.splice(index2, 1); }

  //   }



  //   const uniqueArr = [... new Set([...this.personalMatch.ids, ...this.selectedItems])];
  //   this.personalMatch.ids = uniqueArr;
  //   console.log('Sub ans personalMatch>>>', this.personalMatch.ids);

  // }
}
