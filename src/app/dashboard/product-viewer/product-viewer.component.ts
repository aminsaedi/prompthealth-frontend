import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ImageData, Product} from '../../models/professional';

@Component({
  selector: 'app-product-viewer',
  templateUrl: './product-viewer.component.html',
  styleUrls: ['./product-viewer.component.scss']
})
export class ProductViewerComponent implements OnInit {

  @Input() data: (Product)[] = [];
  @Input() target: number = 0;
  
  @Output() close = new EventEmitter<void>();

  get itemTarget(): Product{ return this.data[this.target]; }

  public thumbnails: ImageData[] = [];
  
  constructor() { }

  ngOnInit(): void {
    this.data.forEach(d=>{
      this.thumbnails.push(d.images[0]);
    });
  }

  selectImage(i: number){ this.target = i; }
  onClose(){ this.close.emit(); }

}
