import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import {expandVerticalAnimation } from '../../_helpers/animations';

@Component({
  selector: 'button-share',
  templateUrl: './button-share.component.html',
  styleUrls: ['./button-share.component.scss'],
  animations: [expandVerticalAnimation],
})
export class ButtonShareComponent implements OnInit {

  @Input() label: string = "Share";
  @Input() btnClass: string = 'btn btn-primary';
  @Input() menuPosition: 'center' | 'right' | 'left' = 'center'

  /** used for Web Share API */
  @Input() url: string;
  @Input() text: string;
  @Input() title: string;
  @Input() media: string; /** this is for pinterest */
  
  /** share option */
  @Input() twitter: any = null;
  @Input() facebook: any = null;
  @Input() linkedin: any = null;
  @Input() pinterest: any = null;
  @Input() email: any = null;

  @Input() hideCopy: boolean = false;

  isMenuOn(type: ShareType): boolean { return !!(this[type] !== null)}
  socialLink(type: ShareType): string {
    let link: string;
    switch(type){
      case 'facebook'  : link = 'https://www.facebook.com/share.php?u=' + this.url ; break;
      case 'twitter'   : link = 'https://twitter.com/share?url=' + this.url; break;
      case 'linkedin'  : link = 'https://www.linkedin.com/sharing/share-offsite/?url=' + this.url; break;
      case 'pinterest' : link = `https://www.pinterest.com/pin/create/button/?url=${this.url}&media=${this.media}&description=${this.text}`; break;
      case 'envelope'  : link = `mailto:?subject=${this.title}&body=${this.text}%0D%0A%0D%0A${this.url}`; break;
    }
    return link;
  }

  public isMenuShown: boolean = false;
  public socials: {id: ShareType, label: string}[];
  public isLinkCopied = false;

  constructor(
    private _changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.socials = [];
    if(this.facebook !== null) { this.socials.push(facebook) }
    if(this.twitter !== null) { this.socials.push(twitter); }
    if(this.linkedin !== null) { this.socials.push(linkedin); }
    if(this.pinterest !== null && this.media !== null) { this.socials.push(pinterest); }
    if(this.email !== null) { this.socials.push(email); }
  }

  onClickButton() {

    /** if mobile, show native action sheet */
    /** if desktop, show sharePalette */
    /** desktop is not good to use native action sheet, because people don't install social apps in desktop */

    /** TODO: userAgentData is still draft in 2021. might have to change later. */

    const nav: any = window.navigator;
    let isDesktop = true;
    if("userAgentData" in nav && nav.userAgentData.mobile) {
      isDesktop = false;
    }else{
      const ua = navigator.userAgent.toLowerCase();
      if(ua.match('ipad|iphone|android') || ( ua.match('mac') && ('ontouchstart' in window) )) {
        isDesktop = false;
      }
    }

    if(nav.share && !isDesktop) {
      const options: WebShareOption = {};
      if(this.url) { options.url = this.url; }
      if(this.text) { options.text = this.text; }
      if(this.title) { options.title = this.title; }

      nav.share(options);
    } else {
      this.isMenuShown = !this.isMenuShown;
    }
  }

  copyLink() {
    const el = document.createElement('input');
    el.setAttribute('type', 'text');
    el.value = this.url;

    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, 9999);
    document.execCommand('copy');
    document.body.removeChild(el);

    this.isLinkCopied = true;
    setTimeout(()=> {
      this.isLinkCopied = false;
      this.closeMenu();
      this._changeDetector.detectChanges();
    }, 1200);
  }

  closeMenu() { 
    this.isMenuShown = false; 
  }
}

type WebShareOption = {
  title?: string,
  text?: string,
  url?: string,
}

type ShareType = 'facebook' | 'twitter' | 'pinterest' | 'linkedin' | 'envelope';
type ShareItem = {id: ShareType, label: string};

const facebook: ShareItem = {id: 'facebook', label: 'Facebook'};
const twitter: ShareItem = {id: 'twitter', label: 'Twitter'};
const pinterest: ShareItem = {id: 'pinterest', label: 'Pinterest'};
const linkedin: ShareItem = {id: 'linkedin', label: 'LinkedIn'};
const email: ShareItem = {id: 'envelope', label: 'Email'};
