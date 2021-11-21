import { Component, OnInit, ViewChild } from '@angular/core';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { ModalComponent } from 'src/app/shared/modal/modal.component';
import { SharedService } from 'src/app/shared/services/shared.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'menu-dashboard',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  get user() { return this._profileService.profile; }
  get linkToPH() { return '/community/profile/' + environment.config.idSA; };
  get sizeM() { return window?.innerWidth >= 768; }
  get sizeS() { return !this.sizeM; }

  
  public menus: MenuItem[];
  @ViewChild('modalLogoutAlert') private modalLogoutAlert: ModalComponent;



  constructor(
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    this.initMenu();
  }

  initMenu(){
    switch(this.user.role) {
      case 'U' :
        this.menus = [ menuGeneral, menuFollow, menuBook, menuBookmark, /*menuNotification, */ menuPassword ];
        break;
      case 'SP':
        this.menus = [ menuGeneral, menuServices, menuPerformance, menuBookProvider, menuBadge, menuSocial, menuFollow, menuBookmark, /*menuNotification,*/ menuPassword, menuPayment, menuAffiliate ];
        break;
      case 'C':
        this.menus = [ menuGeneral, menuServices, menuPerformance, menuBookProvider, menuBadge, menuTeam, menuShowcase, menuVideo, menuSocial, menuFollow, menuBookmark, /*menuNotification,*/ menuPassword, menuPayment, menuAffiliate ];
        break;
      case 'P':
        this.menus = [ menuGeneral, menuServices, menuFollow, /*menuNotification, */ menuPassword, menuPayment, menuAffiliate ];
        break;
      case 'SA':
        this.menus = [ menuGeneral, menuFollow, menuBook, menuBookmark, menuPassword];
        break;
    }
  }

  onClickLogout() {
    this._sharedService.logout();
    this.modalLogoutAlert.hide();
  }

}

const menuGeneral: MenuItem = {
  id: 'profile',
  title: 'Profile',
  icon: 'user-square',
};

const menuServices: MenuItem = {
  id: 'service',
  title: 'Services',
  icon: 'checkbox-square-outline',
}

const menuPerformance: MenuItem = {
  id: 'performance',
  title: 'Performance',
  icon: 'dashboard-2',
}

const menuFollow: MenuItem = {
  id: 'follow',
  title: 'My Followings',
  icon: 'verified',
};

const menuBook: MenuItem = {
  id: 'booking',
  title: 'My Bookings',
  icon: 'inbox-filled',
};

const menuBookProvider: MenuItem = {
  id: 'booking-provider',
  title: 'Bookings',
  icon: 'inbox-filled',
}

const menuTeam: MenuItem = {
  id: 'team',
  title: 'Team',
  icon: 'users',
}

const menuShowcase: MenuItem = {
  id: 'showcase',
  title: 'Showcase',
  icon: 'apperture',
}

const menuVideo: MenuItem = {
  id: 'video',
  title: 'Videos',
  icon: 'film-board',
}

const menuBadge: MenuItem = {
  id: 'badge',
  title: 'Badges',
  icon: 'award',
} 

const menuSocial: MenuItem = {
  id: 'social',
  title: 'Connect Social',
  icon: 'thumbs-up',
};

const menuBookmark: MenuItem = {
  id: 'bookmark',
  title: 'Bookmarks',
  icon: 'bookmark',
};

const menuNotification: MenuItem = {
  id: 'notification',
  title: 'Notifications',
  icon: 'bell',
};

const menuPassword: MenuItem = {
  id: 'password',
  title: 'Change Password',
  icon: 'lock-2-opened',
}

const menuPayment: MenuItem = {id: 'payment',
  title: 'Payment',
  icon: 'credit-card',
}

const menuAffiliate: MenuItem = {
  id: 'affiliate',
  title: 'Affiliate',
  icon: 'gift',
}


interface MenuItem {
  id: string;
  title: string;
  icon: string;
}