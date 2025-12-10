
"use client";

import Image from 'next/image';
import { PostCard, PostProps } from '@/components/post-card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Link as LinkIcon, XCircle, LoaderCircle } from "lucide-react";
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useDoc, useMemoFirebase, useFirestore, useFirebase } from '@/firebase';
import { collection, query, where, DocumentData, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import React, { useMemo, useEffect, useState, use } from 'react';
import { getImageUrl } from '@/lib/placeholder-images';
import { useRouter } from 'next/navigation';

export default function OtherUserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, isUserLoading: isAuthLoading } = useFirebase();
    const router = useRouter();
    const firestore = useFirestore();

    const [isMyProfile, setIsMyProfile] = useState(false);
    
    // Redirect if the user is trying to view their own profile on this public page.
    useEffect(() => {
        if (user && id === user.uid) {
            router.replace('/home/profile');
        } else {
            setIsMyProfile(false);
        }
    }, [user, id, router]);

    // Data fetching for the profile being viewed
    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !id) return null;
        return doc(firestore, 'userProfiles', id);
    }, [firestore, id]);
    
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<DocumentData>(userProfileRef);
    
    // State for follow logic
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    // Effect to set initial follow state
    useEffect(() => {
        if (userProfile && user) {
            setIsFollowing(userProfile.followers?.includes(user.uid) || false);
        }
        setFollowersCount(userProfile?.followers?.length || 0);
    }, [userProfile, user]);

    const handleFollowToggle = async () => {
        if (!user || !firestore || !userProfile) {
            // Consider showing a toast message here
            return;
        }

        setIsFollowLoading(true);

        const currentUserRef = doc(firestore, "userProfiles", user.uid);
        const viewedUserRef = doc(firestore, "userProfiles", userProfile.id);

        try {
            // Optimistic UI updates
            const newIsFollowing = !isFollowing;
            setIsFollowing(newIsFollowing);
            setFollowersCount(prev => newIsFollowing ? prev + 1 : prev - 1);
            
            // Firestore updates
            await updateDoc(currentUserRef, {
                following: newIsFollowing ? arrayUnion(userProfile.id) : arrayRemove(userProfile.id)
            });
            await updateDoc(viewedUserRef, {
                followers: newIsFollowing ? arrayUnion(user.uid) : arrayRemove(user.uid)
            });
            
        } catch (error) {
            console.error("Error toggling follow:", error);
            // Revert optimistic updates on error
            setIsFollowing(isFollowing);
            setFollowersCount(followersCount);
            // Consider showing a toast message for the error
        } finally {
            setIsFollowLoading(false);
        }
    };


    const allPostsQuery = useMemoFirebase(() => {
        if (!firestore || !id) return null;
        return query(collection(firestore, 'posts'), where('authorId', '==', id));
    }, [firestore, id]);

    const { data: allUserActivity, isLoading: arePostsLoading } = useCollection<DocumentData>(allPostsQuery);

    const { userPosts, userReposts } = useMemo(() => {
        if (!allUserActivity) return { userPosts: [], userReposts: [] };
        const posts = allUserActivity.filter(post => !post.originalPostId);
        const reposts = allUserActivity.filter(post => !!post.originalPostId);
        
        const sortByDate = (a: DocumentData, b: DocumentData) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0);
        posts.sort(sortByDate);
        reposts.sort(sortByDate);

        return { userPosts: posts, userReposts: reposts };
    }, [allUserActivity]);

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
    
    const followingCount = userProfile?.following?.length || 0;
    
    const avatar = userProfile?.profilePicture || getImageUrl('default-user-avatar');
    const coverImage = userProfile?.coverImage || getImageUrl('cover-default');

    const isLoading = isAuthLoading || isProfileLoading;
    
    if (isLoading || (user && id === user.uid)) {
         return (
             <div className="max-w-3xl mx-auto flex justify-center items-center h-full pt-20">
                <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!userProfile) {
        return (
             <div className="max-w-3xl mx-auto">
                 <Card className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg bg-card">
                    <XCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-xl font-semibold text-foreground">Usuario no encontrado</h3>
                    <p className="mt-2">El perfil que estás buscando no existe o fue eliminado.</p>
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
                             <Button 
                                variant={isFollowing ? 'default' : 'outline'} 
                                className="gap-2 rounded-full w-28"
                                onClick={handleFollowToggle}
                                disabled={isFollowLoading}
                            >
                                {isFollowLoading ? <LoaderCircle className="animate-spin" /> : (isFollowing ? 'Siguiendo' : 'Seguir')}
                            </Button>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="font-headline text-2xl font-bold">{userProfile?.firstName || 'Estudiante'} {userProfile?.lastName || 'Ejemplar'}</h2>
                        <p className="text-muted-foreground font-mono text-sm">@{userProfile?.email?.split('@')[0] || 'usuario'}</p>
                        <p className="mt-3 text-base max-w-prose text-foreground/90">
                            {userProfile?.description || 'Este usuario no ha añadido una biografía.'}
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
                                <p className="mt-4 text-muted-foreground">Cargando publicaciones...</p>
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
                                <p className="mt-2">Este usuario aún no ha publicado nada.</p>
                            </Card>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="reposts">
                     <div className="space-y-6 mt-6">
                        {arePostsLoading ? (
                           <div className="flex flex-col items-center justify-center pt-20">
                                <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
                                <p className="mt-4 text-muted-foreground">Cargando reposts...</p>
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
                                <p className="mt-2">Este usuario aún no ha compartido ninguna publicación.</p>
                            </Card>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

    