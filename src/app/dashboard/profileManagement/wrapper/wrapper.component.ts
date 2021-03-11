import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedService } from '../../../shared/services/shared.service';
import { ProfileManagementService } from '../profile-management.service';

@Component({
  selector: 'app-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.scss']
})
export class WrapperComponent implements OnInit, OnDestroy {
  constructor(
    private _sharedService: SharedService,
    private _managementService: ProfileManagementService,
  ) { }
  public profile;
  public isPremium = false; /** if the user is vip or subscribe plans, true. */

  userInfo;

  cPlan: [];
  spPlan: [];
  public profileTab = (active) => ({
    title: 'Profile',
    link: 'my-profile',
    description: 'Add & Edit your basic info',
    active,
  })
  public passwordTab = (active) => ({
    title: 'Password',
    description: 'Change your password',
    link: 'my-password',
    active
  })
  public bookingTab = (active) => ({
    title: 'Booking',
    link: 'my-booking',
    description: 'View & Reschedule your bookings',
    active,
  })
  public favouriteTab = (active) => ({
    title: 'Favourite',
    link: 'my-favourites',
    description: 'Your favourite practitioners',
    active,
  })
  public reviewTab = (active) => ({
    title: 'Review and Rating',
    link: 'reviews-ratings',
    active,
  })
  public socialTab = (active) => ({
    title: 'Social',
    description: 'Link your social media profiles',
    link: 'my-social',
    active
  })
  public badgeTab = (active) => ({
    title: 'Badges',
    description: 'Apply for the verified badge and rank ahead of others',
    link: 'my-badge',
    active
  })
  public serviceTab = (active) => ({
    title: 'Service',
    description: 'List your services and treatment etc.',
    link: 'my-service',
    active,
  })
  public subscriptionTab = (active) => ({
    title: 'Subscription',
    description: 'Your premium subscriptions with Prompt Health',
    link: 'my-subscription',
    active,
  })
  public paymentTab = (active) => ({
    description: 'Your payment history',
    title: 'Payment',
    link: 'my-payment',
    active,
  })
  public videoTab = (active) => ({
    description: 'Add youtube & vimeo videos to enrich your profile',
    title: 'Videos',
    link: 'videos-blogs',
    active
  })
  public affiliateTab = (active) => ({
    title: 'Affiliate',
    link: 'my-affiliate',
    description: 'Introduce your friend to join as a parctitioner and get awarded',
    active,
  })
  public amenityTab = (active) => ({
    title: 'Amenities',
    description: 'Introduce your amenities with photos and descriptions',
    link: 'my-amenities',
    active,
  })
  public professionalTab = (active) => ({
    description: 'Associate professionals to your center',
    title: 'Professionals',
    link: 'add-professionals',
    active,
  })
  public productTab = (active) => ({
    description: 'Introduce your products with photos and descriptions',
    title: 'Products',
    link: 'my-product',
    active,
  })
  public performanceTab = (active) => ({
    description: 'Your stats at a glance',
    title: 'Performance',
    link: 'my-performance',
    active,
  })
  
  // tslint:disable-next-line: member-ordering
  listing: any[] = [
    this.profileTab(true),
    this.passwordTab(true)
  ];
  // tslint:disable-next-line: member-ordering
  uListing = [
    this.bookingTab(true),
    this.favouriteTab(true),
    this.reviewTab(true)
  ];
  ngOnDestroy() { this._managementService.destroyProfileDetail(); }

