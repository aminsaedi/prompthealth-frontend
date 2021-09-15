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
    q: 'How are you different from a regular directory?', 
    a: `Unlike regular directories, we don’t assume that people know what providers to search for, and what they all do. Instead, we start from a person’s individual needs and show them all of the options. Our search filters allow people to narrow their search based on preferences such as gender, age speciality, language, location, virtual care, and more. 
    <br><br>
    Further, people are able to learn about each practitioner by the content they post on their profile.  Before booking with a practitioner, our users can learn about their area of interest, and follow them to get notified every time a new post is created. This allows our users to make informed decisions about their care, and book with someone they truly trust and feel comfortable with.`,
    opened: false,
  },
  {
    q: 'I am a health and wellness seeker. How does it work?', 
    a: `After making a free account, you can search, compare options, learn from different options provided based on preferences, and ultimately connect and book with a provider fully informed.
    <br><br>
    Navigating the site and learning from different practitioners is easy to do with no login required. The only time the health seeker needs to sign up is at the time of booking on the site or when using the app.`,
    opened: false,
  },
  {
    q: 'I am a health and wellness practitioner. How does it work?', 
    a: 'After signing up by email, or by connecting your Facebook or Google account, you will be asked a series of questions to help us understand your background and specialities. This allows us to ensure you are listed under all of our relevant categories, and will show up when a user is searching for solutions to a particular concern./nAfter setting up your account, you will be listed in our system, have access to our educational content creation tools to help you market yourself better, and ultimately will get matched with new clients.', 
    opened: false,
  },
  {
    q: 'How much does it cost?', 
    a: 'PromptHealth is completely free for the health seekers. Practitioners have the option of creating a free account, with different subscription options available on the pricing page.',
    opened: false,
  },
  {
    q: 'Do I need to enter any personal health information in?', 
    a: 'No. We do not require users to enter in any personal health information. Our personal match option that helps users filter care options asks for some basic demographic information, but we do not collect any health information.',
    opened: false,
  },
  {
    q: 'I want my search to be even more personalized, but don’t see a filter that applies. What can I do? ', 
    a: 'If you have suggestions for new filters to help improve your search further, or you have a wish list, please contact us at <a href="mailto:info@prompthealthca">info@prompthealthca</a>. We would love your feedback and always strive to improve our platform to offer what you need.',
    opened: false,
  },


]
