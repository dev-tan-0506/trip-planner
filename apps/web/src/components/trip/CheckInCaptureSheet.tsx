'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Camera, ImageUp, Loader2, MapPin, ShieldCheck, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { attendanceApi, AttendanceLocationStatus, AttendanceSnapshot } from '../../lib/api-client';

interface CheckInCaptureSheetProps {
  open: boolean;
  sessionId: string;
  onClose: () => void;
  onOverlayChange?: (open: boolean) => void;
  onSuccess: (snapshot: AttendanceSnapshot) => void;
}

async function fileToDataUrl(file: File): Promise<string> {
  const compressedFile = await compressImage(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Không đọc được ảnh'));
      }
    };
    reader.onerror = () => reject(new Error('Không đọc được ảnh'));
    reader.readAsDataURL(compressedFile);
  });
}

async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Không đọc được ảnh'));
    };
    reader.onerror = () => reject(new Error('Không đọc được ảnh'));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Không nén được ảnh'));
    img.src = dataUrl;
  });

  const maxWidth = 1280;
  const scale = Math.min(1, maxWidth / image.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const context = canvas.getContext('2d');
  if (!context) {
    return file;
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.75);
  });

  return blob ?? file;
}

export function CheckInCaptureSheet({
  open,
  sessionId,
  onClose,
  onOverlayChange,
  onSuccess,
}: CheckInCaptureSheetProps) {
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onOverlayChange?.(open);
    return () => onOverlayChange?.(false);
  }, [onOverlayChange, open]);

  const handleFilePicked = async (file: File | null) => {
    if (!file) return;
    setError(null);
    const dataUrl = await fileToDataUrl(file);
    setImageDataUrl(dataUrl);
    setPreviewUrl(dataUrl);
    setStatusText('Ảnh đã sẵn sàng, bạn có thể gửi check-in.');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    let locationStatus: AttendanceLocationStatus = 'UNAVAILABLE';
    let lat: number | undefined;
    let lng: number | undefined;
    let accuracyMeters: number | undefined;

    try {
      setStatusText('Đang lấy vị trí nếu trình duyệt cho phép...');
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('unavailable'));
          return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        });
      });

      lat = position.coords.latitude;
      lng = position.coords.longitude;
      accuracyMeters = position.coords.accuracy;
      locationStatus = 'GRANTED';
    } catch (locationError) {
      locationStatus =
        locationError instanceof GeolocationPositionError &&
        locationError.code === locationError.PERMISSION_DENIED
          ? 'DENIED'
          : 'UNAVAILABLE';
    }

    try {
      setStatusText(imageDataUrl ? 'Đang gửi check-in kèm ảnh...' : 'Đang xác nhận bạn đã đến...');
      const snapshot = await attendanceApi.submitProof(sessionId, {
        imageDataUrl: imageDataUrl || undefined,
        lat,
        lng,
        accuracyMeters,
        locationStatus,
      });
      setStatusText('Check-in thành công');
      onSuccess(snapshot);
      window.setTimeout(() => {
        onClose();
        setImageDataUrl(null);
        setPreviewUrl(null);
        setStatusText(null);
      }, 900);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không gửi được check-in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl"
          >
            <div className="space-y-5 p-6">
              <div className="flex justify-center">
                <div className="h-1 w-10 rounded-full bg-gray-300" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Gửi check-in</h3>
                  <p className="text-sm text-gray-500">
                    Bạn có thể xác nhận đã đến ngay. Ảnh selfie chỉ là tùy chọn.
                  </p>
                </div>
                <button onClick={onClose} className="rounded-xl p-2 hover:bg-gray-100">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-brand-blue px-4 py-4 text-sm font-black text-white"
                >
                  <Camera size={18} />
                  Chụp ảnh check-in
                </button>
                <button
                  type="button"
                  onClick={() => uploadInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-brand-dark px-4 py-4 text-sm font-black text-white"
                >
                  <ImageUp size={18} />
                  Tải ảnh check-in
                </button>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-green/20 bg-brand-green/5 px-4 py-4 text-sm font-black text-brand-green disabled:opacity-60"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                {submitting ? 'Đang gửi...' : 'Xác nhận đã đến'}
              </button>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={(event) => handleFilePicked(event.target.files?.[0] ?? null)}
              />
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleFilePicked(event.target.files?.[0] ?? null)}
              />

              {previewUrl && (
                <div className="overflow-hidden rounded-3xl border border-gray-100">
                  <img src={previewUrl} alt="Preview" className="h-72 w-full object-cover" />
                </div>
              )}

              {statusText && (
                <div className="rounded-2xl bg-brand-blue/10 px-4 py-3 text-sm font-medium text-brand-blue">
                  {statusText}
                </div>
              )}

              {error && (
                <div className="rounded-2xl bg-brand-coral/10 px-4 py-3 text-sm font-medium text-brand-coral">
                  {error}
                </div>
              )}

              <div className="rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 text-brand-coral" />
                  <p>Nếu trình duyệt cho phép, app sẽ đính kèm vị trí hiện tại. Nếu không, ảnh vẫn được gửi bình thường.</p>
                </div>
              </div>

              {imageDataUrl && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-green to-brand-blue px-4 py-4 text-sm font-black text-white disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                  {submitting ? 'Đang gửi...' : 'Gửi check-in kèm ảnh'}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
