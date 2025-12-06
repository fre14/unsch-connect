"use client";

import React, { useState, useMemo } from 'react';
import { PostCard, PostProps } from '@/components/post-card';
import { CreatePost } from '@/components/create-post';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { XCircle, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function CommunityPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
  }, [firestore]);
  
  const { data: posts, isLoading } = useCollection(postsQuery);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (!searchTerm) return posts;
    
    const lowercasedTerm = searchTerm.toLowerCase();
    
    return posts.filter(post => 
      post.content?.toLowerCase().includes(lowercasedTerm) ||
      post.authorName?.toLowerCase().includes(lowercasedTerm) ||
      post.authorSchool?.toLowerCase().includes(lowercasedTerm)
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
      <h1 className="font-headline text-3xl font-bold mb-6 sr-only">Comunidad Estudiantil</h1>
      <div className="space-y-4">
        <div className='hidden sm:block'>
          <CreatePost />
        </div>
        
        <div className="relative my-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar publicaciones, personas o carreras..."
            className="w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[150px] w-full" />
          </div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const postProps: PostProps = {
              id: post.id,
              author: {
                name: post.authorName,
                username: post.authorUsername,
                avatarId: post.authorAvatarId,
                school: post.authorSchool
              },
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
