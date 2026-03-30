export interface CrowdForecastItem {
  locationLabel: string;
  level: 'THAP' | 'VUA' | 'CAO';
  note: string;
}

export class CrowdProvider {
  async getCrowdForecast(destinationLabel: string): Promise<CrowdForecastItem[]> {
    return [
      {
        locationLabel: `${destinationLabel} - trung tâm`,
        level: 'CAO',
        note: 'Nên đi sớm hơn 30 phút để tránh chen đông.',
      },
      {
        locationLabel: `${destinationLabel} - điểm tham quan ven biển`,
        level: 'VUA',
        note: 'Cuối chiều bắt đầu đông hơn nhóm gia đình.',
      },
    ];
  }
}
