import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { QuestionnaireAnswer } from '../services/questionnaire.service';

@Component({
  selector: 'form-item-customer-health',
  templateUrl: './form-item-customer-health.component.html',
  styleUrls: ['./form-item-customer-health.component.scss']
})
export class FormItemCustomerHealthComponent implements OnInit {

  @Input() data: string[] = null; /** value[] | valueForTracking[]*/
  @Input() col2: boolean = true; /** only available when mode == form  */
  @Input() disabled: boolean = false; /** only available when mode == form */
  @Input() type: 'simple' | 'detail' = 'simple'; /** detail is used for tracking */
  @Input() mode: 'form' | 'tag' = 'form';
  @Input() selections: QuestionnaireAnswer[];
  @Input() controller: FormGroup = new FormGroup({});
  @Input() submitted = false;

  @Output() changeValue = new EventEmitter<string[]>();
  @Output() changeValueForTracking = new EventEmitter<string[]>();

  public selectionList: CustomerHealthSelectionItem[];

  getFormArray(name: string){ return this.controller.controls[name] as FormArray; }

  constructor() { }

  ngOnInit(): void {
    this.controller.setControl('root', new FormArray([]));
    
    const selections: CustomerHealthSelectionItem[] = [];
    this.selections.forEach(a=>{
      const item: CustomerHealthSelectionItem = {
        id: a._id,
        label: a.item_text,
        value: a._id,
        valueForTracking: a._id,
      };
      if(a.subans){
        item.child = [];
        a.subansData.forEach(aSub => {
          item.child.push({
            id: aSub._id,
            label: aSub.item_text,
            value: aSub._id,
            valueForTracking: aSub._id,
          });
        });
      }
      selections.push(item);
    });
    this.selectionList = selections;

    this.selectionList.forEach(item => {
      const val = (this.data && this.type == 'simple' && this.data.includes(item.value)) ? true : (this.data && this.type == 'detail' && this.data.includes(item.valueForTracking)) ? true : false;
      this.getFormArray('root').push(new FormControl(val));

      if(item.child){
        this.controller.setControl(item.id, new FormArray([]));
        item.child.forEach(itemSub => {
          const val = (this.data && this.type == 'simple' && this.data.includes(itemSub.value)) ? true : (this.data && this.type == 'detail' && this.data.includes(itemSub.valueForTracking)) ? true : false;
          this.getFormArray(item.id).push(new FormControl(val));
        });  
      }
    });
    this.getSelectedValue(true);    
  }

  /** get seleceted values */ 
  /** this is only for value. not valueForTracking */
  getSelectedValue(emit: boolean = false): string[]{
    const vals = this.controller.value as {[k:string]: boolean[]};
    const selectedValues: string[] = [];
    vals.root.forEach((isSelected, i) => {
      if(isSelected){
        let val = this.selectionList[i].value;
        selectedValues.push(val);  

        if(vals[this.selectionList[i].id]){
          vals[this.selectionList[i].id].forEach((isSelected, j) => {
            if(isSelected){
              let val = this.selectionList[i].child[j].value;
              selectedValues.push(val);
            }
          });
        }

      }
    });

    if(emit){ this.changeValue.emit(selectedValues); }
    return selectedValues;
  }

  /** get selected values for tracking */
  /** this is only for valueForTracking. not value */
  getSelectedValueForTracking(emit: boolean = false): string[]{
    const vals = this.controller.value as {[k:string]: boolean[]};
    const selectedValues: string[] = [];
    vals.root.forEach((isSelected, i) => {
      if(isSelected){
        let val = this.selectionList[i].valueForTracking;
        selectedValues.push(val);
        
        if(vals[this.selectionList[i].id]){
          vals[this.selectionList[i].id].forEach((isSelected, j) => {
            if(isSelected){
              let val = this.selectionList[i].child[j].valueForTracking;
              selectedValues.push(val);
            }
          });
        }
      }
    });
    if(emit){ this.changeValueForTracking.emit(selectedValues); }
    return selectedValues;
  }

  /** emit changes */
  onChange(){
    this.getSelectedValue(true);
    this.getSelectedValueForTracking(true);
  }
}


export interface CustomerHealthSelectionItem {
  id: string;
  label: string;
  value: string;
  valueForTracking: string;
  child?: CustomerHealthSelectionItem[]
}