import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderStatusService } from '../../shared/services/header-status.service';
import { SharedService } from '../../shared/services/shared.service';
import { Partner } from '../../models/partner';
import { ToastrService } from 'ngx-toastr';
import { CategoryService } from '../../shared/services/category.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { MapsAPILoader } from '@agm/core';

@Component({
  selector: 'app-profile-partner',
  templateUrl: './profile-partner.component.html',
  styleUrls: ['./profile-partner.component.scss']
})
export class ProfilePartnerComponent implements OnInit {

  public profile: Partner;
  public currentTabIndex: number = 0;

  public imageViewerTarget = 0;
  public isDescriptionClamped = true;

  public urlCurrent: string;


  constructor(
    private _router: Router,
    private _headerService: HeaderStatusService,
    private _route: ActivatedRoute,
    private _sharedService: SharedService,
    private _catService: CategoryService,
    private _toastr: ToastrService,
    private _uService: UniversalService,
    private _map: MapsAPILoader,
  ) { }

  ngOnInit() {

    this._route.params.subscribe(async params => {
      const id = params.id;
      this.urlCurrent = (location.href) ? location.href : ('https://prompthealth.ca/products/' + id);

      try { await this.getProfile(id); }
      catch(err){ this._toastr.error(err); }

      this._uService.setMeta(this._router.url, {
        title: `${this.profile.name} | PromptHealth`,
        description: this.profile.description + ' Find coupons, free samples and reviews.',
        pageType: 'article',
        image: this.profile.image,
        imageType: this.profile.imageType,
        imageAlt: this.profile.name,
      });

      if(this.profile){
        const cat = await this._catService.getCategoryAsync();
        this.profile.populateService(cat);  
      }
    });
  }


  getProfile(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const path = 'partner/get/' + id;
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if(res.statusCode == 200) {
          if(res.data && res.data.length > 0){
            const p = res.data[0]
            this.profile = new Partner(p);
            resolve(true);  
          }
          else{ reject('Cannot find the data'); }
        }
        else { reject(res.message); }
      }, error => {
        console.log(error);
        reject('There are some error please try after some time.');
      });
    });
  }

  getService(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const path = 'user/getService/' + id;
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if(res.statusCode == 200) {

        }
      })

    });
  }

  changeTabIndex(i: number){
    this.currentTabIndex = i;

    this._map.load().then(()=>{
      this.profile.setGoogleReviews();
    });  
  }

  changeImageViewerTarget(i: number){
    this.imageViewerTarget = i;
  }

  toggleDescriptionLength(){ this.isDescriptionClamped = !this.isDescriptionClamped; }

  changeStickyStatus(isSticked: boolean){
    if(isSticked){
      this._headerService.hideHeader();
    }else{
      this._headerService.showHeader();
    }
  }

}
