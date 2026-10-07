import { Component, OnInit , OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IGetSocialContentResult, IGetSocialContentsResult } from 'src/app/models/response-data';
import { ISocialPost } from 'src/app/models/social-post';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService, canonicalPathOf } from 'src/app/shared/services/universal.service';
import { formatDateToString } from 'src/app/_helpers/date-formatter';
import { slugify } from 'src/app/_helpers/slugify';
import { directoryCityOf } from 'src/app/_helpers/location-data';
import { isIndexableCityCategory } from 'src/app/_helpers/indexable-combos';
import { CategoryService } from 'src/app/shared/services/category.service';
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


  public post: ISocialPost;
  private postId: string;
  private _isSlugRoute: boolean = false;

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
    private _jsonLdService: JsonLdService,
    private _journey: JourneyService,
    private _catService: CategoryService,
  ) { }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this._jsonLdService.removeJsonLd();
  }

  ngOnInit(): void {
    this._route.params.subscribe((param: {postid?: string, slug?: string}) => {
      const routeType = this._route.snapshot.data?.routeType;
      this.postId = routeType === 'slug' ? param.slug : param.postid;
      this._isSlugRoute = routeType === 'slug';
      this.initPost();
    });
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

  /* Links into the directory, only to pages that exist as a filtered listing.
   * An unknown city or category slug is served as the whole unfiltered
   * directory, so a link built from free text pointed crawlers at hundreds of
   * copies of /practitioners: 38 live articles store "City, BC", and the one
   * blog category in use, "knowledge", is not a directory category at all. */
  async buildDirectoryLinks() {
    const post = this.post;
    this.relatedDirectoryLinks = [];
    const city = directoryCityOf(post.location);
    const category = await this.directoryCategoryOf(post.categoryId);
    if (this.post !== post) { return; }

    const links: {url: string, label: string}[] = [];
    if (category) {
      links.push({
        url: `/practitioners/category/${category.slug}`,
        label: `Browse ${category.title} Practitioners`
      });
    }
    if (city) {
      links.push({
        url: `/practitioners/area/${city.id}`,
        label: `Find Practitioners in ${city.label}`
      });
    }
    /* Only an intersection the directory lets search engines index; the rest
     * answer noindex, and a link to them from every article is wasted. */
    if (category && city && isIndexableCityCategory(city.id, category.slug)) {
      links.push({
        url: `/practitioners/area/${city.id}/category/${category.slug}`,
        label: `Find ${category.title} Practitioners in ${city.label}`
      });
    }
    this.relatedDirectoryLinks = links;
  }

  /* The blog's category, when the directory has a category of the same slug.
   * The two are different lists: blog categories are their own collection,
   * directory categories are the questionnaire's goals, matched by
   * slugify(item_text) exactly as the directory page resolves its route.
   * Asks for the list only when there is a slug to look up. */
  private async directoryCategoryOf(cat: any): Promise<{slug: string, title: string} | null> {
    const slug = cat && typeof cat == 'object' ? cat.slug : null;
    if (!slug) { return null; }
    await this._catService.getCategoryAsync();
    const match = this._catService.categoryListFlatten.find(c => c && slugify(c.item_text) === slug);
    return match ? { slug, title: match.item_text } : null;
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

    /* An author's meta title is written as the whole search result title, up
     * to 70 characters and usually with its own byline, so it goes out as is.
     * The fallback is the post's own title with the site's suffix. */
    const metaTitle = this.post.isArticle ? (this.post.metaTitle || '').trim() : '';
    const metaDescription = this.post.isArticle ? (this.post.metaDescription || '').trim() : '';
    const seoTitle = metaTitle || (title + ' | PromptHealth Community');
    const seoDescription = metaDescription || this.post.summary;
    const city = this.post.isArticle ? directoryCityOf(this.post.location) : null;

    /* Cleaned here as well as in setMeta, because the Article @id and the
     * breadcrumb below are built from it directly. */
    const canonicalPath = (this.post.isArticle && this.post.slug && !this._isSlugRoute)
      ? '/community/article/' + this.post.slug
      : canonicalPathOf(this._router.url);

    /* Only a picture the post really has. Without one, setMeta shares the
     * site's own card rather than the wordmark the feed shows in its place. */
    const shareImage = this.post.shareImage;
    this._uService.setMeta(canonicalPath, {
      title: seoTitle,
      description: seoDescription,
      pageType: 'article',
      ...(shareImage ? { image: shareImage, imageAlt: title } : {}),
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
      'image': shareImage || 'https://www.prompthealth.ca/assets/img/prompthealth.png',
      /* Only a city the directory knows, named the same way everywhere,
       * rather than whatever the author typed. */
      ...(city ? { 'contentLocation': {
        '@type': 'Place',
        'name': city.province ? `${city.label}, ${city.province}` : city.label,
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': city.label,
          ...(city.province ? { 'addressRegion': city.province } : {}),
          'addressCountry': 'CA',
        },
      } } : {}),
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
      (this.post.isEvent && this.eventJsonLdOf(articleJsonLd)) || articleJsonLd,
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

  /* An event described as an Event, from the post itself: its dates exactly
   * and in UTC, and the place or link it gives. server-wrapper.js used to make
   * this by scraping the rendered page for the first date, venue and Register
   * link it met, which could be text the author wrote into the title or the
   * summary in the head, and a date that was not one threw and left the
   * request unanswered.
   *
   * Only an Event a search engine can use: it needs a start, and a place, which
   * for an online event is the address to join it. Without them the page keeps
   * its Article, which is valid, rather than an Event that Search Console
   * reports as broken. */
  private eventJsonLdOf(article: any): any {
    const post = this.post;
    const start = post.startAt;
    if (!start || isNaN(start.getTime())) {
      return null;
    }

    let location: any;
    if (post.isVirtual) {
      if (!/^https?:\/\//i.test(post.link || '')) {
        return null;
      }
      location = { '@type': 'VirtualLocation', 'url': post.link };
    } else {
      const address = (post.venue || '').trim();
      if (!address) {
        return null;
      }
      location = { '@type': 'Place', 'name': address, 'address': address };
    }

    const end = post.endAt;
    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      'name': article.headline,
      'description': article.description,
      'url': article.mainEntityOfPage['@id'],
      'image': article.image,
      'startDate': start.toISOString(),
      ...(end && !isNaN(end.getTime()) && end.getTime() >= start.getTime() ? { 'endDate': end.toISOString() } : {}),
      'eventAttendanceMode': post.isVirtual ? 'https://schema.org/OnlineEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
      'location': location,
      'organizer': article.author,
    };
  }
}
