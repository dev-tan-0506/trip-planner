'use client';

interface MemberChipProps {
  name: string | null;
  avatarUrl: string | null;
  source?: string;
  role?: string;
  onRemove?: () => void;
  compact?: boolean;
}

export function MemberChip({
  name,
  avatarUrl,
  source,
  onRemove,
  compact = false,
}: MemberChipProps) {
  const displayName = name || 'Thành viên';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-100 transition-all hover:bg-gray-100 ${
        compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-sm'
      }`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className={`rounded-full object-cover ${compact ? 'w-4 h-4' : 'w-5 h-5'}`}
        />
      ) : (
        <span
          className={`flex items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue font-bold ${
            compact ? 'w-4 h-4 text-[10px]' : 'w-5 h-5 text-xs'
          }`}
        >
          {initial}
        </span>
      )}
      <span className="font-semibold text-gray-700 truncate max-w-[100px]">
        {displayName}
      </span>
      {source === 'SELF_JOIN' && (
        <span className="text-[10px] text-brand-green font-bold">tự vào</span>
      )}
      {source === 'AUTO_FILL' && (
        <span className="text-[10px] text-brand-yellow font-bold">tự động</span>
      )}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 text-gray-400 hover:text-brand-coral transition-colors"
          title="Bỏ khỏi chỗ này"
        >
          ×
        </button>
      )}
    </div>
  );
}
