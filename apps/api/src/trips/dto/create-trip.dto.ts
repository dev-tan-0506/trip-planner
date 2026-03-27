import { ApiProperty } from '@nestjs/swagger';

export class CreateTripDto {
  @ApiProperty({ example: 'Đà Lạt Mộng Mơ' })
  name: string;

  @ApiProperty({ example: 'Đà Lạt, Lâm Đồng' })
  destination: string;

  @ApiProperty({ example: '2026-04-15T00:00:00.000Z' })
  startDate: string;

  @ApiProperty({ example: '2026-04-18T00:00:00.000Z' })
  endDate: string;
}
