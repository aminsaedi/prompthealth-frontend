import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { IUserDetail } from 'src/app/models/user-detail';
import { validators } from 'src/app/_helpers/form-settings';
import { CheckboxSelectionItem, FormItemCheckboxGroupComponent } from '../form-item-checkbox-group/form-item-checkbox-group.component';
import { FormItemCustomerHealthComponent } from '../form-item-customer-health/form-item-customer-health.component';
import { FormItemServiceComponent } from '../form-item-service/form-item-service.component';
import { CategoryService } from '../services/category.service';
import { Questionnaire, QuestionnaireService } from '../services/questionnaire.service';

@Component({
  selector: 'form-practitioner-service',
  templateUrl: './form-practitioner-service.component.html',
  styleUrls: ['./form-practitioner-service.component.scss']
})
export class FormPractitionerServiceComponent implements OnInit {

  @Input() data: IUserDetail = {};
  @Input() disabled = false;
  @Input() hideSubmit: boolean = false;
  
  @Output() submitForm = new EventEmitter<IUserDetail>();

  public form: FormGroup;
  public isSubmitted: boolean = false;
  // public questionnaireMap: {[k: string]: Questionnaire}; 
  public selectionsCustomerHealth: Questionnaire;
  public selectionsTreatmentModality: CheckboxSelectionItem[];;
  public selectionsTypeOfProvider: CheckboxSelectionItem[];
  public selectionsInsuranceType: CheckboxSelectionItem[] = selectionsInsuranceType;
  public selectionsSeeOtherRegion: CheckboxSelectionItem[] = selectionsSeeOtherRegion;

  get f(){ return this.form.controls; }
  getFormArray(name: string){ return this.form.controls[name] as FormArray; }

  @ViewChildren(FormItemCheckboxGroupComponent) formItemCheckboxGroupComponents: QueryList<FormItemCheckboxGroupComponent>;
  @ViewChild(FormItemCustomerHealthComponent) formHealthComponent: FormItemCustomerHealthComponent;
  @ViewChild(FormItemServiceComponent) formServiceComponent: FormItemServiceComponent;

  constructor(
    private _toastr: ToastrService,
    private _qService: QuestionnaireService,
    private _catService: CategoryService,
    private _fb: FormBuilder,
  ) { }

  async ngOnInit() {

    await this._catService.getCategoryAsync()

    this.form = this._fb.group({
      acceptsInsurance: new FormControl(this.data.acceptsInsurance || null),
      seeOtherRegion: new FormControl(this.data.seeOtherRegion || null),

      service: new FormGroup({}),
      treatmentModality: new FormArray([], validators.treatmentModality),
      typeOfProvider: new FormArray([], validators.typeOfProvider),
      customerHealth: new FormGroup({}, validators.customerHealth),      
    })

    const questionnaires = await this._qService.getProfileService(this.data.roles as ('SP' | 'C'));
    // this.questionnaireMap = questionnaires;
    this.selectionsCustomerHealth = questionnaires.customerHealth;

    const selectionsTreatmentModality: CheckboxSelectionItem[] = [];
    questionnaires.treatmentModality.answers.forEach(a=>{
      selectionsTreatmentModality.push({
        id: a._id,
        label: a.item_text,
        value: a._id,
      })
    });
    this.selectionsTreatmentModality = selectionsTreatmentModality;
    
    const selectionsTypeOfProvider: CheckboxSelectionItem[] = [];
    questionnaires.typeOfProvider.answers.forEach(a=>{
      selectionsTypeOfProvider.push({
        id: a._id,
        label: a.item_text,
        value: a._id,
      });
    });
    this.selectionsTypeOfProvider = selectionsTypeOfProvider;
  }

  onSubmit(){
    if(this.form.invalid){
      this.isSubmitted = true;
      this._toastr.error('There are some items that require your attention.');
      return;
    }

    const services = [];
    this.formItemCheckboxGroupComponents.forEach(item=> {
      if(item.id.match(/treatmentModality|typeOfProvider/)) {
        item.getSelected().forEach(id=>{
          services.push(id);
        });  
      }
    });
    this.formServiceComponent.getSelected().forEach(id=>{
      services.push(id);
    });
    this.formHealthComponent.getSelectedValue().forEach(id=>{
      services.push(id);
    });

    const data: IUserDetail = {
      _id: this.data._id,
      services: services,
      acceptsInsurance: this.f.acceptsInsurance.value,
      seeOtherRegion: this.f.seeOtherRegion.value,
    };

    this.submitForm.emit(data);
  }
}

const selectionsInsuranceType = [
  {id: 'neither',   label: 'Not applicable',  value: null},
  {id: 'private',   label: 'Private',         value: 'private'},
  {id: 'insurance', label: 'Insurance',       value: 'insurance'},
  {id: 'both',      label: 'Both',            value: 'both'},
];

const selectionsSeeOtherRegion = [
  {id: 'state', label: 'Yes', value: null},
  {id: 'no',    label: 'No',  value: 'state'},

]