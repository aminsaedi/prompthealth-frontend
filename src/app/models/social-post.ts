import { Blog, IBlog } from "./blog";

export interface ISocialPost extends IBlog {
  comments: ISocialComment[];
}

export class SocialPost extends Blog implements ISocialPost {
  
  get summary() {
    return this._summary.substr(0, 256);
  }

  get isPost() {
    return !this.isEvent && !this.isArticle;
  }
  get isArticle() {
    return this.title && !this.isEvent;
  }

  get isMoreShown() {
    return !!(this._summary.length > this.summary.length)
  }

  get comments() {
    return this._commentsDummy;
  };


  _commentsDummy: SocialComment[];
  constructor(protected data: ISocialPost) {
    super(data);

    const comments = [];
    commentsDummy.forEach(c => {
      comments.push(new SocialComment(c));
    })

    this._commentsDummy = comments;

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

  private _comments: SocialComment[] = [];

  constructor(private data: ISocialComment, public level: number = 0, public replyTo: ISocialComment['user'] = null) {
    const levelNext = level + 1;

    data.comments.forEach(c => {
      this._comments.push(new SocialComment(c, levelNext, data.user));
    });
  }
}