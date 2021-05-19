import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../shared/services/shared.service';
import { ProfileManagementService } from '../profile-management.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-my-badge',
  templateUrl: './my-badge.component.html',
  styleUrls: ['./my-badge.component.scss']
})
export class MyBadgeComponent implements OnInit {

  public type = 'certification';
  public data: BadgeData;
  public isVerified = false;

  public isSubmitted = false;
  public form: FormGroup;
  public files: File[] = [];
  public filesUploaded: { name: string, path: string, original: string }[];

  public maxTitle = 200;
  public maxDescription = 500;

  public AWS_S3 = environment.config.AWS_S3;

  public targetFileMenu: number;


  get f() { return this.form.controls; }

  private user: any;

  constructor(
    private _fb: FormBuilder,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _profileService: ProfileManagementService,
    private _router: Router,
    private _uService: UniversalService,
  ) {
    this.form = _fb.group({
      title: new FormControl('', [Validators.required, Validators.maxLength(this.maxTitle)]),
      description: new FormControl('', [Validators.required, Validators.maxLength(this.maxDescription)]),
    });
  }

  async ngOnInit(): Promise<void> {
    this._uService.setMeta(this._router.url, {
      title: 'Manage verified badge | PromptHealth',
    });

    this._sharedService.loader('show');

    const user = JSON.parse(localStorage.getItem('user'));
    this.user = await this._profileService.getProfileDetail(user);
    this.isVerified = this.user.verifiedBadge || false;

    try { await this.getBadgeData(); } catch (err) {
      console.log(err);
      this._toastr.error('There are some errors, please try again after some time !');
    }
    this._sharedService.loader('hide');

    if (this.data) {
      this.f.title.setValue(this.data.title);
      this.f.description.setValue(this.data.description);
      this.setUploadedFiles();
    }
  }

  setUploadedFiles() {
    this.filesUploaded = [];
    this.data.certificateFiles.forEach(f => {
      this.filesUploaded.push({
        name: f.replace('certificates/', '').substr(18),
        path: this.AWS_S3 + f,
        original: f,
      });
    });
  }

  showFileMenu(index: number, e: Event) {
    if (this.targetFileMenu !== index) {
      e.preventDefault();
    }
    this.targetFileMenu = index;
  }
  hideFileMenu() { this.targetFileMenu = null; }

  async onSubmit() {
    this.isSubmitted = true;

    if (!this.data && this.files.length === 0) {
      this._toastr.error('Please select at least 1 file.');
      return;
    }

    if (this.form.invalid) {
      this._toastr.error('There are some items that require your attention.');
      return;
    }

    this._sharedService.loader('show');
    try {
      if (this.data) {
        await this.update();
        this._toastr.success('Success! Title / Description updated.');
      } else {
        await this.create();
        this._toastr.success('Success! Please wait until your certification is verified.');
      }
    } catch (error) {
      console.log(error);
      this._toastr.error('There are some errors, please try again after some time !');
    }
    this._sharedService.loader('hide');

  }

  async onRemove(index: number) {
    if (!this.filesUploaded || this.filesUploaded.length <= 1) {
      this.onDelete();
    } else {
      this._sharedService.loader('show');
      try {
        await this.removeFile(index);
        this._toastr.success('Success! The file "' + this.filesUploaded[index].name + '" removed.');
        this.filesUploaded.splice(index, 1);
      } catch (error) {
        console.log(error);
        this._toastr.error('There are some errors, please try again after some time !');
      }
      this._sharedService.loader('hide');
    }
  }

  async onDelete() {
    this._sharedService.loader('show');
    try {
      await this.delete();
      this._toastr.success('Success!');
      this.f.title.setValue('');
      this.f.description.setValue('');
    } catch (error) {
      console.log(error);
      this._toastr.error('There are some errors, please try again after some time !');
    }
    this._sharedService.loader('hide');
  }

