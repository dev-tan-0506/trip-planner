export interface WeatherForecastItem {
  date: string;
  label: string;
  condition: string;
  temperatureC: number;
  rainChancePercent: number;
}

export class WeatherProvider {
  async getFiveDayForecast(destinationLabel: string): Promise<WeatherForecastItem[]> {
    return [
      {
        date: '2026-06-10',
        label: `${destinationLabel} - Hôm nay`,
        condition: 'Nắng nhẹ',
        temperatureC: 31,
        rainChancePercent: 10,
      },
      {
        date: '2026-06-11',
        label: `${destinationLabel} - Ngày mai`,
        condition: 'Có mây',
        temperatureC: 30,
        rainChancePercent: 20,
      },
      {
        date: '2026-06-12',
        label: `${destinationLabel} - Ngày 3`,
        condition: 'Mưa rào',
        temperatureC: 28,
        rainChancePercent: 55,
      },
      {
        date: '2026-06-13',
        label: `${destinationLabel} - Ngày 4`,
        condition: 'Nắng',
        temperatureC: 32,
        rainChancePercent: 5,
      },
      {
        date: '2026-06-14',
        label: `${destinationLabel} - Ngày 5`,
        condition: 'Nắng nhẹ',
        temperatureC: 31,
        rainChancePercent: 15,
      },
    ];
  }
}
