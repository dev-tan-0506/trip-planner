import styles from './page.module.css';
import type { Trip } from '../../../lib/api-client';

type Props = {
  params: Promise<{ joinCode: string }>;
};

async function getTripData(joinCode: string): Promise<Trip | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${apiUrl}/api/trips/${joinCode}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json() as Promise<Trip>;
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
          <h1>ðŸ˜¢ Oops!</h1>
          <p>Chuyáº¿n Ä‘i khÃ´ng tá»“n táº¡i hoáº·c link Ä‘Ã£ háº¿t háº¡n.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.badge}>ðŸŽ’ Chuyáº¿n Ä‘i sáº¯p tá»›i!</div>
        <h1 className={styles.title}>{trip.name}</h1>
        <p className={styles.destination}>ðŸ“ {trip.destination}</p>

        <div className={styles.dates}>
          <span>ðŸ—“ï¸ {new Date(trip.startDate).toLocaleDateString('vi-VN')}</span>
          <span className={styles.arrow}>â†’</span>
          <span>{new Date(trip.endDate).toLocaleDateString('vi-VN')}</span>
        </div>

        <div className={styles.members}>
          <h3>ðŸ‘¥ ThÃ nh viÃªn ({trip.members?.length || 0})</h3>
          <div className={styles.avatarRow}>
            {trip.members?.map((member, i: number) => (
              <div key={i} className={styles.avatar}>
                {member.user?.name?.[0] || '?'}
              </div>
            ))}
          </div>
        </div>

        <button className={styles.joinBtn}>
          ðŸš€ Tham gia ngay!
        </button>
        <p className={styles.hint}>ÄÄƒng nháº­p Ä‘á»ƒ vote, bÃ¬nh chá»n vÃ  xem chi tiáº¿t lá»‹ch trÃ¬nh</p>
      </div>
    </div>
  );
}
