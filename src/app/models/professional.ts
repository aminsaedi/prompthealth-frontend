import { SocialLinkData } from '../shared/social-buttons/social-buttons.component';
import { ImageData, ImageGroupData, ImageViewerData } from '../shared/image-viewer/image-viewer.component';
import { IUserDetail, IVideo } from './user-detail';
import { IProfile, Profile } from './profile';
import { ReviewData } from './review-data';

export interface IProfessional extends IProfile {
  id: IProfessional['_id']; /** old name (changed to _id) */

  image: IProfessional['profileImage']; /** profile image small size (if not set, return default avator) */
  imageFull: IProfessional['profileImageFull']; /** profile image original size (if not set, return default avator) */
  imageType: IProfessional['profileImageType'] /** profile image file type (same as profileImageType) */

  emailToDisplay: string

  title: string;
  phone: string;
  address: IUserDetail['address'];
  state: IUserDetail['state'];
  city: IUserDetail['city'];
  distance: number;
  location: number[]; /** [long, lat] */
  mapLabel: string;
  mapIconUrl: any;

  price: string; /** lower price ex: null | $150 / hr */
  priceFull: string; /** price range or exact price ex: N/A | $150 - 250 / hr */
  website: string;
  websiteLabel: string;
  bookingUrl: string;
  organization: string;
  certification: string;
  yearsOfExperience: string;

  socialLink: {isAvailable: boolean, data: SocialLinkData};
  videos: IVideo[];
  detailByGoogle: google.maps.places.PlaceResult;
  professionals: Professional[];
  rating: number;
  reviews: any[];
  reviewData: ReviewData;
  reviewCount: number;

  amenity: ImageViewerData; /** all amenities data */
  amenityPreview: ImageGroupData[]; /** first 3 amenities for preview */
  product: ImageViewerData; /** all products data */
  productPreview: ImageGroupData[]; /** first 3 products for preview */

  isMapIconReady: boolean;
  isC: boolean;
  isSP: boolean;
  isP: boolean;
  isVirtualAvailable: boolean;
  provideVirtual: boolean; // old name (changed to isVirtualAvailable)
  isConnectedToGoogle: boolean;
  isCheckedForCompare: boolean;

  seeOtherRegion: string;
  acceptInsurance: string;

  languageIds: string[];
  ageRangeIds: string[];
  availabilityIds: string[];
  serviceDeliveryIds: string[];
  serviceIds: string[];
  age_range: string[] /** old name (changed to ageRangeIds) */
  languagesId: string[]; /** old name (changed to languageIds) */
  allServiceId: string[]; /** old name (changed to serviceIds */
  serviceOfferIds: string[]; /** old name (changed to serviceDeliveryIds) */

  dataComparable: any; /** data for compare page (used in old design) */

  triedFetchingGoogleReviews: boolean;
  triedFetchingAmenity: boolean;
  triedFetchingProduct: boolean;
  triedFetchingProfessionals: boolean;
}

export class Professional extends Profile implements IProfessional{

  protected _defaultAvator = '/assets/img/no-image.jpg';
  protected _defaultBanner = '/assets/img/professional-banner.png';

  get id() { return this._id; }

  get image() { return this.profileImage.length > 0 ? this.profileImage : this._defaultAvator; } // if profile image is not set, return default image
  get imageFull() { return this.profileImageFull.length > 0 ? this.profileImageFull : this._defaultAvator; }
  get imageType(){ return this.profileImageType; }
  get coverImage() { return this._defaultBanner; }

  get emailToDisplay() { return this.p.displayEmail; }

  get title() { return this.p.professional_title || null; }
  get phone() { return this._phone; }
  get address() { return (!this.p.hideAddress && this.p.address && this.p.address.length > 0) ? this.p.address : null; }
  get state() { return this.p.state; }
  get city() { return this.p.city; }
  get location() { return this.p.location || [null, null]; }
  get distance() { return this.p.calcDistance || null; }
  get mapLabel() { return (this._priceRange.length >= 1 ? `$${this._priceRange[0]}+` : 'N/A'); }
  get mapIconUrl() { return (this._mapIconUrl && this._mapIconUrl.length > 0) ? this._mapIconUrl : null; }

