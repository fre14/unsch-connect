"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PostCard, PostProps } from '@/components/post-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XCircle, LoaderCircle, PlusCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useCollection, useMemoFirebase, useFirestore, useFirebase } from '@/firebase';
import { useUser } from '@/context/user-context';
import { collection, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

const announcementSchema = z.object({
  title: z.string().min(1, 'El título es requerido.'),
  content: z.string().min(1, 'El contenido es requerido.'),
  category: z.enum(['rectorado', 'facultad', 'admision'], { required_error: 'La categoría es requerida.' }),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

function CreateAnnouncementForm({ setDialogOpen }: { setDialogOpen: (open: boolean) => void }) {
    const { user } = useFirebase();
    const firestore = useFirestore();

    const form = useForm<AnnouncementFormValues>({
        resolver: zodResolver(announcementSchema),
    });

    async function onSubmit(data: AnnouncementFormValues) {
        if (!user || !firestore) {
            toast({ variant: "destructive", title: "Error", description: "Debes iniciar sesión para crear un anuncio." });
            return;
        }

        const announcementCollectionRef = collection(firestore, "announcements");
        
        const newAnnouncement = {
            title: data.title,
            content: data.content,
            category: data.category,
            publisherId: user.uid,
            createdAt: serverTimestamp(),
            faculty: 'General', 
            school: 'General',
            course: 'General',
        };

        addDoc(announcementCollectionRef, newAnnouncement)
            .then(() => {
                 toast({ title: "Anuncio publicado", description: "El anuncio ahora es visible para todos." });
                 form.reset();
                 setDialogOpen(false);
            })
            .catch(error => {
                const permissionError = new FirestorePermissionError({
                    path: announcementCollectionRef.path,
                    operation: 'create',
                    requestResourceData: newAnnouncement,
                });
                errorEmitter.emit('permission-error', permissionError);
                 toast({ variant: "destructive", title: "Error de Permiso", description: "No tienes permiso para crear un anuncio." });
            });
    }
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Título del Anuncio</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Suspensión de clases" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contenido del Anuncio</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Detalles del anuncio..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Categoría</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="rectorado">Rectorado</SelectItem>
                                    <SelectItem value="facultad">Facultad</SelectItem>
                                    <SelectItem value="admision">Admisión</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full !mt-6" disabled={form.formState.isSubmitting}>
                     {form.formState.isSubmitting ? 'Publicando...' : 'Publicar Anuncio'}
                </Button>
            </form>
        </Form>
    );
}


export default function AnnouncementsPage({ searchTerm: layoutSearchTerm }: { searchTerm: string }) {
    const searchParams = useSearchParams();
    const firestore = useFirestore();
    const { userProfile } = useUser();
    const [category, setCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

    const canCreateAnnouncement = userProfile?.role === 'official' || userProfile?.role === 'admin';

    useEffect(() => {
        setSearchTerm(layoutSearchTerm || searchParams.get('search') || '');
    }, [layoutSearchTerm, searchParams]);

    const announcementsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'announcements'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: rawAnnouncements, isLoading } = useCollection(announcementsQuery);

    const filteredAnnouncements = useMemo(() => {
        if (!rawAnnouncements) return [];
        
        let announcements = rawAnnouncements;

        // Filter by category
        if (category !== 'all') {
            announcements = announcements.filter(post => post.category === category);
        }

        // Filter by search term
        const lowercasedTerm = searchTerm.toLowerCase();
        if (lowercasedTerm) {
            announcements = announcements.filter(post =>
                post.content?.toLowerCase().includes(lowercasedTerm) ||
                post.title?.toLowerCase().includes(lowercasedTerm)
            );
        }
        
        return announcements;
    }, [rawAnnouncements, searchTerm, category]);

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
                     {canCreateAnnouncement && (
                        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <PlusCircle className="h-5 w-5" />
                                    <span className="hidden sm:inline">Crear Anuncio</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Crear Nuevo Anuncio</DialogTitle>
                                </DialogHeader>
                                <CreateAnnouncementForm setDialogOpen={setCreateDialogOpen} />
                            </DialogContent>
                        </Dialog>
                    )}
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
                            authorId: post.publisherId,
                            time: formatPostTime(post.createdAt),
                            content: `${post.title ? `**${post.title}**\n\n` : ''}${post.content}`,
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
    