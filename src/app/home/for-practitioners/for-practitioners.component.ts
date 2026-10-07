import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { JsonLdService } from 'src/app/shared/services/json-ld.service';
import { IFAQItem } from '../_elements/faq-item/faq-item.component';
import { OFFER_CATALOG_ITEMS, PAID_PLAN_FAQ } from '../_elements/offer/offer-copy';

@Component({
  selector: 'app-for-practitioners',
  templateUrl: './for-practitioners.component.html',
  styleUrls: ['./for-practitioners.component.scss'],
})
export class ForPractitionersComponent implements OnInit, OnDestroy {
  public features = features;
  public stats = stats;
  public testimonials = testimonials;
  public faqs = faqs;

  constructor(
    private _router: Router,
    private _uService: UniversalService,
    private _jsonLdService: JsonLdService,
  ) {}

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'List Your Practice & Get Discovered by Patients | PromptHealth',
      description:
        'Get discovered by patients on Google and AI search. List your practice for free, publish articles that link back to your website, and add weekly video ideas with PromptHealth Pro.',
      robots: 'index, follow',
    });

    this._jsonLdService.setJsonLd([
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'For Practitioners: List Your Practice on PromptHealth',
        description:
          'Join PromptHealth to get discovered by patients searching on Google and AI tools. List your wellness practice and grow your patient base.',
        url: 'https://www.prompthealth.ca/for-practitioners',
        isPartOf: {
          '@type': 'WebSite',
          name: 'PromptHealth',
          url: 'https://www.prompthealth.ca',
        },
        publisher: {
          '@type': 'Organization',
          name: 'PromptHealth',
          url: 'https://www.prompthealth.ca',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.prompthealth.ca/assets/img/prompthealth.png',
            width: 800,
            height: 350,
          },
        },
        about: {
          '@type': 'MedicalBusiness',
          name: 'PromptHealth',
          description:
            'A wellness discovery platform connecting patients with trusted healthcare providers through content, video, and AI search.',
          url: 'https://www.prompthealth.ca',
          areaServed: [
            { '@type': 'City', name: 'Toronto' },
            { '@type': 'City', name: 'Vancouver' },
            { '@type': 'City', name: 'Calgary' },
            { '@type': 'City', name: 'Victoria' },
            { '@type': 'City', name: 'Winnipeg' },
          ],
          serviceType: [
            'Health Provider Directory',
            'Medical Practice Marketing',
            'Healthcare SEO',
            'AI Search Optimization',
          ],
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Practitioner Plans',
            itemListElement: OFFER_CATALOG_ITEMS,
          },
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a.replace(/<[^>]*>/g, ''),
          },
        })),
      },
    ]);
  }

  ngOnDestroy(): void {
    this._jsonLdService.removeJsonLd();
  }
}

const features = [
  {
    icon: 'search',
    title: 'Get Found on Google & AI Search',
    description:
      'Patients are searching Google and asking ChatGPT for provider recommendations. PromptHealth optimizes your profile and content so you appear in both.',
  },
  {
    icon: 'video-library',
    title: 'Video That Builds Trust',
    description:
      'Learn to make your own videos with PromptHealth Pro, or let us film and produce them for you with PromptHealth Growth. Growth videos are also shared with PromptHealth\'s 21,000+ Instagram followers.',
  },
  {
    icon: 'file',
    title: 'Articles That Help You Get Found',
    description:
      'Publish articles on PromptHealth with a link back to your website, focused on what patients in your specialty are searching for.',
  },
  {
    icon: 'chart-bar',
    title: 'Data-Driven Visibility',
    description:
      'Track your performance with insights on profile views, content engagement, and patient inquiries, so you know what\'s working.',
  },
  {
    icon: 'user-check-outline',
    title: 'Trusted Provider Network',
    description:
      'Join a curated network of vetted wellness professionals. Being part of PromptHealth signals credibility to patients and AI systems alike.',
  },
  {
    icon: 'link-1',
    title: 'Internal Linking & Cross-Promotion',
    description:
      'Benefit from strategic internal linking across high-intent pages, boosting your domain authority and search rankings.',
  },
];

const stats = [
  /* Hedieh, 2026-10-04 (offer v2, 13.2): replaces "1M+ Social Followers". */
  { value: '400+', label: 'Videos Produced' },
  /* Hedieh's figures (2026-09-27), the same as the homepage's; change both
   * together. 600+ counts practitioner and clinic accounts (631 then), which is
   * why it no longer says verified: 442 of them were approved and listed. */
  { value: '600+', label: 'Practitioners' },
  { value: '20', label: 'Cities' },
  { value: '50+', label: 'Health Categories' },
];

const testimonials = [
  {
    name: 'Move Health',
    location: 'Surrey, BC',
    quote:
      'We are beyond pleased with our decision to partner with Prompt Health. Their innovative approach to matching patients with health providers has helped accelerate our multi-disciplinary wellness business.',
  },
  {
    name: 'Connect Health',
    location: 'Vancouver, BC',
    quote:
      'Prompt Health has helped us immensely with our social media marketing while our team has been busy focusing on patient care.',
  },
  {
    name: 'Nourishme',
    location: 'Vancouver, BC',
    quote:
      'Prompt Health is a wonderful health tool to connect people with integrative and functional practitioners. We are excited to collaborate with them!',
  },
];

const faqs: IFAQItem[] = [
  {
    q: 'How does PromptHealth help my practice get found online?',
    a: 'Your PromptHealth profile and the articles you publish give patients more ways to find you on Google, ChatGPT and other AI tools. Each article links back to your website. For more visibility, <a href="/pro">PromptHealth Pro</a> helps your team create videos and posts every week, and <a href="/for-dentists">PromptHealth Growth</a> films and produces them for you.',
    opened: false,
  },
  /* A copy, not the shared object: faq-item writes `opened` onto what it is
   * given, and /faq carries the same question. */
  {
    q: PAID_PLAN_FAQ.q,
    a: PAID_PLAN_FAQ.aHtml,
    opened: false,
  },
  {
    q: 'Do I need to create content myself?',
    a: 'With PromptHealth Basic and Pro, your team creates the content, and we give you the tools, training and ideas. With PromptHealth Growth, we film and produce it for you.',
    opened: false,
  },
  {
    q: 'How is this different from other provider directories?',
    a: 'Most directories are passive listings. On PromptHealth you also publish articles that link back to your website and help patients find you on Google and AI search. With PromptHealth Pro or Growth, you add video that builds trust before patients book.',
    opened: false,
  },
  {
    q: 'What types of practitioners can join?',
    a: 'PromptHealth welcomes all licensed wellness and healthcare providers, including naturopaths, chiropractors, physiotherapists, psychologists, dentists, nutritionists, acupuncturists, and more. We cover 50+ wellness categories.',
    opened: false,
  },
  {
    q: 'How long before I see results?',
    a: 'Free profiles are visible immediately.',
    opened: false,
  },
  {
    q: 'Can I track my performance?',
    a: 'Yes. All providers have access to profile analytics including views, engagement metrics, and content performance.',
    opened: false,
  },
];
