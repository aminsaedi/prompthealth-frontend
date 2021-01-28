import { environment } from 'src/environments/environment';
import { QuestionnaireAnswer } from '../dashboard/questionnaire.service';

export interface IProfessional {
  id: string;

  // general info
  name: string;  // firstname + lastname
  firstname: string;
  image: string;
  role: string;
  phone: string;
  address: string;
  rating: string | number;
  isCentre: boolean;
  provideVirtual: boolean;

  // used in listingComponent
  price: string;
  location: number[]; // geo location
  distance: number;
  mapLabel: string;
  mapIcon?: any;
  isCheckedForCompare: boolean;

  // used in detailComponent
  reviews: any[];
  yearsOfExperience: string;
  languages: string;
  videos: Video[];
  endosements: any[];
  banner: string;
  practicePhilosophy: string;
  ageRange: string;
  organization: string;
  certification: string;

  treatmentModality: string[];
  service: string[];
  serviceDelivery: string[];
  amenity: string[];
  typeOfProvider: string[];

  // not used anywhere yet
  gender: string;
}

/**
 * Professional data
 * fetched from api {user/filter}
 * used in ListingComponent / detailComponent
*/
export class Professional implements IProfessional {

  private _baseURLImage = environment.config.AWS_S3;
  // private _baseURLImage = 'https://api.prompthealth.ca/users/';

  private _rowUserData: any; /** for compatibility with old UI */
  private _rowAns: any;  /** for compatibility with old UI */
  get dataComparable(): any {
    const serviceType = [], serviceOffering = [];
    this._service.forEach(c => { serviceType.push(c.item_text); });
    this._serviceDelivery.forEach(c => { serviceOffering.push(c.item_text); });

    return {
      userId: this._id,
      userData: this._rowUserData,
      ans: this._rowAns,
      serviceData: this._typeOfProvider,
      treatmentModalities: this._treatmentModality,
      serviceType,
      serviceOffering
    };
  } /** for compatibility with old compare page */

  private _id: string;
  private _name: string;
  private _firstname: string;
  private _image: string;
  private _roles: string[];
  private _description: string;
  private _phone: string;
  private _ratingAvg: number;
  private _reviews: any[] = [];
  private _priceRange: number[] = [];
  private _gender: string;
  private _address: string;
  private _location: number[];
  private _distance: number;
  private _provideVirtual: boolean;
  private _videos: Video[];
  private _yearsOfExperience: string;
  private _practicePhilosophy: string;
  private _organization: string;
  private _certification: string;
  private _professionals: Professional[] = [];
  private _amenities: Amenity[];

  private _isCheckedForCompared = false;

  private _languagesId: string[] = [];
  private _ageRangeId: string[] = [];
  private _availabilityId: string[] = [];
  private _serviceDeliveryId: string[] = [];

  private _languages: { id: string, item_text: string }[] = [];
  private _ageRange: { id: string, item_text: string }[] = [];
  private _availability: { id: string, item_text: string }[] = [];

  private _typeOfProvider: ServiceCategory[] = [];   /** homeopath / dentist / neuropsychologist */
  private _treatmentModality: ServiceCategory[] = []; /** laser treatments / tai chi */
  private _service: ServiceCategory[] = []; /** medical care / preventative health */
  private _serviceDelivery: ServiceCategory[] = [];  /** service / exercise training / direct billing */

  private _banner: string; // todo: implement correctly. currently, this property not used.
  private _endosements: any[]; // todo: impliment correctly. currently, this property not used;

  private _mapIconUrl: string;
  private _isMapIconReady = true;

  get id() { return this._id; }
  get name() { return this._name; }
  get firstname() { return this._firstname; }
  get image() { return this._image ? this._baseURLImage + '350x220/' + this._image : '/assets/img/no-image.jpg'; }
  get imageFull() { return this._image ? this._baseURLImage + this._image : '/assets/img/no-image.jpg'; }
  get banner() { return this._banner ? this._baseURLImage + this._banner : '/assets/img/professional-banner.png'; }
  get role() { return this._roles.toString(); }
  get description() { return this._description; }
  get phone() { return this._phone; }
  get reviews() { return this._reviews; }
  get rating() { return this._ratingAvg; }
  get price() {
    return (
      this._priceRange.length > 1) ? `$${this._priceRange[0]}+ / hr` :
      (this._priceRange.length === 1) ? `$${this._priceRange[0]} / hr` : null;
  }
  get priceFull() { return (this._priceRange.length === 0) ? 'N/A' : '$' + this._priceRange.join(' - '); }
  get gender() { return this._gender; }
  get address() { return this._address; }
  get location() { return this._location; }
  get distance() { return this._distance; }
  get provideVirtual() { return this._provideVirtual; }
  get practicePhilosophy() { return this._practicePhilosophy; }
  get videos() { return this._videos; }
  get yearsOfExperience() { return this._yearsOfExperience; }
  get languages() {
    const languages = [];
    this._languages.forEach(l => { languages.push(l.item_text); });
    return languages.join(', ');
  }
  get ageRange() {
    const ageRange = [];
    this._ageRange.forEach(a => { ageRange.push(a.item_text); });
    return ageRange.join(', ');
  }
  get availability() {
    const availability = [];
    this._availability.forEach(a => { availability.push(a.item_text); });
    return availability.join(', ');
  }
  get isCentre() { return !!(this.role.toLocaleLowerCase().match(/c/)); }
  get endosements() { return this._endosements; }
  get organization() { return this._organization; }
  get certification() { return this._certification; }
  get professionals() { return this._professionals; }

