import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register-partner-complete',
  templateUrl: './register-partner-complete.component.html',
  styleUrls: ['./register-partner-complete.component.scss']
})
export class RegisterPartnerCompleteComponent implements OnInit {

  constructor(
    private _toastr: ToastrService,
    private _router: Router,
  ) { }

  private timer: any;
  ngOnInit(): void {
    this._toastr.success('You will be redirected to plan page in 5 seconds.');
    this.timer = setTimeout(()=>{
      this._router.navigate(['/plans/product']);
    }, 5000);
  }

}
