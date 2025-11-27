
"use client";

import React from 'react';
import { PostCard } from '@/components/post-card';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreatePost } from '@/components/create-post';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommunityPage() {
  const firestore = useFirestore();

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
  }, [firestore]);
  
  const { data: posts, isLoading } = useCollection(postsQuery);

  return (
    <div className="max-w-2xl mx-auto relative">
      <h1 className="font-headline text-3xl font-bold mb-6 sr-only">Comunidad Estudiantil</h1>
      <div className="space-y-4">
        <CreatePost />
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}
        {!isLoading && posts && posts.length > 0 ? (
          posts.map((post) => {
            const postProps = {
              id: post.id,
              author: {
                name: post.authorName,
                username: post.authorUsername,
                avatarId: post.authorAvatarId,
              },
              time: post.createdAt?.toDate().toLocaleDateString() || 'hace un momento',
              content: post.content,
              stats: {
                likes: post.likeIds?.length || 0,
                comments: post.commentIds?.length || 0,
                reposts: 0, // Reposts need a separate logic
              }
            };
            return <PostCard key={post.id} {...postProps} />;
          })
        ) : !isLoading && (
          <div className="text-center text-muted-foreground p-8 mt-4 border-2 border-dashed rounded-lg bg-card">
            <h3 className="text-xl font-semibold text-foreground">Aún no hay nada por aquí</h3>
            <p className="mt-2">¡Sé el primero en compartir algo con la comunidad!</p>
          </div>
        )}
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="fixed bottom-6 right-6 sm:hidden rounded-full w-14 h-14 shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Publicación</DialogTitle>
          </DialogHeader>
          <CreatePost />
        </DialogContent>
      </Dialog>
    </div>
  );
}
