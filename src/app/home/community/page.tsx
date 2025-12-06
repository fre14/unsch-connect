"use client";

import React, { useMemo, useState, Suspense } from 'react';
import { PostCard } from '@/components/post-card';
import { CreatePost } from '@/components/create-post';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, DocumentData } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { XCircle, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatPostTime } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

function CommunityPageContent() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('q') || '';
  
  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts'));
  }, [firestore]);
  
  const { data: rawPosts, isLoading: isLoadingPosts } = useCollection<DocumentData & { authorId: string; content: string; createdAt: any; likedBy: string[]; repostedBy: string[]; originalPostId?: string; }>(postsQuery);

  const posts = useMemo(() => {
      if (!rawPosts) return [];
      return [...rawPosts].sort((a, b) => {
        const dateA = a.createdAt?.toDate() || 0;
        const dateB = b.createdAt?.toDate() || 0;
        return dateB - dateA;
      });
  }, [rawPosts]);

  // The logic to get author profiles has been removed from here
  // and is now handled individually within each PostCard component.
  // This is more efficient and respects the security rules.
  
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (!searchTerm) return posts;
    
    const lowercasedTerm = searchTerm.toLowerCase();
    
    // Note: Author filtering would require author data to be available here.
    // Since we're fetching it inside PostCard for security/efficiency,
    // this search will only apply to post content.
    // A more advanced search would require denormalizing author names onto posts
    // or using a search service like Algolia.
    return posts.filter(post => {
      const content = post.content?.toLowerCase() || '';
      return content.includes(lowercasedTerm);
    });
  }, [posts, searchTerm]);

  const isLoading = isLoadingPosts;

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
              />
          ))
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


export default function CommunityPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CommunityPageContent />
    </Suspense>
  )
}
