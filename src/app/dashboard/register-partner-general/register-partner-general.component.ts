import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormBuilder, Validators} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../shared/services/shared.service';
import { BehaviorService } from '../../shared/services/behavior.service';
import { RegisterQuestionnaireService } from '../register-questionnaire.service'; 
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-register-partner-general',
  templateUrl: './register-partner-general.component.html',
  styleUrls: ['./register-partner-general.component.scss']
})
export class RegisterPartnerGeneralComponent implements OnInit {

  public form: FormGroup;
  public isSubmitted: boolean = false;

  public maxName: number = 100;
  public maxTextarea: number = 1000;

  public baseURLImage = environment.config.AWS_S3;

  private subscriptionNavigation: Subscription;

  get f(){ return this.form.controls; }


  private patternURL = "http(s)?:\\/\\/([\\w-]+\\.)+[\\w-]+(\\/[\\w- ./?%&=]*)?";
  private patternPhone = '^[0-9\\-\\(\\)]+$';

  /** copy start */
  constructor(
    private _fb: FormBuilder,
    private _sharedService: SharedService,
    private _bsService: BehaviorService,
    private _qService: RegisterQuestionnaireService,
    private _route: ActivatedRoute,
    private _toastr: ToastrService,
  ) {
  }
  
  ngOnDestroy(){
    if(this.subscriptionNavigation){ this.subscriptionNavigation.unsubscribe(); }
  }

  ngOnInit(): void {
    this.initForm();

    this.subscriptionNavigation = this._qService.observeNavigation().subscribe(type => {
      if(type == 'next'){ this.onSubmit(); }
      else if(type == 'back'){ this._qService.goBack(this._route); }
    });
    this._route.data.subscribe((data: {index: number, next?: string})=>{
      this._qService.canActivate(this._route, data.index);
    });
  }
  /** copy end */


  initForm(){
    const user = this._qService.getUser();
    console.log(user);
    this.form = this._fb.group({
      profileImage: new FormControl((user.profileImage ? user.profileImage : ''), [Validators.required,]),
      firstName: new FormControl((user.firstName ? user.firstName : ''), [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(this.maxName)
      ]),
      email: new FormControl((user.email ? user.email : ''), [
        Validators.required,
        Validators.email
      ]),

      address: new FormControl((user.address ? user.address : ''),   []),
      latitude: new FormControl(((user.location && user.location[1]) ? user.location[1] : 0), []),
      longitude: new FormControl(((user.location && user.location[0]) ? user.location[0] : 0), []),
      city: new FormControl((user.city ? user.city : ''), []),
      state: new FormControl((user.state ? user.state : ''), []),
      zipcode: new FormControl((user.zipcode ? user.zipcode : ''), []),
      
      phone: new FormControl((user.phone ? user.phone : ''), [
        Validators.pattern(this.patternPhone),
        Validators.minLength(10),
        Validators.maxLength(13),
      ]),
      website: new FormControl((user.website ? user.website : ''), [Validators.pattern(this.patternURL)]),
      product_description: new FormControl((user.product_description ? user.product_description : ''), [
        Validators.required,
        Validators.maxLength(this.maxTextarea),
      ]),
      messageToPlatform: new FormControl((user.messageToPlatform ? user.messageToPlatform : ''), [Validators.maxLength(this.maxTextarea)]),
    });
  }

  async onSelectCoverPhoto(e: Event){
    const files = (e.target as HTMLInputElement).files;
    if(files && files.length > 0){
      let image: {file: File | Blob, filename: string};
      try { image = await this._sharedService.shrinkImage(files[0]); }
      catch(err){
        this.f.profileImage.setValue('');
        this._toastr.error('Image size is too big. Please upload image size less than 10MB.');
        return;
      }

      this._sharedService.loader('show');
      try { 
        const imageURL = await this.uploadImage(image.file, image.filename); 
        this.f.profileImage.setValue(imageURL);

        this._bsService.setUserDataOf('profileImage', imageURL);
        this._qService.updateUser({profileImage: imageURL});
      }
      catch(err){ this._toastr.error(err); }
      finally{ this._sharedService.loader('hide'); }
    }
  }

  async uploadImage(file: File | Blob, name: string): Promise<string>{
    return new Promise((resolve, reject) => {
      const userid = this._qService.getUser()._id;
      const uploadImage = new FormData();
      uploadImage.append('_id', userid);
      uploadImage.append('profileImage', file, name);

      this._sharedService.imgUpload(uploadImage, 'user/imgUpload').subscribe((res: any) => {
        if(res.statusCode == 200){
          resolve(res.data.profileImage);
        }else{
          reject('Something went wrong. Please try again.');
        }
      }, error => {
        console.log(error);
          reject('Something went wrong. Please try again.');
      });
    });
  }


  onSubmit(){
    this.isSubmitted = true;
    if(this.form.invalid){
      this._toastr.error('There are some items that require your attention.');
      return; 
    }

    this._qService.updateUser(this.form.value);
    this._qService.goNext(this._route);
  }
}

