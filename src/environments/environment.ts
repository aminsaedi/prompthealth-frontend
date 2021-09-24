// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  config: {
    APP_NAME: 'Wellness',

    BASE_URL: 'http://localhost:3000/',
    API_URL: 'http://localhost:3000/api/v1/',

    FRONTEND_BASE: 'http://localhost:4200',
    BACKEND_BASE: 'http://127.0.0.1:3000', // used only for proxy

    stripeKey: 'pk_test_51HMSVQHzvKsIv7FcySpZJiaqJEpFyeV4T1fqzmTaIMKAt8VoIcSFNOoy0xChuIec3fotWjF00FAMMNI5MZRvr10X00NqhMqjLR',
    AWS_S3: 'https://prompt-images-test.s3.us-east-2.amazonaws.com/',

    APPLE_TEAM_ID: '8JS3W47P32',
    GOOGLE_CLIENT_ID: '911768983583-lqklmh43d4mjclrkgbtbof9th5251po1.apps.googleusercontent.com',
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
