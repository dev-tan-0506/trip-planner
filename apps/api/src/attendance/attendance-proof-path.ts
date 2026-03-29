import { mkdirSync } from 'fs';
import { resolve } from 'path';

function getApiWorkspaceRoot() {
  if (resolve(process.cwd()).toLowerCase().endsWith(`${resolve('apps', 'api').toLowerCase()}`)) {
    return resolve(process.cwd());
  }

  return resolve(process.cwd(), 'apps', 'api');
}

export function getAttendanceProofDir() {
  const dir = resolve(getApiWorkspaceRoot(), 'storage', 'attendance-proofs');
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function getAttendanceProofPublicPath(filename: string) {
  return `/attendance-proofs/${filename}`;
}
