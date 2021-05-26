import { Component, OnInit } from '@angular/core';
import { Questionnaire, QuestionnaireAnswer, QuestionnaireMapSitemap, QuestionnaireService } from 'src/app/shared/services/questionnaire.service';
import { locations } from 'src/app/_helpers/location-data';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ToastrService } from 'ngx-toastr';
// import { SharedService } from '../../shared/services/shared.service';
// import { Router } from '@angular/router';

// declare var FB: any;
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  // email: any;
  constructor(
    private _qService: QuestionnaireService,
    // private formBuilder: FormBuilder,
    // private _router: Router,
    // private _sharedService: SharedService,
    // private toastr: ToastrService,
  ) { }

  public typeOfProviderListHighlight: QuestionnaireAnswer[]; /** only contains 5 type of providers */
  public countCities: number = 0;
  public countTypeOfProviders: number = 0;
  
  ngOnInit() {

    this.countCities = Object.keys(locations).length;
    
    this._qService.getSitemap().then(data => { 
      this.typeOfProviderListHighlight =data.typeOfProvider.answers.slice(0,5);
      this.countTypeOfProviders = data.typeOfProvider.answers.length;
    });
  }

  // route(path, queryParams) {
  //   this._router.navigate([path], { queryParams: queryParams });
  // }

  // subscribe() {
  //   let data = { email: this.email }
  //   if (!this.email || ((this.email.indexOf('@') == -1) && (this.email.indexOf('.') == -1))) {
  //     this._sharedService.showAlert('Please enter valid email id.', 'alert-danger');
  //     return;
  //   }
  //   this._sharedService.loader('show');
  //   this._sharedService.post(data, 'subscription').subscribe((res: any) => {
  //     this._sharedService.loader('hide');
  //     this.email = '';
  //     if (res.success) {
  //       this._sharedService.showAlert(res.data.message, 'alert-success');
  //     } else {
  //       this._sharedService.showAlert(res.error.message, 'alert-danger');
  //     }
  //   }, (error) => { });
  // }
}
