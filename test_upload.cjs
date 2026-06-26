const fs = require('fs');
fs.writeFileSync('dummy.pdf', 'dummy content');
const FormData = require('form-data');
const fetch = require('node-fetch');

const form = new FormData();
form.append('category', 'test_report');
form.append('file', fs.createReadStream('dummy.pdf'));

fetch('https://nas.goodfilmshop.com/upload-download', {
  method: 'POST',
  body: form
}).then(r => r.text()).then(console.log).catch(console.error);
