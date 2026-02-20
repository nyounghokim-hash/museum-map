'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GlassPanel } from '@/components/ui/glass';
import { buildMapLinks, isAppleDevice } from '@/lib/mapLinks';

export default function MuseumDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/museums/${id}`)
            .then(r => r.json())
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(console.error);
    }, [id]);

    if (loading) return <div className="p-20 text-center animate-pulse">Loading Museum Details...</div>;
    if (!data) return <div className="p-20 text-center">Museum Not Found</div>;

    const mapLinks = buildMapLinks({ name: data.name, lat: data.latitude, lng: data.longitude });
    const appleFirst = typeof window !== 'undefined' && isAppleDevice();

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 mt-4 sm:mt-6">
            <button onClick={() => router.back()} className="text-gray-500 text-sm mb-6 inline-block hover:text-black font-medium transition-colors">
                ← Back
            </button>

            {/* Hero Card with Cover Image */}
            <GlassPanel intensity="heavy" className="mb-8 relative overflow-hidden group">
                {/* Cover Image */}
                {data.imageUrl ? (
                    <div className="relative h-56 sm:h-72 w-full overflow-hidden">
                        <img
                            src={data.imageUrl}
                            alt={data.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-4 left-6 right-6">
                            <p className="text-xs font-bold tracking-widest text-white/80 uppercase mb-1">{data.type} • {data.city}, {data.country}</p>
                            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">{data.name}</h1>
                        </div>
                    </div>
                ) : (
                    <div className="relative h-40 w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">{data.type} • {data.city}, {data.country}</p>
                            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-gray-900">{data.name}</h1>
                        </div>
                    </div>
                )}

                {/* Info & Actions */}
                <div className="p-6 sm:p-8">
                    <p className="text-gray-700 leading-relaxed max-w-2xl mb-6">{data.description || 'A premier contemporary art institution.'}</p>

                    {/* Website Link */}
                    {data.website && (
                        <a
                            href={data.website}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:underline mb-6"
                        >
                            🌐 Official Website →
                        </a>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => router.push(`/review/new?museumId=${data.id}`)}
                            className="bg-black text-white px-5 py-3 rounded-xl font-bold hover:bg-neutral-800 transition shadow-lg active:scale-95 text-sm"
                        >
                            Mark as Visited & Review
                        </button>
                        <button
                            onClick={async () => {
                                await fetch('/api/saves', { method: 'POST', body: JSON.stringify({ museumId: data.id }) });
                                alert('Saved!');
                            }}
                            className="bg-white border text-black px-5 py-3 rounded-xl font-bold hover:bg-gray-50 transition shadow-sm active:scale-95 text-sm"
                        >
                            Save to Folder
                        </button>
                    </div>

                    {/* Map Navigation */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-700 mb-3">Get Directions</h3>
                        <div className="flex flex-wrap gap-2">
                            <a
                                href={appleFirst ? mapLinks.appleDirections : mapLinks.googleDirections}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition active:scale-95 shadow-md"
                            >
                                🗺️ {appleFirst ? 'Apple Maps' : 'Google Maps'}
                            </a>
                            <a
                                href={appleFirst ? mapLinks.googleDirections : mapLinks.appleDirections}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 bg-white border text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition active:scale-95"
                            >
                                📍 {appleFirst ? 'Google Maps' : 'Apple Maps'}
                            </a>
                        </div>
                    </div>
                </div>
            </GlassPanel>

            {/* Guest Book Reviews */}
            <div>
                <h2 className="text-2xl font-bold mb-6">Guest Book</h2>
                {data.reviews && data.reviews.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {data.reviews.map((r: any, i: number) => {
                            const pastels = ['bg-amber-50', 'bg-blue-50', 'bg-pink-50', 'bg-green-50', 'bg-purple-50', 'bg-yellow-50'];
                            const rotations = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-0', 'rotate-2', '-rotate-1'];
                            const bg = pastels[i % pastels.length];
                            const rot = rotations[i % rotations.length];
                            return (
                                <div
                                    key={r.id}
                                    className={`${bg} ${rot} rounded-lg p-5 shadow-md hover:shadow-xl hover:rotate-0 transition-all duration-300 relative border border-gray-100/50`}
                                >
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 bg-yellow-200/80 rounded-sm shadow-sm" />
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap mt-2 mb-4" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                                        &ldquo;{r.content}&rdquo;
                                    </p>
                                    <div className="flex justify-between items-end pt-2 border-t border-gray-200/50">
                                        <span className="text-xs font-semibold text-gray-600">
                                            — {r.user?.name || 'Anonymous'}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-amber-50 rounded-lg p-8 text-center shadow-sm border border-amber-100/50 -rotate-1">
                        <p className="text-lg mb-1" style={{ fontFamily: "'Georgia', serif" }}>📝</p>
                        <p className="text-gray-600 italic text-sm" style={{ fontFamily: "'Georgia', serif" }}>
                            No notes yet. Be the first to leave a note!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
