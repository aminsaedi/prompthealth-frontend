import { Component, OnInit } from '@angular/core';
import { QuestionnaireMapProfilePractitioner, QuestionnaireService } from 'src/app/shared/services/questionnaire.service';
import { slideVerticalAnimation } from 'src/app/_helpers/animations';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-profile-about',
  templateUrl: './profile-about.component.html',
  styleUrls: ['./profile-about.component.scss'],
})
export class ProfileAboutComponent implements OnInit {

  get profile() { return this._socialService.selectedProfile; }
  get questionnaires() { return this._qService.questionnaireOf('profilePractitioner') as QuestionnaireMapProfilePractitioner; }

  constructor(
    private _socialService: SocialService,
    private _qService: QuestionnaireService,
  ) { }

  ngOnInit(): void {
  }

}
