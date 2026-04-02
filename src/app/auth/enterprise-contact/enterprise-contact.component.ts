import { Component, OnInit , OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { SharedService } from '../../shared/services/shared.service';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-enterprise-contact',
  templateUrl: './enterprise-contact.component.html',
  styleUrls: ['./enterprise-contact.component.scss']
})
export class EnterpriseContactComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();


  homeForm: FormGroup;
  submitted = false;

  Form: NgForm;
  _host = environment.config.BASE_URL;
  routerSubscription: any;


  isLogin: boolean = false;
  constructor(
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _router: Router,
    private _sharedService: SharedService
  ) {
    if (localStorage.getItem('token')) this.isLogin = true;

    this.routerSubscription = this._router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }

    });
  }

  get f() { return this.homeForm.controls; }
  ngOnInit(): void {
    this._sharedService.sendTop()
    const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
    const emailReg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    const phoneReg = "^((\\+91-?)|0)?[0-9]{10}$"
    this.homeForm = this.formBuilder.group({

      email: ['', [Validators.required, Validators.pattern(emailReg)]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.pattern(phoneReg)]],
      userType: ['SP', Validators.required],
      description: ['', [Validators.required]],
    });

  }

  pressMe() {
    this.submitted = true;
    if (this.homeForm.invalid) {
      return;
    }
    else {
      this.submitted = true;
      let data = this.homeForm.value;
      this._sharedService.loader('show');
      let path = 'user/planRequest'
      this._sharedService.postNoAuth(data, path).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        this._sharedService.loader('hide');
        if (res.statusCode === 200) {
          this.toastr.success('Quotation submitted successfully!');

          this.homeForm.reset();
          this.submitted = false;


          this._router.navigate(['/home']);

        }

        else {
          this._sharedService.showAlert(res.message, 'alert-danger');
        }
      }, (error) => {
        this._sharedService.loader('hide');
      });
    }
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
