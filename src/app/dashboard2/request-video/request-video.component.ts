import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.scss']
})
export class RequestVideoComponent implements OnInit {

  get user() { return this._profileService.profile; }
  
  constructor(
    private _profileService: ProfileManagementService,
    private _uService: UniversalService,
    private _router: Router,
  ) { }

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'Request additional video | PromptHealth',
    });
  }
}
