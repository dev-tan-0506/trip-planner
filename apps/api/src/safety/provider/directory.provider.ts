export interface SafetyDirectoryResult {
  kind: string;
  title: string;
  phone: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  source: string;
}

export class DirectoryProvider {
  async getSafetyDirectory(destinationLabel: string): Promise<SafetyDirectoryResult[]> {
    return [
      {
        kind: 'CLINIC',
        title: `Phòng khám gần ${destinationLabel}`,
        phone: '02361234567',
        address: '12 Trần Phú',
        lat: 16.0678,
        lng: 108.2208,
        source: 'stub',
      },
      {
        kind: 'PHARMACY',
        title: `Nhà thuốc trực đêm ${destinationLabel}`,
        phone: '02367654321',
        address: '88 Lê Lợi',
        lat: 16.071,
        lng: 108.224,
        source: 'stub',
      },
    ];
  }
}
