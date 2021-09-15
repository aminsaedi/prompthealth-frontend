export const environment = {
  production: false,
  config: {
    APP_NAME: 'Wellness',
    // server
    // BASE_URL: 'http://3.12.81.245:3000/api/v1/',
    API_URL: 'http://3.12.81.245:3000/api/v1/',

    BASE_URL: 'https://prompthealth.ca:4200/',
    // API_URL: 'https://prompthealth.ca:3000/api/v1/',
    stripeKey: 'pk_test_51HMSVQHzvKsIv7FcySpZJiaqJEpFyeV4T1fqzmTaIMKAt8VoIcSFNOoy0xChuIec3fotWjF00FAMMNI5MZRvr10X00NqhMqjLR',
    AWS_S3: 'https://prompt-images-test.s3.us-east-2.amazonaws.com/',

    //  BASE_URL: 'https://prompthealth.ca/',
    //  //API_URL: 'https://api.prompthealth.ca/api/v1/',
    //  API_URL: 'https://api.prompthealth.ca/api/v1/',
    // stripeKey: 'pk_live_51HMSVQHzvKsIv7FclCIgEYNrD4tlvjzZRTDx43Y54pVY3vjQ8MhFuOntQMY094MZ49bDzOdFf2A2tkYdTwSag9ij00xDUu4xnU'

    FRONTEND_BASE: 'http://3.12.81.245:4200',

    APPLE_TEAM_ID: '8JS3W47P32',
    APPLE_CLIENT_ID: 'com.prompthealthtest',
    FACEBOOK_APP_ID: '373355990729755',

    disableAnalytics: true,

    idSA: '610b23f28d24b31170b67c60',
    firebase: {
      apiKey: 'AIzaSyC6JqGOHfsZShTHqy1cq-nWOKhlIULtRmI',
      authDomain: 'prompthealth-22680.firebaseapp.com',
      projectId: 'prompthealth-22680',
      storageBucket: 'prompthealth-22680.appspot.com',
      messagingSenderId: '740878106701',
      appId: '1:740878106701:web:a596945bf68f452e37dc04',
      measurementId: 'G-3GTRM03FCL'
    }

  },
  api_routes: {
    LOGIN: 'login',
    REGISTER: 'register',
    MY_ACCOUNT_INFO: '',
    EDIT_PROFILE: ''
  }
};
