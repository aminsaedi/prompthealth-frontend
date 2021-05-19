import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../shared/services/shared.service';
import { environment } from 'src/environments/environment';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
  blogList = [];
  categoryList = [];
  categories: any = []
  defaultImage = 'assets/img/no-image.jpg';
  public AWS_S3='';

  constructor(
    private _sharedService: SharedService,
    private toastr: ToastrService,
    private _router: Router,
    private _uService: UniversalService,
  ) { }

  ngOnInit(): void {
    this.getBlogList();
    this.getAllCategories();
    this.AWS_S3 = environment.config.AWS_S3;

    this._uService.setMeta(this._router.url, {
      title: 'News & Media | PromptHealth',
      description: 'Check out our latest news, podcast, videos and tips regarding to health care services.',
      pageType: 'blog',
    });
  }

  getBlogList() {
    this._sharedService.loader('show');
    let path = `blog/get-all?count=10&page=1&frontend=1&categoryId=`
    this._sharedService.getNoAuth(path).subscribe((res: any) => { 
      if (res.statusCode === 200) {
        this.blogList = res.data.data;
      }else {
        this.toastr.error(res.message);
      }
      this._sharedService.loader('hide');
    }, (error) => {
      this._sharedService.loader('hide');
    });
  }
  getAllCategories() {
    this._sharedService.loader('show');
    let path = `category/get-categories`;
    this._sharedService.getNoAuth(path).subscribe((res: any) => {
      this._sharedService.loader('hide');
      if (res.statusCode === 200) {
        this.categories = res.data;
      }else {
        this.toastr.error(res.message);
      }
    }, (error) => {
      this._sharedService.loader('hide');
    });
  }
}
