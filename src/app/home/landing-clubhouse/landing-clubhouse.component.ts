import { Component, HostBinding, HostListener, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { validators } from 'src/app/_helpers/form-settings';

@Component({
  selector: 'app-landing-clubhouse',
  templateUrl: './landing-clubhouse.component.html',
  styleUrls: ['./landing-clubhouse.component.scss']
})
export class LandingClubhouseComponent implements OnInit {

  public form: FormGroup;
  public isSubmitted = false;
  public countryList: string[] = [];
  public idxCountryFocused = 0;

  private host: HTMLElement;
  get f(){ return this.form.controls; }

  @HostListener('window:keydown', ['$event']) windowKeydown(e: KeyboardEvent) {
    if(this.countryList.length > 0){
      switch(e.key){
        case 'ArrowUp': 
        case 'ArrowLeft':
          e.preventDefault();
          this.moveCountrySelection(this.idxCountryFocused + this.countryList.length - 1)
          break;
        case 'ArrowRight':
        case 'ArrowDown': 
          e.preventDefault();
          this.moveCountrySelection(this.idxCountryFocused + 1);
          break;
        case 'Enter':
          e.preventDefault();
          this.selectCountry(this.countryList[this.idxCountryFocused]);
          break;
				case 'Escape':
					e.preventDefault();
					this.countryList = [];
      }
    }
  }
  constructor(
    _fb: FormBuilder,
    _el: ElementRef
  ) {
    this.form = _fb.group({
      name: new FormControl('', validators.firstnameClient),
      email: new FormControl('', validators.email),
      title: new FormControl('', validators.professionalTitle),
      region: new FormControl('', Validators.required),
    });
    this.host = _el.nativeElement;
  }

  ngOnInit(): void {
    this.f.region.valueChanges.subscribe(value => {
      if(value.length > 0) {
        const list = [];
        countryList.forEach(country => {
          const regex = new RegExp('^' + value);
          if(country.toLowerCase().match(regex)) {
            list.push(country);
          }
        });
        this.countryList = list;
        this.idxCountryFocused = 0;
      } else {
        this.countryList = [];
      }
    });

  }

  hideCountryList(){ this.countryList = []; }

  moveCountrySelection(to: number){
    this.idxCountryFocused = to % this.countryList.length;
      
    const selections = this.host.querySelector('.selections');
    const selection = this.host.querySelectorAll('.selections li a')[this.idxCountryFocused];
    const rect0 = selections.getBoundingClientRect();
    const rect1 = selection.getBoundingClientRect();

    if(rect1.bottom > rect0.bottom) { selections.scrollBy({top: rect1.top - rect0.top, left: 0, behavior: 'smooth'}); }
    else if(rect1.top < rect0.top) { selections.scrollBy({top: rect1.bottom - rect0.bottom, left: 0, behavior: 'smooth'}); }
  }
  

  selectCountry(name: string): void {
    this.f.region.setValue(name);
  }

  onSubmit(){
    this.isSubmitted = true;
    console.log(this.form.value);
  }
}

const countryList = [
	"Afghanistan",
	"Albania",
	"Algeria",
	"American Samoa",
	"Andorra",
	"Angola",
	"Anguilla",
	"Antarctica",
	"Antigua and Barbuda",
	"Argentina",
	"Armenia",
	"Aruba",
	"Australia",
	"Austria",
	"Azerbaijan",
	"Bahamas (the)",
	"Bahrain",
	"Bangladesh",
	"Barbados",
	"Belarus",
	"Belgium",
	"Belize",
	"Benin",
	"Bermuda",
	"Bhutan",
	"Bolivia (Plurinational State of)",
	"Bonaire, Sint Eustatius and Saba",
	"Bosnia and Herzegovina",
	"Botswana",
	"Bouvet Island",
	"Brazil",
	"British Indian Ocean Territory (the)",
	"Brunei Darussalam",
	"Bulgaria",
	"Burkina Faso",
	"Burundi",
	"Cabo Verde",
	"Cambodia",
	"Cameroon",
	"Canada",
	"Cayman Islands (the)",
	"Central African Republic (the)",
	"Chad",
	"Chile",
	"China",
	"Christmas Island",
	"Cocos (Keeling) Islands (the)",
	"Colombia",
	"Comoros (the)",
	"Congo (the Democratic Republic of the)",
	"Congo (the)",
	"Cook Islands (the)",
	"Costa Rica",
	"Croatia",
	"Cuba",
	"Curaçao",
	"Cyprus",
	"Czechia",
	"Côte d'Ivoire",
	"Denmark",
	"Djibouti",
	"Dominica",
	"Dominican Republic (the)",
	"Ecuador",
	"Egypt",
	"El Salvador",
	"Equatorial Guinea",
	"Eritrea",
	"Estonia",
	"Eswatini",
	"Ethiopia",
	"Falkland Islands (the) [Malvinas]",
	"Faroe Islands (the)",
	"Fiji",
	"Finland",
	"France",
	"French Guiana",
	"French Polynesia",
	"French Southern Territories (the)",
	"Gabon",
	"Gambia (the)",
	"Georgia",
	"Germany",
	"Ghana",
	"Gibraltar",
	"Greece",
	"Greenland",
	"Grenada",
	"Guadeloupe",
	"Guam",
	"Guatemala",
	"Guernsey",
	"Guinea",
	"Guinea-Bissau",
	"Guyana",
	"Haiti",
	"Heard Island and McDonald Islands",
	"Holy See (the)",
	"Honduras",
	"Hong Kong",
	"Hungary",
	"Iceland",
	"India",
	"Indonesia",
	"Iran (Islamic Republic of)",
	"Iraq",
	"Ireland",
	"Isle of Man",
	"Israel",
	"Italy",
	"Jamaica",
	"Japan",
	"Jersey",
	"Jordan",
	"Kazakhstan",
	"Kenya",
	"Kiribati",
	"Korea (the Democratic People's Republic of)",
	"Korea (the Republic of)",
	"Kuwait",
	"Kyrgyzstan",
	"Lao People's Democratic Republic (the)",
	"Latvia",
	"Lebanon",
	"Lesotho",
	"Liberia",
	"Libya",
	"Liechtenstein",
	"Lithuania",
	"Luxembourg",
	"Macao",
	"Madagascar",
	"Malawi",
	"Malaysia",
	"Maldives",
	"Mali",
	"Malta",
	"Marshall Islands (the)",
	"Martinique",
	"Mauritania",
	"Mauritius",
	"Mayotte",
	"Mexico",
	"Micronesia (Federated States of)",
	"Moldova (the Republic of)",
	"Monaco",
	"Mongolia",
	"Montenegro",
	"Montserrat",
	"Morocco",
	"Mozambique",
	"Myanmar",
	"Namibia",
	"Nauru",
	"Nepal",
	"Netherlands (the)",
	"New Caledonia",
	"New Zealand",
	"Nicaragua",
	"Niger (the)",
	"Nigeria",
	"Niue",
	"Norfolk Island",
	"Northern Mariana Islands (the)",
	"Norway",
	"Oman",
	"Pakistan",
	"Palau",
	"Palestine, State of",
	"Panama",
	"Papua New Guinea",
	"Paraguay",
	"Peru",
	"Philippines (the)",
	"Pitcairn",
	"Poland",
	"Portugal",
	"Puerto Rico",
	"Qatar",
	"Republic of North Macedonia",
	"Romania",
	"Russian Federation (the)",
	"Rwanda",
	"Réunion",
	"Saint Barthélemy",
	"Saint Helena, Ascension and Tristan da Cunha",
	"Saint Kitts and Nevis",
	"Saint Lucia",
	"Saint Martin (French part)",
	"Saint Pierre and Miquelon",
	"Saint Vincent and the Grenadines",
	"Samoa",
	"San Marino",
	"Sao Tome and Principe",
	"Saudi Arabia",
	"Senegal",
	"Serbia",
	"Seychelles",
	"Sierra Leone",
	"Singapore",
	"Sint Maarten (Dutch part)",
	"Slovakia",
	"Slovenia",
	"Solomon Islands",
	"Somalia",
	"South Africa",
	"South Georgia and the South Sandwich Islands",
	"South Sudan",
	"Spain",
	"Sri Lanka",
	"Sudan (the)",
	"Suriname",
	"Svalbard and Jan Mayen",
	"Sweden",
	"Switzerland",
	"Syrian Arab Republic",
	"Taiwan",
	"Tajikistan",
	"Tanzania, United Republic of",
	"Thailand",
	"Timor-Leste",
	"Togo",
	"Tokelau",
	"Tonga",
	"Trinidad and Tobago",
	"Tunisia",
	"Turkey",
	"Turkmenistan",
	"Turks and Caicos Islands (the)",
	"Tuvalu",
	"Uganda",
	"Ukraine",
	"United Arab Emirates (the)",
	"United Kingdom of Great Britain and Northern Ireland (the)",
	"United States Minor Outlying Islands (the)",
	"United States of America (the)",
	"Uruguay",
	"Uzbekistan",
	"Vanuatu",
	"Venezuela (Bolivarian Republic of)",
	"Viet Nam",
	"Virgin Islands (British)",
	"Virgin Islands (U.S.)",
	"Wallis and Futuna",
	"Western Sahara",
	"Yemen",
	"Zambia",
	"Zimbabwe",
	"Åland Islands"
];

