import { ISocialPost, SocialPostBase } from "./social-post";

export class SocialArticle extends SocialPostBase implements ISocialPost {
  get title() { return this.data.title; }
  
  get image() { return this.data.image ? this.data.image : null; }
  
  get readLength() { return this._readLength; } /** UNIT: minute */
  get readLengthLabel() { return this._readLengthLabel; }
  
  private _readLength: number;
  private _readLengthLabel: string;
  
  constructor(protected data: ISocialPost) {
    super(data);
    this.calcReadLength(data);
  }

  calcReadLength (data: ISocialPost) {
    /** calculate readLength if it's 0 */
    if(data.readLength > 0) {
      this._readLength = data.readLength;
    } else {
      this._readLength = Math.ceil(this._summary.length / 1200) || 1; // originally divide by 200
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

  updateWith(data: ISocialPost) {
    super.updateWith(data);
    this.data.title = data.title;
    this.data.image = data.image;
    this.calcReadLength(data);
  }
}