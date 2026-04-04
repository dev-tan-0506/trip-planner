import { render, screen, within } from '@testing-library/react';
import { Phase07SystemPreview } from '../phase-07-system-preview';

describe('Phase07SystemPreview', () => {
  it('renders shared shell blocks and primitives together for a real consumer proof', () => {
    render(<Phase07SystemPreview />);

    expect(screen.getByText('Mình Đi Đâu Thế')).toBeInTheDocument();
    expect(screen.getByText('Bộ shared shell đã đủ lực để đi tiếp rồi nè.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tìm mood board, CTA, state matrix...')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Tạo chuyến đi' }).length).toBeGreaterThan(0);
    expect(screen.getByText('Primitive stack đang chạy thật')).toBeInTheDocument();
  });

  it('covers loading, empty, and error states in the preview route', () => {
    render(<Phase07SystemPreview />);

    expect(screen.getByTestId('loading-state-card')).toBeInTheDocument();
    expect(screen.getByTestId('loading-title-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('empty-state-card')).toHaveTextContent('Chưa có gì để quẩy hết');
    expect(screen.getByTestId('error-state-card')).toHaveTextContent('Error state đã có fill-based treatment');
  });

  it('keeps disabled controls visible and actually disabled', () => {
    render(<Phase07SystemPreview />);

    expect(screen.getByLabelText('Disabled input demo')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Đang khóa thao tác' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Chưa tới lượt' })).toBeDisabled();
  });

  it('keeps GlassNav and floating action surfaces mobile-safe', () => {
    render(<Phase07SystemPreview />);

    const nav = screen.getByRole('navigation', { name: 'GlassNav mobile safe proof' });
    const navButtons = within(nav).getAllByRole('button');
    expect(navButtons[0]).toHaveClass('min-h-[44px]');

    const floatingActionButton = screen.getByRole('button', { name: 'Chốt demo' });
    expect(floatingActionButton).toHaveClass('min-w-[80px]');
    expect(screen.getByText('Primary quick action giữ target 80px-safe và dùng chung surface semantics với nav.')).toBeInTheDocument();
  });
});
