"use client";

import Image from 'next/image';
import { PostCard, PostProps } from '@/components/post-card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Mail, Link as LinkIcon, CalendarDays, XCircle, LoaderCircle } from "lucide-react";
import Link from 'next/link';
import { useUser } from '@/context/user-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useMemoFirebase, useFirestore, useFirebase } from '@/firebase';
import { collection, query, where, orderBy, DocumentData } from 'firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import React, { useMemo } from 'react';
import { getImageUrl } from '@/lib/placeholder-images';


export default function ProfilePage() {
    const { userProfile, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { user } = useFirebase();

    // Memoize the query to prevent re-creation on every render
    const allPostsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        // Query for posts created by the user OR reposted by the user
        return query(collection(firestore, 'posts'), where('authorId', '==', user.uid), orderBy('createdAt', 'desc'));
    }, [firestore, user]);

    const { data: userCreatedPosts, isLoading: arePostsLoading } = useCollection<DocumentData>(allPostsQuery);

    const { userPosts, userReposts } = useMemo(() => {
        if (!userCreatedPosts) return { userPosts: [], userReposts: [] };
        // post.originalPostId exists on reposts
        const posts = userCreatedPosts.filter(post => !post.originalPostId);
        const reposts = userCreatedPosts.filter(post => !!post.originalPostId);
        return { userPosts: posts, userReposts: reposts };
    }, [userCreatedPosts]);

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
    
    const followersCount = userProfile?.followers?.length || 0;
    const followingCount = userProfile?.following?.length || 0;
    
    const avatar = userProfile?.profilePicture || getImageUrl('default-user-avatar');
    const coverImage = userProfile?.coverImage || getImageUrl('cover-default');

    if (isUserLoading) {
        return (
             <div className="max-w-3xl mx-auto space-y-6">
                <Card className="overflow-hidden shadow-md">
                    <Skeleton className="w-full h-36 md:h-48" />
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-end gap-4 -mt-16 sm:-mt-20">
                            <Skeleton className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 border-background ring-2 ring-primary/50" />
                        </div>
                        <div className="mt-4 space-y-3">
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-12 w-full" />
                            <div className="flex gap-4">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-4 w-1/3" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
             </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Card className="overflow-hidden shadow-md">
                <div className="relative w-full h-36 md:h-48 bg-muted">
                    <Image src={coverImage} alt="Profile Banner" fill priority className="object-cover" />
                </div>
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-end gap-4 -mt-16 sm:-mt-20">
                        <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-background ring-2 ring-primary/50">
                            <AvatarImage src={avatar} />
                            <AvatarFallback>{userProfile?.firstName?.charAt(0) || userProfile?.email?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="ml-auto flex gap-2 pb-2">
                             <Link href="/home/settings" passHref>
                                <Button variant="outline" className="gap-2 rounded-full">
                                    <Edit className="h-4 w-4" /> Editar Perfil
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="font-headline text-2xl font-bold">{userProfile?.firstName || 'Estudiante'} {userProfile?.lastName || 'Ejemplar'}</h2>
                        <p className="text-muted-foreground font-mono text-sm">@{userProfile?.email?.split('@')[0] || 'usuario'}</p>
                        <p className="mt-3 text-base max-w-prose text-foreground/90">
                            {userProfile?.description || 'Actualiza tu biografía en la configuración.'}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            {userProfile?.email && <div className="flex items-center gap-1.5"><Mail className="h-4 w-4"/><span>{userProfile.email}</span></div>}
                            {userProfile?.website && (
                                <div className="flex items-center gap-1.5">
                                    <LinkIcon className="h-4 w-4"/> 
                                    <a 
                                        href={!userProfile.website.startsWith('http') ? `https://${userProfile.website}` : userProfile.website} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="hover:underline text-accent"
                                    >
                                        {userProfile.website.replace(/^(https?:\/\/)/, '')}
                                    </a>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4"/><span>Se unió en {user?.metadata.creationTime ? format(new Date(user.metadata.creationTime), "MMMM 'de' yyyy", { locale: es }) : '2024'}</span></div>
                        </div>
                        <div className="mt-4 flex gap-6 text-sm">
                            <Link href="#" className="hover:underline"><span className="font-bold text-foreground">{followersCount}</span> <span className="text-muted-foreground">Seguidores</span></Link>
                            <Link href="#" className="hover:underline"><span className="font-bold text-foreground">{followingCount}</span> <span className="text-muted-foreground">Siguiendo</span></Link>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="posts" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="posts">Publicaciones</TabsTrigger>
                    <TabsTrigger value="reposts">Reposts</TabsTrigger>
                </TabsList>
                <TabsContent value="posts">
                    <div className="space-y-6 mt-6">
                        {arePostsLoading ? (
                           <div className="flex flex-col items-center justify-center pt-20">
                                <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
                                <p className="mt-4 text-muted-foreground">Cargando tus publicaciones...</p>
                            </div>
                        ) : userPosts && userPosts.length > 0 ? (
                           userPosts.map((post) => {
                                const postProps: PostProps = {
                                    id: post.id,
                                    authorId: post.authorId,
                                    time: formatPostTime(post.createdAt),
                                    content: post.content,
                                    likedBy: post.likedBy || [],
                                    repostedBy: post.repostedBy || [],
                                };
                                return <PostCard key={post.id} {...postProps} />;
                            })
                        ) : (
                            <Card className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg bg-card">
                                <XCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-xl font-semibold text-foreground">Sin publicaciones</h3>
                                <p className="mt-2">Aún no has publicado nada. ¡Comparte algo!</p>
                            </Card>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="reposts">
                     <div className="space-y-6 mt-6">
                        {arePostsLoading ? (
                           <div className="flex flex-col items-center justify-center pt-20">
                                <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
                                <p className="mt-4 text-muted-foreground">Cargando tus reposts...</p>
                            </div>
                        ) : userReposts && userReposts.length > 0 ? (
                           userReposts.map((post) => {
                                const postProps: PostProps = {
                                    id: post.id,
                                    authorId: post.authorId,
                                    time: formatPostTime(post.createdAt),
                                    content: post.content,
                                    likedBy: post.likedBy || [],
                                    repostedBy: post.repostedBy || [],
                                    originalPostId: post.originalPostId,
                                    originalAuthorId: post.originalAuthorId,
                                };
                                return <PostCard key={post.id} {...postProps} />;
                            })
                        ) : (
                            <Card className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg bg-card">
                                <XCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-xl font-semibold text-foreground">Sin reposts</h3>
                                <p className="mt-2">Aún no has compartido ninguna publicación.</p>
                            </Card>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
