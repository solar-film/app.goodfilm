import assert from 'node:assert/strict';
import { getSampleImages } from '../src/sampleImages.js';

const images = getSampleImages({
  image1: '/one.jpg',
  label1: '',
  image2: '/two.jpg',
  image3: '/three.jpg',
  label3: 'รูปเฉพาะ',
  image4: ''
});

assert.equal(images.length, 3);
assert.equal(images[0].label, '', 'an intentionally blank label must remain hidden');
assert.equal(images[1].label, 'ภาพจำลองความเข้ม มองจากภายในอาคาร');
assert.equal(images[2].label, 'รูปเฉพาะ');

console.log('Sample image tests passed.');
