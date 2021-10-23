import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IOptionCheckboxGroup } from 'src/app/shared/form-item-checkbox-group/form-item-checkbox-group.component';
import { QuestionnaireMapProfilePractitioner, QuestionnaireService } from 'src/app/shared/services/questionnaire.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-profile-service',
  templateUrl: './profile-service.component.html',
  styleUrls: ['./profile-service.component.scss']
})
export class ProfileServiceComponent implements OnInit {

  get profile() { return this._socialService.selectedProfile; }
  get questionnaires() { return this._qService.questionnaireOf('profilePractitioner') as QuestionnaireMapProfilePractitioner; }

  public optionNestedFormCheckboxGroup: IOptionCheckboxGroup = {
    showBlockWithZeroMarginWhenDisabled: true, 
    // showBlockSubWithZeroMarginWhenDisabled: true, 
    showInlineSubWhenDisabled: true,
    removeIndentSub: true, 
    fontSmallSub: true
  }

  public optionFormCheckboxGroup: IOptionCheckboxGroup = {
    showInlineWhenDisabled: true,
    inlineSeparator: ', ',
  }

  private subscription: Subscription;

  constructor(
    private _socialService: SocialService,
    private _qService: QuestionnaireService,
    private _uService: UniversalService,
    private _router: Router,
  ) { }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  ngOnInit(): void {
    this.setMeta();

    this.subscription = this._socialService.selectedProfileChanged().subscribe(() => {
      this.setMeta();
    });  
  }

  setMeta() {
    if(this.profile) {
      this._uService.setMeta(this._router.url, {
        title: `Service by ${this.profile.name} | PromptHealth Community`,
        description: `Check out what services ${this.profile.name} offers.`,
        image: this.profile.imageFull,
        imageType: this.profile.imageType,
        imageAlt: this.profile.name,
      });  
    }
  }

}
