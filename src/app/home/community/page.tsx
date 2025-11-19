"use client";

import React from 'react';
import { PostCard, PostProps } from '@/components/post-card';
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

const communityPosts: PostProps[] = [
  // Empty for now
];

export default function CommunityPage() {
  const [posts, setPosts] = React.useState<PostProps[]>(communityPosts);

  return (
    <div className="max-w-2xl mx-auto relative">
      <h1 className="font-headline text-3xl font-bold mb-6">Comunidad Estudiantil</h1>
      <div className="space-y-6">
        <CreatePost />
        {posts.length > 0 ? (
          posts.map((post, index) => <PostCard key={index} {...post} />)
        ) : (
          <div className="text-center text-muted-foreground p-8 border rounded-lg bg-card">
            <p>No hay publicaciones todavía.</p>
            <p className="text-sm">¡Sé el primero en compartir algo con la comunidad!</p>
          </div>
        )}
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="fixed bottom-20 right-6 sm:hidden rounded-full w-14 h-14 shadow-lg">
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
