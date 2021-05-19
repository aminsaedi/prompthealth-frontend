import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { RegisterType } from '../register-questionnaire/register-questionnaire.component';

@Component({
  selector: 'app-register-questionnaire-complete',
  templateUrl: './register-questionnaire-complete.component.html',
  styleUrls: ['./register-questionnaire-complete.component.scss']
})
export class RegisterQuestionnaireCompleteComponent implements OnInit {

  constructor(
    private _toastr: ToastrService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _uService: UniversalService,
  ) { }

  public routePlan: string[];
  private timer: any;

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'Registration complete | PromptHealth',
    });
    this._route.queryParams.subscribe((params: {type: RegisterType}) => {
      // let message: string;

      this.routePlan = (params.type == 'practitioner') ? ['/plans'] : ['/plans/product'];
      // message = 'You will be redirected to plan page in 5 seconds.';


      // if(this.backToAmbassador) {
      //   this.nextRoute = ['/ambassador-program'];
      //   message = 'You will be redirected to Ambassador program page in 5 seconds.';
      // }else{
      // }

      // this._toastr.success(message);

      // this.timer = setTimeout(()=>{
      //   this._router.navigate(this.nextRoute);
      // }, 5000);
  
    });
  }
}

