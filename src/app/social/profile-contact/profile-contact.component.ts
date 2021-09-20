import { Component, Input, OnInit } from '@angular/core';
import { Professional } from 'src/app/models/professional';

@Component({
  selector: 'profile-contact',
  templateUrl: './profile-contact.component.html',
  styleUrls: ['./profile-contact.component.scss']
})
export class ProfileContactComponent implements OnInit {

  @Input() profile: Professional

  constructor() { }

  ngOnInit(): void {
  }

}
