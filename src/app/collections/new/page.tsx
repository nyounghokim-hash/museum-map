'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassPanel } from '@/components/ui/glass';
import { useApp } from '@/components/AppContext';
import { useModal } from '@/components/ui/Modal';
import { t } from '@/lib/i18n';

export default function CreateCollectionPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [plans, setPlans] = useState<any[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');
    const { locale } = useApp();
    const { showAlert } = useModal();

    useEffect(() => {
        // Fetch user's plans to select from
        fetch('/api/plans').then(r => r.json()).then(res => {
            if (res.data) setPlans(res.data);
        });
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlanId) return showAlert(t('collections.selectPlan', locale));

        const plan = plans.find(p => p.id === selectedPlanId);
        if (!plan) return;

        // Convert plan stops into collection items
        const items = plan.stops.map((s: any) => ({
            museumId: s.museumId,
            order: s.order
        }));

        const res = await fetch('/api/collections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description: desc, isPublic, items })
        });
        const data = await res.json();

        if (data.data) {
            showAlert(t('collections.collectionPublished', locale));
            if (isPublic && data.data.shareSlug) {
                router.push(`/share/collections/${data.data.shareSlug}`);
            } else {
                router.push(`/collections`);
            }
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 mt-10">
            <GlassPanel className="p-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 dark:text-white">{t('collections.publishCollection', locale)}</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 border-b border-gray-100 dark:border-neutral-800 pb-4">
                    Turn your completed trips into inspiring collections for others.
                </p>

                <form onSubmit={handleCreate} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Collection Title</label>
                        <input
                            required type="text" value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. 3 Days of Contemporary Art in Paris"
                            className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:ring-black focus:border-black"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea
                            rows={3} value={desc} onChange={e => setDesc(e.target.value)}
                            placeholder="Tell others what makes this route special..."
                            className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:ring-black focus:border-black"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Select a Route / Plan</label>
                        <select
                            required value={selectedPlanId} onChange={e => setSelectedPlanId(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:ring-black focus:border-black"
                        >
                            <option value="">-- Choose a Plan --</option>
                            {plans.map(p => (
                                <option key={p.id} value={p.id}>{p.title || `Plan ${p.id}`}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <input
                            type="checkbox" id="isPublic" checked={isPublic} onChange={e => setIsPublic(e.target.checked)}
                            className="w-5 h-5 accent-black"
                        />
                        <label htmlFor="isPublic" className="text-sm font-bold text-gray-800">Make this collection Public (Shareable)</label>
                    </div>

                    <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl shadow-lg hover:bg-neutral-800 dark:hover:bg-gray-200 transition-all active:scale-95">
                        {t('collections.publishCollection', locale)}
                    </button>
                </form>
            </GlassPanel>
        </div>
    );
}
