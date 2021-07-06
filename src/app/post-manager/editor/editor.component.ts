import { Location } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { EditorChangeContent, EditorChangeSelection } from 'ngx-quill';
import { ToastrService } from 'ngx-toastr';
import Quill from 'quill';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { Blog, IBlog } from 'src/app/models/blog';
import { IBlogCategory } from 'src/app/models/blog-category';
import { IUserDetail } from 'src/app/models/user-detail';
import { DateTimeData } from 'src/app/shared/form-item-datetime/form-item-datetime.component';
import { FormItemUploadImageButtonComponent } from 'src/app/shared/form-item-upload-image-button/form-item-upload-image-button.component';
import { HeaderStatusService } from 'src/app/shared/services/header-status.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { formatDateTimeDataToString, formatDateToString, formatStringToDate, formatStringToDateTimeData } from 'src/app/_helpers/date-formatter';
import { validators } from 'src/app/_helpers/form-settings';
import { environment } from 'src/environments/environment';
import { PostManagerService } from '../post-manager.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  get f() {return this.form.controls; }
  get fVideo() { return ((this.f.videoLinks as FormArray).at(0) as FormGroup).controls; }
  get fPodcast() { return ((this.f.podcastLinks as FormArray).at(0) as FormGroup).controls; }
  
  get categories() { return this._postsService.categories; }
  get tags() { return this._postsService.tags; }

  @HostListener('window:beforeunload', ['$event']) onBeforeUnload(e: BeforeUnloadEvent) {
    if(this._postsService.isEditorLocked) {
      e.returnValue = true;
    }
  }

  isSelectedThumbnailType(type: string) {
    return !!(this.selectedThumbnailType.findIndex(item => item._id == type) >= 0);
  }

  isCategoryEvent(cat: IBlogCategory) {
    return !!cat.title.toLowerCase().match(/event/)
  }

  categoryOf(id: string) {
    let cat: IBlogCategory = null;
    if (this.categories) {
      for (let c of this.categories) {
        if (c._id == id) {
          cat = c;
          break;
        }
      }
    }
    return cat;
  }

  tagOf(id: string) {
    let tag: IBlogCategory = null;
    if (this.tags) {
      for (let t of this.tags) {
        if(t._id == id) {
          tag = t;
          break;
        }
      }
    }
    return tag;
  }
  
  statusNameOf(status: Blog['status']) {
    return this._postsService.statusNameOf(status);
  }

  public user: IUserDetail;
  public post: Blog;
  public description: any;
  public title: any;

  public statuses: IBlogCategory[] = [
    {_id: 'draft', title: 'Draft'},
    {_id: 'publish', title: 'Publish'},
    {_id: 'archive', title: 'Archive'},
  ];
  public thumbnailTypes: IBlogCategory[] = [
    {_id: 'image', title: 'Image' },
    {_id: 'video', title: 'Video' },
    {_id: 'podcast', title: 'Podcast' },
  ];

  public form: FormGroup;
  public selectedCategories: IBlogCategory[] = [];
  public selectedTags: IBlogCategory[] = []
  public selectedStatus: IBlogCategory[] = [];
  public selectedThumbnailType: IBlogCategory[] = [];

  public isSubmitted: boolean = false;
  public isUploading: boolean = false;
  public isSettingShown: boolean = false;
  public isEventShown: boolean = false;

  public minDateTimeEventStart: DateTimeData;
  public minDateTimeEventEnd: DateTimeData;
  
  public dropdownSetting: IDropdownSettings = {
    singleSelection: true,
    idField: '_id',
    textField: 'title',
    itemsShowLimit: 1,
    allowSearchFilter: false,
  }
  
  public dropdownSettingCategories: IDropdownSettings = {
    singleSelection: true,
    idField: '_id',
    textField: 'title',
    itemsShowLimit: 6,
    allowSearchFilter: true,
  }

  public dropdownSettingTags: IDropdownSettings = {
    singleSelection: false,
    idField: '_id',
    textField: 'title',
    selectAllText: 'Select All',
    unSelectAllText: 'Deselect All',
    itemsShowLimit: 6,
    allowSearchFilter: true,
  }

  private contentEditor: Quill;

  private AWS_S3 = environment.config.AWS_S3;

  @ViewChild('imageSelector') imageSelector: FormItemUploadImageButtonComponent;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _location: Location,
    private _sharedService: SharedService,
    private _profileService: ProfileManagementService,
    private _uService: UniversalService,
    private _postsService: PostManagerService,
    private _toastr: ToastrService,
    private _headerService: HeaderStatusService,
  ) { }

  ngOnDestroy() {
    this._postsService.unlockEditor();
    this._headerService.showHeader();
  }
  async ngOnInit() {
    const userLS = this._uService.localStorage.getItem('user');
    if(userLS) {
      this._profileService.getProfileDetail(JSON.parse(userLS)).then(res => {
        this.user = res;
      });
    }

    const now = new Date();
    this.minDateTimeEventStart = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours() + 1,
      minute: 0,
    }
    this.minDateTimeEventEnd = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours() + 2,
      minute: 0
    }

    this.form = new FormGroup({
      // _id: new FormControl(null),
      status: new FormControl('DRAFT'),
      title: new FormControl('', validators.savePostTitle),
      slug: new FormControl(''),
      description: new FormControl(''), // set validator later
      categoryId: new FormControl(null, validators.savePostCategory),
      tags: new FormArray([]),
      authorId: new FormControl(null, validators.savePostAuthorId),
      author: new FormControl(),
      
      eventStartTime: new FormControl(), // set validator later
      eventEndTime: new FormControl(),  // set validator later
      joinEventLink: new FormControl(null, validators.savePostEventLink),  // set validator later
      
      image: new FormControl(),
      videoLinks: new FormArray([
        new FormGroup({
          title: new FormControl(null),
          url: new FormControl(null, validators.savePostVideoLink),
        }),
      ]),
      podcastLinks: new FormArray([
        new FormGroup({
          title: new FormControl(null),
          url: new FormControl(null, validators.savePostPodcastLink),
        }),
      ]),
    }, validators.savePost );

    this._route.params.subscribe((params: {id: string}) => {
      this._sharedService.loader('show');
      const promiseAll = [
        this.initCategories(),
        this.initTags(),
      ];
      if(params.id) {
        promiseAll.push(this.initPost(params.id))
      }

      Promise.all(promiseAll).then(() => {
        this.initForm();
        
        this._uService.setMeta(this._router.url, {
          title: (params.id ? `Edit | ${this.post.title}`  : 'Create new post') + ' | PromptHealth',
        });

      }).catch((err) => {
        console.log(err);
      }).finally(() => {
        this._sharedService.loader('hide');
      });
    });
  }

  initPost(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const post = this._postsService.postOf(id);
      if (post) {
        this.post = post;
        resolve(true);
      } else {
        const path = 'blog/get-by-id/' + id;
        this._sharedService.get(path).subscribe((res: any) => {
          if(res.statusCode === 200) {
            this._postsService.saveCacheSingle(res.data);
            this.post = this._postsService.postOf(id);
            resolve(true);
          } else {
            console.log(res.message);
            reject(res.message);
          }
        }, err => {
          console.log(err);
          reject(err);
        })  
      }
    });
  }

  initCategories(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this._postsService.categories) {
        resolve(true);
      } else {
        const path = `category/get-all`;
        this._sharedService.getNoAuth(path).subscribe((res: any) => {
          if (res.statusCode === 200) {
            this._postsService.saveCacheCategories(res.data.data);
            resolve(true);
          }else {
            console.log(res);
            reject(res.message);
          }
        }, (error) => {
          console.log(error);
          reject(error);
        });
      }  
    });
  }

  initTags() {
    return new Promise((resolve, reject) => {
      if(this._postsService.tags) {
        resolve(true);
      } else {
        const path = `tag/get-all`;
        this._sharedService.getNoAuth(path).subscribe((res: any) => {
          if (res.statusCode === 200) {
            this._postsService.saveCacheTags(res.data.data)
            resolve(true);
          }else {
            console.log(res);
            reject(res.message);
          }
        }, (error) => {
          console.log(error);
          reject(error);
        });
      }
    });
  }

  initForm() {
    if(this.post) {
      this.f.title.setValue(this.post.title);

      this.description = this.post.description;
      this.f.description.setValue(this.post.description);

      this.f.status.setValue(this.post.status || 'DRAFT');

      if(this.post.slug) {
        this.f.slug.setValue(this.post.slug);
      }

      if(this.post.category) {
        this.selectedCategories = [this.post.category];
        this.f.categoryId.setValue(this.post.category._id);
        if(this.post.category && this.isCategoryEvent(this.post.category)) {
          this.showEventCalendar();
        }
      }

      if(this.post.tags) {
        this.selectedTags = this.post.tags;
      }

      if(this.post.videoLinks.length > 0) {
        this.selectedThumbnailType = [this.thumbnailTypes[1]];
        this.fVideo.title.setValue(this.post.videoLinks[0].title);
        this.fVideo.url.setValue(this.post.videoLinks[0].url);
      } else if (this.post.podcastLinks.length > 0) {
        this.selectedThumbnailType = [this.thumbnailTypes[2]];
        this.fPodcast.title.setValue(this.post.podcastLinks[0].title);
        this.fPodcast.url.setValue(this.post.podcastLinks[0].url);
        if(this.post._image) { this.f.image.setValue(this.post._image) };
      } else if (this.post._image) {
        this.selectedThumbnailType = [this.thumbnailTypes[0]];
        this.f.image.setValue(this.post._image);
      }  else {
        this.selectedThumbnailType = [];
      }

      if(this.post.event.startAt) {
        const dt = this.post.event.startAt;
        const val = formatDateToString(dt);
        this.f.eventStartTime.setValue(val);
      }

      if(this.post.event.endAt) {
        const dt = this.post.event.endAt;
        const val = formatDateToString(dt);
        this.f.eventEndTime.setValue(val);
      }

      if(this.post.event.eventOn) {
        this.f.joinEventLink.setValue(this.post.event.link);
      }

    } else {
      let catDefault: IBlogCategory = null;
      for(let c of this.categories) {
        if(c.slug.match(/knowledge|article/)) {
          catDefault = c;
          break;
        }
      }
      this.selectedCategories = [catDefault];
      this.f.status.setValue('DRAFT');
    }

    // wait for all form values are init, and then start checking form values.
    // if any value is changed, lock editor.
    setTimeout(() => {
      this.form.valueChanges.subscribe((e: any) => {
        this._postsService.lockEditor();
      });  
    }, 0);
  }

  onKeydownTitle(e: KeyboardEvent) {
    if(!e.isComposing && e.key == 'Enter') {
      e.preventDefault();
      if(this.contentEditor) {
        this.contentEditor.focus();
      }
    }
  }

  onEditorCreated(e: Quill) {
    this.contentEditor = e;
  }

  async onEditorChanged(e: EditorChangeContent | EditorChangeSelection) {
    if('html' in e) {
      const current = this.f.description.value;
      const next = e.html;

      this.f.description.setValue(e.html);
      if(current != next) {
        this._postsService.lockEditor();
      }

      if(e.html) {
        const regExImageBase64 = /<img src="(data:image\/.+;base64,.+)"(\/)?>/
        const matchImage = e.html.match(regExImageBase64);
        if(matchImage) {
          this.onImageSelected(matchImage[1]);
        }  
      }
    }
  }

  // this is fired when user select image in quill editor
  // shrink image, upload, replace image src from base64 to file link
  onImageSelected(uri: string): Promise<void>{
    return new Promise( async (resolve, reject) => {
      const blob = this._sharedService.b64ToBlob(uri);
      const shrink = await this._sharedService.shrinkImageByFixedWidth(blob, 840);
      const path = '/common/imgUpload';

      this._sharedService.loader('show');
      const formdata = new FormData();
      formdata.append('imgLocation', 'blogs');
      formdata.append('images', shrink.file, shrink.filename);
      this._sharedService.imgUpload(formdata, path).subscribe((res: any) => {
        this._sharedService.loader('hide');
        if(res.statusCode === 200) {
          const url = this.AWS_S3 + res.data;
          const replaced = this.f.description.value.replace(uri, url);
          this.description = replaced;
          resolve();
        } else {
          console.log(res.message);
          this._toastr.error('Something went wrong. Please try again later');
          reject();
        }
      }, error => {
        this._sharedService.loader('hide');
        console.log(error);
        this._toastr.error('Something went wrong. Please try again later');
        reject();
      });
    });
  }

  toggleSettingPanel () {
    this.isSettingShown = !this.isSettingShown;
  }

  onSelectThumbnailType(e: IBlogCategory) {
    if(e._id == 'image') {
      this.imageSelector.select();
    } 
  }

  onChangeImage(e: any) {
    this._postsService.lockEditor();
  }

  onSelectCategory(e: IBlogCategory) {
    const current = this.f.categoryId.value;
    const next = e._id;
    if(current != next) {
      this._postsService.lockEditor();
    }

    if(this.isCategoryEvent(e)) {
      if(!this.f.eventStartTime.value && !this.f.eventEndTime.value){
        const dtS = this.minDateTimeEventStart;
        const valS = formatDateTimeDataToString(dtS);
        this.f.eventStartTime.setValue(valS);

        const dtE = this.minDateTimeEventEnd;
        const valE = formatDateTimeDataToString(dtE);
        this.f.eventEndTime.setValue(valE);
      }

      this.showEventCalendar();
    } else {
      this.hideEventCalendar();
    }
  }

  onDeselectCategory() {
    this._postsService.lockEditor();
    this.hideEventCalendar();
  }

  showEventCalendar() {
    this.isEventShown = true;
  }
  hideEventCalendar() {
    this.isEventShown = false;
  }

  onChangeTags() {
    this._postsService.lockEditor();
  }

  onChangeStartDateTime () {
    const start: Date = formatStringToDate(this.f.eventStartTime.value);
    const end: Date = formatStringToDate(this.f.eventEndTime.value);

    if(start) {
      this.minDateTimeEventEnd = {
        year: start.getFullYear(),
        month: start.getMonth() + 1,
        day: start.getDate(),
        hour: start.getHours(),
        minute: start.getMinutes(),
      }  
    }

    if(start && end && (start.getTime() - end.getTime() > 0)) {
      start.setHours(start.getHours() + 1);
      const val = formatDateToString(start);
      this.f.eventEndTime.setValue(val);
    }
  }

  onChangeEndDateTime(e: Date) {
    // this._postsService.lockEditor();
  } 

  draftPost() {
    const data = {
      id: this.post._id,
      status: 'DRAFT',
    }
    const path = '/blog/updateStatus';
    this._sharedService.loader('show');
    this._sharedService.put(data, path).subscribe((res: any) => {
      this._sharedService.loader('hide');
      if(res.statusCode === 200) {
        this._toastr.success('Changed status to draft successfully.');
        this.post.draft();
        this.initForm();
        this._postsService.unlockEditor();
      }
    });

  }

  onSubmit(publish: boolean = false) {
    this.isSubmitted = true;

    const statusCurrent = this.f.status.value;
    const statusNext = (!publish && statusCurrent == 'DRAFT') ? 'DRAFT' : 'PENDING';

    this.f.authorId.setValue( this.user._id );
    this.f.author.setValue( this.user.firstName );
    this.f.categoryId.setValue( this.selectedCategories.length > 0 ? this.selectedCategories[0]._id : null );
    
    const fTags = this.f.tags as FormArray;
    fTags.clear();
    this.selectedTags.forEach(t => {
      fTags.push(new FormControl(t._id));
    });

    /** remove unnecessary thumbnail */
    if(!this.selectedThumbnailType || this.selectedThumbnailType.length == 0) {
      this.f.image.setValue(null);
      this.fVideo.title.setValue(null);
      this.fVideo.url.setValue(null);
      this.fPodcast.title.setValue(null);
      this.fPodcast.url.setValue(null);
    } else if(this.selectedThumbnailType[0]._id === 'image') {
      this.fVideo.title.setValue(null);
      this.fVideo.url.setValue(null);
      this.fPodcast.title.setValue(null);
      this.fPodcast.url.setValue(null);
    } else if(this.selectedThumbnailType[0]._id === 'video') {
      this.f.image.setValue(null);
      this.fPodcast.title.setValue(null);
      this.fPodcast.url.setValue(null);
    } else if(this.selectedThumbnailType[0]._id === 'podcast') {
      this.fVideo.title.setValue(null);
      this.fVideo.url.setValue(null);
    }

    /** remove unnecessary event data */
    let catName: string = (this.selectedCategories && this.selectedCategories.length > 0) ? this.selectedCategories[0].title : '';
    if(!catName.toLowerCase().match('event')) {
      this.f.eventStartTime.setValue(null);
      this.f.eventEndTime.setValue(null);
      this.f.joinEventLink.setValue(null);
    }

    this.resetValidators(statusNext == 'PENDING');

    console.log(this.form);

    if(this.form.invalid) {
      this._toastr.error('There are several items that requires your attention.')
      return;
    }

    const data: ISaveQuery = new SaveQuery(this.form.value).toJson();
    data.status = statusNext;

    const req =  this.post ? this._sharedService.put(data, `blog/update/${this.post._id}`) : this._sharedService.post(data, 'blog/create');
    console.log('===PAYLOAD====')
    console.log(data);

    this.isUploading = true;

    this._sharedService.loader('show');
    req.subscribe((res: any) => {
      this.isUploading = false;
      this._sharedService.loader('hide');
      if(res.statusCode === 200) {
        /** populate category and tag */
        if(res.data.categoryId) {
          res.data.categoryId = { _id: res.data.categoryId, title: this._postsService.categoryNameOf(res.data.categoryId) };
        }
        if(res.data.tags && res.data.tags.length > 0) {
          const populated: IBlogCategory[] = [];
          res.data.tags.forEach((id: string) => {
            populated.push({ _id: id, title: this._postsService.tagNameOf(id) });
          });
          res.data.tags = populated;
        }

        const isPostNew = (!this.post || !('_id' in this.post));
        if(isPostNew) {
          this._postsService.addCache(0, res.data);
          this._location.replaceState('/dashboard/my-posts/edit/' + res.data._id);
        } else {
          this._postsService.saveCacheSingle(res.data, true);
        }
        this.post = this._postsService.postOf(res.data._id);

        this.initForm();
        this._postsService.unlockEditor();

        this.isSubmitted = false;
        this._toastr.success('Updated successfully');  
      } else {
        this._toastr.error(res.message);
      }
    }, (err) => {
      this.isUploading = false;
      this._sharedService.loader('hide');
      console.log(err);
      this._toastr.error(err);
    });
  }

  resetValidators(published: boolean = false) {
    this.f.description.clearValidators();
    this.f.description.setValidators( published ? validators.publishPostDescription : validators.savePostDescription);
    this.f.description.updateValueAndValidity();

    // this.f.categoryId.clearValidators();
    // this.f.categoryId.updateValueAndValidity();

    this.f.eventStartTime.clearValidators();
    this.f.eventEndTime.clearValidators();
    this.f.joinEventLink.clearValidators();
    let catName: string = (this.selectedCategories && this.selectedCategories.length > 0) ? this.selectedCategories[0].title : '';
    if(catName.toLowerCase().match('event')) {
      this.f.eventStartTime.setValidators( published ? validators.publishPostEventStartTime : validators.savePostEventStartTime);
      this.f.eventEndTime.setValidators( published ? validators.publishPostEventEndTime : validators.savePostEventEndTime);
      this.f.joinEventLink.setValidators( published ? validators.publishPostEventLink : validators.savePostEventLink);
      this.f.eventStartTime.updateValueAndValidity();
      this.f.eventEndTime.updateValueAndValidity();
      this.f.joinEventLink.updateValueAndValidity();  
    }

    // this.f.tags.clearValidators();
    // this.f.tags.setValidators( published ? validators.publishPostTags : validators.savePostTags);
    // this.f.tags.updateValueAndValidity();
  }

  changeStickyStatus(isSticked: boolean) {
    if (isSticked) { this._headerService.hideHeader(); } else { this._headerService.showHeader(); }
  }}


