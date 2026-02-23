'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { GlassPanel, FilterChip } from '@/components/ui/glass';
import dynamic from 'next/dynamic';
import { buildMapLinks, isAppleDevice } from '@/lib/mapLinks';
import { useApp } from '@/components/AppContext';
import { useModal } from '@/components/ui/Modal';
import { t, translateCategory, translateDescription } from '@/lib/i18n';
import { useTranslatedText } from '@/hooks/useTranslation';
import MuseumDetailCard from '@/components/museum/MuseumDetailCard';
import * as gtag from '@/lib/gtag';

const MapLibreViewer = dynamic(() => import('@/components/map/MapLibreViewer'), { ssr: false });
const RouteMapViewer = dynamic(() => import('@/components/map/RouteMapViewer'), { ssr: false });
const TripDetailPanel = dynamic(() => import('@/components/map/TripDetailPanel'), { ssr: false });

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
  const { data: session, status } = useSession();

  // Show detailed panel if museum selected OR if viewing active route (and not seeing a specific museum)
  const isPanelOpen = !!selectedMuseum || (isViewingActiveRoute && !!activeTrip);

  useEffect(() => {
    fetch('/api/museums?limit=2000')
      .then(r => r.json())
      .then(res => setMuseums(res.data?.data || res.data || []))
      .catch(console.error);
  }, []);

  // Check for active trip
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      setActiveTrip(null);
      setIsViewingActiveRoute(false);
      return;
    }

    try {
      const trip = localStorage.getItem('activeTrip');
      if (trip) setActiveTrip(JSON.parse(trip));
    } catch { }
  }, [status]);

  const handleMuseumClick = async (id: string) => {
    const museum = museums.find(m => m.id === id);
    if (museum) {
      setSelectedMuseum(museum);
    } else {
      // Fallback behavior if museum not found in current loaded list
      router.push(`/museums/${id}`);
    }
  };

  const filteredMuseums = activeFilter === 'All'
    ? museums
    : museums.filter(m => m.type === activeFilter);

  const isDarkMode = darkMode;

  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Only allow swipe down if scrolled to the very top
    if (e.currentTarget.scrollTop <= 0) {
      setTouchStart(e.touches[0].clientY);
    } else {
      setTouchStart(null);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientY;
    // If swiped down by more than 100px, close the panel
    if (touchEnd - touchStart > 100) {
      setSelectedMuseum(null);
    }
    setTouchStart(null);
  };

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] flex overflow-hidden">
      {/* PC Click-outside Overlay */}
      {selectedMuseum && (
        <div
          className="hidden md:block absolute inset-0 z-30 cursor-pointer"
          onClick={() => setSelectedMuseum(null)}
          aria-label="Close detail panel"
        />
      )}

      {/* Map */}
      <div className="relative flex-1 transition-all duration-300">
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
                <FilterChip key={f} active={activeFilter === f} onClick={() => {
                  setActiveFilter(f);
                  gtag.event('filter_museums', {
                    category: 'filter',
                    label: f,
                    value: 1
                  });
                }}>
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
        {activeTrip && (
          <div className="absolute bottom-4 left-4 z-10">
            {isViewingActiveRoute ? (
              <button
                onClick={() => setIsViewingActiveRoute(false)}
                className="bg-white/90 dark:bg-neutral-900/90 text-black dark:text-white px-4 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-black/10 hover:bg-gray-50 dark:hover:bg-neutral-800 active:scale-95 transition-all flex items-center gap-2 backdrop-blur-md border border-gray-200 dark:border-neutral-800"
              >
                ✕ {t('modal.cancel', locale) || 'Cancel'}
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

      <div
        className={`absolute top-0 right-0 h-full w-full md:w-[600px] lg:w-[700px] max-w-full 
          bg-neutral-50 dark:bg-neutral-950 md:bg-transparent md:dark:bg-transparent 
          shadow-2xl md:shadow-none transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-40 
          overflow-y-auto hide-scrollbar md:p-6 lg:p-8
          border-l border-gray-200 dark:border-neutral-800 md:border-none
          ${isPanelOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full flex flex-col pb-12 md:pb-6">
          {selectedMuseum ? (
            <MuseumDetailCard
              museumId={selectedMuseum.id}
              onClose={() => setSelectedMuseum(null)}
              isMapContext={true}
            />
          ) : (activeTrip && isViewingActiveRoute) ? (
            <TripDetailPanel
              trip={activeTrip}
              onClose={() => setIsViewingActiveRoute(false)}
              onMuseumClick={handleMuseumClick}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
