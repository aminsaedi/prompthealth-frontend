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
  public holisticImages = holisticImages;
  public idxSelectedMember = -1;

  public isOnHolistic = false;
  public isOnTeam = false;

  public countImagesLoaded = 0;
  public disableAnimationTop = false;
  public disableAnimationHolistic = false;
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

  onHolisticIntersected(enter: boolean) {
    if(enter) {
      this.holisticImages = holisticImages;
      setTimeout(() => {
        this.disableAnimationHolistic = true;
      }, 500);
    } else {
      this.disableAnimationHolistic = false;
      this.holisticImages = [];
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
  '/assets/img/about/top-0.jpg',
  '/assets/img/about/top-1.jpg',
  '/assets/img/about/top-2.jpg'
];

const holisticImages = [
  '/assets/img/about/holistic-0.png',
  '/assets/img/about/holistic-1.png',
  '/assets/img/about/holistic-2.png',
  '/assets/img/about/holistic-3.png',
  '/assets/img/about/holistic-4.png',
];

const teamData = [
  {
    name: 'Bob Mehr',
    title: 'Advisor',
    image: 'bob.jpg',
    content: 'Bob is the president of Pure Integrative Pharmacy, chain of 17 pharmacies across BC with years of experience in healthcare as a pharmacist and business leader.',
  },
  {
    name: 'Jan Simon',
    title: 'Advisor',
    image: 'jan.jpg',
    content: 'Jan is a managing partner at Vonzeo capital and university lecturer in finance at top business schools including IESE and Simon Fraser.',
  },
  {
    name: 'Peter Valadkhan',
    title: 'Technical lead',
    image: 'peter.jpg',
    content: 'Peter is an experienced software developer with a PHD in computer science and university lecturer at University of the Fraser Valley leading the technical development.',
  },
  {
    name: 'Renee Bigelow',
    title: 'Marketing Consultant & Fractional CMO',
    image: 'renee.jpg',
    content: '20+ years experience leading marketing teams with speciality in technology and SaaS & Media and Marketing Services SMBs',
  }, 
  {
    name: 'Jasmine Marahar',
    title: 'Product Manager',
    image: 'jasmine.png',
    content: 'Jasmine joined the team in January 2020 with a background in HR Management to help on the mission to educate others on their treatment options. As someone who has battled mental health challenges all her life, Jasmine knows first-hand that individual care needs for what can diagnostically be the same issue can still be different. Helping others find information and care that is reliable and works best for their needs is important to her.'
  },
  {
    name: 'Jaden Kim',
    title: 'Digital Marketing and Social Media Manager',
    image: 'jaden.png',
    content: 'Jaden joined the team in May, with a background in social media and marketing, excited to contribute to PromptHealth’s mission after years of struggling within the current healthcare system. As she completes her business degree at the University of British Columbia, she hopes to continue her passion for marketing and making health services more accessible. Working at PromptHealth means a lot to her, as she feels strongly about the value that PromptHealth can bring to people.'
  },
  // {
  //   name: 'Leah King',
  //   title: 'Digital Marketing and Communications Manager',
  //   image: 'leah.png',
  //   content: 'Leah joined the team in May 2021, eager to use her background in marketing to propel PromptHealth’s mission to help others in their health and wellness journeys. With an experience of the difficulties our current healthcare system entails when seeking healthcare, Leah sees the immense value PromptHealth can bring to people.'
  // },
  // {
  //   name: 'Evan Wang',
  //   title: 'Account Relationship Manager',
  //   image: 'evan.png',
  //   content: 'Evan joined the team in August 2021 with a running record of sales experiences to unveil and expand the myriad of health services for those in need. In the process of completing his bachelor’s degree in commerce, he is seeking to emulate his values of altruism and service by assisting those who practice health. Generating channels for service providers gives him purpose and has proven to be his vocation.'
  // },
  {
    name: 'Otto Hu',
    title: 'Software Developer',
    image: 'otto.png',
    content: 'Otto is a full-stack software developer who graduated at SFU with B.Sci in computer science. He has been a key member of the team since November 2020. Otto has helped transform and consolidate the project. He also idealized and shaped the platform with the idea of an ecosystem in health, composed of patients, practitioners and product companies.'
  },
  {
    name: 'Takayuki Hiraishi',
    title: 'Software Developer',
    image: 'takayuki.png',
    content: 'Takayuki joined the team as frontend engineer in December 2020, with MEAN stack experience, contributing to PromptHealth web platform. He believes in the power of combination of the healthcare system and web service and is eager to make user experience on the platform better.'
  },
  {
    name: 'Amin Saedi',
    title: 'Mobile App Developer',
    image: 'amin.png',
    content: 'Amin just joined Prompt Health in September 2021 as a Mobile application developer and currently studying computer science. He is interested in changing people\'s experience of the healthcare system, and he hopes the technology can do more to serve the health of society.',
  },
  {
    name: 'Reza Ghenaat',
    title: 'Product Designer',
    image: 'reza.png',
    content: 'Reza is an experienced UI/UX designer with over 8 years of experience, creating a design solution for a mobile and desktop version of the PromptHealth and redesigning existing Web/App designs to meet accessibility standards.',
  },

]