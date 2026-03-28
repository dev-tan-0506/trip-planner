'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, Search, Loader2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { templatesApi, TemplateListing } from '../../lib/api-client';
import { TemplatePreviewCard } from './TemplatePreviewCard';

export function TemplateLibraryPage() {
  const [templates, setTemplates] = useState<TemplateListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    templatesApi.list().then((list) => {
      setTemplates(list);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = search
    ? templates.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.destinationLabel.toLowerCase().includes(search.toLowerCase()),
      )
    : templates;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-yellow/10">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="p-2 bg-brand-yellow/20 rounded-xl group-hover:bg-brand-yellow/30 transition-colors">
              <Compass size={24} className="text-brand-yellow" />
            </div>
            <span className="font-black text-xl text-gray-900 hidden sm:inline">
              Mẫu hành trình
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center justify-center p-4 bg-brand-coral/10 rounded-full">
            <BookOpen size={40} className="text-brand-coral" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900">
            Khám phá hành trình cộng đồng 🌍
          </h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Tìm mẫu hành trình từ cộng đồng, clone về và chỉnh theo ý bạn chỉ trong 1 click!
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative max-w-lg mx-auto"
        >
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc điểm đến..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all text-gray-900 placeholder:text-gray-400 shadow-sm"
          />
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-brand-coral" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center py-16 space-y-3"
          >
            <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full">
              <BookOpen size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-bold">
              {search ? 'Không tìm thấy mẫu nào' : 'Chưa có mẫu hành trình nào'}
            </p>
            <p className="text-sm text-gray-400">
              {search ? 'Thử từ khóa khác nhé!' : 'Hãy là người đầu tiên chia sẻ hành trình từ chuyến đi của bạn!'}
            </p>
          </motion.div>
        )}

        {/* Template Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05 * i }}
              >
                <TemplatePreviewCard template={template} />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
