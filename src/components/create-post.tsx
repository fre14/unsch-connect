"use client";

import * as React from "react";
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, X, LoaderCircle } from "lucide-react";
import { useUser } from "@/context/user-context";
import { Card, CardContent } from "./ui/card";
import { useFirestore, useFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "@/hooks/use-toast";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";
import { v4 as uuidv4 } from 'uuid';

export function CreatePost() {
  const { avatar, userProfile, isUserLoading } = useUser();
  const { user, firebaseApp } = useFirebase();
  const firestore = useFirestore();
  const [content, setContent] = React.useState("");
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const clearImage = () => {
      setImageFile(null);
      setImagePreview(null);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  }

  const handlePublish = async () => {
    if (!content.trim() && !imageFile) {
      return;
    }
    
    if (isUserLoading || !userProfile || !user || !firestore || !firebaseApp) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Tu perfil aún se está cargando. Inténtalo de nuevo en un momento.",
        });
        return;
    }

    setIsPublishing(true);
    let imageUrl: string | null = null;

    try {
        if (imageFile) {
            const storage = getStorage(firebaseApp);
            const imageId = uuidv4();
            const storageRef = ref(storage, `posts/${user.uid}/${imageId}`);
            
            const snapshot = await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        const newPost: any = {
          authorId: user.uid,
          content: content,
          postType: imageUrl ? 'photo' : 'text',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          likedBy: [],
          repostedBy: [],
          commentIds: [],
          ...(imageUrl && { imageUrl: imageUrl }),
        };

        const postsCollectionRef = collection(firestore, "posts");
        await addDoc(postsCollectionRef, newPost);
        
        setContent("");
        clearImage();
        toast({
            title: "¡Publicado!",
            description: "Tu publicación ha sido compartida con la comunidad.",
        });

    } catch (error: any) {
         console.error("Publishing error:", error);
         if (error.code?.startsWith('storage/')) {
             toast({ variant: "destructive", title: "Error de Subida", description: "No se pudo subir la imagen. Verifica tu conexión o los permisos." });
         } else {
            const permissionError = new FirestorePermissionError({
                path: 'posts',
                operation: 'create',
                requestResourceData: { content: content },
            });
            errorEmitter.emit('permission-error', permissionError);
         }
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

            {imagePreview && (
              <div className="relative mt-2">
                <Image src={imagePreview} alt="Vista previa" width={500} height={300} className="rounded-lg object-cover w-full h-auto" />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 h-7 w-7 rounded-full"
                  onClick={clearImage}
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
              <Button className="rounded-full" onClick={handlePublish} disabled={(!content.trim() && !imageFile) || isPublishing}>
                {isPublishing ? (
                    <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Publicando...
                    </>
                ) : "Publicar"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}