  ngOnInit(): void {
    this.getProfileDetails();
    // this.getSubscriptionPlan('user/get-plans');
  }
  getProfileDetails() {
    this.userInfo = JSON.parse(localStorage.getItem('user'));
    const path = `user/get-profile/${this.userInfo._id}`;
    this._sharedService.get(path).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.profile = res.data[0];
        this.setUserPremiumStatus();
        if (this.profile) { this.setListing(this.profile); }
      } else {
        this._sharedService.checkAccessToken(res.message);
      }
    }, err => {

      this._sharedService.checkAccessToken(err);
    });
  }

  setUserPremiumStatus() {
    let isPremium = false;
    if (this.profile) {
      if (this.profile.isVipAffiliateUser) {
        isPremium = true;
      } else if (this.profile.plan && this.profile.plan.name.toLowerCase() !== 'basic') {
        isPremium = true;
      }
    }
    this.isPremium = isPremium;
  }

  getSubscriptionPlan(path) {
    this._sharedService.loader('show');
    this._sharedService.getNoAuth(path).subscribe((res: any) => {
      this._sharedService.loader('hide');

      if (res.statusCode === 200) {
        res.data.forEach(element => {
          if (element.userType.length === 1 && element.userType[0] === 'C') {
            this.cPlan = element;
          }
          if (element.userType.length === 1 && element.userType[0] === 'SP') {
            this.spPlan = element;
          }
        });
      } else {
        // this._commanService.checkAccessToken(res.error);
      }
    }, err => {
      this._sharedService.loader('hide');

    });
  }

  addMenuItem(title: string, isActive: boolean) {
    switch (title) {
      case 'social':
        this.listing.push(this.socialTab(isActive));
        break;
      case 'badge':
        this.listing.push(this.badgeTab(isActive));
        break;
    }
  }

  setListing(profile) {
    if (profile) {
      if (profile.roles !== 'U') {
        this.listing.push(
          this.serviceTab(true)
        );
      }

      if (profile.isVipAffiliateUser) {
        if (profile.roles === 'SP') {
          this.listing.unshift(this.performanceTab(true));
          this.addMenuItem('social', true);
          this.addMenuItem('badge', true);

          this.listing.push(this.subscriptionTab(true));
          this.listing.push(
            this.bookingTab(true)
          );
          this.listing.push(this.paymentTab(true));
          this.listing.push(this.videoTab(true));
          this.listing.push(this.reviewTab(true));
          this.listing.push({
            title: 'Affiliate',
            link: 'my-affiliate',
            active: true,
          });


        } else if (profile.roles === 'C') {
          this.listing.unshift(this.performanceTab(true));
          this.addMenuItem('social', true);
          this.addMenuItem('badge', true);

          this.listing.push(this.bookingTab(true));
          this.listing.push(this.amenityTab(true));
          this.listing.push(this.professionalTab(true));
          this.listing.push(this.productTab(true));
          this.listing.push(this.videoTab(true));
          this.listing.push(this.subscriptionTab(true));
          this.listing.push(this.paymentTab(true));
          this.listing.push(this.affiliateTab(true));
        }
      } else {
        if (profile.roles === 'SP') {
          if (!profile.plan || profile.plan.name.toLowerCase() === 'basic') {
            this.listing.push(this.subscriptionTab(true));
            this.listing.push(this.paymentTab(true));

            this.listing.push(this.performanceTab(false));
            this.addMenuItem('social', false);
            this.addMenuItem('badge', false);

            this.listing.push(this.bookingTab(false));
            this.listing.push(this.videoTab(false));
            this.listing.push(this.reviewTab(false));
          } else {
            this.listing.unshift(this.performanceTab(true));
            this.addMenuItem('social', true);
            this.addMenuItem('badge', true);

            this.listing.push(this.bookingTab(true)),
              this.listing.push(this.paymentTab(true));
            this.listing.push(this.subscriptionTab(true));
            this.listing.push(this.videoTab(true));

            this.listing.push(this.reviewTab(true));
          }
        }
      }

      if (profile.roles === 'U') {
        this.listing.push(...this.uListing);
      }
      if (profile.roles === 'C' && !profile.isVipAffiliateUser) {
        if (!profile.plan || profile.plan.name.toLowerCase() === 'basic') {
          this.listing.push(this.subscriptionTab(true));
          this.listing.push(this.paymentTab(true));

          this.listing.push(this.performanceTab(false));
          this.addMenuItem('social', false);
          this.addMenuItem('badge', false);

          this.listing.push(this.bookingTab(false));
          // this.listing.push({
          //   title: 'Affiliate',
          //   link: 'my-affiliate',
          //   active: false,
          // });

          this.listing.push(this.reviewTab(false));
        } else {
          this.listing.unshift(this.performanceTab(true));
          this.addMenuItem('social', true);
          this.addMenuItem('badge', true);

          this.listing.push(this.bookingTab(true));

          this.listing.push(this.paymentTab(true));
          this.listing.push(this.subscriptionTab(true));
          // this.listing.push({
          //   title: 'Affiliate',
          //   link: 'my-affiliate',
          //   active: true,
          // });
          this.listing.push(this.reviewTab(true));
        }
        if (profile.plan && profile.plan.ListAmenities === true) {
          this.listing.push(this.amenityTab(true));

        } else {
          this.listing.push(this.amenityTab(true));
        }

        if (profile?.plan?.ListOfProviders === true) {
          this.listing.push(this.professionalTab(true));
        } else {
          this.listing.push(this.professionalTab(true));
        }

        if (profile?.plan?.ListProductsOption === true) {
          this.listing.push(this.productTab(true));
        } else {
          this.listing.push(this.productTab(false));
        }

        if (profile?.plan?.videoUpload === true) {
          this.listing.push(this.videoTab(true));
        } else {
          this.listing.push(this.videoTab(false));
        }
      }
    }
  }
}
