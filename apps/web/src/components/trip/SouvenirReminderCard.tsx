'use client';

import { type SouvenirSnapshot } from '../../lib/api-client';

export function SouvenirReminderCard({ snapshot }: { snapshot: SouvenirSnapshot }) {
  if (!snapshot.eligible) return null;

  return (
    <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Souvenir</p>
      <h3 className="mt-2 text-xl font-black text-gray-900">Mua quà trước khi về</h3>
      <p className="mt-2 text-sm text-gray-600">
        {snapshot.destinationLabel}: {snapshot.reminderLabel}
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {snapshot.suggestions.map((suggestion) => (
          <article key={suggestion.locationName} className="rounded-3xl bg-gray-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">Khu gợi ý</p>
            <p className="mt-2 text-base font-black text-gray-900">{suggestion.locationName}</p>
            <p className="text-sm text-gray-500">
              {suggestion.locationType} · {suggestion.areaLabel}
            </p>
            <p className="mt-2 text-sm text-gray-700">{suggestion.reason}</p>
            <p className="mt-2 text-sm text-gray-500">{suggestion.souvenirHint}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
