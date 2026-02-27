'use client';
import { useState } from 'react';

/* ── Info Table Editor ── */
export function InfoTableEditor({ value, onChange }: { value: any[]; onChange: (v: any[]) => void }) {
    const addRow = () => onChange([...value, { label: '', value: '' }]);
    const removeRow = (i: number) => onChange(value.filter((_, idx) => idx !== i));
    const updateRow = (i: number, key: string, val: string) => {
        const next = [...value];
        next[i] = { ...next[i], [key]: val };
        onChange(next);
    };

    const presets = [
        { label: '🎫 입장료', value: '' },
        { label: '🕐 운영시간', value: '' },
        { label: '📍 위치', value: '' },
        { label: '🚇 교통', value: '' },
        { label: '⏱️ 관람시간', value: '' },
        { label: '🎯 전략', value: '' },
    ];
    const addPresets = () => onChange([...value, ...presets.filter(p => !value.some(v => v.label === p.label))]);

    return (
        <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-tight dark:text-white">📋 방문 정보 테이블</h3>
                <div className="flex gap-2">
                    <button type="button" onClick={addPresets} className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 transition-colors">
                        프리셋 추가
                    </button>
                    <button type="button" onClick={addRow} className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-colors">
                        + 행 추가
                    </button>
                </div>
            </div>
            {value.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">정보가 없습니다. 프리셋 또는 행을 추가하세요.</p>
            ) : (
                <div className="space-y-2">
                    {value.map((row, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <input
                                type="text" value={row.label} onChange={(e) => updateRow(i, 'label', e.target.value)}
                                placeholder="라벨 (예: 🎫 입장료)"
                                className="w-[140px] flex-shrink-0 bg-gray-50 dark:bg-neutral-800 border-none rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white"
                            />
                            <input
                                type="text" value={row.value} onChange={(e) => updateRow(i, 'value', e.target.value)}
                                placeholder="값 (예: 16유로)"
                                className="flex-1 bg-gray-50 dark:bg-neutral-800 border-none rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white"
                            />
                            <button type="button" onClick={() => removeRow(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── Artwork Cards Editor ── */
export function ArtworksEditor({ value, onChange }: { value: any[]; onChange: (v: any[]) => void }) {
    const addWork = () => onChange([...value, { image: '', artist: '', title: '', description: '' }]);
    const removeWork = (i: number) => onChange(value.filter((_, idx) => idx !== i));
    const updateWork = (i: number, key: string, val: string) => {
        const next = [...value];
        next[i] = { ...next[i], [key]: val };
        onChange(next);
    };

    return (
        <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-tight dark:text-white">🖼️ 주요 작품</h3>
                <button type="button" onClick={addWork} className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-colors">
                    + 작품 추가
                </button>
            </div>
            {value.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">작품이 없습니다. 추가 버튼을 눌러주세요.</p>
            ) : (
                <div className="space-y-4">
                    {value.map((work, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-4 relative">
                            <button type="button" onClick={() => removeWork(i)} className="absolute top-3 right-3 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <input type="text" value={work.artist} onChange={(e) => updateWork(i, 'artist', e.target.value)}
                                    placeholder="작가명" className="bg-white dark:bg-neutral-900 border-none rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white" />
                                <input type="text" value={work.title} onChange={(e) => updateWork(i, 'title', e.target.value)}
                                    placeholder="작품명" className="bg-white dark:bg-neutral-900 border-none rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white" />
                            </div>
                            <input type="text" value={work.image} onChange={(e) => updateWork(i, 'image', e.target.value)}
                                placeholder="이미지 URL (https://...)" className="w-full bg-white dark:bg-neutral-900 border-none rounded-xl px-3 py-2.5 text-xs font-mono focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white mb-3" />
                            <textarea value={work.description} onChange={(e) => updateWork(i, 'description', e.target.value)}
                                placeholder="작품 설명 (선택)" rows={2} className="w-full bg-white dark:bg-neutral-900 border-none rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white resize-none" />
                            {work.image && (
                                <img src={work.image} alt={work.title} className="w-20 h-20 rounded-xl object-cover mt-2" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── Museum Search/Link Editor ── */
export function MuseumLinker({ selectedMuseums, onChange }: { selectedMuseums: any[]; onChange: (v: any[]) => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    const search = async () => {
        if (!query.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(`/api/museums?q=${encodeURIComponent(query)}&limit=10`);
            const json = await res.json();
            // API returns { data: { data: [...], total } } via successResponse
            const list = json?.data?.data || json?.data || [];
            setResults(Array.isArray(list) ? list : []);
        } catch { setResults([]); }
        setSearching(false);
    };

    const addMuseum = (m: any) => {
        if (!selectedMuseums.some(s => s.id === m.id)) {
            onChange([...selectedMuseums, { id: m.id, name: m.name, city: m.city, country: m.country, imageUrl: m.imageUrl }]);
        }
    };

    const removeMuseum = (id: string) => {
        onChange(selectedMuseums.filter(m => m.id !== id));
    };

    return (
        <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-tight dark:text-white mb-4">🏛️ 관련 박물관</h3>

            {/* Search */}
            <div className="flex gap-2 mb-4">
                <input
                    type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), search())}
                    placeholder="박물관/미술관 검색..."
                    className="flex-1 bg-gray-50 dark:bg-neutral-800 border-none rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white"
                />
                <button type="button" onClick={search} disabled={searching}
                    className="px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                    {searching ? '...' : '검색'}
                </button>
            </div>

            {/* Search Results */}
            {results.length > 0 && (
                <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-3 mb-4 max-h-[200px] overflow-y-auto space-y-1">
                    {results.map((m) => (
                        <button key={m.id} type="button" onClick={() => addMuseum(m)}
                            disabled={selectedMuseums.some(s => s.id === m.id)}
                            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white dark:hover:bg-neutral-800 transition-colors text-left disabled:opacity-30">
                            {m.imageUrl ? (
                                <img src={m.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 text-sm">🏛️</div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold dark:text-white truncate">{m.name}</p>
                                <p className="text-[10px] text-gray-400">{m.city}, {m.country}</p>
                            </div>
                            <span className="text-[10px] text-purple-500 font-bold">+ 추가</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Selected Museums */}
            {selectedMuseums.length > 0 ? (
                <div className="space-y-2">
                    {selectedMuseums.map((m) => (
                        <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20">
                            {m.imageUrl ? (
                                <img src={m.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 text-sm">🏛️</div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold dark:text-white truncate">{m.name}</p>
                                <p className="text-[10px] text-gray-400">{m.city}, {m.country}</p>
                            </div>
                            <button type="button" onClick={() => removeMuseum(m.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-gray-400 text-center py-4">연결된 박물관이 없습니다.</p>
            )}
        </div>
    );
}
