import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'button-profile-guideline',
  templateUrl: './button-profile-guideline.component.html',
  styleUrls: ['./button-profile-guideline.component.scss']
})
export class ButtonProfileGuidelineComponent implements OnInit {

  @Input() label: string = "Profile Guidelines";
  @Input() buttonClass: string = 'btn btn-link';
 
  @ViewChild('guidelineModal') public tutorialModal: ModalDirective;
  

  constructor() { }

  ngOnInit(): void {
  }

}
