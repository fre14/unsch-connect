"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PostCard, PostProps } from '@/components/post-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { XCircle, LoaderCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, orderBy, where, Query } from 'firebase/firestore';

export default function AnnouncementsPage() {
    const searchParams = useSearchParams();
    const firestore = useFirestore();
    const [category, setCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setSearchTerm(searchParams.get('search') || '');
    }, [searchParams]);

    const announcementsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        const baseQuery = collection(firestore, 'announcements');
        
        if (category !== 'all') {
            return query(baseQuery, where('category', '==', category), orderBy('createdAt', 'desc'));
        }
        
        return query(baseQuery, orderBy('createdAt', 'desc'));
    }, [firestore, category]);

    const { data: rawAnnouncements, isLoading } = useCollection(announcementsQuery as Query | null);

    const filteredAnnouncements = useMemo(() => {
        if (!rawAnnouncements) return [];
        if (!searchTerm) return rawAnnouncements;

        return rawAnnouncements.filter(post =>
            post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (post.authorName && post.authorName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [rawAnnouncements, searchTerm]);

    const formatPostTime = (timestamp: any) => {
        if (!timestamp) return 'hace un momento';
        const date = timestamp.toDate();
        const now = new Date();
        const diff = Math.abs(now.getTime() - date.getTime());
        const diffMinutes = Math.ceil(diff / (1000 * 60));
        const diffHours = Math.ceil(diff / (1000 * 60 * 60));
        
        if (diffMinutes < 60) return `hace ${diffMinutes} min`;
        if (diffHours < 24) return `hace ${diffHours} h`;
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h1 className="font-headline text-3xl font-bold">Anuncios Oficiales</h1>
                <div className="flex gap-2">
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filtrar por..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las categorías</SelectItem>
                            <SelectItem value="rectorado">Rectorado</SelectItem>
                            <SelectItem value="facultad">Facultades</SelectItem>
                            <SelectItem value="admision">Admisión</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center pt-20">
                        <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground">Cargando anuncios...</p>
                    </div>
                ) : filteredAnnouncements.length > 0 ? (
                    filteredAnnouncements.map((post) => {
                        const postProps: PostProps = {
                            id: post.id,
                            author: {
                                name: post.authorName,
                                username: post.authorUsername,
                                avatarId: post.authorAvatarId,
                            },
                            time: formatPostTime(post.createdAt),
                            content: post.content,
                            stats: { likes: 0, comments: 0, reposts: 0 },
                            isOfficial: true,
                        };
                        return <PostCard key={post.id} {...postProps} />;
                    })
                ) : (
                    <Card className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg bg-card">
                        <XCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-xl font-semibold text-foreground">No se encontraron anuncios</h3>
                        <p className="mt-2">Intenta ajustar tu búsqueda o filtro para encontrar lo que buscas.</p>
                    </Card>
                )}
            </div>
        </div>
    );
}
