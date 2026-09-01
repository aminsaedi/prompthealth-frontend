import { Component, OnInit , OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IGetSocialContentResult, IGetSocialContentsResult } from 'src/app/models/response-data';
import { ISocialPost } from 'src/app/models/social-post';
import { HeaderStatusService } from 'src/app/shared/services/header-status.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { formatDateToString } from 'src/app/_helpers/date-formatter';
import { slugify } from 'src/app/_helpers/slugify';
import { SocialService } from '../social.service';
import { JsonLdService } from 'src/app/shared/services/json-ld.service';
import { JourneyService } from 'src/app/shared/services/journey.service';
import { BreadcrumbItem } from 'src/app/shared/breadcrumb/breadcrumb.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();


  get pathToApp() {
    let path = '';
    if(this.post?.isNote || this.post?.isPromo) {
      path = this.post.contentType.toLowerCase() + '/' + this.post._id;
    }
    return path;
  }

  public post: ISocialPost;
  private postId: string;
  private _isSlugRoute: boolean = false;

  public isReturnToAppShown = false;
  public relatedPosts: ISocialPost[] = [];
  public relatedDirectoryLinks: {url: string, label: string}[] = [];
  public breadcrumbs: BreadcrumbItem[] = [];

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _socialService: SocialService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _uService: UniversalService,
    private _headerService: HeaderStatusService,
    private _jsonLdService: JsonLdService,
    private _journey: JourneyService,
  ) { }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.hideReturnToApp();
    this._jsonLdService.removeJsonLd();
  }

  ngOnInit(): void {
    this._route.params.subscribe((param: {postid?: string, slug?: string}) => {
      const routeType = this._route.snapshot.data?.routeType;
      this.postId = routeType === 'slug' ? param.slug : param.postid;
      this._isSlugRoute = routeType === 'slug';
      this.initPost();

      //when url is changed within this component after second time, then returnToApp should be false;
      this.hideReturnToApp();
    });

    this.showReturnToAppIfNeeded();
  }

  async initPost() {
    this.post = null;
    this.relatedPosts = [];
    const post = this._socialService.postOf(this.postId);
    if(post) {
      this.post = post;
    } else {
      try {
        const fetchedData: any = await this.fetchPost();
        const lookupId = this._isSlugRoute && fetchedData?._id ? fetchedData._id : this.postId;
        this.post = this._socialService.postOf(lookupId);
      } catch (error) {
      }
    }

    if(this.post) {
      /* Which piece of content this is, for the journey tracker. Sent from here
       * rather than derived from the URL because the same component serves
       * /community/article/<slug> and /community/content/<id>, and only one of
       * those carries an id. */
      this._journey.setEntity(this.post.isEvent ? 'event' : 'article', this.post._id);
      this.setMeta();
      this.setBreadcrumbs();
      this.buildDirectoryLinks();
      this.fetchRelatedPosts();
    } else {
      this._toastr.error('Could not find the content. Please try again');
      this._router.navigate(['/404'], {replaceUrl: true});
    }
  }

  fetchPost() {
    return new Promise((resolve, reject) => {
      // SEO-064: slugs may contain em-dash or other non-ASCII characters.
      // Encode so HttpClient emits an RFC 3986-compliant request path and
      // the backend lookup does not 404 on encoded segments.
      const path = this._isSlugRoute
        ? `blog/get-by-slug/${encodeURIComponent(this.postId)}`
        : `note/${this.postId}`;
      this._sharedService.get(path).pipe(takeUntil(this.destroy$)).subscribe((res: IGetSocialContentResult) => {
        if(res.statusCode === 200) {
          this._socialService.saveCacheSingle(res.data);
          resolve(res.data);
        } else {
          reject(res.message);
        }
      }, err => {
        reject(err);
      });
    });
  }

  fetchRelatedPosts() {
    const type = this.post.contentType;
    const path = `note/filter?count=6&contentType=${type}`;
    this._sharedService.get(path).pipe(takeUntil(this.destroy$)).subscribe((res: IGetSocialContentsResult) => {
      if (res.statusCode === 200 && res.data?.data) {
        this.relatedPosts = res.data.data
          .filter(p => p._id !== this.post._id)
          .slice(0, 5);
      }
    }, err => {
    });
  }

  setBreadcrumbs() {
    let title: string;
    if (this.post.isNote) {
      title = 'Note by ' + this.post.authorName;
    } else if (this.post.isPromo) {
      title = 'Offer from ' + this.post.authorName;
    } else {
      title = this.post.title || 'Post';
    }

    this.breadcrumbs = [
      { label: 'Home', url: '/' },
      { label: 'Community', url: '/community/feed' },
      { label: title }
    ];
  }

  buildDirectoryLinks() {
    this.relatedDirectoryLinks = [];
    const cat = this.post.categoryId as any;
    const catSlug = cat?.slug;
    const catTitle = cat?.title;
    const location = this.post.location;

    if (catSlug) {
      this.relatedDirectoryLinks.push({
        url: `/practitioners/category/${catSlug}`,
        label: `Browse ${catTitle} Practitioners`
      });
    }

    if (location) {
      this.relatedDirectoryLinks.push({
        url: `/practitioners/area/${slugify(location)}`,
        label: `Find Practitioners in ${location}`
      });
    }

    if (catSlug && location) {
      this.relatedDirectoryLinks.push({
        url: `/practitioners/area/${slugify(location)}/category/${catSlug}`,
        label: `Find ${catTitle} Practitioners in ${location}`
      });
    }
  }

  setMeta(){
    let title: string;
    if (this.post.isNote) {
      title = `A note from ${this.post.authorName} posted at ${formatDateToString(new Date(this.post.createdAt))}`;
    } else if (this.post.isPromo) {
      title = `Special discount offer from ${this.post.authorName}!${this.post.availableUntil ? (' Available until ' + formatDateToString(this.post.availableUntil as Date, true)) : ''}`;
    } else {
      title = this.post.title;
    }

    const seoTitle = (this.post.isArticle && this.post.metaTitle) ? this.post.metaTitle : title;
    const seoDescription = (this.post.isArticle && this.post.metaDescription) ? this.post.metaDescription : this.post.summary;

    const canonicalPath = (this.post.isArticle && this.post.slug && !this._isSlugRoute)
      ? '/community/article/' + this.post.slug
      : this._router.url;

    this._uService.setMeta(canonicalPath, {
      title: seoTitle + ' | PromptHealth Community',
      description: seoDescription,
      pageType: 'article',
      image: this.post.coverImage,
      imageType: this.post.coverImageType,
      imageAlt: title,
      ...this.pathToApp && {iosLink: this.pathToApp},
    });

    const articleJsonLd: any = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': title,
      'description': seoDescription || '',
      'datePublished': new Date(this.post.createdAt).toISOString(),
      'dateModified': new Date(this.post.updatedAt || this.post.createdAt).toISOString(),
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': 'https://www.prompthealth.ca' + canonicalPath
      },
      'isPartOf': {
        '@type': 'WebSite',
        'name': 'PromptHealth',
        'url': 'https://www.prompthealth.ca'
      },
      'author': {
        '@type': 'Person',
        'name': this.post.authorName || '',
        ...(this.post.authorSlug ? { 'url': 'https://www.prompthealth.ca/practitioners/' + this.post.authorSlug } : {})
      },
      ...(this.post.coverImage ? { 'image': this.post.coverImage } : {}),
      ...(this.post.isArticle && this.post.location ? { 'contentLocation': { '@type': 'Place', 'name': this.post.location } } : {}),
      'publisher': {
        '@type': 'Organization',
        'name': 'PromptHealth',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://www.prompthealth.ca/assets/img/prompthealth.png'
        }
      }
    };

    this._jsonLdService.setJsonLd([
      articleJsonLd,
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://www.prompthealth.ca'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Community',
            'item': 'https://www.prompthealth.ca/community'
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': title,
            'item': 'https://www.prompthealth.ca' + canonicalPath
          }
        ]
      }
    ]);
  }

  showReturnToAppIfNeeded() {
    const params = this._route.snapshot.queryParams;
    if(params.returnToApp) {
      this.showReturnToApp();
    }
  }

  showReturnToApp() {
    this.isReturnToAppShown = true;
    this._headerService.hideHeader();
  }

  hideReturnToApp() {
    this.isReturnToAppShown = false;
    this._headerService.showHeader();
  }
}
