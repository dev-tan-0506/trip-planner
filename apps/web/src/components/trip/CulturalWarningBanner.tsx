'use client';

interface CulturalWarningBannerProps {
  warnings: Array<{
    id: string;
    title: string;
    message: string;
  }>;
}

export function CulturalWarningBanner({ warnings }: CulturalWarningBannerProps) {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-3xl border border-brand-yellow/25 bg-brand-yellow/10 p-5 shadow-sm">
      <p className="text-sm font-black text-gray-900">Lưu ý văn hóa</p>
      {warnings.map((item) => (
        <div key={item.id} className="rounded-2xl bg-white/80 px-4 py-4 text-sm text-gray-700">
          <p className="font-black text-gray-900">{item.title}</p>
          <p className="mt-2">{item.message}</p>
        </div>
      ))}
    </div>
  );
}
