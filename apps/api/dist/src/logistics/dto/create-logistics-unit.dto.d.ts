export declare class CreateLogisticsUnitDto {
    type: 'ROOM' | 'RIDE';
    label: string;
    capacity: number;
    note?: string;
    rideKind?: 'MOTORBIKE' | 'CAR' | 'BUS';
    plateNumber?: string;
    seatLabels?: string[];
}
