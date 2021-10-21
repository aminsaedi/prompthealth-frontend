import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Partner } from 'src/app/models/partner';
import { IGetCompaniesResult } from 'src/app/models/response-data';
import { Category, CategoryService } from 'src/app/shared/services/category.service';
import { QuestionnaireService } from 'src/app/shared/services/questionnaire.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { expandVerticalAnimation } from 'src/app/_helpers/animations';
import { locations } from 'src/app/_helpers/location-data';
import { environment } from 'src/environments/environment';
import { SocialPostTaxonomyType } from '../social.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [expandVerticalAnimation],
})
export class HomeComponent implements OnInit {

  get topics() { return this._catService.categoryList; }
  get imageSponsor() {
    return this.sponsor?.productImages?.length > 0 ? 
      this.sponsor.productImages[0].url :
        this.sponsor ? this.sponsor.profileImage : null;
  }
  
  public countTypeOfProviders: number;
  public countCities: number;

  public selectedTaxonomyType: SocialPostTaxonomyType;
  public idPH = environment.config.idSA;

  public sponsor: Partner;


  iconOf(topic: Category): string {
    return this._catService.iconOf(topic);
  }

  constructor(
    private _router: Router,
    private _location: Location,
    private _catService: CategoryService,
    private _qService: QuestionnaireService,
    private _sharedService: SharedService,
  ) { }

  
  ngOnInit(): void {
    this._qService.getSitemap().then(data => { 
      this.countTypeOfProviders = data.typeOfProvider.answers.length;
    });

    this.countCities = Object.keys(locations).length;
    this._sharedService.getNoAuth('company/get-random').subscribe((res: IGetCompaniesResult) => {
      if(res.statusCode == 200) {
        this.sponsor = new Partner(res.data[0]);
      }
    });
  }

  navigateTo(route: string[], option: NavigationExtras = {}) {
    this._router.navigate(route, option);
  }

  changeTopics(topic: Category) {
    const path = this._location.path();
    const match = path.match('/community/(feed|article|media|event)');
    const taxonomyType = match ? match[1] : 'feed';
    this._router.navigate(['/community', taxonomyType, topic._id]);
  }

}
