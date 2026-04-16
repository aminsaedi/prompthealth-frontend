import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { JsonLdService } from 'src/app/shared/services/json-ld.service';
import { IFAQItem } from '../_elements/faq-item/faq-item.component';

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
        'Join PromptHealth to get discovered by patients on Google and AI search. List your wellness practice, build your online presence, and attract new patients through expert content and video.',
      robots: 'index, follow',
    });

    this._jsonLdService.setJsonLd([
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'For Practitioners — List Your Practice on PromptHealth',
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
            height: 600,
          },
        },
        about: {
          '@type': 'MedicalBusiness',
          name: 'PromptHealth',
          description:
            'A wellness discovery platform connecting patients with trusted healthcare providers through content, video, and AI search.',
          url: 'https://www.prompthealth.ca',
          priceRange: '$$',
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
            itemListElement: [
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'Free Provider Profile',
                  description:
                    'Basic provider listing with category placement and platform visibility.',
                },
              },
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'AI Visibility Plan',
                  description:
                    'SEO-optimized content, expert video production, keyword strategy, and ongoing visibility optimization.',
                },
              },
            ],
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
    title: 'Expert Video Content',
    description:
      'We produce professional video interviews shared across our YouTube, TikTok, and Instagram channels — reaching over 1 million health-conscious followers.',
  },
  {
    icon: 'file',
    title: 'SEO-Optimized Content Strategy',
    description:
      'Our team creates keyword-targeted articles and content based on what patients are actually searching for in your specialty.',
  },
  {
    icon: 'chart-bar',
    title: 'Data-Driven Visibility',
    description:
      'Track your performance with insights on profile views, content engagement, and patient inquiries — so you know what\'s working.',
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
  { value: '1M+', label: 'Social Followers' },
  { value: '500+', label: 'Verified Providers' },
  { value: '8', label: 'Cities Covered' },
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
    a: 'PromptHealth combines SEO-optimized content, expert video production, and AI search optimization to ensure your practice appears when patients search on Google, ChatGPT, and other AI tools. We create keyword-targeted content based on what patients in your specialty are actually searching for.',
    opened: false,
  },
  {
    q: 'What does it cost to list my practice?',
    a: 'We offer a <strong>free basic profile</strong> that lists your practice on PromptHealth. Our <strong>AI Visibility Program</strong> starts at $500/month and includes professional video content, SEO-optimized articles, keyword strategy, and placement on high-intent pages. <a href="/plans">View full pricing details</a>.',
    opened: false,
  },
  {
    q: 'Do I need to create content myself?',
    a: 'No — we handle everything. Our team conducts a professional video interview via Zoom, edits the content, and publishes it across our platforms including YouTube, TikTok, and Instagram. We also create written articles optimized for search.',
    opened: false,
  },
  {
    q: 'How is this different from other provider directories?',
    a: 'Most directories are passive listings. PromptHealth actively drives patient traffic to your profile through <strong>SEO content, video distribution, and AI search optimization</strong>. We don\'t just list you — we make sure patients find you.',
    opened: false,
  },
  {
    q: 'What types of practitioners can join?',
    a: 'PromptHealth welcomes all licensed wellness and healthcare providers — including naturopaths, chiropractors, physiotherapists, psychologists, dentists, nutritionists, acupuncturists, and more. We cover 50+ wellness categories.',
    opened: false,
  },
  {
    q: 'How long before I see results?',
    a: 'Free profiles are visible immediately. For the AI Visibility Program, most providers see measurable increases in profile views and patient inquiries within 4–8 weeks as content is indexed by search engines and AI tools.',
    opened: false,
  },
  {
    q: 'Can I track my performance?',
    a: 'Yes. All providers have access to profile analytics including views, engagement metrics, and content performance. AI Visibility Program members receive detailed monthly reports with insights and recommendations.',
    opened: false,
  },
];
