import { Component, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'dashboard-menu',
  templateUrl: './dashboard-menu.component.html',
  styleUrls: ['./dashboard-menu.component.scss']
})
export class DashboardMenuComponent {

  @Input() user: any;


  @Input() ui: 'button' | 'menu' = 'menu';
  @Input() buttonDirection: 'left' | 'right' = 'left';
  @Input() styleButton: any = null;
  @Input() styleMenu: any = null;
  @Input() styleHeader: any = null;
  @Input() styleBody: any = null;

  @Output() logout = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  constructor() { }


  getId() {
    return this.user ? this.user._id : null;
  }
  getEmail() {
    return this.user ? this.user.email : null;
  }

  getName() {
    const noname = 'Anonymous';
    if (!this.user) { return noname; }

    const name = [];
    if (this.user.firstName && this.user.firstName.length > 0) { name.push(this.user.firstName.trim()); }
    if (this.user.lastName && this.user.lastName.length > 0) { name.push(this.user.lastName.trim()); }
    return (name.length > 0) ? name.join(' ') : noname;
  }
  getImage() {
    return (this.user && this.user.profileImage) ? environment.config.AWS_S3 + this.user.profileImage : 'assets/img/default_user.jpg';
  }

  hasProfile() {
    let hasProfile = false;
    if (this.user && this.user.roles !== 'U') { hasProfile = true; }
    return hasProfile;
  }

  onClickLogout() { this.logout.emit(); }
  onClose() { this.close.emit(); }
}