  get mapLabel() { return (this.price ? this.price : null); }
  get mapIconUrl() { return (this._mapIconUrl && this._mapIconUrl.length > 0) ? this._mapIconUrl : null; }
  get isMapIconReady() { return this._isMapIconReady; }

  get typeOfProvider() {
    const result = [];
    if (this._typeOfProvider) { this._typeOfProvider.forEach(o => { result.push(o.item_text); }); }
    return result;
  }

  get treatmentModality() {
    const result = [];
    if (this._treatmentModality) { this._treatmentModality.forEach(o => { result.push(o.item_text); }); }
    return result;
  }

  get service() {
    const result = [];
    if (this._service) { this._service.forEach(o => { result.push(o.item_text); }); }
    return result;
  }

  get serviceDelivery() {
    const result = [];
    if (this._serviceDelivery) { this._serviceDelivery.forEach(o => { result.push(o.item_text); }); }
    return result;
  }

  get amenity() {
    const result = [];
    if (this._amenities) { this._amenities.forEach(o => { result.push(o.item_text); }); }
    return result;
  }

  get isCheckedForCompare() { return this._isCheckedForCompared; }
  set isCheckedForCompare(checked: boolean) { this._isCheckedForCompared = checked; }
  uncheckForCompare() { this._isCheckedForCompared = false; }

  constructor(id: string, p: any, ans?: any) {
    this._id = id;
    this._rowUserData = p;
    this._rowAns = ans;

    const first = p.firstName || p.fname || '';
    const last = p.lastName || p.lname || '';
    const name = first + ' ' + last;
    this._name = name.trim();
    this._firstname = first;

    this._image = p.profileImage || p.image || null;
    this._banner = null;

    this._roles = !p.roles ? ['SP'] : (typeof p.roles === 'string') ? [p.roles] : p.roles;

    this._description = p.description || null;
    this._practicePhilosophy = p.product_description || null;

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

    this._ratingAvg = p.ratingAvg ? Number(p.ratingAvg) : 0;
    this._reviews = p.ratingBy || [];

    const priceRange: string = p.price_per_hours || '';
    const priceArray: string[] = priceRange ? priceRange.replace('$', '').split('-') : [];
    priceArray.forEach((price) => {
      const p = Number(price.trim());
      if (p > 0) { this._priceRange.push(p); }
    });

    this._gender = p.gender || null;
    this._address = p.address || null;
    this._videos = p.videos || [];
    this._yearsOfExperience = p.years_of_experience || null;
    this._languagesId = p.languages || [];
    this._availabilityId = p.typical_hours || [];
    this._ageRangeId = p.age_range || [];
    this._ageRange = p.age_range || [];
    this._serviceDeliveryId = p.serviceOfferIds || [];
    this._location = p.location || null;
    this._distance = p.calcDistance || null;
    this._provideVirtual = p.provideVirtual || false;

    this._organization = p.professional_organization || null;
    this._certification = p.certification || null;
  }

  populate(type: 'languages' | 'availability' | 'ageRange' | 'serviceDelivery', dataSet: QuestionnaireAnswer[]) {
    this['_' + type] = [];
    dataSet.forEach(a => {
      for (let i = 0; i < this['_' + type + 'Id'].length; i++) {
        const id = this['_' + type + 'Id'][i];
        if (id == a._id) {
          this['_' + type].push({ id, item_text: a.item_text });
          break;
        }
      }
    });
  }

  setServiceCategory(name: string, data: ServiceCategory[]) { this['_' + name] = data; }
  setEndosements(endosements: any[]) { this._endosements = endosements; }
  setProfessionals(professionals: Professional[]) { professionals.forEach(p => { this._professionals.push(p); }); }

