'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassPanel, FilterChip } from '@/components/ui/glass';
import dynamic from 'next/dynamic';
import { buildMapLinks, isAppleDevice } from '@/lib/mapLinks';
import { useApp } from '@/components/AppContext';
import { useModal } from '@/components/ui/Modal';
import { t, translateCategory, translateDescription } from '@/lib/i18n';
import { useTranslatedText } from '@/hooks/useTranslation';

const MapLibreViewer = dynamic(() => import('@/components/map/MapLibreViewer'), { ssr: false });
const RouteMapViewer = dynamic(() => import('@/components/map/RouteMapViewer'), { ssr: false });

export default function MainPage() {
  const [museums, setMuseums] = useState<any[]>([]);
  const [selectedMuseum, setSelectedMuseum] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [countExpanded, setCountExpanded] = useState(false);
  const { locale, darkMode } = useApp();
  const { showAlert } = useModal();
  const router = useRouter();
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [isViewingActiveRoute, setIsViewingActiveRoute] = useState(false);

  useEffect(() => {
    fetch('/api/museums?limit=2000')
      .then(r => r.json())
      .then(res => setMuseums(res.data?.data || res.data || []))
      .catch(console.error);
  }, []);

  // Check for active trip
  useEffect(() => {
    try {
      const trip = localStorage.getItem('activeTrip');
      if (trip) setActiveTrip(JSON.parse(trip));
    } catch { }
  }, []);

  const handleMuseumClick = async (id: string) => {
    const res = await fetch(`/api/museums/${id}`);
    const data = await res.json();
    if (data.data) setSelectedMuseum(data.data);
  };

  const handleSave = async (id: string) => {
    await fetch('/api/saves', { method: 'POST', body: JSON.stringify({ museumId: id }) });
    showAlert(t('modal.picked', locale));
  };

  const filteredMuseums = activeFilter === 'All'
    ? museums
    : museums.filter(m => m.type === activeFilter);

  const appleDevice = typeof window !== 'undefined' && isAppleDevice();
  const mapLinks = selectedMuseum
    ? buildMapLinks({ name: selectedMuseum.name, lat: selectedMuseum.latitude, lng: selectedMuseum.longitude })
    : null;

  const translatedDesc = useTranslatedText(selectedMuseum?.description, locale);
  const isDarkMode = darkMode;

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] flex">
      {/* Map */}
      <div className={`relative flex-1 transition-all duration-300 ${selectedMuseum ? 'hidden sm:block' : ''}`}>
        {isViewingActiveRoute && activeTrip ? (
          <RouteMapViewer
            stops={activeTrip.stops}
            darkMode={isDarkMode}
            onStopClick={(stop) => {
              if (stop.museumId) handleMuseumClick(stop.museumId);
            }}
          />
        ) : (
          <MapLibreViewer
            museums={filteredMuseums}
            onMuseumClick={handleMuseumClick}
            darkMode={isDarkMode}
          />
        )}

        {/* Filters overlay — stacked */}
        {!isViewingActiveRoute && (
          <div className="absolute top-4 left-4 right-4 z-10 flex flex-col gap-2 sm:gap-3 pointer-events-none">
            <div className="flex gap-2 pointer-events-auto overflow-x-auto pb-1 scrollbar-hide">
              {['All', 'Contemporary Art', 'Modern Art', 'Fine Arts', 'Art Gallery', 'General Museum', 'Cultural Center'].map(f => (
                <FilterChip key={f} active={activeFilter === f} onClick={() => setActiveFilter(f)}>
                  {translateCategory(f, locale)}
                </FilterChip>
              ))}
            </div>
          </div>
        )}

        {/* Museum count — clickable expandable badge */}
        {!isViewingActiveRoute && (
          <div className="absolute bottom-4 right-4 z-10">
            <button
              onClick={() => setCountExpanded(prev => !prev)}
              className={`bg-black/80 text-white backdrop-blur-md rounded-2xl shadow-lg cursor-pointer hover:bg-black/90 active:scale-95 transition-all duration-300 overflow-hidden ${countExpanded ? 'px-5 py-3' : 'px-3 py-1.5 text-xs'
                }`}
              style={{ transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              <span className="font-bold text-sm">
                {filteredMuseums.length.toLocaleString()} {t('map.museums', locale)}
              </span>
              {countExpanded && (
                <div className="mt-2 space-y-1 animate-fadeInUp text-left">
                  {['Art Gallery', 'General Museum', 'Contemporary Art', 'Modern Art', 'Fine Arts', 'Cultural Center'].map(cat => {
                    const count = museums.filter(m => m.type === cat).length;
                    if (count === 0) return null;
                    return (
                      <div key={cat} className="flex justify-between gap-6 text-xs">
                        <span className="text-white/60">{translateCategory(cat, locale)}</span>
                        <span className="font-medium">{count.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </button>
          </div>
        )}

        {/* Active Route Button */}
        {activeTrip && !selectedMuseum && (
          <div className="absolute bottom-4 left-4 z-10">
            {isViewingActiveRoute ? (
              <button
                onClick={() => setIsViewingActiveRoute(false)}
                className="bg-white/90 dark:bg-neutral-900/90 text-black dark:text-white px-4 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-black/10 hover:bg-gray-50 dark:hover:bg-neutral-800 active:scale-95 transition-all flex items-center gap-2 backdrop-blur-md border border-gray-200 dark:border-neutral-800"
              >
                ✕ 닫기
              </button>
            ) : (
              <button
                onClick={() => setIsViewingActiveRoute(true)}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 backdrop-blur-md"
              >
                <span className="animate-pulse">🚀</span>
                {t('plans.viewActiveRoute', locale)}
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{activeTrip.title}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Detail Panel — slides in from the right on desktop, full screen on mobile */}
      {selectedMuseum && (
        <div className="w-full sm:w-[420px] h-full bg-white dark:bg-neutral-900 border-l border-gray-200 dark:border-neutral-800 overflow-y-auto shrink-0 animate-slideIn z-20">
          {/* Close button */}
          <button
            onClick={() => setSelectedMuseum(null)}
            className="sticky top-0 z-30 w-full flex items-center gap-2 px-4 py-3 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-gray-100 dark:border-neutral-800 text-sm font-medium text-gray-500 hover:text-black dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
          >
            {t('detail.backToMap', locale)}
          </button>

          {/* Cover Image */}
          <div className="relative h-48 sm:h-56 w-full overflow-hidden">
            <img
              src={selectedMuseum.imageUrl || '/defaultimg.png'}
              alt={selectedMuseum.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = '/defaultimg.png'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* Content */}
          <div className="p-5 space-y-5 stagger-children">
            {/* Name — allow 2 lines */}
            <div>
              <p className="text-xs font-bold tracking-widest text-gray-400 dark:text-neutral-400 uppercase mb-1">
                {translateCategory(selectedMuseum.type, locale)} • {selectedMuseum.city}, {selectedMuseum.country}
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-neutral-50 leading-tight line-clamp-2">
                {selectedMuseum.name}
              </h2>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-neutral-300 leading-relaxed">
              {translatedDesc || translateDescription(selectedMuseum.description, locale)}
            </p>

            {/* Website */}
            {selectedMuseum.website && (
              <a
                href={selectedMuseum.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:underline"
              >
                🌐 {t('detail.officialWebsite', locale)} →
              </a>
            )}

            {/* Opening Hours — from DB */}
            {(() => {
              const hours = selectedMuseum.openingHours as Record<string, string> | null;
              const dayLabels: Record<string, string> = {
                mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
                thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday'
              };
              const dayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

              if (!hours || Object.keys(hours).length === 0) return null;

              return (
                <div className="bg-gray-50 dark:bg-neutral-800/50 border border-transparent dark:border-neutral-800 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">{t('detail.openingHours', locale)}</h3>
                  <div className="text-sm text-gray-700 dark:text-neutral-200 space-y-1">
                    {hours.info ? (
                      <p className="text-sm">{hours.info}</p>
                    ) : (
                      dayOrder.filter(d => hours[d]).map(d => (
                        <div key={d} className="flex justify-between">
                          <span>{dayLabels[d]}</span>
                          <span className="font-medium">{hours[d]}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-2 italic">{t('detail.hoursVary', locale)}</p>
                </div>
              );
            })()}

            {/* Map Navigation */}
            {mapLinks && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">{t('detail.getDirections', locale)}</h3>
                <div className="flex gap-2">
                  <a
                    href={appleDevice ? mapLinks.appleDirections : mapLinks.googleDirections}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-600 dark:bg-blue-600/90 text-white px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition active:scale-95 shadow-md"
                  >
                    🗺️ {appleDevice ? 'Apple Maps' : 'Google Maps'}
                  </a>
                  <a
                    href={appleDevice ? mapLinks.googleDirections : mapLinks.appleDirections}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 bg-white dark:bg-neutral-800/80 border dark:border-neutral-700 text-gray-600 dark:text-neutral-300 px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-neutral-700 transition active:scale-95"
                  >
                    📍
                  </a>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleSave(selectedMuseum.id)}
                className="flex-1 bg-black text-white dark:bg-neutral-100 dark:text-neutral-900 py-3 rounded-xl font-bold shadow-lg shadow-black/20 hover:bg-neutral-800 dark:hover:bg-white transition-all active:scale-95 text-sm"
              >
                {t('detail.pick', locale)}
              </button>
              <button
                onClick={() => {
                  window.open(`/review/new?museumId=${selectedMuseum.id}`, '_self');
                }}
                className="flex-1 bg-white dark:bg-neutral-800/80 text-black dark:text-neutral-200 border border-gray-200 dark:border-neutral-700 py-3 rounded-xl font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-700 transition-all active:scale-95 text-sm"
              >
                {t('detail.writeReview', locale)}
              </button>
            </div>

            {/* Guest Book Preview */}
            {selectedMuseum.reviews && selectedMuseum.reviews.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-3">{t('detail.guestbook', locale)}</h3>
                <div className="space-y-3">
                  {selectedMuseum.reviews.slice(0, 3).map((r: any, i: number) => {
                    const pastels = ['bg-amber-50 dark:bg-amber-400/10 dark:text-amber-100', 'bg-blue-50 dark:bg-blue-400/10 dark:text-blue-100', 'bg-pink-50 dark:bg-pink-400/10 dark:text-pink-100'];
                    return (
                      <div key={r.id} className={`${pastels[i % 3]} rounded-lg p-3 text-sm relative text-gray-800 dark:border dark:border-white/5`}>
                        <p className="italic leading-relaxed" style={{ fontFamily: "'Georgia', serif" }}>
                          &ldquo;{r.content}&rdquo;
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-neutral-400 opacity-80 mt-1.5 font-medium">— {r.user?.name || 'Anonymous'}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
