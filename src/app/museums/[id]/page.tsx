'use client';
import { useParams, useRouter } from 'next/navigation';
import MuseumDetailCard from '@/components/museum/MuseumDetailCard';

export default function MuseumDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    return (
        <div className="max-w-4xl mx-auto p-0 sm:p-6 pb-20 sm:pb-20 mt-0 sm:mt-6">
            <MuseumDetailCard museumId={id as string} onClose={() => router.back()} />
        </div>
    );
}
