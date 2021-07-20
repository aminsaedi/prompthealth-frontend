import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss']
})
export class AudioPlayerComponent implements OnInit {

  @Input() audioStyle: {[k: string]: string | number};
  @Input() audioClass: string[] | string | {[k: string]: any} = ['theme-default'];

  constructor() { }

  ngOnInit(): void {
  }
}


