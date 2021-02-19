import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-amenity-viewer',
  templateUrl: './amenity-viewer.component.html',
  styleUrls: ['./amenity-viewer.component.scss']
})
export class AmenityViewerComponent implements OnInit {

  @Input() data: Amenity[];
  @Output() close = new EventEmitter<void>();

  public target: ImageData;

  get images(){
    const result = [];
    this.data.forEach(d=>{ d.images.forEach(image=>{ result.push(image)}); });

    return result;
  }

  constructor() { }

  ngOnInit(): void {
    this.target = this.images[0];
  }

  selectImage(i: number){ this.target = this.images[i]; }

  onClose(){ this.close.emit(); }

}

interface Amenity {
  id: string;
  item_text: string;
  images: ImageData[];
}

interface ImageData {name?: string, url: string, desc?: string}