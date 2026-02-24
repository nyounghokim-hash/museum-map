'use client';
import { useState, useEffect } from 'react';
import { GlassPanel } from '@/components/ui/glass';
import { t } from '@/lib/i18n';
import { useApp } from '@/components/AppContext';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TripStop {
    museumId: string;
    name: string;
    latitude: number;
    longitude: number;
    order: number;
}

interface TripData {
    planId: string;
    title: string;
    stops: TripStop[];
}

function SortableItem({ stop, index, onMuseumClick, locale }: { stop: TripStop, index: number, onMuseumClick: (id: string) => void, locale: string }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: stop.museumId + '-' + index });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="w-full flex gap-4 text-left group relative z-10 transition-transform active:scale-[0.98]"
        >
            <div
                {...attributes}
                {...listeners}
                className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:bg-purple-700 transition-colors shrink-0 cursor-grab active:cursor-grabbing"
            >
                {index + 1}
            </div>
            <div
                onClick={() => onMuseumClick(stop.museumId)}
                className="flex-1 min-w-0 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm group-hover:border-purple-200 dark:group-hover:border-purple-900/50 group-hover:shadow-md transition-all cursor-pointer"
            >
                <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    {stop.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('global.viewDetails', locale) || 'Click to view details'} →
                </p>
            </div>
        </div>
    );
}

export default function TripDetailPanel({
    trip,
    onClose,
    onMuseumClick
}: {
    trip: TripData;
    onClose: () => void;
    onMuseumClick: (id: string) => void;
}) {
    const { locale } = useApp();
    const [stops, setStops] = useState(trip.stops);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        setStops(trip.stops);
    }, [trip]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setStops((items) => {
                const oldIndex = items.findIndex((item, i) => (item.museumId + '-' + i) === active.id);
                const newIndex = items.findIndex((item, i) => (item.museumId + '-' + i) === over.id);

                const newStops = arrayMove(items, oldIndex, newIndex);

                // Persist new order to localStorage if activeTrip exists
                if (typeof window !== 'undefined') {
                    const saved = localStorage.getItem('activeTrip');
                    if (saved) {
                        try {
                            const parsed = JSON.parse(saved);
                            parsed.stops = newStops.map((s, idx) => ({ ...s, order: idx }));
                            localStorage.setItem('activeTrip', JSON.stringify(parsed));
                            // Also update the overall trip object in memory if needed, 
                            // but since stops is a local state, we just sync to storage.
                            // The parent might need to know, but parent usually provides trip from storage.
                            window.dispatchEvent(new Event('storage'));
                        } catch (e) {
                            console.error("Failed to sync reordered trip to storage", e);
                        }
                    }
                }

                return newStops;
            });
        }
    }

    if (isCollapsed) {
        return (
            <div className="fixed bottom-24 right-4 sm:right-8 z-50">
                <button
                    onClick={() => setIsCollapsed(false)}
                    className="w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    title={t('plans.activeRoute', locale) || 'Active Route'}
                >
                    <span className="text-2xl">🚀</span>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-neutral-900">
                        {stops.length}
                    </div>
                </button>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col pt-2 sm:pt-4">
            {/* Header / Close Button */}
            <div className="flex items-center justify-between mb-4 px-4 sm:px-0">
                <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-full transition-colors shadow-sm active:scale-95 shrink-0"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <button
                    onClick={() => setIsCollapsed(true)}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                    {locale === 'ko' ? '숨기기' : 'Collapse'}
                </button>
            </div>

            <GlassPanel intensity="heavy" className="mb-8 relative overflow-hidden border-0 sm:border !rounded-none sm:!rounded-3xl shadow-xl flex-1 flex flex-col min-h-0">
                <div className="p-6 sm:p-8 bg-gradient-to-br from-purple-600/10 to-transparent dark:from-purple-900/20 flex-1 flex flex-col overflow-y-auto hide-scrollbar">
                    <div className="flex items-center gap-3 mb-2 shrink-0">
                        <span className="text-2xl animate-pulse">🚀</span>
                        <p className="text-xs font-bold tracking-widest text-purple-600 dark:text-purple-400 uppercase">Active Route</p>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight mb-6 shrink-0">
                        {trip.title}
                    </h1>

                    <div className="space-y-4 relative flex-1">
                        {/* Timeline Line */}
                        <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-purple-100 dark:bg-purple-900/30" />

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={stops.map((s, i) => s.museumId + '-' + i)}
                                strategy={verticalListSortingStrategy}
                            >
                                {stops.map((stop, i) => (
                                    <SortableItem
                                        key={stop.museumId + '-' + i}
                                        stop={stop}
                                        index={i}
                                        onMuseumClick={onMuseumClick}
                                        locale={locale}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>

                    <p className="mt-8 text-xs text-center text-gray-400 dark:text-neutral-500 font-medium italic shrink-0">
                        {t('plans.dragReorder', locale) || 'Drag to reorder stops'}
                    </p>
                </div>
            </GlassPanel>
        </div>
    );
}
