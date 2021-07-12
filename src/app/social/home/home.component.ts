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

  public categories: Category[] = [];

  constructor(
    private _catService: CategoryService,
  ) { }

  iconOf(cat: Category): string {
    return this._catService.iconOf(cat);
  }

  ngOnInit(): void {
    this._catService.getCategoryAsync().then(cats => {
      this.categories = cats;
    });
  }
}
