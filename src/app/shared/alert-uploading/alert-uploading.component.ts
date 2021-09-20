import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'alert-uploading',
  templateUrl: './alert-uploading.component.html',
  styleUrls: ['./alert-uploading.component.scss']
})
export class AlertUploadingComponent implements OnInit {

  @Input() label: string = 'Uploading...';
  @Input() closable: boolean = false;

  @Output() onClose = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  close() {
    this.onClose.emit();
  }

}
