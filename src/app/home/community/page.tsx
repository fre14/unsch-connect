"use client";

import React, { useMemo, useState } from 'react';
import { PostCard, PostProps } from '@/components/post-card';
import { CreatePost } from '@/components/create-post';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, DocumentData } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

// La página ahora recibe el `searchTerm` como prop desde `layout.tsx`
export default function CommunityPage({ searchTerm }: { searchTerm: string }) {
  const firestore = useFirestore();

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
  }, [firestore]);
  
  // El hook se mantiene igual, pero los datos se filtrarán de forma diferente.
  const { data: posts, isLoading } = useCollection<DocumentData & {authorId: string; content: string; createdAt: any; likeIds: string[]; commentIds: string[] }>(postsQuery);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (!searchTerm) return posts;
    
    // El filtrado ahora es más simple, ya que no necesitamos los datos denormalizados del autor aquí.
    const lowercasedTerm = searchTerm.toLowerCase();
    
    return posts.filter(post => 
      post.content?.toLowerCase().includes(lowercasedTerm)
    );
  }, [posts, searchTerm]);

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
    <div className="max-w-2xl mx-auto relative">
      <div className="space-y-4">
        <div className='hidden sm:block'>
          <CreatePost />
        </div>
        
        {isLoading ? (
          <div className="space-y-4 pt-6">
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[150px] w-full" />
          </div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            // Pasamos solo el authorId a PostCard, que ahora se encarga de obtener los datos.
            const postProps: PostProps = {
              id: post.id,
              authorId: post.authorId,
              time: formatPostTime(post.createdAt),
              content: post.content,
              stats: {
                likes: post.likeIds?.length || 0,
                comments: post.commentIds?.length || 0,
                reposts: 0,
              }
            };
            return <PostCard key={post.id} {...postProps} />;
          })
        ) : (
          <Card className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg bg-card mt-6">
                <XCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-xl font-semibold text-foreground">
                  {searchTerm ? 'No se encontraron resultados' : 'Aún no hay nada por aquí'}
                </h3>
                <p className="mt-2">
                  {searchTerm ? 'Intenta con otra búsqueda.' : '¡Sé el primero en compartir algo con la comunidad!'}
                </p>
            </Card>
        )}
      </div>
    </div>
  );
}
