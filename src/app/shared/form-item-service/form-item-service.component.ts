import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Category, CategoryService } from '../services/category.service';

@Component({
  selector: 'form-item-service',
  templateUrl: './form-item-service.component.html',
  styleUrls: ['./form-item-service.component.scss']
})
export class FormItemServiceComponent implements OnInit {

  @Input() data: string[] = null; /** serviceId[] */
  @Input() col2: boolean = true;
  @Input() disabled: boolean = false;

  @Output() changeValue = new EventEmitter<string[]>();

  public form: FormGroup;
  public categories: Category[];

  getFormArray(name: string){ return this.form.controls[name] as FormArray; }

  constructor(
    _fb: FormBuilder,
    private _catService: CategoryService,
  ) {
    this.form = _fb.group({root: new FormArray([])});
  }

  async ngOnInit() {
    const cats = await this._catService.getCategoryAsync();
    this.categories = cats;

    cats.forEach(cat => {
      this.getFormArray('root').push(new FormControl( (this.data && this.data.indexOf(cat._id) > -1) ? true : false));

      this.form.setControl(cat._id, new FormArray([]));
      cat.subCategory.forEach(sub => {
        this.getFormArray(cat._id).push(new FormControl((this.data && this.data.indexOf(sub._id) > -1) ? true : false));
      });
    });

    this.form.valueChanges.subscribe(()=>{
      this.getSelected(true);
    });
  }

  getSelected(emit: boolean = false){
    const vals = this.form.value;
      /** get selected services. (if root category is not selected, sub category is ignored.) */
      const services: string[] = [];
      vals.root.forEach((v: boolean, i: number) => {
      if(v){
        let id = this.categories[i]._id;
        services.push(id);

        vals[id].forEach((vSub: boolean, j: number) => {
          if(vSub){
            let idSub = this.categories[i].subCategory[j]._id;
            services.push(idSub);
          }
        });
      }
    });

    if(emit){ this.changeValue.emit(services); }

    return services;
  }

  getSelectedName(){
    const result = [];
    const services = this.getSelected();
    this.categories.forEach(cat=>{
      if(services.indexOf(cat._id) > -1){ result.push(cat.item_text); }

      cat.subCategory.forEach(sub=>{
        if(services.indexOf(sub._id)> -1){ result.push(sub.item_text); }
      });
    })
    return result;
  }

  reset(){
    this.categories.forEach(cat => {
      this.getFormArray('root').controls.forEach(c => { c.setValue(false); });

      cat.subCategory.forEach(sub => {
        this.getFormArray(cat._id).controls.forEach(c => { c.setValue(false); });
      })
    });
  }
}
