'use client';

import { motion } from 'framer-motion';
import { MapPin, Calendar, Copy, Users } from 'lucide-react';
import Link from 'next/link';
import { TemplateListing } from '../../lib/api-client';

interface TemplatePreviewCardProps {
  template: TemplateListing;
}

export function TemplatePreviewCard({ template }: TemplatePreviewCardProps) {
  return (
    <Link href={`/templates/${template.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="group bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden hover:shadow-xl hover:border-brand-coral/20 transition-all cursor-pointer"
      >
        {/* Top accent gradient */}
        <div className="h-2 bg-gradient-to-r from-brand-coral via-brand-yellow to-brand-green" />

        <div className="p-6 space-y-4">
          {/* Destination label */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-coral bg-brand-coral/10 px-3 py-1.5 rounded-full w-fit">
            <MapPin size={12} />
            {template.destinationLabel}
          </div>

          {/* Title */}
          <h3 className="text-lg font-black text-gray-900 group-hover:text-brand-coral transition-colors leading-tight">
            {template.title}
          </h3>

          {/* Summary */}
          {template.summary && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {template.summary}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar size={12} /> {template.daysCount} ngày
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Copy size={12} /> {template.cloneCount} bản sao
              </span>
            </div>
            {template.publishedBy.name && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Users size={12} /> {template.publishedBy.name}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
