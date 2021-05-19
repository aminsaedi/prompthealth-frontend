import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { UniversalService } from 'src/app/shared/services/universal.service';
// import { Router } from 'express';

@Component({
  selector: 'app-unsubscribe',
  templateUrl: './unsubscribe.component.html',
  styleUrls: ['./unsubscribe.component.scss']
})
export class UnsubscribeComponent implements OnInit {
  url: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sharedService: SharedService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private _uService: UniversalService,
  ) { }

  ngOnInit(): void {
    this._uService.setMeta(this.router.url, {
      title: 'Unsbscribe Email | PromptHealth',
    });
    this.spinner.show();
    this.route.paramMap
      .subscribe(params => {
        const routeParams = params.get('email');
        this.sharedService.unsubscribe(routeParams).subscribe((res) => {
          this.spinner.hide();
          if (res.statusCode === 200) {
            this.toastr.success('Unsubscribe successfully!');
            this.router.navigate(['/thankyou']);
          } else {
            this.toastr.error(res.message);
          }

        },
          err => {
            this.spinner.hide();
            this.toastr.error(err);
          }
        );
      });
  }




}
