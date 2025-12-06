"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PostCard, PostProps } from '@/components/post-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';


const allAnnouncements: PostProps[] = [
  // Data has been removed and should be fetched from a database.
];

export default function AnnouncementsPage() {
    const searchParams = useSearchParams();
    const [filteredAnnouncements, setFilteredAnnouncements] = useState<PostProps[]>([]);
    const [category, setCategory] = useState('all');

    useEffect(() => {
        const searchTerm = searchParams.get('search') || '';

        let announcements = allAnnouncements;

        if (category !== 'all') {
            announcements = announcements.filter(post => post.category === category);
        }

        if (searchTerm) {
            announcements = announcements.filter(post =>
                post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (post.author && post.author.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        
        setFilteredAnnouncements(announcements);

    }, [searchParams, category]);


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
        {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((post) => (
                <PostCard key={post.id} {...post} />
            ))
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
