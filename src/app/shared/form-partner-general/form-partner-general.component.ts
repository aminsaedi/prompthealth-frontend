import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators} from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../shared/services/shared.service';
import { minmax, pattern, validators } from 'src/app/_helpers/form-settings';
import { IUserDetail } from 'src/app/models/user-detail';

@Component({
  selector: 'form-partner-general',
  templateUrl: './form-partner-general.component.html',
  styleUrls: ['./form-partner-general.component.scss']
})
export class FormPartnerGeneralComponent implements OnInit {

  @Input() data: IUserDetail;  
  @Input() disabled = false;

  @Output() changeImage = new EventEmitter<string>();
  @Output() submitText = new EventEmitter<any>(); /** it does NOT return userID nor imageURL */

  public form: FormGroup;
  public isSubmitted: boolean = false;

  public maxName: number = minmax.nameMax;
  public maxTextarea: number = minmax.textareaMax;

  public baseURLImage = environment.config.AWS_S3;

  private patternURL = pattern.url;
  private patternPhone = pattern.phone;

  get f(){ return this.form.controls; }


  constructor(
    private _fb: FormBuilder,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.form = this._fb.group({
      profileImage: new FormControl((this.data.profileImage ? this.data.profileImage : ''), [Validators.required,]),
      firstName: new FormControl((this.data.firstName ? this.data.firstName : ''), [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(this.maxName)
      ]),
      email: new FormControl((this.data.email ? this.data.email : ''), [
        Validators.required,
        Validators.email
      ]),

      address: new FormControl((this.data.address ? this.data.address : ''),   []),
      latitude: new FormControl(((this.data.location && this.data.location[1]) ? this.data.location[1] : 0), []),
      longitude: new FormControl(((this.data.location && this.data.location[0]) ? this.data.location[0] : 0), []),
      city: new FormControl((this.data.city ? this.data.city : ''), []),
      state: new FormControl((this.data.state ? this.data.state : ''), []),
      zipcode: new FormControl((this.data.zipcode ? this.data.zipcode : ''), []),
      
      phone: new FormControl((this.data.phone ? this.data.phone : ''), [
        Validators.pattern(this.patternPhone),
        Validators.minLength(10),
        Validators.maxLength(13),
      ]),
      website: new FormControl((this.data.website ? this.data.website : ''), [Validators.pattern(this.patternURL)]),
      product_description: new FormControl((this.data.product_description ? this.data.product_description : ''), [
        Validators.required,
        Validators.maxLength(this.maxTextarea),
      ]),
      messageToPlatform: new FormControl((this.data.messageToPlatform ? this.data.messageToPlatform : ''), [Validators.maxLength(this.maxTextarea)]),
    }, {validators: validators.addressSelectedFromSuggestion});
  }

  onChangeImage(imageURL: string){
    this.changeImage.emit(imageURL);
  }

  onSubmit(){
    this.isSubmitted = true;
    if(this.form.invalid){
      this._toastr.error('There are some items that require your attention.');
      return; 
    }

    this.submitText.emit(this.form.value);
  }
}
