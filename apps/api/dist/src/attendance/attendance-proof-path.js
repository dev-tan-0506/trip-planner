"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendanceProofDir = getAttendanceProofDir;
exports.getAttendanceProofPublicPath = getAttendanceProofPublicPath;
const fs_1 = require("fs");
const path_1 = require("path");
function getApiWorkspaceRoot() {
    if ((0, path_1.resolve)(process.cwd()).toLowerCase().endsWith(`${(0, path_1.resolve)('apps', 'api').toLowerCase()}`)) {
        return (0, path_1.resolve)(process.cwd());
    }
    return (0, path_1.resolve)(process.cwd(), 'apps', 'api');
}
function getAttendanceProofDir() {
    const dir = (0, path_1.resolve)(getApiWorkspaceRoot(), 'storage', 'attendance-proofs');
    (0, fs_1.mkdirSync)(dir, { recursive: true });
    return dir;
}
function getAttendanceProofPublicPath(filename) {
    return `/attendance-proofs/${filename}`;
}
//# sourceMappingURL=attendance-proof-path.js.map