const fs = require('fs');
const path = require('path');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const FormData = require('form-data');

async function testUpload() {
  const form = new FormData();
  form.append('image1', Buffer.from('fake image data'), { filename: 'test.jpg', contentType: 'image/jpeg' });
  
  const res = await fetch('https://nas.goodfilmshop.com/upload-portfolio', {
    method: 'POST',
    body: form,
  });
  
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}

testUpload().catch(console.error);
