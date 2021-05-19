import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { SharedService } from '../../shared/services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';



@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss']
})
export class SubscribeComponent implements OnInit {
  days: any;
  hours: any;
  minutes: any;
  seconds: any;
  private future: Date;
  private futureString: string;
  private message: string;
  homeForm: FormGroup;
  submitted = false;
  // _host = environment.config.BASE_URL;
  id: any;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private _sharedService: SharedService,
    private toastr: ToastrService,
    private _uService: UniversalService,
  ) {

  }




  get f() { return this.homeForm.controls; }
  ngOnInit() {
    this._uService.setMeta(this.router.url, {
      title: 'Subscribe Email | PromptHealth',
      description: 'Subscribe to our newsletter and get latest updates from PromptHealth.'
    });

    this.homeForm = this.formBuilder.group({

      email: ['', [Validators.required, Validators.email]],

    });

    this.timer();
    this.id = setInterval(() => {
      this.timer();
    }, 1000);


  }


  submit() {
    // alert("here");


    this.submitted = true;
    let data = JSON.stringify(this.homeForm.value);

    // this._sharedService.loader('show');
    this._sharedService.contactus(data).subscribe((res: any) => {
      // this._sharedService.loader('hide');
      if (res.success) {
        this.toastr.success(res.message);
        this.homeForm.reset();
        this.submitted = false;
        
      }else {
        this.toastr.error(res.message);
      }
    }, (error) => {
      this.toastr.error("Please check your email id.");
      //this._sharedService.loader('hide');
    });
  }

  timer() {
    var deadline = new Date('Mar 5, 2020 15:37:25').getTime();

    var now = new Date().getTime();
    var t = deadline - now;
    var days = Math.floor(t / (1000 * 60 * 60 * 24));
    var hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((t % (1000 * 60)) / 1000);

    this.days = days;
    this.hours = hours;
    this.minutes = minutes;
    this.seconds = seconds;
  }

}




