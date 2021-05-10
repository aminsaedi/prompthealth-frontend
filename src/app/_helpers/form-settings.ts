import { FormArray, FormControl, FormGroup, ValidatorFn, Validators } from "@angular/forms"

export const minmax = {
  nameMax: 100,
  nameMin: 3,
  phoneMax: 16,
  phoneMin: 10,
  textareaMax: 1000,
  professionalTitleMax: 30,
  professionalOrganizationMax: 200,
  certificationMax: 200,
}
export const pattern = {
  url: 'http(s)?:\\/\\/([\\w-]+\\.)+[\\w-]+(\\/[\\w- ./?%&=]*)?',
  phone: '^[0-9\\-\\(\\)\\s]+$',
  price: '^[0-9]{1,}(\\.[0-9]{1,2})?$',
}

const validatorCheckboxSelectedAtLeast = (minRequired: number = 1): ValidatorFn => {
  return function validate(formArray: FormArray) {
    let checked = 0;

    (formArray.value as boolean[]).forEach(val => {
      if(val){ 
        checked ++; 
      }
    });

    if(checked >= minRequired){
      return null;
    }else{
      const errors = {}
      errors['requiredCheckboxSelectedAtLeast' + minRequired] = true;
      return errors;
    }
  }
}

const validatorNestedCheckboxSelectedAtLeast = (minRequired: number = 1): ValidatorFn => {
  return function validate(formGroup: FormGroup) {
    let checked = 0;
    if(formGroup.value.root && formGroup.value.root.length > 0){
      formGroup.value.root.forEach((isChecked: boolean) => {
        if(isChecked){
          checked ++;
        }
      });
    }
    
    if(checked >= minRequired){
      return null;
    }else{
      const errors = {}
      errors['requiredCheckboxSelectedAtLeast' + minRequired] = true;
      return errors;
    }
  }
}

const validatorAddressSelectedFromSuggestion = (): ValidatorFn => {
  return function validate(formGroup: FormGroup) {
    const lat = formGroup.controls.latitude.value;
    const lng = formGroup.controls.longitude.value;

    if(!formGroup.controls.address.value) {
      return null;
    }else if(lat != 0 && lng != 0){
      return null;
    }else{
      const errors = {'addressSelectedFromSuggestion': true};
      return errors;
    }
  }
}

const validatorPatternPassword = (): ValidatorFn => {
  return function validate(formControl: FormControl) {
    const regex = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\\d$@$!%*?&].{8,}');
    if(formControl.value.match(regex)) {
      console.log('password ok');
      return null;
    }else{
      console.log('password error');
      const errors = {'matchPatternPassword': true};
      return errors;
    }
  }
}

const validatorFirstNameClient = [Validators.maxLength(minmax.nameMax), Validators.required];
const validatorLastNameClient = [Validators.maxLength(minmax.nameMax)];
const validatorNameSP = [Validators.required, Validators.minLength(3), Validators.maxLength(minmax.nameMax)];
const validatorEmail = [Validators.required, Validators.email];
const validatorPhone = [Validators.pattern(pattern.phone), Validators.minLength(minmax.phoneMin), Validators.maxLength(minmax.phoneMax)];
const validatorRequired = [Validators.required];
const validatorRequiredTrue = [Validators.requiredTrue];
const validatorUrl = [Validators.pattern(pattern.url)];
const validatorProfessionalTitle = [Validators.maxLength(minmax.professionalTitleMax)];
const validatorProfessionalOrganization = [Validators.maxLength(minmax.professionalOrganizationMax)];
const validatorCertification = [Validators.maxLength(minmax.certificationMax)];
const validatorExactPricing = [Validators.pattern(pattern.price)];
const validatorExactPricingRequired = [Validators.pattern(pattern.price), Validators.required];
const validatorTextarea = [Validators.maxLength(minmax.textareaMax)];

export const validators = {
  profileImageProvider: validatorRequired,
  nameCentre: validatorNameSP,
  nameProvider: validatorNameSP,
  namePartner: validatorNameSP,
  firstnameClient: validatorFirstNameClient,
  lastnameClient: validatorLastNameClient,
  email: validatorEmail,
  phone: validatorPhone,
  gender: validatorRequired,
  address: validatorRequired,
  addressSelectedFromSuggestion: validatorAddressSelectedFromSuggestion(),
  addressClient: [],
  website: validatorUrl,
  bookingURL: validatorUrl,
  professionalTitle: validatorProfessionalTitle,
  professionalOrganization: validatorProfessionalOrganization,
  certification: validatorCertification,
  ageRange: validatorCheckboxSelectedAtLeast(1),
  typicalHours: validatorCheckboxSelectedAtLeast(1),
  customerHealth: validatorNestedCheckboxSelectedAtLeast(1),
  typeOfProvider: [],
  treatmentModality: [],
  service: validatorNestedCheckboxSelectedAtLeast(1),
  exactPricing: validatorExactPricing,
  exactPricingRequired: validatorExactPricingRequired,
  businessKind: validatorRequired,
  productDescription: validatorTextarea,

  personalMatchGender: validatorRequired,
  personalMatchAgeRange: validatorRequired,
  
  password: validatorPatternPassword(),
  accredit: validatorRequiredTrue,
  
}