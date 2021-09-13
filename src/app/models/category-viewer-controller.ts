import { Category } from "../shared/services/category.service";

export class CategoryViewerController {

  public dataPerRows: {
    categories: Category[];
    categoryInjected: Category;
  }[];

  isCategorySelected(idxRow: number, idxCol: number) {
    const target = this.dataPerRows[idxRow].categories[idxCol];
    const injected = this.dataPerRows[idxRow].categoryInjected;
    return (injected && target._id == injected._id) ? true : false;
  }

  getIconOf(cat: Category): string {
    const img = cat.image;
    const img2 = img.toLowerCase().replace(/_/g, '-').replace('.png', '');
    return img2
  }

  subCategoriesString(parent: Category) {
    const categories = [];
    parent.subCategory.forEach(sub => {categories.push(sub.item_text); });
    return categories.join(', ');
  }

  onTapMainCategory(idxRow: number, idxCol: number) {
    const data = this.dataPerRows[idxRow];

    if(this.isCategorySelected(idxRow, idxCol)) { this._dispose(data); }
    else {
      const injected = data.categoryInjected;
      const target = data.categories[idxCol];

      if(!injected) { 
        this._inject(data, target); 
      }
      else {
        this._dispose(data);
        this.waitForInject = {idxRow: idxRow, idxCol: idxCol};
      }
    }

    this.isCategorySelected(idxRow, idxCol)
  }

  onAnimationDone() {
    if(this.waitForInject) {
      const data = this.dataPerRows[this.waitForInject.idxRow];
      const target = data.categories[this.waitForInject.idxCol];
      this._inject(data, target);
      this.waitForInject = null;
    }
  }

  disposeAll() {
    this.dataPerRows.forEach(data => { this._dispose(data); });
  }

  private waitForInject: {idxRow: number; idxCol: number} = null;

  private _inject(dataPerRow: CategoryViewerController['dataPerRows'][0], target: Category) {
    dataPerRow.categoryInjected = target;
  }

  private _dispose(dataPerRow: CategoryViewerController['dataPerRows'][0]) {
    dataPerRow.categoryInjected = null;
  }


  constructor(categories: Category[]) {
    this.dataPerRows = [];

    let numcol: number;
    if(!window.innerWidth || window.innerWidth < 768) { numcol = 1; }
    else if(window.innerWidth < 1200) { numcol = 2} 
    else { numcol = 3; }

    const numrow = Math.ceil(categories.length / numcol);

    for (let i=0; i<numrow; i++) {
      const categoriesPerRow = [];
      for (let j=0; j<numcol; j++) {
        let k = i * numcol + j;
        if(k >= categories.length) { break; }

        categoriesPerRow.push(categories[k]);
      }

      if(categoriesPerRow.length == 0) { break; }
      
      this.dataPerRows.push({categories: categoriesPerRow, categoryInjected: null});
    }
  }
}
