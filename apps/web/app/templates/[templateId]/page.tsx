'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Copy,
  Users,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import {
  templatesApi,
  CommunityTemplate,
} from '../../../src/lib/api-client';
import { CloneTemplateDialog } from '../../../src/components/templates/CloneTemplateDialog';

export default function TemplateDetailPage() {
  const params = useParams<{ templateId: string }>();
  const [template, setTemplate] = useState<CommunityTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showClone, setShowClone] = useState(false);

  useEffect(() => {
    if (params.templateId) {
      templatesApi
        .get(params.templateId)
        .then(setTemplate)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [params.templateId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-light via-white to-brand-yellow/10">
        <Loader2 size={32} className="animate-spin text-brand-coral" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-light via-white to-brand-yellow/10">
        <div className="text-center space-y-3">
          <p className="text-xl font-black text-gray-900">
            Không tìm thấy mẫu 😔
          </p>
          <Link
            href="/templates"
            className="text-brand-coral font-bold hover:underline"
          >
            ← Quay lại thư viện
          </Link>
        </div>
      </div>
    );
  }

  const snapshot = template.sanitizedSnapshot;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-yellow/10">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/templates"
            className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={16} /> Thư viện
          </Link>
          <button
            onClick={() => setShowClone(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-brand-coral to-brand-yellow text-white rounded-2xl font-bold text-sm shadow-lg shadow-brand-coral/20 hover:shadow-xl transition-all active:scale-[0.98]"
          >
            Clone về trip mới 🚀
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Template Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 space-y-4"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-brand-coral bg-brand-coral/10 px-3 py-1.5 rounded-full w-fit">
            <MapPin size={12} />
            {template.destinationLabel}
          </div>

          <h1 className="text-3xl font-black text-gray-900 leading-tight">
            {template.title}
          </h1>

          {template.summary && (
            <p className="text-gray-600">{template.summary}</p>
          )}
          {template.coverNote && (
            <p className="text-sm text-gray-500 italic">
              💡 {template.coverNote}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-400 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <Calendar size={14} /> {template.daysCount} ngày
            </span>
            <span className="flex items-center gap-1">
              <Copy size={14} /> {template.cloneCount} bản sao
            </span>
            {template.publishedBy.name && (
              <span className="flex items-center gap-1">
                <Users size={14} /> {template.publishedBy.name}
              </span>
            )}
          </div>
        </motion.div>

        {/* Day-by-Day Preview from sanitizedSnapshot */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-gray-900">
            Lịch trình chi tiết
          </h2>

          {snapshot.days.map((day) => (
            <motion.div
              key={day.dayIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: day.dayIndex * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-brand-coral/5 to-brand-yellow/5 px-5 py-3 border-b border-gray-50">
                <h3 className="font-black text-gray-900">
                  Ngày {day.dayIndex + 1}
                </h3>
              </div>

              <div className="divide-y divide-gray-50">
                {day.items.map((item, i) => (
                  <div key={i} className="px-5 py-3 flex items-start gap-3">
                    {item.startMinute !== null && (
                      <span className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0 pt-0.5">
                        <Clock size={12} />
                        {String(Math.floor(item.startMinute / 60)).padStart(
                          2,
                          '0',
                        )}
                        :{String(item.startMinute % 60).padStart(2, '0')}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">
                        {item.title}
                      </p>
                      {item.locationName && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {item.locationName}
                        </p>
                      )}
                      {item.shortNote && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.shortNote}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center py-6"
        >
          <button
            onClick={() => setShowClone(true)}
            className="px-8 py-4 bg-gradient-to-r from-brand-coral to-brand-yellow text-white rounded-2xl font-black text-lg shadow-lg shadow-brand-coral/20 hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Clone hành trình này 🚀
          </button>
        </motion.div>
      </main>

      {/* Clone Dialog */}
      <CloneTemplateDialog
        template={template}
        open={showClone}
        onClose={() => setShowClone(false)}
      />
    </div>
  );
}
