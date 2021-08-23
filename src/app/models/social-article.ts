import { ISocialPost, SocialPostBase } from "./social-post";

export class SocialArticle extends SocialPostBase implements ISocialPost {
  get title() { return this.data.title; }
  
  get image() { return (this.data.image) ? this._s3 + this.data.image : '/assets/img/logo-square-primary-light.png'; }
  get imageType() {
    let imageType: string = '';
    if(this.data.image) {
      const regex = /\.(jpe?g|png)$/;
      const match = this.data.image.match(regex);
      imageType = match ? ('image/' + match[1]) : '';  
    }
    return imageType;
  }
  
  get readLength() { return this._readLength; } /** UNIT: minute */
  get readLengthLabel() { return this._readLengthLabel; }
  
  private _readLength: number;
  private _readLengthLabel: string;
  
  constructor(protected data: ISocialPost) {
    super(data);
    
    /** calculate readLength if it's 0 */
    if(data.readLength > 0) {
      this._readLength = data.readLength;
    } else {
      const words = data.title + this._summary;
      this._readLength = Math.ceil(words.length / 200);
    }
    this._readLengthLabel = this.getFormattedTime(this._readLength);
  }

  getFormattedTime(minutes: number) { 
    let res: string = '';
    if(minutes >= 60) {
      const h = Math.floor(minutes / 60 * 100) / 100;
      res = h + 'hour' + (h > 1 ? 's' : '');
    } else {
      res = minutes + 'min' + (minutes > 1 ? 's' : '');      
    }
    return res;
  }
}