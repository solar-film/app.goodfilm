import assert from 'node:assert/strict';
import { getDownloadBrand, getProductBrandLabel, getSeriesBrand, PRODUCT_BRANDS } from '../src/downloadBrands.js';

const series = [
  { id: 'pr', groupId: 'g1' },
  { id: 'a326', groupId: 'g6' }
];

assert.equal(getSeriesBrand(series[0]), PRODUCT_BRANDS.THREE_M);
assert.equal(getSeriesBrand(series[1]), PRODUCT_BRANDS.BOSTIK);
assert.equal(getDownloadBrand({ brand: 'bostik' }, series), PRODUCT_BRANDS.BOSTIK);
assert.equal(getDownloadBrand({ seriesId: 'pr' }, series), PRODUCT_BRANDS.THREE_M);
assert.equal(getDownloadBrand({ seriesId: 'a326' }, series), PRODUCT_BRANDS.BOSTIK);
assert.equal(getDownloadBrand({ title: 'Technical Data Sheet Bostik S548' }, series), PRODUCT_BRANDS.BOSTIK);
assert.equal(getDownloadBrand({ title: 'Technical Data Sheet PR70' }, series), PRODUCT_BRANDS.THREE_M);
assert.equal(getProductBrandLabel(PRODUCT_BRANDS.BOSTIK), 'ผลิตภัณฑ์ Bostik');

console.log('Download brand tests passed.');
