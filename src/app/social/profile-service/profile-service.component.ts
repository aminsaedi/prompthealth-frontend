import { Component, OnInit } from '@angular/core';
import { IOptionCheckboxGroup } from 'src/app/shared/form-item-checkbox-group/form-item-checkbox-group.component';
import { QuestionnaireMapProfilePractitioner, QuestionnaireService } from 'src/app/shared/services/questionnaire.service';
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
  constructor(
    private _socialService: SocialService,
    private _qService: QuestionnaireService,
  ) { }

  ngOnInit(): void {
  }

}
