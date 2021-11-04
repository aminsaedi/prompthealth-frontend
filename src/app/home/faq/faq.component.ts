import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { IFAQItem } from '../_elements/faq-item/faq-item.component';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FAQComponent implements OnInit {

  public faqs = faqs;

  constructor(
    private _router: Router,
    private _uService: UniversalService,  
  ) { }

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'Frequently Asked Questions (FAQ) | PromptHealth',
      description: 'Here are some of the most frequently asked questions we get about PromptHealth.'
    });
  }
}

const faqs: IFAQItem[] = [
  {
    q: 'What is PromptHealth?', 
    a: `PromptHealth is an online platform created to assist people navigate their health journey by providing education on holistic wellness solutions. Providers listed with us post trusted content to educate the community on their services and field, allowing the community to make informed decisions about their health. People looking for care options can easily sort through providers who offer services that may help them using personalized filters, or by answering our personal match questionnaire. To further emphasize an integrative approach and truly create an all-in-one wellness navigator, we also list different wellness products and services that may assist providers with their service goals or provide supplementary solutions to wellness seekers.`,
    opened: false,
  },
  {
    q: 'How does PromptHealth work?', 
    a: `Wellness seekers can navigate PromptHealth based on their wellness needs or goals. By using our filters or personal match questionnaire, you can search and compare options, learn about specific services and wellness topics directly from providers, and ultimately connect with and book with a provider with confidence that you have been fully informed on your options. Wellness seekers are not required to sign-up for an account to explore the platform. However, to connect and book with a provider, an account will be required so you can keep track of your appointments.`,
    opened: false,
  },
  {
    q: 'How do I find a provider?', 
    a: `PromptHealth has 3 ways for you to find the right wellness provider:
      <ul>
        <li>Simply scroll through and browse the listed providers based on your location or explore virtual options, and apply personalized filters to narrow down your search.</li>
        <li>Start with the search bar and type in a provider type (e.g. chiropractor), condition (e.g. back pain), or search up a provider by name if you already know who you are looking for. (e.g. John Smith). Type in your postal code to refine searches to your region.</li>
        <li>Use our personal match questionnaire to help filter your wellness options based on specific needs.</li>
      </ul>
    `,
    opened: false,
  },
  {
    q: 'How can I learn more about each service?', 
    a: 'We are the first health and wellness platform that enables providers to create educational content in a social format, allowing the community to easily learn about health topics directly from experts. A benefit of signing-up for an account is that you can follow different provider profiles based on categories you are most interested in (e.g. mental health) and receive notifications every time a new post is shared by a provider in that category. This allows you to easily access content that interests you in formats that you find easiest to learn from, including voice memos, quick text notes, images, articles/blogs, and even events. After learning about a provider and what they offer through their profile, you can then connect with them directly to request an appointment.',
    opened: false,
  },
  {
    q: 'How do I book a provider?', 
    a: 'Once you have  found a  provider that fits your personal needs out of the options provided, you can either directly book with them if they have connected an existing booking system,  or use our booking form to request an appointment. You can easily keep track of requested appointments, and even see when the provider has opened your request. The appointment payment process is handled by each provider directly as per their policy.',
    opened: false,
  },
  {
    q: 'Do I need to enter any personal health information in?',
    a: 'No, we do not collect any sensitive personal health  information. At the time of sign-up, we require basic information such as your name, email address, and phone number. When navigating the platform, you may be asked for some basic demographic information depending on the type of search option you use including gender, age range and health background, but this information is not mandatory.',
    opened: false,
  },

  {
    q: 'How does PromptHealth verify its providers?',
    a: `Our team works hard to take due diligence by performing qualitative reviews on each provider before they are listed on our platform to ensure the credibility of information provided by them. Providers with verified badges in the form of a blue check mark beside their profile names have provided proof of certification. Any providers who are found to have provided false information will be immediately removed and banned from our platform. To further promote trust amongst providers who are listed with us, each provider has an authentic recommendation section on their profile, where other providers can leave recommendations for them. 
      <br><br>
      Although this review process is carefully conducted, we cannot guarantee the qualification information provided and cannot be responsible for false information.
    `,    
    opened: false,
  },
  {
    q: 'I want my search to be even more personalized, but don’t see a filter that applies. What can I do?',
    a: `If you have suggestions for new filters to help improve your search further, or you have a wish list, please contact us at <a href="mailto:info@prompthealth.ca">info@prompthealth.ca</a>. We would love your feedback and always strive to improve our platform to offer what you need.`,
    opened: false,
  },
]
