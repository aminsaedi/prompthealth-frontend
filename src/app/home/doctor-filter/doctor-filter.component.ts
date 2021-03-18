import { Component, OnInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import { MapsAPILoader, MouseEvent } from '@agm/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { SharedService } from '../../shared/services/shared.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-doctor-filter',
  templateUrl: './doctor-filter.component.html',
  styleUrls: ['./doctor-filter.component.scss']
})
export class DoctorFilterComponent implements OnInit {
  @ViewChild('closebutton') closebutton;
  @ViewChild('searchGlobal')

  public searchGlobalElementRef: ElementRef;
  selectedService = 'By Service';
  defaultImage = 'assets/img/no-image.jpg';
  selectedServiceId = '';
  private geoCoder;
  keyword = 'name';
  gender = '';
  categoryList = [];
  serviceQuestion;
  profileQuestions;
  languageQuestion;
  avalibilityQuestion;
  selectedHours = '';
  selectedServiceType = '';
  selectedLang = '';
  doctorList = [];
  allDoctorList = [];
  rating = 0;
  zipCodeSearched;
  searchedAddress = '';
  zipcode = '';
  lat;
  long;
  selectedName = '';
  selectedPriceRange = '';
  priceList = [
    { value: '', name: 'Not Critical' },
    { value: '< $50', name: '$ < 50' },
    { value: '$50-100', name: '$ 50-100' },
    { value: '$100-200', name: '$ 100-200' },
    { value: '$200-500', name: '$ 200-500' },
    { value: '$500-1000', name: '$ 500-1000' },
    { value: '$1000', name: '$ > 1000' },
  ];
  kms = 100;

  queryLatLong;

  location = {
    markers: [],
    zoom: 10,
    lati: 51.673858,
    lng: 7.815982,
  };

  public AWS_S3 = '';

  constructor(
    private activeRoute: ActivatedRoute,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private sharedService: SharedService,
    private toastr: ToastrService,
  ) {

    this.queryLatLong = `${this.activeRoute.snapshot.queryParams.long}, ${this.activeRoute.snapshot.queryParams.lat}`;
  }

