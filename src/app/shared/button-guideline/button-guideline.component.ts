import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'button-guideline',
  templateUrl: './button-guideline.component.html',
  styleUrls: ['./button-guideline.component.scss']
})
export class ButtonGuidelineComponent implements OnInit {

  @Input() type: GuidelineType = 'profile'
  @Input() label: string = "Profile Guidelines";
  @Input() buttonClass: string = 'btn btn-link';

 public isBottomExpanded: boolean = false;

  @ViewChild('guidelineModal') public guidelineModal: ModalDirective;
  

  constructor() { }

  ngOnInit(): void {
  }

  openModal() {
    this.guidelineModal.show();
  }

  expandBottom() { this.isBottomExpanded = true; }
  shrinkBottom() { this.isBottomExpanded = false; }


}

type GuidelineType = 'profile' | 'ambassador';
