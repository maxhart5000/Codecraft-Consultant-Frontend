// Configuration for Okta integration
export default {
  oidc: {
    clientId: '0oaezrpi14AhsbWst5d7',
    issuer: 'https://dev-79221683.okta.com/oauth2/default',
    redirectUri:  window.location.origin + '/login/callback',
    scopes: ['openid', 'profile', 'email'],
  },
};
