import { Component, OnInit } from "@angular/core";
import { BehaviorService } from '../../shared/services/behavior.service';
import { SharedService } from '../../shared/services/shared.service';
import { environment } from 'src/environments/environment';
import { UniversalService } from "src/app/shared/services/universal.service";
import { Router } from "@angular/router";
import { Professional } from "src/app/models/professional";
import { ProfileManagementService } from "src/app/shared/services/profile-management.service";
import { QuestionnaireMapProfilePractitioner, QuestionnaireService } from "src/app/shared/services/questionnaire.service";
import { IOptionCheckboxGroup } from "src/app/shared/form-item-checkbox-group/form-item-checkbox-group.component";

@Component({
  selector: "app-listingcompare",
  templateUrl: "./listingcompare.html",
  styleUrls: ["./listingcompare.scss"]
})

export class ListingcompareComponent implements OnInit {
  get user() { return this._profileService.profile; }
  get questionnaires() { return this._qService.questionnaireOf('profilePractitioner') as QuestionnaireMapProfilePractitioner; }

  public professionals: Professional[];

  public optionNestedFormCheckboxGroup: IOptionCheckboxGroup = {
    showBlockWithZeroMarginWhenDisabled: true, 
    showInlineSubWhenDisabled: true,
    removeIndentSub: true, 
    fontSmallSub: true
  }

  public optionFormCheckboxGroup: IOptionCheckboxGroup = {
    showInlineWhenDisabled: true,
    inlineSeparator: ', ',
  }

  compareIds;
  languageQuestion;
  avalibilityQuestion;
  serviceOffering;
  categoryList;

  loggedInUser: string;
  public AWS_S3='';

  constructor(
    private _router: Router,
    private behaviorService: BehaviorService,
    private sharedService: SharedService,
    private _uService: UniversalService,
    private _profileService: ProfileManagementService,
    private _qService: QuestionnaireService,
  ) { }

  ngOnInit(): void {
    this.loggedInUser = localStorage.getItem('loginID');
    this.professionals = this.sharedService.getCompareList();

    this.getProfileQuestion();
    this.AWS_S3 = environment.config.AWS_S3
    // this.data = this.compareIds[i];
    this._uService.setMeta(this._router.url), {
      title: 'Compare practitioners | PromptHealth',
    };
  }

  getProfileQuestion() {
    let path = `questionare/get-profile-questions`;
    this.sharedService.getNoAuth(path).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.compareIds = this.behaviorService.getCopmareIds().value;

        for (var i = 0; i < this.compareIds.length; ++i) {
          // if (this.compareIds[i]) this.data.push(this.compareIds[i]);
        }

        res.data.forEach(element => {
          if (element.question_type === 'service' && element.slug === "languages-you-offer") {
            this.languageQuestion = element
          }
          if (element.question_type === 'availability') {
            this.avalibilityQuestion = element
          }
        });
      } else {
        //  this.toastr.error(res.message);

      }
    }, err => {
      this.sharedService.loader('hide');
    });
  }
}
