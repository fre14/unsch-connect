
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MessageCircle, Heart, Repeat, MoreHorizontal, Bookmark, Flag, BadgeCheck, Briefcase, LoaderCircle } from 'lucide-react';
import { getImageUrl } from '@/lib/placeholder-images';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, DocumentData } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';

export type PostProps = {
  id?: string;
  authorId: string;
  time: string;
  content: string;
  imageId?: string;
  imageAlt?: string;
  stats: {
    likes: number;
    comments: number;
    reposts: number;
  };
  isOfficial?: boolean;
};

// Hook interno para obtener los datos del autor
function useAuthorProfile(authorId: string) {
  const firestore = useFirestore();
  const authorDocRef = useMemoFirebase(() => {
    if (!firestore || !authorId) return null;
    return doc(firestore, 'userProfiles', authorId);
  }, [firestore, authorId]);

  const { data: authorProfile, isLoading } = useDoc<DocumentData>(authorDocRef);
  
  return { authorProfile, isLoading };
}

export function PostCard({ id, authorId, time, content, imageId, imageAlt, stats, isOfficial = false }: PostProps) {
  const { authorProfile, isLoading } = useAuthorProfile(authorId);

  const postImageUrl = imageId ? getImageUrl(imageId) : null;
  
  const authorName = authorProfile ? `${authorProfile.firstName} ${authorProfile.lastName}`.trim() : 'Usuario';
  const authorUsername = authorProfile ? authorProfile.email?.split('@')[0] : '...';
  const authorAvatarUrl = authorProfile?.profilePicture || getImageUrl('default-user-avatar');
  const authorSchool = authorProfile?.school;

  if (isLoading) {
    return (
        <Card className="p-4">
            <div className="flex gap-4">
                <div className="h-11 w-11 rounded-full bg-muted animate-pulse"></div>
                <div className="flex-1 space-y-3">
                    <div className="h-4 w-1/2 bg-muted animate-pulse rounded-md"></div>
                    <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
                </div>
            </div>
        </Card>
    )
  }

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
       <div className="p-4 flex gap-4">
        <Avatar className="h-11 w-11">
          <AvatarImage src={authorAvatarUrl} alt={authorName} />
          <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
            <div className='flex justify-between items-start'>
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold font-headline hover:underline cursor-pointer">{authorName}</p>
                        {isOfficial && <BadgeCheck className="h-4 w-4 text-primary" />}
                        <p className="text-sm text-muted-foreground">@{authorUsername}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <p>{time}</p>
                        {authorSchool && (
                        <div className="flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5" />
                            <span>{authorSchool}</span>
                        </div>
                        )}
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Más opciones">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem><Bookmark className="mr-2 h-4 w-4" /> Guardar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive/90"><Flag className="mr-2 h-4 w-4" /> Reportar</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <p className="whitespace-pre-wrap text-base">{content}</p>
            {postImageUrl && imageAlt && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                <Image src={postImageUrl} alt={imageAlt} fill className="object-cover" />
            </div>
            )}
            <div className="flex justify-between items-center pt-2 -ml-2">
                <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary" aria-label={`${stats.comments} comentarios`}>
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm">{stats.comments}</span>
                </Button>
                <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-green-500" aria-label={`${stats.reposts} reposts`}>
                    <Repeat className="h-5 w-5" />
                    <span className="text-sm">{stats.reposts}</span>
                </Button>
                <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-red-500" aria-label={`${stats.likes} me gusta`}>
                    <Heart className="h-5 w-5" />
                    <span className="text-sm">{stats.likes}</span>
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" aria-label="Guardar publicación">
                    <Bookmark className="h-5 w-5" />
                </Button>
            </div>
        </div>
      </div>
    </Card>
  );
}
