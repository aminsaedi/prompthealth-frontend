import { Component, OnInit } from '@angular/core';
import { Category, CategoryService } from 'src/app/shared/services/category.service';
import { expandVerticalAnimation } from 'src/app/_helpers/animations';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [expandVerticalAnimation],
})
export class HomeComponent implements OnInit {

  public topics: Category[] = [];

  constructor(
    private _catService: CategoryService,
  ) { }

  iconOf(topic: Category): string {
    return this._catService.iconOf(topic);
  }

  ngOnInit(): void {
    this._catService.getCategoryAsync().then(cats => {
      this.topics = cats;
    });
  }

}
