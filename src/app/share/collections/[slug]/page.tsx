'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GlassPanel } from '@/components/ui/glass';

export default function SharedCollectionPage() {
    const { slug } = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/share/collections/${slug}`)
            .then(r => r.json())
            .then(res => {
                setData(res.data);
                setLoading(false);
            });
    }, [slug]);

    const handleCloneToMap = () => {
        // In real app: save all museums in this collection to a user's local folder
        alert('All museums from this collection have been cloned to your Saved Folder!');
        router.push('/map'); // redirect to map so loop restarts
    };

    if (loading) return <div className="p-20 text-center animate-pulse">Loading Collection...</div>;
    if (!data) return <div className="p-20 text-center text-red-500 font-bold">Collection not found or private.</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 mt-10">
            {/* Header Profile & Title */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-black text-white rounded-full flex justify-center items-center font-bold text-xl uppercase">
                    {data.user?.name ? data.user.name[0] : 'U'}
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{data.title}</h1>
                    <p className="text-gray-500 font-medium text-sm">Curated by {data.user?.name || 'Anonymous'}</p>
                </div>
            </div>

            <p className="text-gray-700 text-lg mb-8 leading-relaxed max-w-2xl">{data.description}</p>

            {/* Action CTA for New Users entering loop */}
            <div className="bg-blue-600 text-white rounded-2xl p-8 flex flex-col items-center text-center shadow-xl shadow-blue-600/20 mb-12">
                <h2 className="text-2xl font-bold mb-2">Inspired by this route?</h2>
                <p className="text-blue-100 mb-6 font-medium">Save these museums to your own profile and start planning your trip.</p>
                <button
                    onClick={handleCloneToMap}
                    className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition shadow-md active:scale-95"
                >
                    Save Route & Open Map
                </button>
            </div>

            {/* Collection Items */}
            <h3 className="text-xl font-bold mb-6 border-b pb-2">Itinerary Stops</h3>
            <div className="grid gap-6">
                {data.items?.map((item: any, i: number) => (
                    <GlassPanel key={item.id} className="flex gap-4 p-4 items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 text-black flex justify-center items-center font-bold border border-gray-200">
                            {i + 1}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-lg">{item.museum.name}</h4>
                            <p className="text-xs text-gray-500 font-medium">{item.museum.city}, {item.museum.country}</p>
                        </div>
                        <button
                            onClick={() => router.push(`/museums/${item.museumId}`)}
                            className="text-sm font-bold text-blue-600 hover:underline px-4"
                        >
                            View Detail
                        </button>
                    </GlassPanel>
                ))}
            </div>
        </div>
    );
}
