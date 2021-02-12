import { Component, ViewChild, Output, EventEmitter, NgZone, ElementRef } from '@angular/core';
import { SharedService } from '../../shared/services/shared.service';
import { BehaviorService } from 'src/app/shared/services/behavior.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { MapsAPILoader } from '@agm/core';

import { } from 'googlemaps';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent {
  // @ViewChild('myInput', { static: false })

  @ViewChild('search')
  public searchElementRef: ElementRef;

  myInputVariable: any;
  activeTab = 'questionnaire';
  zoom: number;
  roles = ''
  private geoCoder;
  defaultImage = '';

  public userDetails = {
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    hideAddress: false,
    state: '',
    city: '',
    certification: '',
    zipcode: '',
    age_range: [],
    languages: [],
    typical_hours: [],
    serviceOfferIds: [],
    price_per_hours: '',
    product_description: '',
    years_of_experience: '',
    business_kind: '',
    booking: '',
    bookingURL: '',
    profileImage: '',
    latitude: 0,
    longitude: 0,
    licence_type_degree: '',
    professional_organization: '',
    accredited_provide_canada: false
  };
  userId = ''

  ageRangeList = [
    { id: '5eb1a4e199957471610e6cd7', name: 'Not Critical', checked: false },
    { id: '5eb1a4e199957471610e6cd8', name: 'Child (<12)', checked: false },
    { id: '5eb1a4e199957471610e6cd9', name: 'Adolescent (12-18)', checked: false },
    { id: '5eb1a4e199957471610e6cda', name: 'Adult (18+)', checked: false },
    { id: '5eb1a4e199957471610e6cdb', name: 'Senior (>64)', checked: false },
  ];

  languagesSelected = [];
  hoursSelected = [];
  serviceOfferSelected = []
  profileQuestions = [];
  age_rangeSelected = [];

  avalibilityQuestion
  languageQuestion
  serviceQuestion

  public _host = environment.config.BASE_URL;
  public response: any;
  private imageSrc: string = '';
  imageSrc1: any;

  public AWS_S3 = environment.config.AWS_S3

  @Output() ActiveNextTab = new EventEmitter<string>();

  constructor(
    private _sharedService: SharedService,
    private _bs: BehaviorService,
    private toastr: ToastrService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone) {
  }

  ngOnInit() {
    this.roles = localStorage.getItem('roles');
    this.userId = JSON.parse(localStorage.getItem('user'))._id;
    this.mapsAPILoader.load().then(() => {
      this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder;

      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //set latitude, longitude and zoom
          this.userDetails.latitude = place.geometry.location.lat();
          this.userDetails.longitude = place.geometry.location.lng();
          this.zoom = 12;

          this.getAddress(this.userDetails.latitude, this.userDetails.longitude);
        });
      });
    });
    const userInfo = JSON.parse(localStorage.getItem('user'));
    this.userDetails.email = userInfo ? userInfo.email : '';
    this.getProfileQuestion();
  }
  getAddress(latitude, longitude) {
    this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results, status) => {
      this.userDetails.city = '';
      this.userDetails.state = '';
      this.userDetails.zipcode = '';

      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 12;
          this.userDetails.address = results[0].formatted_address;
          // find country name
          for (var i = 0; i < results[0].address_components.length; i++) {
            for (var b = 0; b < results[0].address_components[i].types.length; b++) {

              //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
              if (results[0].address_components[i].types[b] == "locality") {
                //this is the object you are looking for
                this.userDetails.city = results[0].address_components[i].long_name;
                break;
              }
              if (this.userDetails.city.length === 0) {
                if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
                  //this is the object you are looking for
                  this.userDetails.city = results[0].address_components[i].long_name;
                  break;
                }
                if (results[0].address_components[i].types[b] == "administrative_area_level_2") {
                  //this is the object you are looking for
                  this.userDetails.state = results[0].address_components[i].long_name;
                  break;
                }
              }
              if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
                //this is the object you are looking for
                this.userDetails.state = results[0].address_components[i].long_name;
                break;
              }
              if (results[0].address_components[i].types[b] == "postal_code") {
                //this is the object you are looking for
                this.userDetails.zipcode = results[0].address_components[i].long_name;
                break;
              }
            }
          }
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  }
  getProfileQuestion() {
    let path = `questionare/get-profile-questions`;
    this._sharedService.getNoAuth(path).subscribe((res: any) => {
      if (res.statusCode === 200) {
        res.data.forEach(element => {
          if (element.question_type === 'service' && element.slug === "offer-your-services") {
            this.serviceQuestion = element;
          }
          if (element.question_type === 'service' && element.slug === "languages-you-offer") {
            this.languageQuestion = element
          }
          if (element.question_type === 'availability') {
            this.avalibilityQuestion = element
          }
        });
      } else {
        this.toastr.error(res.message);

      }
    }, err => {
      this._sharedService.loader('hide');
    });
  }
  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.userDetails.latitude = position.coords.latitude;
        this.userDetails.longitude = position.coords.longitude;
        this.zoom = 15;
      });
    }
  }
  handleImageChange(event) {
    const formData: FormData = new FormData();
    formData.append('profileImage', event.target.files[0])

    let input = new FormData();
    input.append('_id', this.userId);
    input.append('profileImage', event.target.files[0]);
    // Add your values in here
    this._sharedService.loader('show');
    this._sharedService.imgUpload(input, 'user/imgUpload').subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.userDetails.profileImage = res.data.profileImage;
        this._sharedService.loader('hide');
      } else {
        this.toastr.error(res.message);
      }
    }, err => {
      this._sharedService.loader('hide');
      this.toastr.error('There are some errors, please try again after some time !', 'Error');
    });

  }
  checkBoxChanged(e, fieldUpdated) {
    if (fieldUpdated === 'avalibilityQuestion') {
      if (e.target.checked) {
        this.hoursSelected.push(e.target.id);
      }
      else {
        const find = this.hoursSelected.indexOf(e.target.id);
        if (find > -1) {
          this.hoursSelected.splice(find, 1);
        }
      }

      this.userDetails.typical_hours = this.hoursSelected;
    }
    if (fieldUpdated === 'languageQuestion') {
      if (e.target.checked) {
        this.languagesSelected.push(e.target.id);
      }
      else {

        const find = this.languagesSelected.indexOf(e.target.id)
        if (find > -1) {
          this.languagesSelected.splice(find, 1);
        }
      }
      this.userDetails.languages = this.languagesSelected;
    }
    if (fieldUpdated === 'serviceType') {
      if (e.target.checked) {
        if (this.serviceOfferSelected.indexOf(e.target.id) === -1) {
          this.serviceOfferSelected.push(e.target.id);
        }
      }
      else {
        const find = this.serviceOfferSelected.indexOf(e.target.id)
        if (find > -1) {
          this.serviceOfferSelected.splice(find, 1);
        }
      }

      this.userDetails.serviceOfferIds = this.serviceOfferSelected;
    }
    if (fieldUpdated === 'ageRange') {
      if (e.target.checked) {
        if (this.age_rangeSelected.indexOf(e.target.id) === -1) {
          if (e.target.id === '5eb1a4e199957471610e6cd7') {
            this.ageRangeList.forEach(el => {
              this.age_rangeSelected.push(el.id);
            })
          } else {
            this.age_rangeSelected.push(e.target.id);
          }
        }
      }
      else {
        const find = this.age_rangeSelected.indexOf(e.target.id)
        if (find > -1) {
          this.age_rangeSelected.splice(find, 1);
        }
      }
      this.userDetails.age_range = this.age_rangeSelected;
    }
  }
  handleReaderLoaded(e) {
    let reader = e.target;
    this.defaultImage = reader.result;
  }
  save() {
    if (this.userDetails.typical_hours.length == 0) {
      this.toastr.error("Please select the typical hours!");
      return;
    }
    const formData = new FormData();
    const payload = this.userDetails;
    payload['_id'] = localStorage.getItem('loginID');
    payload.phone.toString();
    this.ActiveNextTab.emit(this.activeTab);  // TODO: To be added to after form submission
    this._sharedService.loader('show');
    let data = JSON.parse(JSON.stringify(this.userDetails));
    this._sharedService.post(data, 'user/updateProfile').subscribe((res: any) => {
      this._sharedService.loader('hide');
      if (res.statusCode === 200) {
        this._bs.setUserData(res.data);
        
        this.response = res;
        this.toastr.success('Profile updated successfully!');
        // this._router.navigate(['/home']);
      } else {
        this.toastr.error(res.message);

      }
    }, err => {
      this._sharedService.loader('hide');
    });
  }
  trim(key) {
    if (this.userDetails[key] && this.userDetails[key][0] == ' ') this.userDetails[key] = this.userDetails[key].trim();
  }
}
