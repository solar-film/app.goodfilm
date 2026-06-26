export const PRODUCT_BRANDS = {
  THREE_M: '3m',
  BOSTIK: 'bostik'
};

const BOSTIK_GROUP_IDS = new Set(['g6', 'g7', 'g8']);
const BOSTIK_LEGACY_DOCUMENT_PATTERN = /bostik|smart\s*flex|fp404|f404|a326|a330|s301|s5(?:46|48|546)/i;

export const getProductBrandLabel = (brand) => {
  if (brand === PRODUCT_BRANDS.BOSTIK) return 'ผลิตภัณฑ์ Bostik';
  if (brand === PRODUCT_BRANDS.THREE_M) return 'ฟิล์ม 3M';
  return 'ไม่ระบุ';
};

export const getSeriesBrand = (seriesItem) => (
  BOSTIK_GROUP_IDS.has(seriesItem?.groupId)
    ? PRODUCT_BRANDS.BOSTIK
    : PRODUCT_BRANDS.THREE_M
);

export const getDownloadBrand = (download, seriesList = []) => {
  if (download?.brand === PRODUCT_BRANDS.THREE_M || download?.brand === PRODUCT_BRANDS.BOSTIK) {
    return download.brand;
  }

  const linkedSeries = seriesList.find(seriesItem => seriesItem.id === download?.seriesId);
  if (linkedSeries) return getSeriesBrand(linkedSeries);

  // Compatibility for legacy records. New records always store an explicit brand.
  const legacyText = `${download?.title || ''} ${download?.file || ''}`;
  return BOSTIK_LEGACY_DOCUMENT_PATTERN.test(legacyText)
    ? PRODUCT_BRANDS.BOSTIK
    : PRODUCT_BRANDS.THREE_M;
};
