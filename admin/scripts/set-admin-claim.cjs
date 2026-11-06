const admin = require('firebase-admin');
const readline = require('readline');

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || '../../serviceAccountKey.json';
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountPath)) });

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
// รับ UID แล้วกำหนด custom claim admin ผ่าน Firebase Admin SDK
rl.question('Admin Firebase Auth UID: ', async (uid) => {
  try {
    await admin.auth().setCustomUserClaims(uid.trim(), { admin: true });
    console.log('Admin claim set. The user must sign out and sign in again.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
  }
});