  async onSelect(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    const filesUploading: File[] = [];
    const filesTooBig: File[] = [];

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const f: File = files.item(i);
        if (f.size > 10 * 1000 * 1000 /** 10MB */) {
          filesTooBig.push(f);
        } else {
          filesUploading.push(f);
        }
      }
    }

    if (filesUploading.length > 0) {
      if (this.data) {
        this._sharedService.loader('show');
        try {
          await this.addFiles(filesUploading);
          this._toastr.success(`Success! ${filesUploading.length} ${(filesUploading.length > 1) ? 'files' : 'file'} added.`);
        } catch (error) {
          console.log(error);
          this._toastr.error('There are some errors, please try again after some time !');
        }
        this._sharedService.loader('hide');
      } else {
        filesUploading.forEach(f => {
          this.files.push(f);
        });
      }
    }

    if (filesTooBig.length > 0) {
      this._toastr.success('Some files are too big. Please select files less than 10MB.');
    }
  }

  async onDownload(i) {
    try { await this._sharedService.downloadFile(this.filesUploaded[i].original); } catch (error) {
      console.log(error);
      this._toastr.error('Cannot download file. Please try again after some time !');
    }
  }

  removeFileBeforeUpload(index: number) {
    this.files.splice(index, 1);
    if (this.files.length === 0) { this.isSubmitted = false; }
  }

  getApiPath(type: 'get' | 'create' | 'update' | 'add' | 'remove' | 'delete') {
    let path: string;
    switch (this.type) {
      case 'certification':
        path = (type === 'create') ? 'certificate/create' :
          (type === 'add') ? 'certificate/add-file/' + this.data._id :
            (type === 'remove') ? 'certificate/remove-file/' + this.data._id :
              (type === 'update') ? 'certificate/update/' + this.data._id :
                (type === 'delete') ? 'certificate/delete/' + this.data._id :
                  'certificate/get-by-userid/' + this.user._id;
        break;
    }
    return path;
  }

  getBadgeData(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._sharedService.get(this.getApiPath('get')).subscribe((res: any) => {
        if (res.statusCode === 200) {
          if (res.data.length > 0) {
            this.data = res.data[0];
          }
          resolve(true);
        } else {
          reject(res);
        }
      }, error => {
        reject(error);
      });
    });
  }

  removeFile(index: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const target = this.filesUploaded[index].original;
      this._sharedService.put({ filePath: target }, this.getApiPath('remove')).subscribe((res: any) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          reject(res);
        }
      }, error => {
        reject(error);
      });
    });
  }

  delete(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._sharedService.deleteContent(this.getApiPath('delete')).subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.data = null;
          this.filesUploaded = null;
          this.files = [];
          resolve(true);
        } else {
          reject(res);
        }
      }, error => {
        reject(error);
      });
    });
  }

  addFiles(files: File[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const data = new FormData();
      data.append('_id', this.user._id);
      files.forEach(f => {
        data.append('certificates', f);
      });
      this._sharedService.imgUploadPut(data, this.getApiPath('add')).subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.data = res.data;
          this.files = [];
          this.setUploadedFiles();
          resolve(true);
        } else {
          reject(res);
        }
      }, error => {
        reject(error);
      });
    });
  }

  update(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const data = {
        userId: this.user._id,
        title: this.f.title.value,
        description: this.f.description.value,
      };
      this._sharedService.put(data, this.getApiPath('update')).subscribe((res: any) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          reject(res);
        }
      }, error => {
        reject(error);
      });

    });
  }

  create(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const data = new FormData();
      data.append('userId', this.user._id);

      Object.keys(this.f).forEach((k, i) => {
        data.append(k, this.f[k].value);
      });

      this.files.forEach(f => {
        data.append('certificates', f);
      });

      this._sharedService.imgUpload(data, this.getApiPath('create')).subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.data = res.data;
          this.files = [];
          this.setUploadedFiles();
          resolve(true);
        } else {
          reject(res);
        }
      }, error => {
        reject(error);
      });
    });
  }

}

interface BadgeData {
  _id: string;
  userId: string;
  title: string;
  description: string;
  certificateFiles?: string[];
}
