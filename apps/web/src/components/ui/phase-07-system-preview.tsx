'use client';

import {
  ActionPillRow,
  AppHeader,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  FloatingActionSurface,
  GlassNav,
  HeroPanel,
  Input,
  SearchField,
  SectionFrame,
  Skeleton,
  StatusBanner,
} from '@repo/ui/components';
import {
  Bell,
  Camera,
  Compass,
  MapPinned,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';

const navItems = [
  { id: 'tong-quan', label: 'Tổng quan', icon: <Compass size={16} /> },
  { id: 'lich-trinh', label: 'Lịch trình', icon: <MapPinned size={16} /> },
  { id: 'nhac-viec', label: 'Nhắc việc', icon: <Bell size={16} /> },
];

const actionItems = [
  { id: 'lich-trinh', label: 'Lịch trình', icon: '🗺️' },
  { id: 'chi-phi', label: 'Chi phí', icon: '💸' },
  { id: 'ban-be', label: 'Bạn bè', icon: '🫶' },
];

export function Phase07SystemPreview() {
  return (
    <div className="surface-app min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-[var(--space-xl)] px-4 py-[var(--space-xl)] md:px-6">
        <AppHeader
          notificationCount={3}
          productMark={
            <div className="flex items-center gap-[var(--space-sm)]">
              <div className="rounded-[var(--radius-pill)] bg-[var(--accent-primary)]/12 p-[10px] text-[var(--accent-primary)]">
                <Compass size={20} />
              </div>
              <div>
                <p className="font-[900] tracking-[-0.03em]">Mình Đi Đâu Thế</p>
                <p className="text-sm text-[var(--text-muted)]">Phase 07 shared shell</p>
              </div>
            </div>
          }
          profile={{
            avatar: { initials: 'QT', status: 'online' },
            meta: 'Lead planner',
            name: 'Quốc Trí',
          }}
          searchProps={{
            'aria-label': 'Tìm trong preview hệ thống',
            placeholder: 'Tìm mood board, CTA, state matrix...',
          }}
          trailingAction={<Button variant="secondary">Xem token</Button>}
        />

        <HeroPanel
          actions={[
            { label: 'Tạo chuyến đi', leadingIcon: <Sparkles size={18} /> },
            { label: 'Xem flow mobile', variant: 'secondary' },
          ]}
          badgeLabel="DSYS-03 ready"
          description="Preview này chứng minh tokens, primitives và shell blocks của phase 07 có thể render cùng nhau trong apps/web mà chưa cần redesign production."
          eyebrow="Thin consumer proof"
          media={
            <div className="flex h-full min-h-[220px] flex-col justify-between rounded-[calc(var(--radius-hero)-1rem)] bg-white/70 p-[var(--space-md)]">
              <AvatarGroup>
                <Avatar initials="QT" status="online" />
                <Avatar initials="MH" status="busy" />
                <Avatar initials="LA" status="offline" />
              </AvatarGroup>
              <div className="flex flex-col gap-[var(--space-sm)]">
                <Badge variant="success">Ready để phase 08 nhập cuộc</Badge>
                <p className="text-sm text-[var(--text-muted)]">
                  Header, hero, status, empty, error, disabled, và mobile-safe states đang lên cùng một mặt bằng.
                </p>
              </div>
            </div>
          }
          title="Bộ shared shell đã đủ lực để đi tiếp rồi nè."
        >
          <StatusBanner
            description="Hero CTA dùng shared button, còn phần shell info dùng shared status banner luôn."
            icon={<Bell size={18} />}
            title="Loading, empty, error, disabled đều có đường đi rõ ràng."
            variant="warning"
          />
        </HeroPanel>

        <SectionFrame
          actionSlot={<Badge variant="status">No-divider shell framing</Badge>}
          description="Một cụm generic để feature phases khỏi phải tự build lại shortcut rails hay grouped sections."
          surface="lifted"
          title="Hero + section + primitive stack"
        >
          <ActionPillRow activeId="lich-trinh" items={actionItems} />

          <div className="grid gap-[var(--space-md)] lg:grid-cols-2">
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Primitive stack đang chạy thật</CardTitle>
                <CardDescription>
                  SearchField, Input, Badge, Avatar và Button đang được mount cùng shell block thay vì markup route-local.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SearchField aria-label="Search field proof" />
                <Input
                  helpText="Giữ label, hint, error và disabled ở cùng contract."
                  label="Planner note"
                  placeholder="VD: Chốt xe 16 chỗ đi sớm"
                />
                <div className="flex flex-wrap items-center gap-[var(--space-sm)]">
                  <Badge variant="discovery">Discovery</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="counter">12</Badge>
                  <Avatar initials="TN" size="sm" status="online" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Tạo chuyến đi</Button>
                <Button variant="ghost">Xem docs</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disabled state vẫn phải dễ đọc</CardTitle>
                <CardDescription>
                  DSYS-03 yêu cầu disabled không chỉ là opacity, mà vẫn giữ context cho người dùng.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  aria-label="Disabled input demo"
                  disabled
                  helpText="Input này bị khóa tạm thời để giữ state matrix."
                  label="Disabled input"
                  placeholder="Đợi quyền leader nha"
                />
                <div className="flex flex-wrap gap-[var(--space-sm)]">
                  <Button disabled>Đang khóa thao tác</Button>
                  <Button disabled variant="secondary">
                    Chưa tới lượt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </SectionFrame>

        <SectionFrame
          actionSlot={<Badge variant="neutral">State matrix</Badge>}
          description="Loading, empty, error và urgency states cần được khóa ngay từ phase foundation."
          title="Shared states không để feature phase tự đoán"
        >
          <div className="grid gap-[var(--space-md)] xl:grid-cols-3">
            <Card data-testid="loading-state-card" variant="glass">
              <CardHeader>
                <CardTitle>Loading state</CardTitle>
                <CardDescription>Skeleton giữ chỗ và tránh layout shift.</CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" data-testid="loading-title-skeleton" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full rounded-[var(--radius-pill)]" />
              </CardContent>
            </Card>

            <EmptyState
              action={<Button variant="secondary">Tạo mục đầu tiên</Button>}
              body="Tạo một mục mới hoặc chọn gợi ý có sẵn để bắt đầu nhanh."
              data-testid="empty-state-card"
              icon={<Camera size={24} />}
              title="Chưa có gì để quẩy hết"
            />

            <ErrorState
              action={<Button variant="destructive">Thử lại liền</Button>}
              data-testid="error-state-card"
              detail="Có lỗi xảy ra rồi. Thử lại một lần nữa hoặc tải lại trang nếu vẫn chưa ổn."
              title="Error state đã có fill-based treatment"
            />
          </div>

          <div className="grid gap-[var(--space-md)] lg:grid-cols-2">
            <StatusBanner
              description="Announcement surface dùng semantic fill, không đẩy warning sang viền đỏ đơn độc."
              icon={<Sparkles size={18} />}
              title="Success banner cho flow đã chốt"
              variant="success"
            />
            <StatusBanner
              description="Khi cần khẩn hơn, destructive copy vẫn nằm trong shared contract."
              icon={<TriangleAlert size={18} />}
              title="Destructive status cho cảnh báo gấp"
              variant="destructive"
            />
          </div>
        </SectionFrame>

        <SectionFrame
          actionSlot={<Badge variant="counter">44 / 80 safe</Badge>}
          description="Desktop-first nhưng mobile-safe: target size rõ ràng, rail scroll được, quick action không co bé lại."
          surface="glass"
          title="Responsive-safe shell proof"
        >
          <GlassNav
            activeId="tong-quan"
            aria-label="GlassNav mobile safe proof"
            items={navItems}
          />
          <FloatingActionSurface
            actionLabel="Chốt demo"
            description="Primary quick action giữ target 80px-safe và dùng chung surface semantics với nav."
            icon={<Sparkles size={18} />}
            secondarySlot={<Button variant="secondary">Mở sheet</Button>}
          />
        </SectionFrame>
      </div>
    </div>
  );
}
