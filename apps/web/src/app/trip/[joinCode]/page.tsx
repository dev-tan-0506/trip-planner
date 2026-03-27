import styles from './page.module.css';

type Props = {
  params: Promise<{ joinCode: string }>;
};

async function getTripData(joinCode: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${apiUrl}/api/trips/${joinCode}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function TripPreviewPage({ params }: Props) {
  const { joinCode } = await params;
  const trip = await getTripData(joinCode);

  if (!trip) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <h1>😢 Oops!</h1>
          <p>Chuyến đi không tồn tại hoặc link đã hết hạn.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.badge}>🎒 Chuyến đi sắp tới!</div>
        <h1 className={styles.title}>{trip.name}</h1>
        <p className={styles.destination}>📍 {trip.destination}</p>

        <div className={styles.dates}>
          <span>🗓️ {new Date(trip.startDate).toLocaleDateString('vi-VN')}</span>
          <span className={styles.arrow}>→</span>
          <span>{new Date(trip.endDate).toLocaleDateString('vi-VN')}</span>
        </div>

        <div className={styles.members}>
          <h3>👥 Thành viên ({trip.members?.length || 0})</h3>
          <div className={styles.avatarRow}>
            {trip.members?.map((m: any, i: number) => (
              <div key={i} className={styles.avatar}>
                {m.user?.name?.[0] || '?'}
              </div>
            ))}
          </div>
        </div>

        <button className={styles.joinBtn}>
          🚀 Tham gia ngay!
        </button>
        <p className={styles.hint}>Đăng nhập để vote, bình chọn và xem chi tiết lịch trình</p>
      </div>
    </div>
  );
}
