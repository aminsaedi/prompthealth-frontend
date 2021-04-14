import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'form-item-customer-health',
  templateUrl: './form-item-customer-health.component.html',
  styleUrls: ['./form-item-customer-health.component.scss']
})
export class FormItemCustomerHealthComponent implements OnInit {

  @Input() data: string[] = null; /** value[] | valueForTracking[]*/
  @Input() col2: boolean = true; /** only available when mode == form  */
  @Input() disabled: boolean = false; /** only available when mode == form */
  @Input() mustSelectAtLeast = 0; /** todo: add validator if needed */
  @Input() type: 'simple' | 'detail' = 'simple'; /** detail is used for tracking */
  @Input() mode: 'form' | 'tag' = 'form';

  @Output() changeValue = new EventEmitter<string[]>();
  @Output() changeValueForTracking = new EventEmitter<string[]>();

  public form: FormGroup;
  public selectionList: SelectionItem[] = customerHealth;

  getFormArray(name: string){ return this.form.controls[name] as FormArray; }

  constructor(
    _fb: FormBuilder
  ) { 
    this.form = _fb.group({root: new FormArray([])});
  }

  ngOnInit(): void {
    this.selectionList.forEach(item => {
      const val = (this.data && this.type == 'simple' && this.data.includes(item.value)) ? true : (this.data && this.type == 'detail' && this.data.includes(item.valueForTracking)) ? true : false;
      this.getFormArray('root').push(new FormControl(val));

      if(item.child){
        this.form.setControl(item.id, new FormArray([]));
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
  /** subcategory is ignored because its value is same as root category */
  getSelectedValue(emit: boolean = false): string[]{
    const vals = this.form.value as {[k:string]: boolean[]};
    const selectedValues: string[] = [];
    vals.root.forEach((isSelected, i) => {
      if(isSelected){
        let val = this.selectionList[i].value;
        selectedValues.push(val);  
      }
    });

    if(emit){ this.changeValue.emit(selectedValues); }
    return selectedValues;
  }

  /** get selected values for tracking */
  /** this is only for valueForTracking. not value */
  getSelectedValueForTracking(emit: boolean = false): string[]{
    const vals = this.form.value as {[k:string]: boolean[]};
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

export const customerHealth: SelectionItem[] = [
  {id: 'ch1',     label: 'Chronic Health',            value: '5eb1a4e199957471610e6cd4', valueForTracking: 'chronic-health', child: [
    {id: 'ch1a',  label: 'Cardiovascular Disease',    value: '5eb1a4e199957471610e6cd4', valueForTracking: 'chronic-cardiovascular-disease'},
    {id: 'ch1b',  label: 'Diabetes',                  value: '5eb1a4e199957471610e6cd4', valueForTracking: 'chronic-diabetes'},
    {id: 'ch1c',  label: 'Cancer',                    value: '5eb1a4e199957471610e6cd4', valueForTracking: 'chronic-cancer'},
    {id: 'ch1d',  label: 'Neurodegenrative Disease',  value: '5eb1a4e199957471610e6cd4', valueForTracking: 'chronic-neurodegenrative-disease'},
    {id: 'ch1e',  label: 'Autoimmune Disease',        value: '5eb1a4e199957471610e6cd4', valueForTracking: 'chronic-autoimmune-disease'},
    {id: 'ch1f',  label: 'Other',                     value: '5eb1a4e199957471610e6cd4', valueForTracking: 'chronic-other'},
  ]},
  {id: 'ch2',     label: 'Pregnant',                  value: '5eb1a4e199957471610e6cd2', valueForTracking: 'pregnant'},
  {id: 'ch3',     label: 'Not Critical',              value: '5eb1a4e199957471610e6cd1', valueForTracking: 'not-critical'}
]

interface SelectionItem {
  id: string;
  label: string;
  value: string;
  valueForTracking: string;
  child?: SelectionItem[]
}