export const lowConfidenceRoute = {
  id: 'route-low-confidence',
  title: 'Lộ trình ẩm thực gợi ý',
  confidenceLabel: 'Cần xem lại',
  stops: ['Bún bò', 'Bánh xèo', 'Cà phê muối'],
  reasoning: 'Thứ tự này được gợi ý theo khoảng cách, nhưng vẫn nên kiểm tra giờ mở cửa.',
};

export const lowConfidenceBookingDraft = {
  id: 'booking-draft-low-confidence',
  source: 'forwarded-email',
  confidenceLabel: 'Cần xem lại',
  confirmationCode: 'VN-LOW-505',
  fieldsNeedingReview: ['giờ bay', 'nhà ga', 'hành lý'],
};

export const healthWarningHigh = {
  id: 'health-warning-high',
  severity: 'Nguy cơ cao',
  message: 'Món này có thể không phù hợp với hồ sơ dị ứng hiện tại.',
};

export const benchmarkWarningCaution = {
  id: 'benchmark-warning-caution',
  severity: 'Cần xem lại',
  message: 'Chi phí dự kiến đang cao hơn mặt bằng khu vực, cần xem lại trước khi chốt.',
};