interface ISaveQuery {
  // _id?: string,
  status: IBlog['status'];
  title: string;
  authorId: string;
  author: string;

  // slug?: string;
  description?: string;
  categoryId?: string;
  tags?: string[],
  readLength?: number;

  eventStartTime?: string | Date;
  eventEndTime?: string | Date;
  joinEventLink?: string;
  
  image?: string;
  videoLinks?: {
    title: string;
    url: string;
  }[];
  podcastLinks?: ISaveQuery['videoLinks'];

  headliner?: boolean;
}

class SaveQuery implements ISaveQuery {
  get status() { return this.data.status || 'DRAFT'; }
  get title() { return this.data.title || null; }
  get authorId() { return this.data.authorId || null; }
  get author() { return this.data.author || null; }
  get description() { return this.data.description || ''; }
  get categoryId() { return this.data.categoryId || ''; }
  get tags() { return (this.data.tags && this.data.tags.length > 0) ? this.data.tags : []; }
  
  get eventStartTime() { return this.data.eventStartTime ? formatStringToDate(this.data.eventStartTime as string) : null; }
  get eventEndTime() { return this.data.eventEndTime ? formatStringToDate(this.data.eventEndTime as string) : null; }
  get joinEventLink() { return this.data.joinEventLink || null; }
  
  get image() { return this.data.image || ''; }
  get videoLinks() { 
    let res: ISaveQuery['videoLinks'] = [];
    if(this.data.videoLinks && this.data.videoLinks.length > 0) {
      const data = this.data.videoLinks[0];
      if(data.url) {
        res = [{title: 'video', url: data.url}];
      }
    }
    return res;
  }
  get podcastLinks() {
    let res: ISaveQuery['podcastLinks'] = [];
    if(this.data.podcastLinks && this.data.podcastLinks.length > 0) {
      const data = this.data.podcastLinks[0];
      if(data.url) {
        res = [{title: 'podcast', url: data.url}];
      }
    }
    return res;
   }

  toJson() { 
    const data: ISaveQuery = {
      status: this.status,
      authorId: this.authorId,
      author: this.author,

      title: this.title,
      description: this.description,
      
      categoryId: this.categoryId,
      tags: this.tags,
      
      joinEventLink: this.joinEventLink,
      eventStartTime: this.eventStartTime,
      eventEndTime: this.eventEndTime,

      image: this.image,
      videoLinks: this.videoLinks,
      podcastLinks: this.podcastLinks,
      headliner: false,
    };
    return data;
  }
  constructor(private data: ISaveQuery) {}
}

