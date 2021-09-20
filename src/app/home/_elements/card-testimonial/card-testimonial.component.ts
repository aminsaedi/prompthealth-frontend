import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'card-testimonial',
  templateUrl: './card-testimonial.component.html',
  styleUrls: ['./card-testimonial.component.scss']
})
export class CardTestimonialComponent implements OnInit {

  @Input() data: any;
  
  constructor() { }

  ngOnInit(): void {
  }

}
