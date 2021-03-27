import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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
  }
}