  ngOnInit(): void {
    this.getCategoryServices();
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder;
      const autocomplete = new google.maps.places.Autocomplete(this.searchGlobalElementRef.nativeElement);
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          // get the place result
          const place: google.maps.places.PlaceResult = autocomplete.getPlace();

          // verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          this.lat = place.geometry.location.lat();
          this.location.lati = place.geometry.location.lng();
          this.location.lng = place.geometry.location.lat();
          this.long = place.geometry.location.lng();
          const payload = {
            latLong: `${this.long}, ${this.lat}`,
            miles: this.kms
          };
          this.getDoctorList(payload);
        });
      });
    });

    this.searchedAddress = localStorage.getItem('searchedAddress');
    this.getDoctorList({ latLong: this.queryLatLong, miles: this.kms });
    this.getProfileQuestion();

    this.AWS_S3 = environment.config.AWS_S3;
  }

  getProfileQuestion() {
    const path = `questionare/get-profile-questions`;
    this.sharedService.getNoAuth(path).subscribe((res: any) => {
      if (res.statusCode === 200) {
        res.data.forEach(element => {
          if (element.question_type === 'service' && element.slug === 'offer-your-services') {
            this.serviceQuestion = element;
          }
          if (element.question_type === 'service' && element.slug === 'languages-you-offer') {
            this.languageQuestion = element;
          }
          if (element.question_type === 'availability') {
            this.avalibilityQuestion = element;
          }
        });
      } else {
        this.toastr.error(res.message);

      }
    }, err => {
      this.sharedService.loader('hide');
    });
  }
  getAllDoctorList() {
    const path = 'user/get-all-dr';
    this.sharedService.getNoAuth(path).subscribe((res: any) => {
      if (res.statusCode === 200) {
        const result = res.data;
        this.createNameList(result);

      } else {
        this.toastr.error(res.message);
      }
    }, err => {
      this.sharedService.loader('hide');
    });
  }
  getCategoryServices() {
    this.sharedService.loader('show');
    this.sharedService.getNoAuth('questionare/get-service').subscribe((res: any) => {
      this.sharedService.loader('hide');
      if (res.statusCode === 200) {
        this.categoryList = res.data;
        this.categoryList.forEach(el => {
          if (el.category_type === 'Service') {
            el.category.forEach(element => {
              if (element.item_text === 'Service') {
                this.categoryList = element.subCategory;
              }
            });
          }
        });
      } else {
      }
    }, (error) => {
      console.error(error);
      this.toastr.error('There are some error please try after some time.');
      this.sharedService.loader('hide');
    });
  }
  getDoctorList(filter) {
    this.allDoctorList = [];
    this.sharedService.loader('show');
    let payload;
    payload = {
      ...filter,
    };
    console.log(payload);
    const path = 'user/filter-map';
    this.sharedService.postNoAuth(payload, path).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.doctorList = res.data;
        this.doctorList = this.doctorList.sort((a, b) => a.calcDistance - b.calcDistance);
        if (this.doctorList.length) {
          this.createNameList(res.data);
          const self = this;
          setTimeout(() => {
            self.createMapMarker(this.doctorList);
          }, 100);
          this.sharedService.loader('hide');
        } else {
          this.toastr.error('No Professionals found');
          this.sharedService.loader('hide');
        }

      }
    }, err => {
      this.sharedService.loader('hide');
    });
  }
  handleRatingChange(event) {
    if (event.target.value !== 'all') {
      this.rating = parseInt(event.target.value);
    }
  }
  onRangeChange(event) {
    this.kms = Math.round(Math.ceil(event.target.value / 5) * 5);
  }
  onOptionsSelected(value: string, type) {

    if (type === 'language') {
      this.selectedLang = value;
    }

    if (type === 'userType') {

      this.gender = value;
    }
    if (type === 'hours') {
      this.selectedHours = value;
    }

    if (type === 'serviceType') {
      this.selectedServiceType = value;
    }

    if (type === 'priceRange') {
      this.selectedPriceRange = value;
    }
  }
  resetFilter() {
    this.sharedService.loader('show');
    this.rating = 0;
    this.gender = '';
    this.selectedLang = '';
    this.selectedHours = '';
    this.selectedServiceType = '';
    this.kms = 100;
    this.selectedPriceRange = '';
    this.getDoctorList({
      latLong: (this.long && this.lat) ? `${this.long}, ${this.lat}` : this.queryLatLong, miles: this.kms
    });
  }
  applyFilter() {
    let latlongs = this.queryLatLong;
    if (this.long && this.lat) {
      latlongs = `${this.long}, ${this.lat}`;
    }

    const payload = {
      rating: this.rating,
      languageId: this.selectedLang,
      gender: this.gender,
      typicalHoursId: this.selectedHours,
      serviceOfferId: this.selectedServiceType,
      price_per_hours: this.selectedPriceRange,
      miles: this.kms,
      latLong: latlongs
    };

    this.getDoctorList(payload);

    this.closebutton.nativeElement.click();
  }
  createMapMarker(data) {
    this.location.markers = [];
    this.location.lati = data[data.length - 1].location[1];

    this.location.lng = data[data.length - 1].location[0];
    for (const element of data) {
      if (element.location) {
        this.location.markers.push({
          lat: element.location[1],
          lng: element.location[0],
          label: element.roles,
          draggable: false,
          infoContent: {
            name: element.firstName,
            address: element.address,
            profileImage: element.profileImage,
            _id: element._id,
          }
        });
      }
    }

  }
  createNameList(data) {
    this.allDoctorList = [];
    for (const element of data) {
      if (element.firstName) {
        this.allDoctorList.push({
          id: element._id,
          name: element.firstName,
        });
      }
    }
  }
  serviceFilter(event) {
    const payload = {
      latLong: (this.long && this.lat) ? `${this.long}, ${this.lat}` : this.queryLatLong,
      miles: this.kms,
      serviceId: event.target.id,
      name: this.selectedName ? this.selectedName : ''
    };
    this.getDoctorList(payload);
    this.selectedService = event.target.text;
    this.selectedServiceId = event.target.id;
  }
  selectEvent(item) {
    const payload = {
      latLong: (this.long && this.lat) ? `${this.long}, ${this.lat}` : this.queryLatLong,
      miles: this.kms,
      name: item.name,
      serviceId: this.selectedServiceId
    };
    this.selectedName = item.name;
    this.getDoctorList(payload);
  }
  resetNames() {
    const payload = {
      latLong: (this.long && this.lat) ? `${this.long}, ${this.lat}` : this.queryLatLong,
      miles: this.kms,
      name: '',
      serviceId: this.selectedServiceId
    };
    this.selectedName = '';
    this.getDoctorList(payload);

  }
  ngOnDestroy() {
    localStorage.removeItem('searchedAddress');
  }
}
// just an interface for type safety.
interface marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
  infoContent?: string;
}
