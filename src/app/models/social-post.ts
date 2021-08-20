import { SafeHtml } from "@angular/platform-browser";
import { environment } from "src/environments/environment";
import { Blog, IBlog } from "./blog";
import { IUserDetail } from "./user-detail";

export interface ISocialPost {
  _id: string;
  contentType: 'NOTE' | 'PROMO' | 'ARTICLE' | 'EVENT';
  authorId: string | IUserDetail;

  status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
  description?: string;
  descriptonSanitized?: SafeHtml;

  tags?: string[];

  createdAt: string;

  comments: ISocialComment[];
}

export class SocialPost implements ISocialPost {

  get _id() { return this.data._id; }
  get contentType() { return this.data.contentType; }
  get status() { return this.data.status || null; }

  get author() { return (this.data.authorId && typeof this.data.authorId != 'string') ? this.data.authorId.firstName : ''; } //author name
  get authorId(): string { return (typeof this.data.authorId == 'string') ? this.data.authorId : this.data.authorId ?  this.data.authorId._id : 'noid'; }
  get authorImage() { return (this.data.authorId && typeof this.data.authorId != 'string' && this.data.authorId.profileImage) ? this._s3 + '350x220/' + this.data.authorId.profileImage : 'assets/img/logo-sm-square.png'}
  get authorVerified() {return (this.data.authorId && typeof this.data.authorId != 'string' && this.data.authorId.verifiedBadge) ? true : false; }

  get description() { return this.data.description || ''; }
  get descriptionSanitized() { return this._description; }
  get summary() { return this._summary.substr(0, 256); }

  get tags() { return this.data.tags; }

  get createdAt() { return this.data.createdAt; }

  get isNote() { return this.contentType == 'NOTE'; }
  get isArticle() { return this.contentType == 'ARTICLE'; }
  get isEvent() { return this.contentType == 'EVENT'; }

  get isMoreShown() { return !!(this._summary.length > this.summary.length); }


  get comments() {
    return this._commentsDummy;
  };

  protected _s3 = environment.config.AWS_S3; 
  protected _summary: string;
  private _description: SafeHtml;

  _commentsDummy: SocialComment[];
  constructor(protected data: ISocialPost) {
    const desc = data.description || '';
    this._summary = desc.replace(/<\/?[^>]+(>|$)/g, '').replace(/\s{2,}/, " ");

    const comments = [];
    commentsDummy.forEach(c => {
      comments.push(new SocialComment(c));
    })

    this._commentsDummy = comments;
  }

  setSanitizedDescription(d: SafeHtml) {
    this._description = d;
  }
}

export interface ISocialComment {
  _id: string;
  content: string;
  like: number;
  userId?: string;
  user?: {
    _id: string;
    profileImage: string;
    firstName: string;
    lastName: string;
  }

  comments: ISocialComment[];
}


