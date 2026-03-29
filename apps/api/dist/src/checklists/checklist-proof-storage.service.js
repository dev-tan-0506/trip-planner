"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecklistProofStorageService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
let ChecklistProofStorageService = class ChecklistProofStorageService {
    constructor() {
        this.storageDir = (0, node_path_1.join)(process.cwd(), 'apps', 'api', 'storage', 'checklist-proofs');
    }
    async saveProofImage(itemId, tripMemberId, imageDataUrl) {
        const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
        if (!match) {
            throw new Error('Invalid checklist proof payload');
        }
        const mimeType = match[1];
        const base64Body = match[2];
        const extension = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
        const fileName = `${itemId}-${tripMemberId}.${extension}`;
        await (0, promises_1.mkdir)(this.storageDir, { recursive: true });
        await (0, promises_1.writeFile)((0, node_path_1.join)(this.storageDir, fileName), Buffer.from(base64Body, 'base64'));
        return `/checklist-proofs/${fileName}`;
    }
};
exports.ChecklistProofStorageService = ChecklistProofStorageService;
exports.ChecklistProofStorageService = ChecklistProofStorageService = __decorate([
    (0, common_1.Injectable)()
], ChecklistProofStorageService);
//# sourceMappingURL=checklist-proof-storage.service.js.map