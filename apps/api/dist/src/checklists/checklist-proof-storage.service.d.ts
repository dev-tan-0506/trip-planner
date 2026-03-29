export declare class ChecklistProofStorageService {
    private readonly storageDir;
    saveProofImage(itemId: string, tripMemberId: string, imageDataUrl: string): Promise<string>;
}
