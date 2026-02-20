'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function CollectionsPage() {
    const [collections, setCollections] = useState([
        { id: 'my-favorites', title: 'My Favorites', count: 5, isPublic: false },
        { id: 'europe-contemporary', title: 'Europe Contemporary Tour', count: 12, isPublic: true },
    ]);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this collection?')) return;
        setCollections(prev => prev.filter(c => c.id !== id));
        // TODO: Call DELETE /api/collections/:id
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-4 sm:p-8 sm:mt-10">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold">My Collections</h1>
                <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-neutral-800 transition-colors">
                    + New Folder
                </button>
            </div>

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
                            <p className="text-gray-500 text-sm">{col.count} museums saved</p>
                        </div>

                        <div className="text-sm font-semibold text-blue-600">
                            View Folder →
                        </div>
                    </Link>
                ))}

                {collections.length === 0 && (
                    <div className="col-span-full py-16 text-center text-gray-400">
                        No collections yet. Create your first folder!
                    </div>
                )}
            </div>
        </div>
    );
}
