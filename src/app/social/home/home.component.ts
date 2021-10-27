import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Category, CategoryService } from 'src/app/shared/services/category.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { QuestionnaireService } from 'src/app/shared/services/questionnaire.service';
// import { SharedService } from 'src/app/shared/services/shared.service';
import { expandVerticalAnimation } from 'src/app/_helpers/animations';
import { locations } from 'src/app/_helpers/location-data';
import { environment } from 'src/environments/environment';
import { SocialPostTaxonomyType, SocialService } from '../social.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [expandVerticalAnimation],
})
export class HomeComponent implements OnInit {

  get topics() { return this._catService.categoryList; }
  // get imageSponsor() {
  //   return this.sponsor?.productImages?.length > 0 ? 
  //     this.sponsor.productImages[0].url :
  //       this.sponsor ? this.sponsor.profileImage : null;
  // }
  
  public countTypeOfProviders: number;
  public countCities: number;

  public selectedTaxonomyType: SocialPostTaxonomyType;
  public selectedTopicId: string;
  public idPH = environment.config.idSA;

  private subscriptionTopicId: Subscription;


  iconOf(topic: Category): string {
    return this._catService.iconOf(topic);
  }

  constructor(
    private _router: Router,
    private _location: Location,
    private _catService: CategoryService,
    private _qService: QuestionnaireService,
    private _modalService: ModalService,
    private _socialService: SocialService,
    private _changeDetector: ChangeDetectorRef,
    // private _sharedService: SharedService,
  ) { }

  ngOnDestroy() {
    this.subscriptionTopicId?.unsubscribe();
  }
  
  ngOnInit(): void {

    this._qService.getSitemap().then(data => { 
      this.countTypeOfProviders = data.typeOfProvider.answers.length;
    });

    this.countCities = Object.keys(locations).length;

    // this._sharedService.getNoAuth('company/get-random').subscribe((res: IGetCompaniesResult) => {
    //   if(res.statusCode == 200) {
    //     this.sponsor = new Partner(res.data[0]);
    //   }
    // });

    this.subscriptionTopicId = this._socialService.selectedTopicIdChanged().subscribe(id => {
      this.selectedTopicId = id;
      this._changeDetector.detectChanges();
    })
  }

  navigateTo(route: string[], option: NavigationExtras = {}) {
    this._router.navigate(route, option);
  }

  changeTopics(topic: Category) {
    const [path, query] = this._modalService.currentPathAndQueryParams;
    const match = path.match('/community/(feed|article|media|event|note)');
    const taxonomyType = match ? match[1] : 'feed';
    this._router.navigate(['/community', taxonomyType, topic._id], {queryParams: query});
  }
}
