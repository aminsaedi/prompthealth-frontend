import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { UniversalService } from "src/app/shared/services/universal.service";
import { smoothHorizontalScrolling } from "src/app/_helpers/smooth-scroll";

@Component({
  selector: "app-testimonial",
  templateUrl: "./testimonial.component.html",
  styleUrls: ["./testimonial.component.scss"],
})
export class TestimonialComponent implements OnInit {
  public testimonials = testimonials;
  @ViewChild("testimonialsContainer") private testimonialsContainer: ElementRef;

  constructor(private _uService: UniversalService, private _router: Router) {}

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: "Testimonials about PromptHealth",
      robots: "index, follow",
    });
  }

  scrollNext() {
    const el: HTMLElement = this.testimonialsContainer.nativeElement;
    if (el) {
      const w = el.clientWidth;
      const l = el.scrollLeft;
      const currentIndex = Math.floor(l / w);
      const amount = (currentIndex + 1) * w - l;
      smoothHorizontalScrolling(el, 160, amount, l);
    }
  }
  scrollPrev() {
    const el: HTMLElement = this.testimonialsContainer.nativeElement;
    if (el) {
      const w = el.clientWidth;
      const l = el.scrollLeft;
      const currentIndex = Math.ceil(l / w);
      const amount = (currentIndex - 1) * w - l;
      smoothHorizontalScrolling(el, 160, amount, l);
    }
  }
}

const testimonials = [
  {
    name: "Move Health",
    location: "Surrey, BC",
    profileId: "60074ebd998cd73c49680be9",
    image: "/assets/img/testimonial/movehealth.png",
    body: "We are beyond pleased with our decision to partner with Prompt Health.  Their innovative approach to matching patients with health providers has helped accelerate our multi-disciplinary wellness business.",
    link: "https://www.movehealthandwellness.com/",
    // numFollowers: 981,
    // numPosts: 96,
    // rating: 5,
  },
  {
    name: "Connect Health",
    location: "Vancouver, BC",
    profileId: "6047dc101c38b73a74c11e51",
    image: "/assets/img/testimonial/connecthealth.png",
    body: "Prompt Health has helped us immensely with our social media marketing while our team has been busy focusing on patient care. We really appreciate their help and all they have assisted us with since joining. -The Connect Health Team.",
    link: "https://www.connecthealthcare.ca",
  },
  {
    name: "Nourishme",
    location: "Vancouver, BC",
    profileId: "60954a833f3c8b158749d053",
    image: "/assets/img/testimonial/nourishme.png",
    body: "Prompt Health is a wonderful health tool to connect people with integrative and functional practitioners. We are excited to collaborate with them!",
    link: "https://nourishme.ca",
  },
  {
    name: "Daniella Le Gresley",
    location: "",
    profileId: "615e05f08571d6108c04d149",
    image:
      "https://prompt-images.s3.us-east-2.amazonaws.com/350x220/users/1634226972706aZVx-hyper-acceleratortm-elevator-pitch-practice_oct-13-2021.jpg?ver=2.3",
    body: "It warms my heart to know that technology is being designed to reimagine the wellness journey and create safe spaces for different practitioners to connect, learn and share",
    link: "https://www.instagram.com/laughwithdani/",
  },
  {
    name: "Jennifer Vauthrin",
    location: "",
    profileId: "6153b3f412bf5f047dab68ed",
    image:
      "https://prompt-images.s3.us-east-2.amazonaws.com/350x220/users/1634169533656FQld-28fe2887-e035-48da-94a0-ce0003177190.jpeg?ver=2.3",
    body: "You have done an amazing job of bringing all of us together to create a community that will bring health and happiness, growth and tools to others lives, that so deserve it.",
    link: "https://www.soulutionscounselling.com/",
  },
  {
    name: "Noura S.",
    location: "RD",
    profileId: "608c1e0d20f3fd2919048d1e",
    image:
      "https://prompt-images.s3.us-east-2.amazonaws.com/350x220/users/1633798125797Zhr0-13173077_895334293945532_6260969973580948853_o.jpg?ver=2.3",
    body: "It is an innovative idea that brings health care professionals that brings information they have in their area of practice. For example, hormonal health and those who are interested in learning more and finding help.",
    link: "https://nourishwithnoura.com/",
  },
  {
    name: "Beth Campbell Duke",
    location: "Navigating healthcare",
    profileId: "60ac2184367eda615047efe3",
    image:
      "https://prompt-images.s3.us-east-2.amazonaws.com/350x220/users/1621893535938Jslh-resized-navigating-healthcare-png-copy.png?ver=2.3",
    body: "Counselling, physiotherapist or programs that physicians may not know about. Patients needs to know their resources and doing their own research. Having something like PromptHealth takes alot of the weight off the shoulder of the patient doing the search by themselves.",
    link: "https://navigatinghealthcare.ca/",
  },
  {
    name: "Ali Farahani",
    location: "PHD, MD",
    profileId: "",
    image: "",
    body: "I just downloaded your app and was extremely impressed. I can completely see how this could be so helpful for so many people. Excited to see as this evolves.",
    link: "",
  },
  {
    name: "Tony Hui",
    location: "",
    profileId: "",
    image: "",
    body: "There are very good clinicians out there, but don't necessarily come with the ample background to showcase themselves in this digital age. Thanks to this platform, I can see new hopes in the horizon.",
    link: "",
  },
  {
    name: "Coach Chappy",
    location: "",
    profileId: "",
    image: "",
    body: "PromptHealth is the one that connects you to the healthcare and counselling needs that you may have when you experience something like what I went through with cancer recovery.",
    link: "",
  },
  // {
  //   name: '',
  //   location: '',
  //   profileId: '',
  //   image: '',
  //   body: '',
  //   link: '',
  // },
];
