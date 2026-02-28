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

  // AI Recommend
  const [aiQuery, setAiQuery] = useState('');
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Show detailed panel if museum selected OR if viewing active route (and not seeing a specific museum)
  const isPanelOpen = !!selectedMuseum || (isViewingActiveRoute && !!activeTrip);

  useEffect(() => {
    fetch('/api/museums?limit=5000')
      .then(r => r.json())
      .then(res => setMuseums(res.data?.data || res.data || []))
      .catch(console.error);
  }, []);

  const handleAiRecommend = async () => {
    if (!aiQuery.trim() || aiLoading) return;
    setAiLoading(true);
    setAiResults([]);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery, locale })
      });
      const data = await res.json();
      if (data.data?.length > 0) {
        setAiResults(data.data);
      } else {
        showAlert(translateCategory('ai.noResults', locale));
      }
    } catch {
      showAlert(translateCategory('ai.error', locale));
    } finally {
      setAiLoading(false);
    }
  };

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

  const filteredMuseums = museums.filter(m => {
    const matchesFilter = activeFilter === 'All' || m.type === activeFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      m.name?.toLowerCase().includes(q) ||
      m.nameEn?.toLowerCase().includes(q) ||
      m.city?.toLowerCase().includes(q) ||
      m.country?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

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
    <div className="relative w-full h-[calc(100vh-3.5rem-70px)] lg:h-[calc(100vh-3.5rem)] flex overflow-hidden">
      {/* PC Click-outside Overlay */}
      {selectedMuseum && (
        <div
          className="hidden lg:block absolute inset-0 z-30 cursor-pointer"
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

        {/* Filters overlay — Search → Categories → AI */}
        {!isViewingActiveRoute && (
          <div className={`absolute top-4 left-4 z-10 flex flex-col gap-2 sm:gap-3 pointer-events-none transition-all duration-500 ${isPanelOpen ? 'hidden lg:flex lg:right-[716px]' : 'right-4'}`}>
            {/* Search Bar */}
            <div className="pointer-events-auto">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={translateCategory('search.placeholder', locale)}
                  className="w-full pl-8 pr-4 py-3 bg-white/92 dark:bg-neutral-900/92 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100/50 dark:border-neutral-800/50 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-300 dark:focus:border-purple-700 transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
                {searchQuery.trim().length > 0 && filteredMuseums.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/50 dark:border-neutral-800/50 max-h-60 overflow-y-auto z-50">
                    {filteredMuseums.slice(0, 8).map(m => (
                      <button
                        key={m.id}
                        className="w-full text-left px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border-b border-gray-50 dark:border-neutral-800/50 last:border-0"
                        onClick={() => {
                          setSelectedMuseum(m);
                          setSearchQuery('');
                        }}
                      >
                        <div className="text-sm font-bold text-gray-800 dark:text-white truncate">{m.name}</div>
                        {m.nameEn && <div className="text-[11px] text-gray-400 dark:text-neutral-500 truncate">{m.nameEn}</div>}
                        <div className="text-[10px] text-gray-400 mt-0.5">{m.city}, {m.country}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Category Chips */}
            <div className="flex gap-2 pointer-events-auto overflow-x-auto pb-1 scrollbar-hide">
              {['All', 'Art Gallery', 'Contemporary Art', 'Modern Art', 'Fine Arts', 'General Museum', 'History Museum', 'Natural History', 'Science Museum', 'Maritime Museum', 'Archaeological Museum', 'Photography Museum', 'Design Museum', 'Cultural Center'].map(f => (
                <FilterChip key={f} active={activeFilter === f} onClick={() => {
                  setActiveFilter(f);
                  setAiOpen(false);
                  setAiResults([]);
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

        {/* AI Recommend — PC: bottom-left, Mobile/Tablet: above bottom nav */}
        {!isViewingActiveRoute && !isPanelOpen && (
          <div className="absolute bottom-[94px] lg:bottom-4 left-4 right-[120px] z-10 pointer-events-none">
            <div className="pointer-events-auto">
              {!aiOpen ? (
                <button
                  onClick={() => setAiOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-full shadow-lg border border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all active:scale-95"
                >
                  <span className="text-lg">✨</span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {translateCategory('ai.recommend', locale)}
                  </span>
                </button>
              ) : (
                <div className="flex flex-col-reverse gap-2">
                  <form onSubmit={(e) => { e.preventDefault(); handleAiRecommend(); }} className="flex gap-2">
                    <input
                      type="text"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder={translateCategory('ai.placeholder', locale)}
                      className="flex-1 px-4 py-2.5 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-full shadow-lg border border-purple-200 dark:border-purple-800 text-sm text-gray-800 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={aiLoading}
                      className="px-4 py-2.5 bg-purple-600 text-white rounded-full text-sm font-bold shadow-lg hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-50 shrink-0"
                    >
                      {aiLoading ? '...' : '✨'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAiOpen(false); setAiResults([]); setAiQuery(''); }}
                      className="px-3 py-2.5 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md rounded-full shadow-lg text-gray-500 hover:text-gray-800 dark:hover:text-white text-sm active:scale-95 transition-all shrink-0"
                    >✕</button>
                  </form>

                  {/* AI Results — shown above input */}
                  {aiResults.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {aiResults.map((m: any) => (
                        <button
                          key={m.id}
                          onClick={() => { handleMuseumClick(m.id); setAiOpen(false); }}
                          className="flex-shrink-0 w-48 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 dark:border-neutral-800 p-3 text-left hover:shadow-xl active:scale-[0.98] transition-all"
                        >
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{m.name}</h4>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {m.city && `${m.city}, `}{(() => { try { return new Intl.DisplayNames([locale], { type: 'region' }).of(m.country) || m.country; } catch { return m.country; } })()}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-[10px] font-medium truncate max-w-full">
                            {translateCategory(m.type || '', locale)}
                          </span>
                          {m.reason && (
                            <p className="mt-1.5 text-[10px] text-gray-500 dark:text-gray-400 leading-snug line-clamp-2" title={m.reason}>
                              💡 {m.reason}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {aiLoading && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-xl shadow-lg">
                      <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{translateCategory('ai.loading', locale)}</span>
                    </div>
                  )}
                  {!aiLoading && aiResults.length === 0 && aiQuery && (
                    <div className="px-4 py-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-xl shadow-lg">
                      <span className="text-xs text-gray-400">{translateCategory('ai.hint', locale)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Museum count — clickable expandable badge */}
        {!isViewingActiveRoute && (
          <div className="absolute bottom-[94px] lg:bottom-4 right-4 z-10">
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
                  {['Art Gallery', 'Contemporary Art', 'History Museum', 'General Museum', 'Natural History', 'Maritime Museum', 'Science Museum', 'Fine Arts', 'Modern Art', 'Archaeological Museum', 'Cultural Center', 'Photography Museum', 'Design Museum'].map(cat => {
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
                className="bg-purple-600 text-white px-4 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-purple-600/30 hover:bg-purple-700 active:scale-95 transition-all flex items-center gap-2 backdrop-blur-md"
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
        className={`absolute top-0 right-0 h-full w-full lg:w-[700px] max-w-full 
          bg-neutral-50 dark:bg-neutral-950 lg:bg-transparent lg:dark:bg-transparent 
          shadow-2xl lg:shadow-none transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-40 
          overflow-y-auto hide-scrollbar lg:p-8
          border-l border-gray-200 dark:border-neutral-800 lg:border-none
          ${isPanelOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full flex flex-col pb-12 lg:pb-6">
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
