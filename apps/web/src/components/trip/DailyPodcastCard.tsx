'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  dailyPodcastApi,
  type DailyPodcastRecap,
  type DayGroup,
} from '../../lib/api-client';

interface DailyPodcastCardProps {
  tripId: string;
  days?: DayGroup[];
}

function getDefaultDayIndex(days: DayGroup[]) {
  const lastDayWithItems = [...days].reverse().find((day) => day.items.length > 0);
  return lastDayWithItems?.dayIndex ?? 0;
}

function formatDurationLabel(durationSeconds: number) {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  if (!minutes) {
    return `${seconds}s`;
  }

  return `${minutes}p ${seconds.toString().padStart(2, '0')}s`;
}

function getSpeechSynthesisSupport() {
  if (typeof window === 'undefined') {
    return null;
  }

  const synth = window.speechSynthesis;
  if (!synth || typeof window.SpeechSynthesisUtterance === 'undefined') {
    return null;
  }

  return synth;
}

export function DailyPodcastCard({ tripId, days = [] }: DailyPodcastCardProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => getDefaultDayIndex(days));
  const [recap, setRecap] = useState<DailyPodcastRecap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playbackNotice, setPlaybackNotice] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDayIndex(getDefaultDayIndex(days));
  }, [days]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    dailyPodcastApi
      .getDailyPodcast(tripId, selectedDayIndex)
      .then((result) => {
        if (!active) return;
        setRecap(result.recap);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Khong tai duoc recap cuoi ngay');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedDayIndex, tripId]);

  useEffect(() => {
    return () => {
      const synth = getSpeechSynthesisSupport();
      if (synth) {
        synth.cancel();
      }
    };
  }, []);

  const dayOptions = useMemo(() => {
    if (!days.length) {
      return [{ dayIndex: 0, label: 'Ngay 1' }];
    }

    return days.map((day) => ({
      dayIndex: day.dayIndex,
      label: `Ngay ${day.dayIndex + 1}`,
    }));
  }, [days]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      setPlaybackNotice(null);
      const nextRecap = await dailyPodcastApi.generateDailyPodcast(tripId, selectedDayIndex, {
        tone: 'playful',
      });
      setRecap(nextRecap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong tao duoc recap cuoi ngay');
    } finally {
      setGenerating(false);
    }
  };

  const handlePlay = () => {
    if (!recap) {
      return;
    }

    if (recap.audioUrl) {
      if (typeof window !== 'undefined') {
        window.open(recap.audioUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    const synth = getSpeechSynthesisSupport();
    if (recap.audioMode === 'BROWSER_TTS' && synth) {
      const utterance = new window.SpeechSynthesisUtterance(recap.transcript);
      utterance.lang = 'vi-VN';
      utterance.rate = 1;
      utterance.onend = () => setPlaying(false);
      utterance.onerror = () => {
        setPlaying(false);
        setPlaybackNotice('Trinh duyet dang chan doc audio, nen minh giu ban text de ca nhom doc nhanh.');
      };

      setPlaying(true);
      setPlaybackNotice(null);
      synth.cancel();
      synth.speak(utterance);
      return;
    }

    setPlaybackNotice('May nay chua ho tro speechSynthesis, nen minh hien ban recap text de doc nhanh.');
  };

  return (
    <section className="rounded-[28px] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Podcast ngay</p>
          <h3 className="mt-2 text-lg font-black text-gray-900">
            Recap vui cho cuoi ngay {selectedDayIndex + 1}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Mot doan recap gon de nghe tren web, va van co ban text de doc ngay khi audio khong san sang.
          </p>
        </div>

        <label className="text-xs font-semibold text-gray-500">
          Chon ngay
          <select
            value={selectedDayIndex}
            onChange={(event) => setSelectedDayIndex(Number(event.target.value))}
            className="mt-2 block rounded-2xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-700"
          >
            {dayOptions.map((option) => (
              <option key={option.dayIndex} value={option.dayIndex}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {generating ? 'Dang tao recap...' : recap ? 'Tao lai recap' : 'Tao recap ngay'}
        </button>

        <button
          type="button"
          onClick={handlePlay}
          disabled={!recap || playing}
          className="rounded-2xl bg-brand-dark px-4 py-3 text-sm font-black text-white transition hover:bg-brand-dark/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {playing ? 'Dang phat...' : 'Phat recap'}
        </button>
      </div>

      {loading ? (
        <div className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-sm text-gray-500">
          Dang tim recap cuoi ngay...
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {playbackNotice ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {playbackNotice}
        </div>
      ) : null}

      {recap ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-3xl border border-white/70 bg-white/90 p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-700">
              <span>{recap.title}</span>
              <span className="rounded-full bg-emerald-100 px-2 py-1">{recap.audioMode}</span>
              <span className="rounded-full bg-sky-100 px-2 py-1">
                {formatDurationLabel(recap.durationSeconds)}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Tom tat nhanh</p>
              <p className="mt-2 text-sm leading-6 text-gray-700">{recap.recapText}</p>
            </div>
            <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Ban transcript</p>
              <p className="mt-2 text-sm leading-6 text-gray-600">{recap.transcript}</p>
            </div>
          </div>
        </div>
      ) : !loading ? (
        <div className="mt-4 rounded-2xl border border-dashed border-emerald-200 bg-white/80 px-4 py-3 text-sm text-gray-600">
          Chua co recap nao cho ngay nay. Bam "Tao recap ngay" de co mot ban tong ket gon cho ca nhom.
        </div>
      ) : null}
    </section>
  );
}
