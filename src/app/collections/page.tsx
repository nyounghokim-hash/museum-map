'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CollectionsPage() {
    const [collections, setCollections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/collections')
            .then(r => r.json())
            .then(res => {
                setCollections(res.data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this collection?')) return;
        await fetch(`/api/collections/${id}`, { method: 'DELETE' });
        setCollections(prev => prev.filter(c => c.id !== id));
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-4 sm:p-8 sm:mt-10">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold">My Collections</h1>
                <p className="text-gray-500 mt-2 text-sm">Your saved museum folders.</p>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400 animate-pulse">Loading collections...</div>
            ) : collections.length === 0 ? (
                <div className="py-20 text-center">
                    <div className="text-6xl mb-4">📁</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No collections yet</h2>
                    <p className="text-gray-500 mb-6">Save museums and organize them into collections!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {collections.map((col) => (
                        <Link
                            key={col.id}
                            href={`/collections/${col.id}`}
                            className="border border-gray-200 p-5 sm:p-6 rounded-2xl bg-white shadow-sm hover:shadow-md hover:border-black/50 transition-all flex flex-col justify-between h-40 relative group"
                        >
                            {/* Delete button */}
                            <button
                                onClick={(e) => handleDelete(col.id, e)}
                                className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all z-10"
                                title="Delete collection"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>

                            <div>
                                <div className="flex justify-between items-start mb-2 pr-8">
                                    <h2 className="text-xl font-bold">{col.title}</h2>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${col.isPublic ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {col.isPublic ? 'Public' : 'Private'}
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm">{col._count?.items || 0} museums saved</p>
                            </div>

                            <div className="text-sm font-semibold text-blue-600">
                                View Folder →
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Add New Collection card */}
            {!loading && (
                <Link href="/collections/new" className="block mt-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-black hover:bg-gray-50 transition-all cursor-pointer group active:scale-[0.98]">
                        <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-black flex items-center justify-center transition-colors mb-2">
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-400 group-hover:text-black transition-colors">New Collection</span>
                    </div>
                </Link>
            )}
        </div>
    );
}