  get price() { return (this._priceRange.length >= 1) ? `$${this._priceRange[0]}+ / hr` : null; }
  get priceFull() { return (this._priceRange.length === 0) ? 'N/A' : '$' + this._priceRange.join(' - '); }
  get website() { return this.p.website; }
  get websiteLabel() { return this.getURLLabel(this.p.website); }
  get bookingUrl() { return this.p.bookingURL || null; }
  get organization() { return this.p.professional_organization || null; }
  get certification() { return this.p.certification; }
  get yearsOfExperience() { return this.p.years_of_experience || null; }
  get acceptInsurance() { return this.p.acceptsInsurance || null; }
  get seeOtherRegion() { return this.p.seeOtherRegion || null; }

  get socialLink() { return this._socialLink; }
  get videos() { return (this.p.plan && this.p.plan.videoUpload) ? this.p.videos : []; } 
  get detailByGoogle(){ return this._detailByGoogle || null; }
  get professionals() { return (this.p.plan && this.p.plan.ListOfProviders) ? this._professionals : []; }
  get rating() { return Math.round(this.p.ratingAvg * 10) / 10; }
  get reviews() { return this._reviewData ? this._reviewData.data : []; }
  get reviewData() { return this._reviewData; }
  get reviewCount() { return this.reviews.length; }

  get amenity() {
    return (this._amenities && this._amenities.imageGroups.length > 0 && this.p.plan && this.p.plan.ListAmenities) ? this._amenities : {imageGroups: []};
  }

  get amenityPreview() {
    const result = [];
    if (this._amenities && this._amenities.imageGroups.length > 0 && this.p.plan && this.p.plan.ListAmenities) {
      this._amenities.imageGroups.forEach(a => { a.images.forEach(image => { result.push(image); }); });
    }
    return (result.length > 3) ? result.slice(0, 3) : result;
  }

  get product() {
    return (this._products && this._products.imageGroups.length > 0 && this.p.plan && this.p.plan.ListProductsOption) ? this._products : {imageGroups: []};
  }

  get productPreview() {
    const result = [];
    if (this._products && this._products.imageGroups.length > 0 && this.p.plan && this.p.plan.ListProductsOption) {
      this._products.imageGroups.forEach(p => { result.push(p.images[0]); });
    }
    return (result.length > 3) ? result.slice(0, 3) : result;
  }

  get isMapIconReady() { return this._isMapIconReady; }
  get isVirtualAvailable() { return this.p.provideVirtual || false; }
  get provideVirtual() { return this.isVirtualAvailable; }
  get isConnectedToGoogle() { return !!this.p.placeId}
  get isCheckedForCompare() { return this._isCheckedForCompared; }
  set isCheckedForCompare(checked: boolean) { this._isCheckedForCompared = checked; }

  get languageIds() { return this.p.languages || []; }
  get ageRangeIds() { return this.p.age_range || []; }
  get availabilityIds() { return this.p.typical_hours || []; }
  get serviceIds() { return this.p.services || []; }
  get serviceDeliveryIds() { return this.p.serviceOfferIds || []; }
  get age_range() { return this.ageRangeIds; }
  get languagesId() { return this.languageIds; }
  get allServiceId() { return this.serviceIds || []; }
  get serviceOfferIds() { return this.serviceDeliveryIds; };


  get dataComparable(): any {
    const serviceType = [], serviceOffering = [];
    // this._service.forEach(c => { serviceType.push(c.item_text); });
    // this._serviceDelivery.forEach(c => { serviceOffering.push(c.item_text); });

    return {
      userId: this._id,
      userData: this.p,
      ans: this.ans,
      // serviceData: this._typeOfProvider,
      // treatmentModalities: this._treatmentModality,
      serviceType,
      serviceOffering
    };
  } /** for compatibility with old compare page */

  get triedFetchingAmenity() { return this._triedFetchingAmenity; }
  get triedFetchingProduct() { return this._triedFetchingProduct;}
  get triedFetchingGoogleReviews() { return this._triedFetchingGoogleReviews; }
  get triedFetchingProfessionals() { return this._triedFetchingProfessionals; }


