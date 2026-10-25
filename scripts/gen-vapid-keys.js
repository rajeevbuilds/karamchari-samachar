// Optional. The site makes its own notification keys the first time they are
// needed and keeps them in the settings table, so you normally never run this.
// Use it only if you prefer to set the keys yourself as environment variables
// (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT):
//   node scripts/gen-vapid-keys.js
// Keep the private key secret. A new pair later means every existing subscriber
// would need to sign up again.
const webpush = require('web-push');
const keys = webpush.generateVAPIDKeys();
console.log('VAPID_PUBLIC_KEY=' + keys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);
console.log('VAPID_SUBJECT=mailto:you@example.com   # replace with the site contact email');
