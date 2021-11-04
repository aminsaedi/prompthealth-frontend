import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderStatusService } from 'src/app/shared/services/header-status.service';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  public professionalSignup = false;
  public partnerSignup = false;

  public userRole: string;

  constructor(
    private route: ActivatedRoute,
    private _router: Router,
    private _uService: UniversalService,
    private _headerStatusService: HeaderStatusService,
    ) { }

  ngOnInit() {
    this.route.params.subscribe(param => {
      const type = param.type;
      this.professionalSignup = (type.toLowerCase() == 'u') ? false : true;
      this.partnerSignup = (type.toLowerCase() == 'p') ? true : false;
      switch (type.toLowerCase()) {
        case 'u':  this.userRole = 'U';  break;
        case 'sp': this.userRole = 'SP'; break;
        case 'c':  this.userRole = 'C';  break;
        case 'p':  this.userRole = 'P';  break;
      }
    });

    this._uService.setMeta(this._router.url, {
      title: 'Registration | PromptHealth',
    });
  }

  changeHeaderShadowStatus(isShown: boolean) {
    if(isShown) {
      this._headerStatusService.showShadow();
    } else {
      this._headerStatusService.hideShadow();
    }
  }  
}
