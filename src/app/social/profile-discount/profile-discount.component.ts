import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { ISocialPost } from 'src/app/models/social-post';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-profile-discount',
  templateUrl: './profile-discount.component.html',
  styleUrls: ['./profile-discount.component.scss']
})
export class ProfileDiscountComponent implements OnInit {

  get profile() { return this._socialService.selectedProfile; }
  get user() { return this._profileService.profile; }

  public posts: ISocialPost[];
  private subscriptionCacheChange: Subscription;
  private countPerPage = 20;
  private isMorePosts = true;
  private isLoading = false;
  private subscription: Subscription;


  @HostListener('window:scroll', ['$event']) async onWindowScroll(e: Event) {
    if(!this.isLoading && this.isMorePosts && document.body && this.posts && this.posts.length > 0) {
      const startLoad = !!(document.body.scrollHeight < window.scrollY + window.innerHeight * 2);
      if(startLoad) {
        this.isLoading = true;
        const postsFetched = await this.fetchPosts();
        postsFetched.forEach(p => {
          this.posts.push(p);
        });
      }
    }
  }

  constructor(
    private _socialService: SocialService,
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
    private _uService: UniversalService,
    private _router: Router,
  ) { }

  ngOnInit(): void {
  }

  fetchPosts(): Promise<ISocialPost[]> {
    return new Promise((resolve, reject) => {
      resolve([]);
    })
  }

}
