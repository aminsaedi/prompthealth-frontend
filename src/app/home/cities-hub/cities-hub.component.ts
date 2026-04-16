import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { locationsNested } from 'src/app/_helpers/location-data';
import { IFormItemSearchData } from 'src/app/models/form-item-search-data';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-cities-hub',
  templateUrl: './cities-hub.component.html',
  styleUrls: ['./cities-hub.component.scss'],
})
export class CitiesHubComponent implements OnInit {
  public provinces: IFormItemSearchData[] = locationsNested;

  constructor(
    private _uService: UniversalService,
  ) {}

  ngOnInit(): void {
    this._uService.setMeta('/practitioners/cities', {
      title: 'Browse Healthcare Providers by City | PromptHealth',
      description: 'Find top-rated healthcare providers across Canada. Browse practitioners by city including Vancouver, Toronto, Calgary, Edmonton, Ottawa, and more.',
    });
  }
}
