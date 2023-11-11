export const environment = {
  production: true,
  config: {
    APP_NAME: 'Wellness',

    BASE_URL: 'https://prompthealth.ca/',
    API_URL: 'https://ocean.prompthealth.ca/api/v1/',

    FRONTEND_BASE: 'https://prompthealth.ca',
    BACKEND_BASE: 'http://127.0.0.1:3001', // used only for proxy


    stripeKey: 'pk_live_51HMSVQHzvKsIv7FclCIgEYNrD4tlvjzZRTDx43Y54pVY3vjQ8MhFuOntQMY094MZ49bDzOdFf2A2tkYdTwSag9ij00xDUu4xnU',
    AWS_S3: 'https://prompt-images.s3.us-east-2.amazonaws.com/',

    
    APPLE_TEAM_ID: '8JS3W47P32',
    APPLE_CLIENT_ID: 'com.prompthealth',
    GOOGLE_CLIENT_ID: '911768983583-hrth6fagg8em1oc6v6mkcv21bsoac0ar.apps.googleusercontent.com',
    FACEBOOK_APP_ID: '2053494228293760',
    disableAnalytics: false,

    idSA: '5edb61483cd45aa28f6413c0',

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
