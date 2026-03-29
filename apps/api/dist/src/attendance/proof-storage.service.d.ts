export declare class ProofStorageService {
    private readonly storageDir;
    saveProofImage(sessionId: string, tripMemberId: string, imageDataUrl: string): Promise<string>;
    private getExtensionFromMime;
}
