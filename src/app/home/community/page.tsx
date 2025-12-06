"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { PostCard, PostProps } from '@/components/post-card';
import { CreatePost } from '@/components/create-post';
import { useCollection, useMemoFirebase, useFirestore, useDoc } from '@/firebase';
import { collection, query, orderBy, DocumentData, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatPostTime } from '@/lib/utils';

// La página ahora recibe el `searchTerm` como prop desde `layout.tsx`
export default function CommunityPage({ searchTerm }: { searchTerm: string }) {
  const firestore = useFirestore();

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // IMPORTANT: Removed orderBy('createdAt', 'desc') to avoid needing a composite index
    // that the security rules would require. We will sort on the client.
    return query(collection(firestore, 'posts'));
  }, [firestore]);
  
  const { data: rawPosts, isLoading } = useCollection<DocumentData & { authorId: string; content: string; createdAt: any; likedBy: string[]; repostedBy: string[]; originalPostId?: string; }>(postsQuery);

  const posts = useMemo(() => {
      if (!rawPosts) return [];
      // Sort posts on the client-side
      return [...rawPosts].sort((a, b) => {
        const dateA = a.createdAt?.toDate() || 0;
        const dateB = b.createdAt?.toDate() || 0;
        return dateB - dateA;
      });
  }, [rawPosts])

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (!searchTerm) return posts;
    
    const lowercasedTerm = searchTerm.toLowerCase();
    
    // This is a simplified filtering. For a full implementation, author data would be needed.
    return posts.filter(post => 
      post.content?.toLowerCase().includes(lowercasedTerm)
      // A more complete search would also check author name, which would require fetching author profiles.
      // e.g. || authorName.toLowerCase().includes(lowercasedTerm)
    );
  }, [posts, searchTerm]);


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
            const postProps: PostProps = {
              id: post.id,
              authorId: post.authorId,
              time: formatPostTime(post.createdAt),
              content: post.content,
              likedBy: post.likedBy,
              repostedBy: post.repostedBy,
              originalPostId: post.originalPostId,
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
