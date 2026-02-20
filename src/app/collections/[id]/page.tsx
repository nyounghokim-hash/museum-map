'use client';
import { useParams, useRouter } from 'next/navigation';

export default function CollectionDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const handleCreateAutoRoute = () => {
        // API logic: Calculate route TSP for items in folder, then create a Plan
        // fetch('/api/plans', { method: 'POST', body: { collectionId: id } })
        const planId = 'plan-' + Math.floor(Math.random() * 10000);
        alert('Generating AutoRoute based on geography... Plan Created!');
        router.push(`/plans/${planId}`);
    };

    const handleShareCollection = () => {
        alert('Settings updated: Collection is now PUBLIC! Link copied to clipboard.');
    };

    return (
        <div className="max-w-4xl mx-auto p-8 mt-10">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold capitalize">{id?.toString().replace('-', ' ')} Folder</h1>
                    <p className="text-gray-500 mt-1">3 Museums in this folder (2 visited, 1 pending)</p>
                </div>
                <button
                    onClick={handleShareCollection}
                    className="border border-gray-300 bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50"
                >
                    Share Collection (Make Public)
                </button>
            </div>

            {/* Simulated Collection Items */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {['Tate Modern (Visited)', 'MoMA (Visited)', 'Centre Pompidou'].map((name, i) => (
                    <div key={i} className="border border-gray-200 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400">Photo Placeholder</div>
                        <h3 className="font-bold">{name}</h3>
                        {name.includes('Visited') && <p className="text-xs text-green-600 font-semibold mt-1">★ Reviewed</p>}
                    </div>
                ))}
            </div>

            {/* AutoRoute Action Trigger */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center flex flex-col items-center">
                <h2 className="text-xl font-bold text-blue-900 mb-2">Planning a Trip?</h2>
                <p className="text-blue-700 mb-6">Create an optimized travel route (AutoRoute) for the museums in this list.</p>
                <button
                    onClick={handleCreateAutoRoute}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-colors"
                >
                    Generate AutoRoute
                </button>
            </div>
        </div>
    );
}
