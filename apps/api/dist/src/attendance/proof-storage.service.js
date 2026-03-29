"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProofStorageService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
let ProofStorageService = class ProofStorageService {
    constructor() {
        this.storageDir = (0, node_path_1.join)(process.cwd(), 'apps', 'api', 'storage', 'attendance-proofs');
    }
    async saveProofImage(sessionId, tripMemberId, imageDataUrl) {
        const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
        if (!match) {
            throw new Error('Invalid proof image payload');
        }
        const mimeType = match[1];
        const base64Body = match[2];
        const extension = this.getExtensionFromMime(mimeType);
        const fileName = `${sessionId}-${tripMemberId}.${extension}`;
        await (0, promises_1.mkdir)(this.storageDir, { recursive: true });
        await (0, promises_1.writeFile)((0, node_path_1.join)(this.storageDir, fileName), Buffer.from(base64Body, 'base64'));
        return `/attendance-proofs/${fileName}`;
    }
    getExtensionFromMime(mimeType) {
        if (mimeType.includes('png'))
            return 'png';
        if (mimeType.includes('webp'))
            return 'webp';
        return 'jpg';
    }
};
exports.ProofStorageService = ProofStorageService;
exports.ProofStorageService = ProofStorageService = __decorate([
    (0, common_1.Injectable)()
], ProofStorageService);
//# sourceMappingURL=proof-storage.service.js.map