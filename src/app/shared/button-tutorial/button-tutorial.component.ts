import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'button-tutorial',
  templateUrl: './button-tutorial.component.html',
  styleUrls: ['./button-tutorial.component.scss']
})
export class ButtonTutorialComponent implements OnInit {

  @Input() label: string; /** label for button */
  @Input() title: string; /** title for modal  */
  @Input() type: TutorialType;
  @Input() buttonClass: string = 'btn-outline small';

  @ViewChild('videoPlayer') videoPlayer: ElementRef;
  @ViewChild('tutorialModal') public tutorialModal: ModalDirective;

  public videoUrl: string;

  constructor() { }

  ngOnInit(): void {
    switch(this.type){
      case 'signup': this.videoUrl = 'https://prompt-images.s3.us-east-2.amazonaws.com/tutorial-register-sp.MP4'; break;
      case 'signup-product': this.videoUrl = 'https://prompt-images.s3.us-east-2.amazonaws.com/tutorial-signup-product.mp4'; break;
      case 'dashboard': this.videoUrl = 'https://prompt-images.s3.us-east-2.amazonaws.com/tutorial-dashboard.mp4'; break;
    }
  }

  playVideo() { (this.videoPlayer.nativeElement as HTMLVideoElement).play(); }
  pauseVideo() { (this.videoPlayer.nativeElement as HTMLVideoElement).pause(); }

}

type TutorialType = 'signup' | 'signup-product' | 'dashboard';