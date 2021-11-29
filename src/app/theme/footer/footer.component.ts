import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { QuestionnaireAnswer, QuestionnaireService } from 'src/app/shared/services/questionnaire.service';
import { RegionService, RegionType } from 'src/app/shared/services/region.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { locations } from 'src/app/_helpers/location-data';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  
  get isU() { return this._profileService.profile?.isU; }
  
  constructor(
    private _qService: QuestionnaireService,
    private _profileService: ProfileManagementService,
    private _regionService: RegionService,
    private _uService: UniversalService,
  ) { }

  public typeOfProviderListHighlight: QuestionnaireAnswer[]; /** only contains 2 type of providers */
  public countCities: number = 0;
  public countTypeOfProviders: number = 0;

  public regionFormatted: string;
  private subscriptionRegionStatus: Subscription;
  
  ngOnDestroy() {
    this.subscriptionRegionStatus?.unsubscribe();
  }

  ngOnInit() {
    this.countCities = Object.keys(locations).length;
    
    this._qService.getSitemap().then(data => { 
      this.typeOfProviderListHighlight =data.typeOfProvider.answers.slice(0,2);
      this.countTypeOfProviders = data.typeOfProvider.answers.length;
    });

    this.subscriptionRegionStatus = this._regionService.statusChanged().subscribe(() => {
      const region = this._uService.localStorage.getItem('region') as RegionType;
      this.regionFormatted = this._regionService.formatRegion(region);
    });
  }

  showModalRegion() {
    this._regionService.changeModalVisibility(true);
  }
}
