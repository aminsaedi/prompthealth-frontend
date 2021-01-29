import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';


type AddonType = 'op1' | 'op2' | 'advanced' | 'endorsement' | 'social';
interface AddonData { title: string; desc: string[]; }

@Component({
  selector: 'subscription-plan-addon-card',
  templateUrl: './subscription-plan-addon-card.component.html',
  styleUrls: ['./subscription-plan-addon-card.component.scss']
})
export class SubscriptionPlanAddonCardComponent implements OnInit {

  @Input() type: AddonType;
  @Input() data: any;
  @Input() isPriceMonthly = true;
  @Input() hasPlan = false;
  @Input() flexibleButtonPosition = true;

  @Output() select = new EventEmitter<AddonType>();

  public isLoggedIn = false;
  public addon: AddonData = null;

  constructor() { }

  ngOnInit(): void {
    if (localStorage.getItem('token')) { this.isLoggedIn = true; }
    this.addon = addons[this.type];
  }

  getTabName() {
    /** tod: use real data for price */
    let name = '';
    switch (this.type) {
      case 'social': name = 'Ask us for a quote'; break;
      default: name = `$${this.isPriceMonthly ? ('xx/Monthly') : ('xx/Annually')}`;
    }

    if (this.data) {
      name = `$${this.isPriceMonthly ? (this.data.price + '/Monthly') : (this.data.yearlyPrice + '/Annually')}`;
    }
    return name;
  }

  getLinkToSignin() {
    /** todo: add code  */
    const link = ['/auth', 'registration', 'sp'];
    return link;
  }

  triggerButtonClick() { this.select.emit(this.data); }

}

const addons: { op1: AddonData, op2: AddonData, advanced: AddonData, endorsement: AddonData, social: AddonData } = {
  op1: {
    title: 'Option 1 - The Networker',
    desc: [
      'Get featured on our homepage for ultimate exposure',
    ],
  },
  op2: {
    title: 'Option 2 - The Socialite',
    desc: [
      '3 general health content IG/FB posts/week',
      'IG/FB posts for all special occasions',
      '1 custom TikTok, IGTV, or Podcast per year, which will also be uploaded to YouTube',
    ]
  },
  advanced: {
    title: 'Advanced Tier',
    desc: [
      'Get featured on our home page',
    ]
  },
  endorsement: {
    title: 'Endorsement Tier',
    desc: [
      'Service provider/center can endorse the partner on their profile page and share to social media for clinical credibility',
    ]
  },
  social: {
    title: 'Social Collaboration',
    desc: [
      'Custom YouTube video',
      'Creating challenges (i.e. 30 days eating vegan challenge)',
      'encouraging others to try products with us',
    ]
  }
};
