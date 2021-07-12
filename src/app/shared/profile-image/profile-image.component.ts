import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.scss']
})
export class ProfileImageComponent implements OnInit {

  @Input() image: string;
  @Input() size: number = 40; // unit: px

  constructor() { }

  ngOnInit(): void {
  }

}
