import { Component, OnInit } from '@angular/core';
import { QuestionnaireMapProfilePractitioner, QuestionnaireService } from 'src/app/shared/services/questionnaire.service';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-profile-service',
  templateUrl: './profile-service.component.html',
  styleUrls: ['./profile-service.component.scss']
})
export class ProfileServiceComponent implements OnInit {

  get profile() { return this._socialService.selectedProfile; }
  public questionnaires: QuestionnaireMapProfilePractitioner;

  constructor(
    private _socialService: SocialService,
    private _qService: QuestionnaireService,
  ) { }

  ngOnInit(): void {
    this._qService.getProfilePractitioner('SP').then(d => {
      this.questionnaires = d;
      console.log(d);
    });
  }

}
