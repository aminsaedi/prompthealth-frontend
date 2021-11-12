import { Injectable } from '@angular/core';
import { FormItemSearchData, IFormItemSearchData } from 'src/app/models/form-item-search-data';

@Injectable({
  providedIn: 'root'
})
export class SearchBarService {

  constructor() { }

  private currentKeyword: string;
  private currentKeyloc: string;

  private selectedCategory: FormItemSearchData;
  private selectedTypeOfProvider: FormItemSearchData;
  private selectedArea: FormItemSearchData;

  dispose() {
    const names: SearchDataName[] = ['selectedSituation', 'selectedLocation'];
    names.forEach(name => {
      this.remove(name);
    });
    this.setKeyword(null);
    this.setKeyloc(null);
  }

  remove(name: SearchDataName) {
    this[name] = null;
  }

  set(name: SearchDataName, data: FormItemSearchData) {
    this[name] = data;
  }

  setKeyword(data: string) {
    this.currentKeyword = data;
  }

  setKeyloc(data: string) {
    this.currentKeyloc = data;
  }

  get(name: SearchDataName) {
    return this[name];
  }

  getKeyword() {
    return this.currentKeyword;
  }

  getKeyloc() {
    return this.currentKeyloc;
  }
}

type SearchDataName = 'selectedSituation' | 'selectedLocation';