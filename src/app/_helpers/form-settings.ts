import { FormArray, ValidatorFn, Validators } from "@angular/forms"

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

const validatorFirstNameClient = [Validators.maxLength(minmax.nameMax), Validators.required];
const validatorLastNameClient = [Validators.maxLength(minmax.nameMax)];
const validatorNameSP = [Validators.required, Validators.minLength(3), Validators.maxLength(minmax.nameMax)];
const validatorEmail = [Validators.required, Validators.email];
const validatorPhone = [Validators.pattern(pattern.phone), Validators.minLength(minmax.phoneMin), Validators.maxLength(minmax.phoneMax)];
const validatorRequired = [Validators.required];
const validatorUrl = [Validators.pattern(pattern.url)];
const validatorProfessionalTitle = [Validators.maxLength(minmax.professionalTitleMax)];
const validatorProfessionalOrganization = [Validators.maxLength(minmax.professionalOrganizationMax)];
const validatorCertification = [Validators.maxLength(minmax.certificationMax)];
const validatorExactPricing = [Validators.pattern(pattern.price)];
const validatorExactPricingRequired = [Validators.pattern(pattern.price), Validators.required];
const validatorTextarea = [Validators.maxLength(minmax.textareaMax)];


export const validators = {
  nameCentre: validatorNameSP,
  nameProvider: validatorNameSP,
  namePartner: validatorNameSP,
  firstnameClient: validatorFirstNameClient,
  lastnameClient: validatorLastNameClient,
  email: validatorEmail,
  phone: validatorPhone,
  gender: validatorRequired,
  address: validatorRequired,
  addressClient: [],
  website: validatorUrl,
  bookingURL: validatorUrl,
  professionalTitle: validatorProfessionalTitle,
  professionalOrganization: validatorProfessionalOrganization,
  certification: validatorCertification,
  ageRange: validatorCheckboxSelectedAtLeast(1),
  typicalHours: validatorCheckboxSelectedAtLeast(1),
  exactPricing: validatorExactPricing,
  exactPricingRequired: validatorExactPricingRequired,
  businessKind: validatorRequired,
  productDescription: validatorTextarea,

  personalMatchGender: validatorRequired,
  personalMatchAgeRange: validatorRequired,
}