  setAmenities(amenities: any[]) {
    const a = [];
    amenities.forEach(amenity => {
      a.push({
        id: amenity.defaultamenityId._id,
        item_text: amenity.defaultamenityId.item_text,
        image: (amenity.defaultamenityId.icon ? ('/assets/img/' + amenity.defaultamenityId.icon) : null),
      });
    });
    this._amenities = a;
  }
  setReviews(reviews: any[]) { this._reviews = reviews || []; }
  sortReviewBy(i: number) {
    switch (i) {
      case 0: this._reviews.sort((a, b) => b.rate - a.rate); break; /** rate desc */
      case 1: this._reviews.sort((a, b) => a.rate - b.rate); break; /** rate asc */
      case 2: this._reviews.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()); break; /** date desc */
    }
  }

  async setMapIcon() {
    const img = new Image;
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    const needLabel = !!this.mapLabel;

    const radCircle = needLabel ? 28 : 34;
    const gap = 3;
    const padding = 2;
    const paddingRight = 20;
    const hLabel = 42;

    if (needLabel) {
      ctx.fillStyle = 'black';
      ctx.font = '14px bold -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"';
      const wText = ctx.measureText(this.mapLabel).width;
      c.width = radCircle * 2 + gap + wText + padding + paddingRight;
      c.height = radCircle * 2 + padding * 2;

      ctx.beginPath();
      const x = 10;
      const y = padding + radCircle - hLabel / 2;
      const w = c.width - 10;
      const h = hLabel;
      const r = h / 2;

      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arc(x + w - r, y + r, r, Math.PI * (3 / 2), Math.PI * (1 / 2), false);
      ctx.lineTo(x + r, y + h);
      ctx.arc(x + r, y + h - r, r, Math.PI * (1 / 2), Math.PI * (3 / 2), false);
      ctx.closePath();

      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'grey';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fill();

      ctx.fillStyle = 'black';
      ctx.font = '14px bold -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"';
      ctx.fillText(this.mapLabel, padding + radCircle * 2 + gap, padding + radCircle + 5);

    } else {
      c.width = 2 * (radCircle + padding);
      c.height = 2 * (radCircle + padding);
    }

    // const radCircle = 32;
    // const gap = 5;
    // const wLabel = 125;
    // const hLabel = 28;



    // c.width = needLabel? wLabel : radCircle * 2;
    // c.height = needLabel? radCircle * 2 + gap + hLabel : radCircle * 2;

    // if(needLabel){
    //   ctx.beginPath();
    //   const x = 0;
    //   const y = radCircle * 2 + gap;
    //   const w = wLabel;
    //   const h = hLabel;
    //   const r = hLabel / 2;

    //   ctx.moveTo(x + r, y);
    //   ctx.lineTo(x + w - r, y);
    //   ctx.arc(x + w - r, y + r, r, Math.PI * (3 / 2), Math.PI * (1 / 2), false);
    //   ctx.lineTo(x + r, y + h);
    //   ctx.arc(x + r, y + h - r, r, Math.PI * (1 / 2), Math.PI * (3 / 2), false);
    //   ctx.closePath();

    //   ctx.fillStyle = 'white';
    //   ctx.fill();

    //   ctx.fillStyle = 'black';
    //   ctx.font = '16px bold -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"';
    //   var wText = ctx.measureText(this.mapLabel).width;
    //   ctx.fillText(this.mapLabel, (wLabel - wText) / 2, radCircle * 2 + gap + hLabel - 8);
    // }

    img.onload = () => {

      ctx.beginPath();
      ctx.arc(padding + radCircle, padding + radCircle, radCircle, 0 * Math.PI / 180, 360 * Math.PI / 180);
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'grey';
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();
      ctx.clip();

      const w = img.width;
      const h = img.height;
      const rect = (w > h) ? h : w;

      const x = (w > h) ? (w - h) / 2 : 0;
      const y = (w > h) ? 0 : (h - w) / 2;

      ctx.drawImage(img, x, y, rect, rect, padding, padding, padding + radCircle * 2, padding + radCircle * 2);
      this._mapIconUrl = c.toDataURL();
      this._isMapIconReady = true;

      img.addEventListener('error', () => { img.src = '/assets/img/logo-sm.png'; });
      img.crossOrigin = '';
      img.src = this._image ? this.image : '/assets/img/logo-sm.png';
    };
  }
}
interface ServiceCategory {
  item_text: string;
  id?: string;
  slug?: string;
  questionId?: string;
  ansId?: string;
  subAnsId?: boolean;
}

interface Video {
  _id: string;
  title: string;
  url: string;
}

interface Amenity {
  id: string;
  item_text: string;
  image: string;
}
