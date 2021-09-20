import { IProfessional, Professional } from './professional';
import { ImageViewerData, ImageData } from '../shared/image-viewer/image-viewer.component';

export interface IPartner extends IProfessional {
  email: string;
  priceLevel: number;
  priceUnder: number; /** price 1 */

  productImageViewerData: ImageViewerData;
  productImages: ImageData[];
  countProductImages: number;

  signupURL: string;
  coupon: string;
  sampleLink: string;
  sampleLinkLabel: string;
  affiliateLink: string;
  affiliateLinkLabel: string;
  trialLink: string;
  trialLinkLabel: string;

  createdAt: number; /** timestamp for createdAt*/
}

export class Partner extends Professional implements IPartner{

  get email() { return this.data.displayEmail; }
  get description() { return this.data.product_description; }

  get priceLevel() { return this.data.priceLevel; }
  get priceUnder() {return this.data.price1 || 0; }

  get productImageViewerData(){ return this._imageViewerDataProduct; }
  get productImages() { return this._imageViewerDataProduct.images; }
  get countProductImages() { return this._imageViewerDataProduct.images.length; }

  get signupURL() { return this.data.signupURL; }
  get coupon(){ return this.data.couponLink; }
  get sampleLink(){ return this.data.sampleLink; }
  get sampleLinkLabel(){ return this.getURLLabel(this.sampleLink); }
  get affiliateLink(){ return this.data.affiliateLink; }
  get affiliateLinkLabel(){ return this.getURLLabel(this.affiliateLink); }
  get trialLink(){ return this.data.trialLink; }
  get trialLinkLabel(){ return this.getURLLabel(this.trialLink); }

  get createdAt() { return this._createdAt.getTime(); }
  

  private _imageViewerDataProduct: ImageViewerData;
  private _createdAt: Date;

  constructor(protected data: any){
    super(data._id, data);
    
    this._imageViewerDataProduct = {images: []};
    if(data.image){
      data.image.forEach((image: string) => {
        this._imageViewerDataProduct.images.push( {url: this._s3 + image} );
      });
    }

    this._createdAt = new Date(data.createdAt);
  }
}
