// Makes the key pair that browser notifications need. Run once with:
//   node scripts/gen-vapid-keys.js
// Then add the three printed values as secrets / environment variables on the
// hosting (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT). Keep the private
// key secret and do not commit it. Never generate a new pair later unless you
// are happy for every existing subscriber to need to sign up again.
const webpush = require('web-push');
const keys = webpush.generateVAPIDKeys();
console.log('VAPID_PUBLIC_KEY=' + keys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);
console.log('VAPID_SUBJECT=mailto:you@example.com   # replace with the site contact email');
