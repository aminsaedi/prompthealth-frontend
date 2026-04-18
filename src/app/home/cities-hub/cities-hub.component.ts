import { Component, OnInit, OnDestroy } from '@angular/core';
import { locationsNested } from 'src/app/_helpers/location-data';
import { IFormItemSearchData } from 'src/app/models/form-item-search-data';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { JsonLdService } from 'src/app/shared/services/json-ld.service';

@Component({
  selector: 'app-cities-hub',
  templateUrl: './cities-hub.component.html',
  styleUrls: ['./cities-hub.component.scss'],
})
export class CitiesHubComponent implements OnInit, OnDestroy {
  public provinces: IFormItemSearchData[] = locationsNested;

  constructor(
    private _uService: UniversalService,
    private _jsonLdService: JsonLdService,
  ) {}

  ngOnInit(): void {
    this._uService.setMeta('/practitioners/cities', {
      title: 'Browse Healthcare Providers by City | PromptHealth',
      description: 'Find top-rated healthcare providers across Canada. Browse practitioners by city including Vancouver, Toronto, Calgary, Edmonton, Ottawa, and more.',
    });

    this.setJsonLd();
  }

  ngOnDestroy(): void {
    this._jsonLdService.removeJsonLd();
  }

  private setJsonLd(): void {
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.prompthealth.ca' },
        { '@type': 'ListItem', 'position': 2, 'name': 'Find Practitioners', 'item': 'https://www.prompthealth.ca/practitioners' },
        { '@type': 'ListItem', 'position': 3, 'name': 'Browse by City', 'item': 'https://www.prompthealth.ca/practitioners/cities' },
      ],
    };

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'How do I find a healthcare provider in my city?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Use PromptHealth\'s city directory to browse healthcare providers by location. Select your city from the list to see top-rated practitioners available for in-person or virtual appointments in your area.',
          },
        },
        {
          '@type': 'Question',
          'name': 'Which cities does PromptHealth serve?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'PromptHealth lists healthcare providers across major cities in every Canadian province, including Toronto, Vancouver, Calgary, Edmonton, Ottawa, Montreal, Winnipeg, Halifax, and many more. Browse the full list on this page to find your city.',
          },
        },
        {
          '@type': 'Question',
          'name': 'Can I filter practitioners by specialty in my city?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes. After selecting your city, you can use the Expert Finder to filter practitioners by specialty, type of provider, ratings, availability, and whether they offer virtual consultations.',
          },
        },
        {
          '@type': 'Question',
          'name': 'Are PromptHealth practitioners accepting new patients?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Many practitioners listed on PromptHealth are accepting new patients. You can check individual provider profiles for current availability and book appointments directly through the platform.',
          },
        },
        {
          '@type': 'Question',
          'name': 'How do I book an appointment through PromptHealth?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Find a provider in your city, view their profile to check availability and services, and book an appointment directly through PromptHealth. Many providers offer both in-person and virtual consultation options.',
          },
        },
      ],
    };

    this._jsonLdService.setJsonLd([breadcrumbSchema, faqSchema]);
  }
}
