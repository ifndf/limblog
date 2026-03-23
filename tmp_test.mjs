import { SignJWT } from 'jose';
import crypto from 'crypto';
async function run() {
  const secret = 'LIMBLOG_VERY_SECRET_KEY_CHANGE_ME_PLEASE';
  const key = crypto.createSecretKey(Buffer.from(secret));
  const token = await new SignJWT({ username: 'admin' }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(key);
  
  const res = await fetch('http://127.0.0.1:3000/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'limblog_session=' + token
    },
    body: JSON.stringify({ title: 'Test', slug: 'test-' + Date.now(), content: 'test content' })
  });
  console.log('Status', res.status);
  console.log(await res.text());
}
run();
