import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { JsonLdService } from 'src/app/shared/services/json-ld.service';
import { IFAQItem } from '../_elements/faq-item/faq-item.component';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FAQComponent implements OnInit, OnDestroy {

  public faqGroups = faqGroups;

  constructor(
    private _router: Router,
    private _uService: UniversalService,
    private _jsonLdService: JsonLdService,
  ) { }

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'Frequently Asked Questions (FAQ) | PromptHealth',
      description: 'Here are some of the most frequently asked questions we get about PromptHealth.'
    });

    const allFaqs = faqGroups.reduce<IFAQItem[]>((acc, g) => acc.concat(g.items), []);
    this._jsonLdService.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: allFaqs.map(faq => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    });
  }

  ngOnDestroy(): void {
    this._jsonLdService.removeJsonLd();
  }
}

const faqGroups: { category: string; items: IFAQItem[] }[] = [
  {
    category: 'General Questions',
    items: [
      {
        q: 'What is PromptHealth?',
        a: 'PromptHealth is an AI-powered healthcare discovery platform that helps patients find trusted healthcare professionals and helps providers become more discoverable online. Unlike traditional directories, PromptHealth allows healthcare professionals to publish educational content such as articles and videos, helping them build authority and improve visibility in modern search environments — including AI-powered tools. Patients can search for services, watch educational videos, read expert content, and connect with healthcare providers who share helpful information about treatments and care options.',
        opened: false,
        category: 'General Questions',
      },
      {
        q: 'How is PromptHealth different from traditional directories?',
        a: 'Traditional directories list providers. PromptHealth helps providers build authority and visibility. Instead of only showing names and contact details, PromptHealth allows healthcare professionals to publish educational articles, share expert videos, build searchable authority profiles, increase visibility in AI-powered searches, and reach patients before they book care. This makes PromptHealth both a discovery platform and a visibility engine.',
        opened: false,
        category: 'General Questions',
      },
    ],
  },
  {
    category: 'For Patients',
    items: [
      {
        q: 'How do I find a healthcare provider?',
        a: 'You can search on PromptHealth by service (example: dental implants, physiotherapy, nutrition), location, specialty, or symptoms/treatment needs. You can also watch educational videos, read expert articles, learn about treatment options, and connect directly with providers. PromptHealth helps patients make informed decisions before booking care.',
        opened: false,
        category: 'For Patients',
      },
      {
        q: 'Can I book appointments through PromptHealth?',
        a: 'Some providers offer direct booking options. Others provide contact details so patients can connect with the clinic directly. Booking options vary depending on the provider.',
        opened: false,
        category: 'For Patients',
      },
      {
        q: 'Is the information on PromptHealth trustworthy?',
        a: 'Yes. Healthcare professionals on PromptHealth are responsible for providing accurate, professional information based on their training and clinical experience. Educational content is designed to help patients better understand their options and make informed healthcare decisions.',
        opened: false,
        category: 'For Patients',
      },
    ],
  },
  {
    category: 'For Healthcare Professionals',
    items: [
      {
        q: 'Why should I join PromptHealth?',
        a: 'PromptHealth helps healthcare professionals become discoverable where patients are searching today — including search engines, video platforms, and AI-powered search tools. By publishing educational content, professionals can increase online visibility, build authority in their field, educate patients, attract new patients, and stay competitive in digital healthcare discovery.',
        opened: false,
        category: 'For Healthcare Professionals',
      },
      {
        q: 'Is it free to join PromptHealth?',
        a: 'Yes. Healthcare professionals can create a free listing, which includes basic profile, services offered, location details, and contact information. This allows patients to discover your practice and learn about your services.',
        opened: false,
        category: 'For Healthcare Professionals',
      },
      {
        q: 'What is the Authority Visibility Tier?',
        a: 'The Authority Visibility Tier is designed for professionals who want to significantly increase their online visibility and authority. This premium option may include educational article publishing, video integration, SEO optimization, AI discovery optimization, priority profile placement, and authority-building content support.',
        opened: false,
        category: 'For Healthcare Professionals',
      },
      {
        q: 'How does PromptHealth help with AI visibility?',
        a: 'PromptHealth creates structured, searchable content that modern search engines and AI tools can understand. This includes educational articles, embedded expert videos, optimized provider profiles, and organized healthcare topics. These elements improve visibility in AI-generated search results, conversational search tools, voice search platforms, and modern search engines.',
        opened: false,
        category: 'For Healthcare Professionals',
      },
      {
        q: 'Do I need to create my own content?',
        a: 'Not necessarily. PromptHealth can support content creation by helping providers publish educational articles, treatment explanations, frequently asked question content, and video-based educational material. Many providers begin with simple educational topics and expand their content over time.',
        opened: false,
        category: 'For Healthcare Professionals',
      },
    ],
  },
  {
    category: 'AI Video & Content Creation',
    items: [
      {
        q: 'Can I create videos without filming every time?',
        a: 'Yes. PromptHealth offers AI Clone Video options, allowing healthcare professionals to create educational videos efficiently without repeated filming. AI Clone videos use your voice and likeness to generate professional educational content based on common patient questions and treatment topics.',
        opened: false,
        category: 'AI Video & Content Creation',
      },
      {
        q: 'Do AI Clone videos replace traditional filming?',
        a: 'No. AI Clone videos are designed to complement traditional filming, not replace it. Many professionals use a hybrid approach that includes professional video shoots, AI-generated educational videos, short-form educational content, and article-based education.',
        opened: false,
        category: 'AI Video & Content Creation',
      },
      {
        q: 'What types of videos work best?',
        a: 'Educational videos that answer patient questions perform best. Examples include treatment explanations, procedure overviews, recovery expectations, preventive care tips, and common patient concerns.',
        opened: false,
        category: 'AI Video & Content Creation',
      },
    ],
  },
  {
    category: 'Content & Visibility',
    items: [
      {
        q: 'Why are articles important on PromptHealth?',
        a: 'Articles help answer patient questions and improve discoverability online. They also improve search visibility, help AI tools understand provider expertise, build authority in specific treatment areas, and support long-term discoverability.',
        opened: false,
        category: 'Content & Visibility',
      },
      {
        q: 'Why are videos important?',
        a: 'Videos help patients visually understand treatments and build trust with healthcare providers. They also increase engagement, improve discoverability, support AI search visibility, and enhance patient education.',
        opened: false,
        category: 'Content & Visibility',
      },
      {
        q: 'Can my content appear in AI search results?',
        a: 'Yes. PromptHealth content is structured to improve visibility in modern search environments, including AI-driven platforms. Publishing educational content increases the chances of appearing in AI-generated answers, topic-based searches, conversational search platforms, and knowledge-based discovery results.',
        opened: false,
        category: 'Content & Visibility',
      },
    ],
  },
  {
    category: 'Platform & Account Questions',
    items: [
      {
        q: 'How do I update my profile?',
        a: 'You can log into your account and update services, bio, contact details, credentials, and educational content. Keeping your profile current improves visibility and helps patients find accurate information.',
        opened: false,
        category: 'Platform & Account Questions',
      },
      {
        q: 'Who can join PromptHealth?',
        a: 'PromptHealth is designed for licensed and certified healthcare professionals, including dentists, physicians, physiotherapists, chiropractors, mental health professionals, nutrition specialists, wellness providers, and preventive healthcare professionals. Additional specialties are continuously added.',
        opened: false,
        category: 'Platform & Account Questions',
      },
      {
        q: 'How do I get started?',
        a: 'You can begin by creating a free profile on PromptHealth. From there, you can add your services, publish educational content, explore advanced visibility options, and start building your digital presence.',
        opened: false,
        category: 'Platform & Account Questions',
      },
    ],
  },
];
