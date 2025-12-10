"use client";

import * as React from "react";
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, X } from "lucide-react";
import { useUser } from "@/context/user-context";
import { Card, CardContent } from "./ui/card";
import { useFirestore, useFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";

export function CreatePost() {
  const { avatar, userProfile, isUserLoading } = useUser();
  const { user } = useFirebase();
  const firestore = useFirestore();
  const [content, setContent] = React.useState("");
  const [image, setImage] = React.useState<string | null>(null);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    if (!content.trim() && !image) {
      return;
    }
    
    if (isUserLoading || !userProfile || !user || !firestore) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Tu perfil aún se está cargando. Inténtalo de nuevo en un momento.",
        });
        return;
    }

    setIsPublishing(true);

    const newPost: any = {
      authorId: user.uid,
      content: content,
      postType: image ? 'photo' : 'text',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likedBy: [],
      repostedBy: [],
      commentIds: [],
    };

    if (image) {
      newPost.imageUrl = image;
    }

    const postsCollectionRef = collection(firestore, "posts");
    addDoc(postsCollectionRef, newPost)
        .then(() => {
            setContent("");
            setImage(null);
            toast({
                title: "¡Publicado!",
                description: "Tu publicación ha sido compartida con la comunidad.",
            });
        })
        .catch((error: any) => {
            const permissionError = new FirestorePermissionError({
                path: postsCollectionRef.path,
                operation: 'create',
                requestResourceData: newPost,
            });
            errorEmitter.emit('permission-error', permissionError);
        })
        .finally(() => {
            setIsPublishing(false);
        });
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

            {image && (
              <div className="relative mt-2">
                <Image src={image} alt="Vista previa" width={500} height={300} className="rounded-lg object-cover w-full h-auto" />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 h-7 w-7 rounded-full"
                  onClick={() => setImage(null)}
                  disabled={isPublishing}
                  aria-label="Quitar imagen"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/png, image/jpeg, image/gif"
            />
            
            <div className="flex justify-between items-center pt-2">
                <div className="flex gap-1 text-primary">
                    <Button variant="ghost" size="icon" disabled={isPublishing} aria-label="Añadir imagen" onClick={() => fileInputRef.current?.click()}>
                      <ImageIcon className="h-5 w-5" />
                    </Button>
                </div>
              <Button className="rounded-full" onClick={handlePublish} disabled={(!content.trim() && !image) || isPublishing}>
                {isPublishing ? "Publicando..." : "Publicar"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
