"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PostCard, PostProps } from '@/components/post-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';


const allAnnouncements: PostProps[] = [
  {
    id: '1',
    author: { name: 'Oficina Central de Admisión', username: '@admisionunsch', avatarId: 'admision-avatar' },
    time: 'ayer',
    content: 'Se comunica a los postulantes que el Examen de Admisión 2024-II se llevará a cabo el día 15 de Agosto. Consultar la guía del postulante en nuestra página web oficial.',
    isOfficial: true,
    stats: { likes: 350, comments: 45, reposts: 120 },
    category: 'admision',
  },
  {
    id: '2',
    author: { name: 'Rectorado UNSCH', username: '@rectorado', avatarId: 'rector-avatar' },
    time: 'hace 2 días',
    content: '¡Feliz 347° Aniversario, Universidad Nacional de San Cristóbal de Huamanga! Un día para celebrar nuestra historia y mirar hacia el futuro con esperanza y compromiso.',
    imageId: 'aniversary-banner',
    imageAlt: 'University anniversary banner',
    isOfficial: true,
    stats: { likes: 890, comments: 110, reposts: 250 },
    category: 'rectorado',
  },
  {
    id: '3',
    author: { name: 'Facultad de Ingeniería', username: '@fiamg', avatarId: 'fiamg-avatar' },
    time: 'hace 3 días',
    content: 'La próxima semana se realizarán las elecciones para el centro de estudiantes de la facultad. Invitamos a todos a participar de este importante proceso democrático.',
    isOfficial: true,
    stats: { likes: 95, comments: 12, reposts: 22 },
    category: 'facultad',
  },
];

export default function AnnouncementsPage() {
    const searchParams = useSearchParams();
    const [filteredAnnouncements, setFilteredAnnouncements] = useState<PostProps[]>(allAnnouncements);
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
                post.author.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="space-y-6">
        {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((post) => (
                <PostCard key={post.id} {...post} />
            ))
        ) : (
             <div className="text-center text-muted-foreground p-8 border rounded-lg bg-card">
                <p>No se encontraron anuncios que coincidan con tu búsqueda.</p>
            </div>
        )}
        </div>
    </div>
  );
}