  uncheckForCompare() { this._isCheckedForCompared = false; }

  getURLLabel(url: string = ''){
    let label = ''
    const match = url.match(/https?:\/\/(?:www\.)?([^/]+)/);
    if(url && match){ label = match[1]; }
    return label;
  }

  private _phone: string;
  private _reviewData: ReviewData;

  private _priceRange: number[] = [];
  private _professionals: Professional[] = [];
  private _amenities: ImageViewerData;
  private _products: ImageViewerData;

  private _isCheckedForCompared = false;

  private _socialLink: { isAvailable: boolean, data: SocialLinkData } = {
    isAvailable: false,
    data: {
      facebook: null,
      twitter: null,
      instagram: null,
      linkedin: null,
      tiktok: null,
      youtube: null,
    }
  };

  private _detailByGoogle: google.maps.places.PlaceResult;
  private _mapIconUrl: string;
  private _isMapIconReady = false;

  private _triedFetchingGoogleReviews = false;
  private _triedFetchingAmenity = false;
  private _triedFetchingProduct = false;
  private _triedFetchingProfessionals = false;

  constructor(id: string, protected p: IUserDetail, private ans?: any) {
    super({...p, _id: id});

    let phone: string;
    if (!p.phone) {
      phone = null;
    } else if (p.phone.length === 0) {
      phone = null;
    } else if (p.phone.length === 10) {
      phone = `(${p.phone.slice(0, 3)}) ${p.phone.slice(3, 6)}-${p.phone.slice(6)}`;
    } else {
      phone = p.phone;
    }
    this._phone = phone;

    let priceRange: string = p.exactPricing ? p.exactPricing.toString() : (p.price_per_hours || '');
    priceRange = priceRange.replace('<', '0 -');
    const priceArray: string[] = priceRange ? priceRange.replace('$', '').split('-') : [];
    priceArray.forEach((price) => {
      const p = Number(price.trim());
      if (p >= 0) { this._priceRange.push(p); }
    });

    if (p.socialLinks && p.socialLinks.length > 0 && ((p.plan && p.plan.name !== 'Basic') || p.isVipAffiliateUser)) {
      this._socialLink.isAvailable = true;
      p.socialLinks.forEach((d: { type: string; link: string }) => {
        this._socialLink.data[d.type] = d.link;
      });
    }
  }

  markAsTriedFetchingAmenity() { this._triedFetchingAmenity = true; }
  markAsTriedFetchingProduct() { this._triedFetchingProduct = true; }
  markAsTriedFetchingProfessionals() { this._triedFetchingProfessionals = true; }

  
  setProfessionals(professionals: IUserDetail[]) { 
    const ps = professionals.map(item => new Professional(item._id, item));
    this._professionals = ps;
  }

  setAmenities(amenities: any[]) {
    const as = [];
    amenities.forEach(amenity => {
      const images: ImageData[] = [];
      amenity.images.forEach((image: string) => {
        images.push({
          url: this._s3 + image,
          name: amenity.defaultamenityId.item_text
        });
      });
      as.push({
        id: amenity.defaultamenityId._id,
        item_text: amenity.defaultamenityId.item_text,
        images
      });
    });
    this._amenities = {imageGroups: as};
  }

  setProducts(products: any[]) {
    const ps = [];
    products.forEach(p => {
      const images: ImageData[] = [];
      p.images.forEach((image: string) => {
        images.push({
          name: p.title,
          url: this._s3 + image,
          desc: p.description
        });
      });
      ps.push({
        id: p._id,
        item_text: p.title,
        desc: p.description,
        images,
        price: p.price
      });
    });
    this._products = {imageGroups: ps};
  }