const commentsDummy: ISocialComment[] = [
  {
    _id: '1', 
    content: 'MA planning made restaurant dining the easier option. Celine Spino loves to cook and dine out.',
    like: 8,
    userId: 'user123',
    user: {
      _id: 'user123',
      profileImage: 'https://prompt-images-test.s3.us-east-2.amazonaws.com/users/1625868480702qwkD-edgar-castrejon-1csavdwfiew-unsplash.jpg?ver=1.0.2',
      firstName: 'Ida',
      lastName: 'Webb',
    },
    
    comments: [
      {
        _id: '2', 
        content: 'MA.',
        like: 2,
        userId: 'user123',
        user: {
          _id: 'user123',
          profileImage: 'https://prompt-images-test.s3.us-east-2.amazonaws.com/users/1625868480702qwkD-edgar-castrejon-1csavdwfiew-unsplash.jpg?ver=1.0.2',
          firstName: 'Ella',
          lastName: 'Mcbride',
        },
        
        comments: [{
          _id: '3', 
          content: 'MA and dine out.',
          like: 0,
          userId: 'user123',
          user: {
            _id: 'user123',
            profileImage: 'https://prompt-images-test.s3.us-east-2.amazonaws.com/users/1625868480702qwkD-edgar-castrejon-1csavdwfiew-unsplash.jpg?ver=1.0.2',
            firstName: 'Vanessa',
            lastName: 'Meyer',
          },
          comments: [],
        }],
      },
      {
        _id: '4', 
        content: 'Celine Spino loves to cook and dine out.',
        like: 6,
        userId: 'user123',
        user: {
          _id: 'user123',
          profileImage: 'https://prompt-images-test.s3.us-east-2.amazonaws.com/users/1625868480702qwkD-edgar-castrejon-1csavdwfiew-unsplash.jpg?ver=1.0.2',
          firstName: 'Norris',
          lastName: 'Hunter',
        },
        comments: [],
      }
    ]
  },
  {
    _id: '5', 
    content: 'MA planning made restaurant dine out.',
    like: 12,
    userId: 'user123',
    user: {
      _id: 'user123',
      profileImage: 'https://prompt-images-test.s3.us-east-2.amazonaws.com/users/1625868480702qwkD-edgar-castrejon-1csavdwfiew-unsplash.jpg?ver=1.0.2',
      firstName: 'Ollie',
      lastName: 'Fowler',
    },
    
    comments: [
      {
        _id: '6', 
        content: 'MA easier option. Celine Spino loves to cook and dine out.',
        like: 4,
        userId: 'user123',
        user: {
          _id: 'user123',
          profileImage: 'https://prompt-images-test.s3.us-east-2.amazonaws.com/users/1625868480702qwkD-edgar-castrejon-1csavdwfiew-unsplash.jpg?ver=1.0.2',
          firstName: 'Andrew',
          lastName: 'Lamb',
        },
        
        comments: [],
      },
      {
        _id: '7', 
        content: 'and dine out.',
        like: 53,
        userId: 'user123',
        user: {
          _id: 'user123',
          profileImage: 'https://prompt-images-test.s3.us-east-2.amazonaws.com/users/1625868480702qwkD-edgar-castrejon-1csavdwfiew-unsplash.jpg?ver=1.0.2',
          firstName: 'Beatrice',
          lastName: 'Menzie',
        },
        
        comments: [],
      }
    ]
  },
  {
    _id: '8', 
    content: 'MA planning made restaurant dining the easier option. Celine Spino loves to cook and dine out.',
    like: 53,
    userId: 'user123',
    user: {
      _id: 'user123',
      profileImage: 'https://prompt-images-test.s3.us-east-2.amazonaws.com/users/1625868480702qwkD-edgar-castrejon-1csavdwfiew-unsplash.jpg?ver=1.0.2',
      firstName: 'Daphne',
      lastName: 'Aguilar',
    },
    
    comments: [
      {
        _id: '9', 
        content: 'MA planning made restaurant dining the easier option. Celine Spino loves to cook and dine out.',
        like: 53,
        userId: 'user123',
        user: {
          _id: 'user123',
          profileImage: 'https://prompt-images-test.s3.us-east-2.amazonaws.com/users/1625868480702qwkD-edgar-castrejon-1csavdwfiew-unsplash.jpg?ver=1.0.2',
          firstName: 'Kayla',
          lastName: 'Oliver',
        },
        
        comments: [],
      },
      {
        _id: '10', 
        content: 'MA planning made restaurant dining the easier option. Celine Spino loves to cook and dine out.',
        like: 53,
        userId: 'user123',
        user: {
          _id: 'user123',
          profileImage: 'https://prompt-images-test.s3.us-east-2.amazonaws.com/users/1625868480702qwkD-edgar-castrejon-1csavdwfiew-unsplash.jpg?ver=1.0.2',
          firstName: 'Beatrice',
          lastName: 'Row',
        },
        
        comments: [],
      }
    ]
  }
];

class SocialComment implements ISocialComment {

  get _id() { return this.data._id; }
  get content() { return this.data.content; }
  get like() { return this.data.like; }
  get user() { return this.data.user || null; }
  get comments() { return this._comments; }

  get hasChild() { return (this._comments.length > 0); }

  private _comments: SocialComment[] = [];

  constructor(private data: ISocialComment, public level: number = 0, public replyTo: ISocialComment['user'] = null) {
    const levelNext = level + 1;

    data.comments.forEach(c => {
      this._comments.push(new SocialComment(c, levelNext, data.user));
    });
  }
}