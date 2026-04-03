import { Component, Input, OnInit } from '@angular/core';
import { IconName } from 'src/app/models/icon-ph';

@Component({
  selector: 'profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.scss']
})
export class ProfileImageComponent implements OnInit {

  @Input() image: string;
  @Input() alt: string = '';
  @Input() size: number = 40; // unit: px
  @Input() radius: number = 8; //unit: px
  @Input() option: IProfileImageOption = {}

  public _option: ProfileImageOption;
  
  private readonly defaultAvatar = '/assets/img/default_user.jpg';

  constructor() { }

  ngOnInit(): void {
    this._option = new ProfileImageOption(this.option);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== this.defaultAvatar) {
      img.src = this.defaultAvatar;
    }
  }
}

interface IProfileImageOption {
  dummyIcon?: IconName;
  dummySize?: number;
  dummyClass?: string;
  dummyBgClass?: string;
}

class ProfileImageOption implements IProfileImageOption{
  get dummyIcon() { return this.data.dummyIcon || 'user'; }
  get dummySize() { return this.data.dummySize || 22; }
  get dummyClass() { return this.data.dummyClass || 'text-label'}
  get dummyBgClass() { return this.data.dummyBgClass || null; }

  constructor(private data: IProfileImageOption){}
}