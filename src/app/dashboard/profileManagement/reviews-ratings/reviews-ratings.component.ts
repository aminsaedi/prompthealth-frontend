import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../shared/services/shared.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';
@Component({
  selector: 'app-reviews-ratings',
  templateUrl: './reviews-ratings.component.html',
  styleUrls: ['./reviews-ratings.component.scss']
})
export class ReviewsRatingsComponent implements OnInit {
  userInfo;
  rating;
  ru
  defaultImage = 'assets/img/no-image.jpg';
  earnedPoint = 0
  currentPage;
  totalItems
  pageSize: 10
  public AWS_S3='';
  constructor(
    private _sharedService: SharedService,
    private _router: Router,
    private _uService: UniversalService,
  ) { }

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'Reviews and Ratings | PromptHealth',
    });

    this.userInfo = JSON.parse(localStorage.getItem('user'));

    // this. s = localStorage.getItem('roles');
    this.getProfileDetails();
    this.AWS_S3 = environment.config.AWS_S3

  }
  getProfileDetails() {
    let path = `booking/get-all-review?userId=${this.userInfo._id}&count=10&page=1&search=/`;
    this._sharedService.get(path).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.rating = res.data.data;
        this.rating = this.rating.filter((el) => {
          return el.rating > 0
        })
        this.totalItems = this.rating.length
        this.earnedPoint = this.rating.length ? Math.max.apply(Math, this.rating.map(function (o) {
          return o.customerId.pointEarned;
        })) : 0
      } else {
        this._sharedService.checkAccessToken(res.message);
      }
    }, err => {

      this._sharedService.checkAccessToken(err);
    });
  }
}
