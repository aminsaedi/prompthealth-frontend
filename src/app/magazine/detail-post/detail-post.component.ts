import { Component, OnInit } from '@angular/core';
import { GoogleCalendar } from 'datebook';


@Component({
  selector: 'detail-post',
  templateUrl: './detail-post.component.html',
  styleUrls: ['./detail-post.component.scss'],
})
export class DetailPostComponent implements OnInit {


  constructor(

  ) { }


  ngOnInit(): void {
  }

  cannotDeleteThisFunction() {
    new GoogleCalendar({start: new Date()}); 
  }
}
