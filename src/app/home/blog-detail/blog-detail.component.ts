import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../shared/services/shared.service';
import { environment } from 'src/environments/environment';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss']
})
export class BlogDetailComponent implements OnInit {
  blogList: any;
  defaultImage = 'assets/img/no-image.jpg';
  categoryList = [];
  private sub: any;
  id = '';
  socialShare = false;
  socialSharing: any;
  public AWS_S3 = '';

  constructor(
    private activeRoute: ActivatedRoute,
    private router: Router,
    private _sharedService: SharedService,
    private toastr: ToastrService,
    private _uService: UniversalService,
  ) {
  }

  ngOnInit(): void {
    this.sub = this.activeRoute.params.subscribe(params => {
      this.id = params.id;
    });
    this.getBlog();
    this.getAllCategories();
    this.AWS_S3 = environment.config.AWS_S3;
  }

  changeSocialLink(value) {
    if (value === 'fb') {
      this.socialSharing = 'fb';
    } else {
      this.socialSharing = 'in';
    }
  }

  getBlog() {
    const path = `blog/get-by-slug/${this.id}`;
    this._sharedService.getNoAuth(path).subscribe((res: any) => {
      this._sharedService.loader('hide');
      let url = 'https://prompthealth.ca';
      const img = 'https://prompthealth.ca/assets/img/logo.png';
      if (res.statusCode === 200) {
        this.blogList = res.data;
        let des = '';

        if (this.blogList.description) {
          des = this.removeTags(this.blogList.description);
        }

        this._uService.setMeta(this.router.url, {
          title: this.blogList.title + ' | PromptHealth',
          description: des,
          pageType: 'article',
          image: img,
          imageType: 'image/png',
          imageAlt: this.blogList.title,
        });

        // if (this.blogList.image) {
        //   img = "https://api.prompthealth.ca/blogs/" + this.blogList.image
        // }
      } else {
        this.toastr.error(res.message);
      }
    }, (error) => {
      this._sharedService.loader('hide');
    });
  }

  removeTags(str) {
    if ((str === null) || (str === '')) {
      return false;
    } else {
      str = str.toString();
    }
    return str.replace(/(<([^>]+)>)/ig, '');
  }


  getAllCategories() {
    const path = `category/get-all?count=10&page=1&frontend=1`;
    this._sharedService.getNoAuth(path).subscribe((res: any) => {
      this._sharedService.loader('hide');
      if (res.statusCode === 200) {
        this.categoryList = res.data.data;
      } else {
        this.toastr.error(res.message);
      }
    }, (error) => {
      this._sharedService.loader('hide');
    });
  }
}
