
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MessageCircle, Heart, Repeat, MoreHorizontal, Flag, BadgeCheck, Briefcase, Trash2, LoaderCircle } from 'lucide-react';
import { getImageUrl } from '@/lib/placeholder-images';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, DocumentData, deleteDoc, updateDoc, arrayUnion, arrayRemove, addDoc, collection, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useFirebase, useCollection } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Skeleton } from './ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Textarea } from './ui/textarea';
import { formatPostTime } from '@/lib/utils';
import Link from 'next/link';

// Hook interno para obtener los datos del autor
function useAuthorProfile(authorId: string | undefined) {
  const firestore = useFirestore();
  const authorDocRef = useMemoFirebase(() => {
    if (!firestore || !authorId) return null;
    return doc(firestore, 'userProfiles', authorId);
  }, [firestore, authorId]);

  const { data: authorProfile, isLoading } = useDoc<DocumentData>(authorDocRef);
  
  return { authorProfile, isLoading };
}

function Comment({ comment }: { comment: DocumentData }) {
    const { authorProfile, isLoading } = useAuthorProfile(comment.authorId);

    if (isLoading) {
        return (
            <div className="flex items-center space-x-2 py-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-40" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start space-x-3 py-3">
            <Avatar className="h-9 w-9">
                <AvatarImage src={authorProfile?.profilePicture || getImageUrl('default-user-avatar')} />
                <AvatarFallback>{authorProfile?.firstName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="bg-muted/50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{`${authorProfile?.firstName || ''} ${authorProfile?.lastName || ''}`.trim()}</span>
                        <span className="text-xs text-muted-foreground">{formatPostTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                </div>
            </div>
        </div>
    );
}

function CommentsDialog({ postId }: { postId: string }) {
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const firestore = useFirestore();
    const { user } = useFirebase();

    const commentsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
    }, [firestore, postId]);
    
    const { data: comments, isLoading: isLoadingComments } = useCollection(commentsQuery);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !firestore || !user) return;

        setIsSubmitting(true);
        const commentsCollectionRef = collection(firestore, 'posts', postId, 'comments');
        const newComment = {
            authorId: user.uid,
            content: commentText,
            createdAt: serverTimestamp(),
            postId: postId,
        };
        try {
            await addDoc(commentsCollectionRef, newComment);
            setCommentText('');
        } catch (error) {
            console.error("Error adding comment: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo publicar el comentario.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle>Comentarios</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] flex flex-col">
                <div className="flex-1 overflow-y-auto pr-4">
                     {isLoadingComments ? (
                        <div className="flex justify-center items-center h-24">
                            <LoaderCircle className="animate-spin text-primary" />
                        </div>
                    ) : comments && comments.length > 0 ? (
                        comments.map(comment => <Comment key={comment.id} comment={comment} />)
                    ) : (
                        <p className="py-8 text-center text-sm text-muted-foreground">No hay comentarios aún. ¡Sé el primero!</p>
                    )}
                </div>
                <form onSubmit={handleCommentSubmit} className="mt-4 flex items-start space-x-2 border-t pt-4">
                    <Textarea 
                        placeholder="Escribe un comentario..." 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="min-h-[40px] resize-none"
                        rows={1}
                        disabled={isSubmitting}
                    />
                    <Button type="submit" disabled={!commentText.trim() || isSubmitting}>
                        {isSubmitting ? <LoaderCircle className="animate-spin" /> : "Enviar"}
                    </Button>
                </form>
            </div>
        </DialogContent>
    );
}

export type PostProps = {
  id: string;
  authorId: string;
  time: string;
  content: string;
  likedBy?: string[];
  repostedBy?: string[];
  originalPostId?: string;
  originalAuthorId?: string;
  imageId?: string;
  imageAlt?: string;
  isOfficial?: boolean;
  authorOverride?: { name: string };
};

export function PostCard(props: PostProps) {
    const { id, authorId, time, content, imageId, imageAlt, isOfficial = false, authorOverride, likedBy = [], repostedBy = [], originalPostId, originalAuthorId } = props;
    const { user } = useFirebase();
    const firestore = useFirestore();

    const [hasLiked, setHasLiked] = useState(user && likedBy.includes(user.uid));
    const [likeCount, setLikeCount] = useState(likedBy.length);
    const [repostCount, setRepostCount] = useState(repostedBy.length);


    const commentsQuery = useMemoFirebase(() => {
        if (!firestore || !id) return null;
        return query(collection(firestore, 'posts', id, 'comments'));
    }, [firestore, id]);

    const { data: comments } = useCollection(commentsQuery);
    const commentCount = comments?.length || 0;

    // Determine which author ID to use (original for reposts, own for original posts)
    const displayAuthorId = originalAuthorId || authorId;
    const { authorProfile, isLoading: isAuthorLoading } = useAuthorProfile(displayAuthorId);

    const isAuthor = user?.uid === authorId;
    const [isDeleting, setIsDeleting] = useState(false);
    
    const originalPostQuery = useMemoFirebase(() => {
        if (!firestore || !originalPostId) return null;
        return doc(firestore, 'posts', originalPostId);
    }, [firestore, originalPostId]);

    const { data: originalPostData, isLoading: isOriginalPostLoading } = useDoc<DocumentData>(originalPostQuery);
    
    const postImageUrl = imageId ? getImageUrl(imageId) : null;
  
    const authorName = authorOverride?.name || (authorProfile ? `${authorProfile.firstName} ${authorProfile.lastName}`.trim() || authorProfile.email?.split('@')[0] : 'Usuario');
    const authorUsername = authorProfile ? authorProfile.email?.split('@')[0] : '...';
    const authorAvatarUrl = authorProfile?.profilePicture || getImageUrl('default-user-avatar');
    const authorSchool = authorProfile?.school;

    const handleDelete = async () => {
        if (!firestore || !id) return;
        setIsDeleting(true);
        const postDocRef = doc(firestore, 'posts', id);
        try {
            await deleteDoc(postDocRef);
            toast({ title: 'Publicación eliminada', description: 'Tu publicación ha sido eliminada correctamente.' });
        } catch (error) {
            const permissionError = new FirestorePermissionError({ path: postDocRef.path, operation: 'delete' });
            errorEmitter.emit('permission-error', permissionError);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar la publicación.' });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleLike = async () => {
        if (!firestore || !user) {
             toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para dar me gusta.' });
             return;
        }

        // Optimistic UI update
        const newHasLiked = !hasLiked;
        setHasLiked(newHasLiked);
        setLikeCount(prev => newHasLiked ? prev + 1 : prev - 1);

        const postDocRef = doc(firestore, 'posts', id);
        const updateData = {
            likedBy: newHasLiked ? arrayUnion(user.uid) : arrayRemove(user.uid),
            updatedAt: serverTimestamp()
        };

        try {
            await updateDoc(postDocRef, updateData)
        } catch (error) {
             // Revert optimistic update on error
            setHasLiked(!newHasLiked);
            setLikeCount(prev => !newHasLiked ? prev + 1 : prev - 1);

            const permissionError = new FirestorePermissionError({
                path: postDocRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo procesar tu Me Gusta.' });
        }
    }

    const handleRepost = async () => {
        if (!firestore || !user) {
            toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para repostear.' });
            return;
        }
        const postDocRef = doc(firestore, 'posts', id);
        
        if (originalPostId) {
             toast({ title: 'Acción no permitida', description: 'No puedes repostear un repost.' });
             return;
        }

        setRepostCount(prev => prev + 1);

        const newPost = {
            authorId: user.uid,
            content: content, 
            postType: 'repost',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            originalPostId: id,
            originalAuthorId: authorId,
            likedBy: [],
            repostedBy: [],
        };
        
        try {
            await addDoc(collection(firestore, 'posts'), newPost);
            await updateDoc(postDocRef, { repostedBy: arrayUnion(user.uid), updatedAt: serverTimestamp() });
            toast({ title: '¡Reposteado!', description: 'Has compartido esta publicación.' });
        } catch (error) {
             setRepostCount(prev => prev - 1);
             const updateData = { repostedBy: arrayUnion(user.uid), updatedAt: serverTimestamp() };
             const permissionError = new FirestorePermissionError({
                path: postDocRef.path,
                operation: 'update',
                requestResourceData: updateData,
             });
             errorEmitter.emit('permission-error', permissionError);
             toast({ variant: 'destructive', title: 'Error', description: 'No se pudo repostear.' });
        }
    };

    const isLoading = isAuthorLoading || isOriginalPostLoading;

    if (isLoading) {
        return (
            <Card className="p-4 shadow-sm">
                <div className="flex gap-4">
                    <Skeleton className="h-11 w-11 rounded-full" />
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2"> <Skeleton className="h-4 w-1/3" /> <Skeleton className="h-3 w-1/4" /> </div>
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </Card>
        )
    }
  
    return (
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
             {originalPostId && (
                <div className="px-4 pt-2 text-sm text-muted-foreground flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    <Link href={`/home/profile/${authorId}`} className="font-semibold hover:underline">Tú</Link> has reposteado
                </div>
            )}
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
                            {authorSchool && !isOfficial && (<div className="flex items-center gap-1.5"> <Briefcase className="h-3.5 w-3.5" /> <span>{authorSchool}</span> </div>)}
                        </div>
                    </div>
                    <AlertDialog>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Más opciones"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem><Flag className="mr-2 h-4 w-4" /> Reportar</DropdownMenuItem>
                              {isAuthor && (
                                <>
                                  <DropdownMenuSeparator />
                                   <AlertDialogTrigger asChild><DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive/90"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem></AlertDialogTrigger>
                                </>
                              )}
                          </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente tu publicación de nuestros servidores.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">{isDeleting ? 'Eliminando...' : 'Eliminar'}</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
                <p className="whitespace-pre-wrap text-base">{content}</p>

                {/* Render original post content if this is a repost */}
                {originalPostId && originalPostData && (
                    <div className="border rounded-lg p-3 mt-2">
                         <PostCard 
                            {...originalPostData as any}
                            id={originalPostData.id}
                            time={formatPostTime(originalPostData.createdAt)}
                            likedBy={originalPostData.likedBy || []}
                            repostedBy={originalPostData.repostedBy || []}
                        />
                    </div>
                )}
                 {originalPostId && !originalPostData && !isOriginalPostLoading && (
                    <div className="border rounded-lg p-3 mt-2">
                        <p className='text-sm text-muted-foreground'>Esta publicación ya no está disponible.</p>
                    </div>
                 )}


                {postImageUrl && imageAlt && !originalPostId && (<div className="relative aspect-video w-full overflow-hidden rounded-lg border"><Image src={postImageUrl} alt={imageAlt} fill className="object-cover" /></div>)}
                <div className="flex justify-between items-center pt-2 -ml-2">
                    <Dialog>
                        <DialogTrigger asChild>
                             <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary" aria-label="Comentarios">
                                <MessageCircle className="h-5 w-5" />
                                <span className="text-sm">{commentCount}</span>
                            </Button>
                        </DialogTrigger>
                       <CommentsDialog postId={id} />
                    </Dialog>
                    <Button variant="ghost" onClick={handleRepost} className="flex items-center gap-2 text-muted-foreground hover:text-green-500" aria-label={`${repostCount} reposts`}>
                        <Repeat className="h-5 w-5" />
                        <span className="text-sm">{repostCount}</span>
                    </Button>
                    <Button variant="ghost" onClick={handleLike} className="flex items-center gap-2 text-muted-foreground hover:text-red-500" aria-label={`${likeCount} me gusta`}>
                        <Heart className={`h-5 w-5 ${hasLiked ? 'fill-current text-red-500' : ''}`} />
                        <span className="text-sm">{likeCount}</span>
                    </Button>
                </div>
            </div>
          </div>
        </Card>
    );
}
