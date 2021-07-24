import { Component, OnInit } from '@angular/core';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-profile-review',
  templateUrl: './profile-review.component.html',
  styleUrls: ['./profile-review.component.scss']
})
export class ProfileReviewComponent implements OnInit {

  get profile() { return this._socialService.selectedProfile; }
  
  constructor(
    private _socialService: SocialService,
  ) { }

  ngOnInit(): void {
  }

}
