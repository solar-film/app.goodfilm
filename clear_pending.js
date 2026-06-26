import fs from 'fs';
import crypto from 'crypto';

const sessionSecret = process.env.ADMIN_SESSION_SECRET || 'goodfilm-local-session-secret-change-before-production';

const signSession = (expiresAt, scope) => {
  const payload = Buffer.from(JSON.stringify({ expiresAt, scope })).toString('base64url');
  const signature = crypto.createHmac('sha256', sessionSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
};

async function clearPending() {
  try {
    const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
    const token = signSession(expiresAt, 'admin');
    const headers = { 'Cookie': `goodfilm_admin_session=${token}` };

    const res = await fetch('http://localhost:3001/portfolio?type=sample');
    const items = await res.json();
    
    let deletedCount = 0;
    for (const item of items) {
      const title = String(item?.title || '');
      const id = String(item?.id || '');
      const isPending = !item?.seriesId
        || Boolean(item?.recoveredFrom)
        || id.startsWith('recovered-')
        || title.startsWith('Recovered sample pending review');
        
      if (isPending) {
        console.log(`Deleting: ${id}`);
        const delRes = await fetch(`http://localhost:3001/portfolio/${id}`, {
          method: 'DELETE',
          headers
        });
        if (delRes.ok) deletedCount++;
      }
    }
    console.log(`Successfully deleted ${deletedCount} pending items.`);
  } catch (err) {
    console.error('Error:', err);
  }
}

clearPending();