  setReviews(data: any[]) {
    this.p.ratingBy.forEach((r0: any) => {
      const populated = [];
      for (const r1 of data) {
        if (r1._id == r0.bookingId) {
          const name = [];
          if (r1.customerId.firstName) { name.push(r1.customerId.firstName); }
          if (r1.customerId.lastName) { name.push(r1.customerId.lastName); }

          populated.push({
            name: (name.length > 0) ? name.join(' ') : 'Anonymous',
            image: (r1.customerId.profileImage) ? this._s3 + '350x220/' + r1.customerId.profileImage : '/assets/img/no-image.jpg',
            rate: r1.rating,
            review: r1.review,
            createdAt: r0.createdAt,
          });
          break;
        }
      }
      this._reviewData = new ReviewData(populated);
    });
  }

  async setGoogleReviews(): Promise<google.maps.places.PlaceResult>{
    return new Promise( async (resolve, reject) => {
      if(this._detailByGoogle){ resolve(this._detailByGoogle); }
      else if(!this.p.placeId) { resolve(null); }
      else {
        this._triedFetchingGoogleReviews = true;
        const map = new google.maps.Map(document.createElement('div'));
        const service = new google.maps.places.PlacesService(map);
        service.getDetails({
          fields: ['rating', 'review', 'photo', 'url'],
          placeId: this.p.placeId,
        }, (result, status)=>{
          if(result){
            this._detailByGoogle = result;
            resolve(this._detailByGoogle);  
          }else{
            reject(status);
          }
        });
      }
    });
  }

  async setMapIcon(highlight: boolean = false) {
    this._isMapIconReady = false;
    this._mapIconUrl = null;

    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');

    ctx.font = '14px bold -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"';

    const imageSize = 30;
    const wText = ctx.measureText(this.mapLabel).width;
    const [x0, x1] = [10, 10 + 5 + imageSize + 5 + wText + 10];
    const [y0, y1] = [10, 10 + 5 + imageSize + 5];
    const w = x1 + 10;
    const h = y1 + 10;
    const r = 8;
    
    c.width = w;
    c.height = h;
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    ctx.moveTo(x0 + r, y0);
    ctx.lineTo(x1 - r, y0);
    ctx.arc(x1 - r, y0 + r, r, Math.PI * 3 / 2, 0, false);
    ctx.lineTo(x1, y1 - r);
    ctx.arc(x1 - r, y1 - r, r, 0, Math.PI * 1 / 2, false);
    ctx.lineTo(x0 + r, y1);
    ctx.arc(x0 + r, y1 - r, r, Math.PI * 1 / 2, Math.PI, false)
    ctx.lineTo(x0, y0 + r);
    ctx.arc(x0 + r, y0 + r, r, Math.PI, Math.PI * 3 / 2, false);
    ctx.closePath();

    ctx.fillStyle = highlight ? '#293148' : 'white';
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    ctx.font = '14px bold -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"';
    ctx.fillStyle = highlight ? 'white' : 'black';
    ctx.fillText(this.mapLabel, x0 + 5 + imageSize + 5 , 35);

    this._mapIconUrl = c.toDataURL('image/png', 0.5);
    this._isMapIconReady = true;

    const img = new Image;
    img.onload = () => {
      const w = img.width;
      const h = img.height;
      const rect = (w > h) ? h : w;

      const x = (w > h) ? (w - h) / 2 : 0;
      const y = (w > h) ? 0 : (h - w) / 2;
      ctx.drawImage(img, x, y, rect, rect, x0 + 5, y0 + 5, imageSize, imageSize);
      this._mapIconUrl = c.toDataURL();
    }

    img.addEventListener('error', () => {
      if (!img.src.match(/assets/)) {
        img.src = '/assets/img/logo-sm.png';
      } else {
        console.log('default image for custom map icon load error.');
        this._isMapIconReady = true;
      }
    });

    img.crossOrigin = '';
    img.src = this.profileImage ? this.profileImage : '/assets/img/logo-sm.png';
  }
}
export interface ServiceCategory {
  item_text: string;
  id?: string;
  _id?: string;
  slug?: string;
  questionId?: string;
  ansId?: string;
  subAnsId?: boolean;
  subAns?: boolean;   /** true if this category has subcategory */
  isSubAns?: boolean; /** true if this category is subcategory */
  hasSubAns?: boolean;
  subAnsData?: ServiceCategory[];

}