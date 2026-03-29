export declare class CreateAttendanceSubmissionDto {
    imageDataUrl?: string;
    lat?: number;
    lng?: number;
    accuracyMeters?: number;
    locationStatus: 'GRANTED' | 'DENIED' | 'UNAVAILABLE';
}
