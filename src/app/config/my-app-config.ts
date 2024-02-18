// Configuration for Okta integration
export default {
  oidc: {
    issuer: 'https://dev-79221683.okta.com/oauth2/default',
    clientId: '0oaezrpi14AhsbWst5d7',
    redirectUri:  window.location.origin + '/login/callback',
    scopes: ['openid', 'profile', 'email'],
  },
};
