import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'social-media-kit',
  templateUrl: './social-media-kit.component.html',
  styleUrls: ['./social-media-kit.component.scss']
})
export class SocialMediaKitComponent implements OnInit {

  @Input() expanded: boolean = false;
  @ViewChild('mediaKitContainer') private mediaKitContainer: ElementRef;
  @ViewChild('mediaKit') private mediaKit: ElementRef;

  public heightContainer: string;
  private heightImage: number = 0;

  constructor(
    private _changeDetector: ChangeDetectorRef,
  ) { }

  ngAfterViewChecked() {
    if(this.mediaKit) {
      const h = (this.mediaKit.nativeElement as HTMLElement).getBoundingClientRect().height;
      if(this.heightImage != h) {
        this.heightImage = h;
        this.setHeightContainer();
      }
    }
  }

  ngOnChanges(e: SimpleChanges) {
    if(e.expanded && this.mediaKit) {
      this.setHeightContainer();
    }
  }

  setHeightContainer() {
    this.heightContainer = this.expanded ? null : this.heightImage + 'px';
    this._changeDetector.detectChanges();
  }

  ngOnInit(): void {
  }

}
