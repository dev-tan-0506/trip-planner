import { Compass } from "lucide-react";

interface PublicEntryBrandProps {
  compact?: boolean;
}

export function PublicEntryBrand({ compact = false }: PublicEntryBrandProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="pe-brand-icon">
        <Compass size={compact ? 18 : 24} strokeWidth={2.3} />
      </div>
      <div className="min-w-0">
        <p className={`truncate font-[900] uppercase italic leading-[1.1] tracking-[-0.05em] text-[var(--text-primary)] ${compact ? "text-lg" : "text-[clamp(1.65rem,3vw,2.5rem)]"}`}>
          Mình Đi Đâu Thế?
        </p>
        <p className="text-[11px] font-[800] uppercase tracking-[0.18em] text-[var(--accent-primary)] md:text-xs">
          Đi là ghiền, chốt đơn là bay!
        </p>
      </div>
    </div>
  );
}


