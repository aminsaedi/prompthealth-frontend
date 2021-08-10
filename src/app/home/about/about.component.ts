import { Component, OnInit } from '@angular/core';
import { HeaderStatusService } from 'src/app/shared/services/header-status.service';
import { expandVerticalAnimation, slideVerticalStaggerAnimation } from 'src/app/_helpers/animations';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  animations: [slideVerticalStaggerAnimation, expandVerticalAnimation],
})
export class AboutComponent implements OnInit {

  get isImageReady() { return !!(this.countImagesLoaded == topImages.length); }
  
  public teamData = teamData;
  public topImages = topImages;

  public isOnTeam = false;

  public countImagesLoaded = 0;
  public disableAnimationTop = false;
  public disableAnimationTeam = false;
  

  constructor(
    private _headerStatusService: HeaderStatusService,
  ) { }

  ngOnInit(): void {
    this.countImagesLoaded = 0
  }

  onImageLoaded() {
    this.countImagesLoaded++;
    setTimeout(() => {
      this.disableAnimationTop = true;
    }, 500)
  }
    
  changeHeaderShadowStatus(isShown: boolean) {
    if(isShown) {
      this._headerStatusService.showShadow();
    } else {
      this._headerStatusService.hideShadow();
    }
  }

  onTeamIntersected(enter: boolean) {
    if(enter) {
      this.teamData = teamData;
      setTimeout(() => {
        this.disableAnimationTeam = true;
      }, 500);
    } else {
      this.disableAnimationTeam = false;
      this.teamData = [];
    }
  }
}

const topImages = [
  '/assets/img/about/top-1.png',
  '/assets/img/about/top-2.png',
  '/assets/img/about/top-3.png'
]

const teamData = [
  {
    name: 'Hedieh Safiyari',
    title: 'CEO & Founder',
    image: 'hedieh.png'
  },
  {
    name: 'Hedieh Safiyari',
    title: 'CEO & Founder',
    image: 'hedieh.png'
  },
  {
    name: 'Hedieh Safiyari',
    title: 'CEO & Founder',
    image: 'hedieh.png'
  },
  {
    name: 'Hedieh Safiyari',
    title: 'CEO & Founder',
    image: 'hedieh.png'
  },
  {
    name: 'Hedieh Safiyari',
    title: 'CEO & Founder',
    image: 'hedieh.png'
  },
  {
    name: 'Hedieh Safiyari',
    title: 'CEO & Founder',
    image: 'hedieh.png'
  },

]