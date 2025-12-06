"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Globe } from "lucide-react";
import { useUser } from "@/context/user-context";
import { Card, CardContent } from "./ui/card";
import { useFirestore, useFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";

export function CreatePost() {
  const { avatar, userProfile } = useUser();
  const { user } = useFirebase();
  const firestore = useFirestore();
  const [content, setContent] = React.useState("");
  const [isPublishing, setIsPublishing] = React.useState(false);

  const handlePublish = async () => {
    if (!content.trim() || !user || !firestore || !userProfile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se puede publicar. Asegúrate de haber iniciado sesión y completado tu perfil.",
      });
      return;
    }

    setIsPublishing(true);

    const newPost = {
      authorId: user.uid,
      authorName: `${userProfile.firstName} ${userProfile.lastName}`.trim() || userProfile.email,
      authorUsername: userProfile.email?.split('@')[0] || 'unknown_user',
      authorAvatarId: 'user-avatar-main',
      content: content,
      postType: 'text',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likeIds: [],
      commentIds: [],
    };

    try {
      const postsCollectionRef = collection(firestore, "posts");
      
      await addDoc(postsCollectionRef, newPost);

      setContent("");
      toast({
        title: "¡Publicado!",
        description: "Tu publicación ha sido compartida con la comunidad.",
      });

    } catch (error: any) {
      // Create a specific permission error to be caught globally
      const permissionError = new FirestorePermissionError({
        path: collection(firestore, 'posts').path,
        operation: 'create',
        requestResourceData: newPost,
      });
      // Emit the error for the global handler to catch
      errorEmitter.emit('permission-error', permissionError);
      
      // Also show a local toast for immediate user feedback
      toast({
        variant: "destructive",
        title: "Error de publicación",
        description: "No tienes permiso para crear publicaciones.",
      });
      console.error("Error creating post:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Card className="sm:border-b sm:rounded-none sm:shadow-none sm:p-0">
      <CardContent className="p-4">
        <div className="grid grid-cols-[auto,1fr] gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatar} />
            <AvatarFallback>{userProfile?.firstName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Textarea
              placeholder="¿Qué está pasando?"
              className="border-none focus-visible:ring-0 resize-none text-lg p-0 shadow-none bg-transparent"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPublishing}
            />
            <div className="flex justify-between items-center pt-2">
                <div className="flex gap-1 text-primary">
                    <Button variant="ghost" size="icon" disabled={isPublishing} aria-label="Añadir imagen"><ImageIcon className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" disabled={isPublishing} aria-label="Cambiar visibilidad"><Globe className="h-5 w-5" /></Button>
                </div>
              <Button className="rounded-full" onClick={handlePublish} disabled={!content.trim() || isPublishing}>
                {isPublishing ? "Publicando..." : "Publicar"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
