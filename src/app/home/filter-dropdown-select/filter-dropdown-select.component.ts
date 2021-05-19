import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { FormControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { QuestionnaireAnswer } from '../../shared/services/questionnaire.service';

@Component({
  selector: 'filter-dropdown-select',
  templateUrl: './filter-dropdown-select.component.html',
  styleUrls: ['./filter-dropdown-select.component.scss']
})
export class FilterDropdownSelectComponent implements OnInit, OnChanges {

  @Input() target: string;
  @Input() options: QuestionnaireAnswer[] = [];
  @Input() multiple = true;

  @Output() changeState = new EventEmitter<string>();

  public form: FormGroup;

  constructor(
    private _fb: FormBuilder,
  ) { }

  ngOnChanges(e: SimpleChanges) {
    if (e.target && e.target.currentValue && e.target.currentValue != e.target.previousValue) {
      this.initForm();
    }
  }

  ngOnInit(): void {
  }

  initForm() {
    if (this.multiple) {
      const formCheckbox = new FormArray([]);
      this.options.forEach(o => { formCheckbox.push(new FormControl(o.active)); });
      this.form = this._fb.group({ checkbox: formCheckbox });

    } else {
      let selected: QuestionnaireAnswer = null;
      for (let i = 0; i < this.options.length; i++) {
        if (this.options[i].active) { selected = this.options[i]; break; }
      }
      this.form = this._fb.group({ radio: new FormControl((selected ? selected._id : '')) });
    }
  }

  reset() {
    // this.options.forEach(o => { o.active = false; });

    if(this.multiple){
      (this.form.controls.checkbox as FormArray).controls.forEach(c => {
        c.setValue(false);
      });  
    }else{
      this.form.controls.radio.setValue('');
    }
    // this.changeState.emit('clear');
  }

  save() { 
    if(this.multiple){
      (this.form.controls.checkbox as FormArray).controls.forEach((c, i) => {
        this.options[i].active = c.value;
      });
    }else{
    }

    this.options.forEach((o, i) => {
      if(this.multiple){
        o.active = (this.form.controls.checkbox as FormArray).controls[i].value;
      }else{
        o.active = (this.form.controls.radio.value == o._id) ? true : false;
      }
    });
    
    this.changeState.emit('save'); 
  }
}
