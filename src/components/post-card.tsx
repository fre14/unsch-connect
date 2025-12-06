
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MessageCircle, Heart, Repeat, MoreHorizontal, Bookmark, Flag, BadgeCheck, Briefcase, Trash2 } from 'lucide-react';
import { getImageUrl } from '@/lib/placeholder-images';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, DocumentData, deleteDoc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useFirebase } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Skeleton } from './ui/skeleton';

export type PostProps = {
  id: string; // ID is now mandatory for deletion
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
  const { user } = useFirebase();
  const firestore = useFirestore();
  const isAuthor = user?.uid === authorId;
  const [isDeleting, setIsDeleting] = useState(false);

  const postImageUrl = imageId ? getImageUrl(imageId) : null;
  
  const authorName = authorProfile ? `${authorProfile.firstName} ${authorProfile.lastName}`.trim() || authorProfile.email?.split('@')[0] : 'Usuario';
  const authorUsername = authorProfile ? authorProfile.email?.split('@')[0] : '...';
  const authorAvatarUrl = authorProfile?.profilePicture || getImageUrl('default-user-avatar');
  const authorSchool = authorProfile?.school;

  const handleCommentClick = () => {
    toast({
      title: "En desarrollo",
      description: "La funcionalidad de comentarios se añadirá pronto.",
    });
  };

  const handleDelete = async () => {
    if (!firestore || !id) return;

    setIsDeleting(true);
    const postDocRef = doc(firestore, 'posts', id);

    deleteDoc(postDocRef)
      .then(() => {
        toast({ title: 'Publicación eliminada', description: 'Tu publicación ha sido eliminada correctamente.' });
      })
      .catch((error) => {
        const permissionError = new FirestorePermissionError({
          path: postDocRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo eliminar la publicación.',
        });
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  if (isLoading) {
    return (
        <Card className="p-4 shadow-sm">
            <div className="flex gap-4">
                <Skeleton className="h-11 w-11 rounded-full" />
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-12 w-full" />
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
          <AvatarFallback>{authorName?.charAt(0) || 'U'}</AvatarFallback>
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
                <AlertDialog>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Más opciones">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem><Bookmark className="mr-2 h-4 w-4" /> Guardar</DropdownMenuItem>
                          <DropdownMenuItem><Flag className="mr-2 h-4 w-4" /> Reportar</DropdownMenuItem>
                          {isAuthor && (
                            <>
                              <DropdownMenuSeparator />
                               <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive/90">
                                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </>
                          )}
                      </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente tu publicación de nuestros servidores.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
            <p className="whitespace-pre-wrap text-base">{content}</p>
            {postImageUrl && imageAlt && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                <Image src={postImageUrl} alt={imageAlt} fill className="object-cover" />
            </div>
            )}
            <div className="flex justify-between items-center pt-2 -ml-2">
                <Button variant="ghost" onClick={handleCommentClick} className="flex items-center gap-2 text-muted-foreground hover:text-primary" aria-label={`${stats.comments} comentarios`}>
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

    