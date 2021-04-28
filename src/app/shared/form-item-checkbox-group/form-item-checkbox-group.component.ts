import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'form-item-checkbox-group',
  templateUrl: './form-item-checkbox-group.component.html',
  styleUrls: ['./form-item-checkbox-group.component.scss']
})
export class FormItemCheckboxGroupComponent implements OnInit {

  @Input() id: string = null;
  @Input() type: 'checkbox' | 'radio' | 'selectbox' = 'checkbox';
  @Input() label: string = null;
  @Input() data: string[]; /** selected id list. this is used for checkbox */
  @Input() controller: FormArray | FormControl;
  @Input() submitted = false;
  @Input() disabled = false;
  @Input() selections: CheckboxSelectionItem[];
  
  @Input() ageRangeType: 'simple' | 'detail' = 'simple';
  @Input() includePreferNotToSay = false;

  @Input() responsive = false; /** this is used for selectbox */

  public selectionList: CheckboxSelectionItem[];

  /** for selectbox */
  public isSelectionsVisible: boolean = false;
  public idxItemFocused: number = 0;
  public idxItemSelected: number = -1;


  get controls() {return (this.controller as FormArray).controls; }

  constructor() { }

  ngOnInit(): void {
    switch(this.id){
      case 'age_range': this.selectionList = (this.ageRangeType == 'simple') ? age_range : age_range_detail; break;
      case 'years_of_experience': this.selectionList = years_of_experience; break;
      case 'business_kind': this.selectionList = business_kind; break;
      case 'gender': this.selectionList = this.selections ? this.selections : gender; break;
      default: this.selectionList = this.selections || [];
    }
    

    if(this.includePreferNotToSay){
      this.selectionList = this.selectionList.concat(preferNotToSay);
    }
    if(this.type == 'checkbox'){
      this.selectionList.forEach(item => {
        (this.controller as FormArray).push( new FormControl( (this.data && this.data.includes(item.value) ? true : false) ));
      });  
    }else if(this.type == 'selectbox'){
      this.selectionList.forEach((item, i) => {
        if(item.value == this.controller.value){ this.idxItemSelected = i; }
      });
    }
  }

  /** checkbox control start */
  /** getSelected is used by parent compoennt to obtain selected values array */
  getSelected(): string[] {
    const selected = [];
    (this.controller.value as boolean[]).forEach((isSelected, i) => {
      if(isSelected) {
        selected.push(this.selectionList[i].value);        
      }
    })
    return selected;
  }
  /** checkbox control end */



  /** select box control start */
  toggleSelectionsVisibility(state: 'hide' | 'show' = null){
    if(state == 'hide'){ this.isSelectionsVisible = false; }
    else if(state == 'show'){ this.isSelectionsVisible = true; }
    else{ this.isSelectionsVisible = !this.isSelectionsVisible; }

    if(this.isSelectionsVisible){
      this.idxItemFocused = (this.idxItemSelected >= 0) ? this.idxItemSelected : 0;
    }
  }

  isItemFocused(i: number){ return (this.idxItemFocused === i); }
  
  onKeyDownOnItem(e: KeyboardEvent){
    switch(e.key){
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        this.idxItemFocused = this.idxItemFocused + this.selectionList.length - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        this.idxItemFocused ++;
        break;
    }

    this.idxItemFocused = this.idxItemFocused % this.selectionList.length;
  }

  select(idx: number){
    this.idxItemSelected = idx;
    (this.controller as FormControl).setValue(this.selectionList[idx].value);
    this.toggleSelectionsVisibility('hide');
  }
  /** select box control end */

}

const age_range: CheckboxSelectionItem[] = [
  { id: 'age1', label: 'Not Critical', value: '5eb1a4e199957471610e6cd7'  },
  { id: 'age2', label: 'Child (<12)', value: '5eb1a4e199957471610e6cd8' },
  { id: 'age3', label: 'Adolescent (12-18)', value: '5eb1a4e199957471610e6cd9' },
  { id: 'age4', label: 'Adult (18+)', value: '5eb1a4e199957471610e6cda' },
  { id: 'age5', label: 'Senior (>64)', value: '5eb1a4e199957471610e6cdb' },
];

const age_range_detail: CheckboxSelectionItem[] = [
  { id: 'age1', label: 'Under 12 years old',    value: '5eb1a4e199957471610e6cd8' },
  { id: 'age2', label: '12 - 17 years old',     value: '5eb1a4e199957471610e6cd9' },
  { id: 'age3', label: '18 - 24 years old',     value: '5eb1a4e199957471610e6cda' },
  { id: 'age3', label: '25 - 34 years old',     value: '5eb1a4e199957471610e6cda' },
  { id: 'age4', label: '35 - 44 years old',     value: '5eb1a4e199957471610e6cda' },
  { id: 'age5', label: '45 - 54 years old',     value: '5eb1a4e199957471610e6cda' },
  { id: 'age6', label: '55 - 64 years old',     value: '5eb1a4e199957471610e6cda' },
  { id: 'age7', label: '65 - 74 years old',     value: '5eb1a4e199957471610e6cdb' },
  { id: 'age8', label: '75 years old or older', value: '5eb1a4e199957471610e6cdb' },
];

const years_of_experience: CheckboxSelectionItem[] = [
  { id: 'exp1', label: '<5 Years', value: '< 5' },
  { id: 'exp2', label: '5-10 Years', value: '5-10' },
  { id: 'exp3', label: '10-20 Years', value: '10-20' },
  { id: 'exp4', label: '>20 Years', value: '> 20' },
];

const business_kind: CheckboxSelectionItem[] = [
  { id: 'business1', label: 'Clinic', value: 'clinic' },
  { id: 'business2', label: 'Health Center', value: 'health_center' },
  { id: 'business3', label: 'Health Club', value: 'health_club' },
  { id: 'business4', label: 'Gym', value: 'gym' },
  { id: 'business5', label: 'Studio', value: 'studio' },
  { id: 'business6', label: 'Pharmacy', value: 'pharmacy' },
];

const gender: CheckboxSelectionItem[] = [
  {id: 'gen1', label: 'Female', value: 'female'},
  {id: 'gen2', label: 'Male', value: 'male'},
  {id: 'gen3', label: 'Non-Binary', value: 'nonbinary'},
];

const preferNotToSay: CheckboxSelectionItem[] = [
  {id: 'prefer-not-to-say', label: 'Prefer Not To Say', value: 'prefer-not-to-say'}
];

export interface CheckboxSelectionItem {
  id: string;
  label: string;
  value: string;
  minmax?: number[];
}