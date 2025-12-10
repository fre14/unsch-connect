
"use client";

import React, { useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { PostCard } from '@/components/post-card';
import { CreatePost } from '@/components/create-post';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, DocumentData } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { XCircle, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatPostTime } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getImageUrl } from '@/lib/placeholder-images';

function UserSearchResultCard({ user }: { user: DocumentData }) {
    return (
        <Card className="hover:bg-muted/50 transition-colors">
            <Link href={`/home/profile/${user.id}`} className="flex items-center gap-4 p-3">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={user.profilePicture || getImageUrl('default-user-avatar')} />
                    <AvatarFallback>{user.firstName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{`${user.firstName || ''} ${user.lastName || ''}`.trim()}</p>
                    <p className="text-sm text-muted-foreground">@{user.email?.split('@')[0] || 'usuario'}</p>
                </div>
            </Link>
        </Card>
    );
}

function CommunityPageContent() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('q') || '';
  
  // Fetch posts
  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts'));
  }, [firestore]);
  
  const { data: rawPosts, isLoading: isLoadingPosts } = useCollection<DocumentData & { authorId: string; content: string; createdAt: any; likedBy: string[]; repostedBy: string[]; originalPostId?: string; }>(postsQuery);

  // Fetch users (only if there's a search term, to optimize)
  const usersQuery = useMemoFirebase(() => {
      if (!firestore || !searchTerm) return null; // <-- FIX: Only query if searchTerm exists
      return query(collection(firestore, 'userProfiles'));
  }, [firestore, searchTerm]); // <-- FIX: Add searchTerm to dependency array

  const { data: allUsers, isLoading: isLoadingUsers } = useCollection<DocumentData>(usersQuery);

  const posts = useMemo(() => {
      if (!rawPosts) return [];
      return [...rawPosts].sort((a, b) => {
        const dateA = a.createdAt?.toDate() || 0;
        const dateB = b.createdAt?.toDate() || 0;
        return dateB - dateA;
      });
  }, [rawPosts]);
  
  const { filteredPosts, filteredUsers } = useMemo(() => {
    if (!searchTerm) {
        return { filteredPosts: posts, filteredUsers: [] };
    }
    
    const lowercasedTerm = searchTerm.toLowerCase();
    
    const fPosts = posts.filter(post => {
      const content = post.content?.toLowerCase() || '';
      return content.includes(lowercasedTerm);
    });

    const fUsers = (allUsers || []).filter(user => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        const emailUsername = (user.email?.split('@')[0] || '').toLowerCase();
        return fullName.includes(lowercasedTerm) || emailUsername.includes(lowercasedTerm);
    });

    return { filteredPosts: fPosts, filteredUsers: fUsers };

  }, [posts, allUsers, searchTerm]);

  const isLoading = isLoadingPosts || (searchTerm ? isLoadingUsers : false);

  const noResults = searchTerm && filteredPosts.length === 0 && filteredUsers.length === 0;

  return (
    <div className="max-w-2xl mx-auto relative">
      <div className="space-y-4">
        <div className='hidden sm:block'>
          <CreatePost />
        </div>
        
        {isLoading ? (
          <div className="space-y-4 pt-6">
            <Skeleton className="h-[80px] w-full" />
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[150px] w-full" />
          </div>
        ) : (
          <>
            {searchTerm && filteredUsers.length > 0 && (
                <div className='space-y-4'>
                     <h2 className="font-headline text-xl font-bold mt-6">Personas</h2>
                     {filteredUsers.map(user => <UserSearchResultCard key={user.id} user={user} />)}
                </div>
            )}
             {searchTerm && filteredPosts.length > 0 && (
                 <h2 className="font-headline text-xl font-bold mt-6">Publicaciones</h2>
             )}

            {filteredPosts.length > 0 && (
              filteredPosts.map((post) => (
                 <PostCard 
                    key={post.id} 
                    id={post.id}
                    authorId={post.authorId}
                    time={formatPostTime(post.createdAt)}
                    content={post.content}
                    likedBy={post.likedBy}
                    repostedBy={post.repostedBy}
                    originalPostId={post.originalPostId}
                    imageUrl={post.imageUrl}
                  />
              ))
            )}

            {noResults && (
                <Card className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg bg-card mt-6">
                    <XCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-xl font-semibold text-foreground">
                      No se encontraron resultados
                    </h3>
                    <p className="mt-2">
                      Intenta con otra búsqueda para "<strong>{searchTerm}</strong>".
                    </p>
                </Card>
            )}

            {!searchTerm && posts.length === 0 && (
                 <Card className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg bg-card mt-6">
                    <XCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-xl font-semibold text-foreground">
                      Aún no hay nada por aquí
                    </h3>
                    <p className="mt-2">
                      ¡Sé el primero en compartir algo con la comunidad!
                    </p>
                </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}


export default function CommunityPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CommunityPageContent />
    </Suspense>
  )
}
