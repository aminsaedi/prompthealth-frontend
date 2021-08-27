import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderStatusService } from 'src/app/shared/services/header-status.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { fadeAnimation, slideVerticalStaggerAnimation } from 'src/app/_helpers/animations';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  animations: [slideVerticalStaggerAnimation, fadeAnimation],
})
export class AboutComponent implements OnInit {

  get isImageReady() { return !!(this.countImagesLoaded == topImages.length); }
  get founderData() { return teamData[0]; }
  
  public teamData = teamData;
  public topImages = topImages;
  public idxSelectedMember = -1;

  public isOnTeam = false;

  public countImagesLoaded = 0;
  public disableAnimationTop = false;
  public disableAnimationTeam = false;
  

  constructor(
    private _headerStatusService: HeaderStatusService,
    private _uService: UniversalService,
    private _router: Router,
  ) { }

  ngOnInit(): void {
    this.countImagesLoaded = 0;
    this._uService.setMeta(this._router.url, {
      title: 'PromptHealth revolutionize the health and wellness experience',
      description: 'It is our mission to help people seeking care reach informed decisions about their health by providing credible educational resources and personalized care options. ',
    });
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
      this.idxSelectedMember = -1;
      this.teamData = [];
    }
  }

  onMemberClicked(i: number) {
    this.disableAnimationTeam = false;
    const next = this.idxSelectedMember == i ? -1 : i;
    this.changeSelectedMember(next);
  }

  changeSelectedMember(i: number) {
    this.disableAnimationTeam = false;
    this.idxSelectedMember = i;
    setTimeout(() => {
      this.disableAnimationTeam = true;
    }, 300);
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
    image: 'hedieh.png',
    content: 'Jaden joined the team in May, excited to contribute to PromptHealth’s mission after years of struggling within the current healthcare system. As she completes her business degree at the University of British Columbia, she hopes to continue.'
  },
  {
    name: 'Hedieh Safiyari',
    title: 'CEO & Founder',
    image: 'hedieh.png',
    content: 'Jaden joined the team in May, excited to contribute to PromptHealth’s mission after years of struggling within the current healthcare system. As she completes her business degree at the University of British Columbia, she hopes to continue.'
  },
  {
    name: 'Hedieh Safiyari',
    title: 'CEO & Founder',
    image: 'hedieh.png',
    content: 'Jaden joined the team in May, excited to contribute to PromptHealth’s mission after years of struggling within the current healthcare system. As she completes her business degree at the University of British Columbia, she hopes to continue.'
  },
  {
    name: 'Hedieh Safiyari',
    title: 'CEO & Founder',
    image: 'hedieh.png',
    content: 'Jaden joined the team in May, excited to contribute to PromptHealth’s mission after years of struggling within the current healthcare system. As she completes her business degree at the University of British Columbia, she hopes to continue.'
  },
  {
    name: 'Hedieh Safiyari',
    title: 'CEO & Founder',
    image: 'hedieh.png',
    content: 'Jaden joined the team in May, excited to contribute to PromptHealth’s mission after years of struggling within the current healthcare system. As she completes her business degree at the University of British Columbia, she hopes to continue.'
  },
  {
    name: 'Hedieh Safiyari',
    title: 'CEO & Founder',
    image: 'hedieh.png',
    content: 'Jaden joined the team in May, excited to contribute to PromptHealth’s mission after years of struggling within the current healthcare system. As she completes her business degree at the University of British Columbia, she hopes to continue.'
  },
  {
    name: 'Hedieh Safiyari',
    title: 'CEO & Founder',
    image: 'hedieh.png',
    content: 'Jaden joined the team in May, excited to contribute to PromptHealth’s mission after years of struggling within the current healthcare system. As she completes her business degree at the University of British Columbia, she hopes to continue.'
  },

]