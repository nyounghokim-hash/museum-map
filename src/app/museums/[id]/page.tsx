'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GlassPanel } from '@/components/ui/glass';

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

    return (
        <div className="max-w-4xl mx-auto p-6 mt-6">
            <button onClick={() => router.back()} className="text-gray-500 text-sm mb-6 inline-block hover:text-black font-medium transition-colors">
                ← Back
            </button>

            <GlassPanel intensity="heavy" className="p-8 mb-8 relative overflow-hidden group">
                <div className="relative z-10">
                    <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">{data.type} • {data.city}, {data.country}</p>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4">{data.name}</h1>
                    <p className="text-gray-700 leading-relaxed max-w-2xl mb-8">{data.description || 'No detailed description available.'}</p>

                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push(`/review/new?museumId=${data.id}`)}
                            className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-neutral-800 transition shadow-lg active:scale-95"
                        >
                            Mark as Visited & Review
                        </button>
                        <button
                            onClick={async () => {
                                await fetch('/api/saves', { method: 'POST', body: JSON.stringify({ museumId: data.id }) });
                                alert('Saved!');
                            }}
                            className="bg-white border text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition shadow-sm active:scale-95"
                        >
                            Save to Folder
                        </button>
                    </div>
                </div>
            </GlassPanel>

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
                                    {/* Tape decoration */}
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
