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
    a: `PromptHealth is an online platform revolutionizing the health and wellness experience. It started off as a two-sided marketplace where people could personalize their search options and connect with different provider types proven to help with a specific cause. Now, with the help of our network of providers and further technology development, PromptHealth is on track to be the go-to social app and site to provide people with the educational resources they need to make informed decisions about their health, in an engaging format. PromptHealth acts as a ‘personal assistant’ that takes the challenge out of accessing and navigating the care you need.`,
    opened: false,
  },
  {
    q: 'How does PromptHealth work?', 
    a: `You can navigate PromptHealth based on your need or goal. You can search, compare options, learn from different options provided based on preferences, and ultimately connect and book with a provider fully informed. 
      <br><br>
      Navigating the site and learning from different providers is easy to do with no login required. The only time you need to sign up is at the time of booking on the site or when using the app. `,
    opened: false,
  },
  {
    q: 'How do I find a providers?', 
    a: `PromptHealth has a number of ways for you to find the right wellness provider. 
      <ol>
        <li>You can simply scroll through and browse the providers listed on the marketplace based on location or virtual options.There are additional filters that help you narrow down your search. </li>
        <li>You can start with the search bar and type in a providers type (e.g. chiropractor), condition (e.g. back pain), or search a specific provider (e.g. John Smith). You can also type in your zip code to refine searches to your general area. </li>
        <li>If you need a little more assistance, you can use the personal match to help you filter options based on your specific needs. </li>
      </ol>`,
    opened: false,
  },
  {
    q: 'How can I learn more about each service?', 
    a: 'We are the first social platform in health and wellness that enables providers to create educational content in different formats so you can keep coming back to learn from them. You can follow different providers based on the category that you are most interested in (e.g. mental health) and receive notification every time a new health information is shared in that category. This allows you to learn about the topics of your interest in whatever format you prefer such as voice, text, picture or video. You can learn more about the providers and eventually connect with them when needed.',
    opened: false,
  },
  {
    q: 'How do I book a provider?', 
    a: 'Once you’ve found your provider out of the options you are provided, you can either directly book with them if they already have a direct booking system, or use our request booking form if they do not have a booking system. The payment process is handled by each provider directly as per their policy.',
    opened: false,
  },
  {
    q: 'Do I need to enter any personal health information in?',
    a: 'No. We do not require users to enter in any personal health information. Our personal match option that helps users filter care options asks for some basic demographic information but it is not mandatory.',
    opened: false,
  },

  {
    q: 'Can I leave a review for a wellness provider?',
    a: 'Yes, however reviews can only be left once you have booked and completed an appointment with the provider via PromptHealth. After this, you can go to your dashboard and rate your experience.',
    opened: false,
  },
  {
    q: 'How does PromptHealth verify its providers?',
    a: 'We have done our due diligence by doing a qualitative review on each provider upon sign up to ensure credibility of information provided. The providers with a verified badge in the form of a blue check mark beside their names have provided proof of their certification.',
    opened: false,
  },
  {
    q: 'I want my search to be even more personalized, but don’t see a filter that applies. What can I do?',
    a: `If you have suggestions for new filters to help improve your search further, or you have a wish list, please contact us at 
    <a href="mailto:info@prompthealth.ca">info@prompthealth.ca</a>. 
    We would love your feedback and always strive to improve our platform to offer what you need. `,
    opened: false,
  },


]
