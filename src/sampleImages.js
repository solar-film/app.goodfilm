export const SAMPLE_IMAGE_SLOTS = [
  { imageKey: 'image1', labelKey: 'label1', name: 'รูปแรก', defaultLabel: 'ภาพจำลองความเข้ม มองจากภายนอกอาคาร' },
  { imageKey: 'image2', labelKey: 'label2', name: 'รูปที่สอง', defaultLabel: 'ภาพจำลองความเข้ม มองจากภายในอาคาร' },
  { imageKey: 'image3', labelKey: 'label3', name: 'รูปที่สาม', defaultLabel: 'รูปตัวอย่างเพิ่มเติมรูปที่ 3' },
  { imageKey: 'image4', labelKey: 'label4', name: 'รูปที่สี่', defaultLabel: 'รูปตัวอย่างเพิ่มเติมรูปที่ 4' }
];

export const getSampleImages = (sample = {}) => SAMPLE_IMAGE_SLOTS
  .filter(({ imageKey }) => Boolean(sample[imageKey]))
  .map(slot => {
    const savedLabel = sample[slot.labelKey];
    return {
      ...slot,
      src: sample[slot.imageKey],
      label: savedLabel === '' ? '' : (savedLabel || slot.defaultLabel)
    };
  });
