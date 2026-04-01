export const lowConfidenceRoute = {
  id: 'route-low-confidence',
  title: 'Lo trinh am thuc goi y',
  confidenceLabel: 'Can xem lai',
  stops: ['Bun bo', 'Banh xeo', 'Ca phe muoi'],
  reasoning: 'Thu tu nay duoc goi y theo khoang cach, nhung van nen kiem tra gio mo cua.',
};

export const lowConfidenceBookingDraft = {
  id: 'booking-draft-low-confidence',
  source: 'forwarded-email',
  confidenceLabel: 'Can xem lai',
  confirmationCode: 'VN-LOW-505',
  fieldsNeedingReview: ['gio bay', 'nha ga', 'hanh ly'],
};

export const healthWarningHigh = {
  id: 'health-warning-high',
  severity: 'Nguy co cao',
  message: 'Mon nay co the khong phu hop voi ho so di ung hien tai.',
};

export const benchmarkWarningCaution = {
  id: 'benchmark-warning-caution',
  severity: 'Can xem lai',
  message: 'Chi phi du kien dang cao hon mat bang khu vuc, can xem lai truoc khi chot.',
};
