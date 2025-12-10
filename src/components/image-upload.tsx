"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Camera, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useFirebase } from "@/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "@/hooks/use-toast";

interface ImageUploadProps {
    initialImage: string;
    onImageChange: (newImage: string) => void;
    aspectRatio?: string;
    storagePath: 'avatars' | 'covers'; // Path in storage
}

export function ImageUpload({ initialImage, onImageChange, aspectRatio = "aspect-square", storagePath }: ImageUploadProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(initialImage);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, firebaseApp } = useFirebase();

  useEffect(() => {
    setImagePreview(initialImage);
  }, [initialImage]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !firebaseApp) return;

    setIsUploading(true);

    // Show instant preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
        const storage = getStorage(firebaseApp);
        const imageId = uuidv4();
        const fullStoragePath = `${storagePath}/${user.uid}/${imageId}`;
        const storageRef = ref(storage, fullStoragePath);
        
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        onImageChange(downloadURL); // Pass the final URL up to the parent
        setImagePreview(downloadURL); // Update preview to final URL

    } catch (error) {
        console.error("Error uploading image:", error);
        toast({ variant: "destructive", title: "Error de Subida", description: "No se pudo subir la imagen."});
        setImagePreview(initialImage); // Revert to initial image on error
    } finally {
        setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const isAvatar = aspectRatio === 'aspect-square';

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        {isAvatar ? (
            <Avatar className="h-20 w-20">
                <AvatarImage src={imagePreview || ''} />
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
        ) : (
            <div className={cn("relative w-32 rounded-md overflow-hidden bg-muted", aspectRatio)}>
                {imagePreview && <Image src={imagePreview} alt="Preview" fill className="object-cover" />}
            </div>
        )}
        <Button 
            variant="outline" 
            size="icon" 
            className="absolute bottom-0 right-0 rounded-full h-7 w-7 bg-card hover:bg-muted -translate-x-1 translate-y-1"
            onClick={handleButtonClick}
            disabled={isUploading}
            >
            {isUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4 text-muted-foreground" />}
            <span className="sr-only">Change image</span>
        </Button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        className="hidden"
        accept="image/png, image/jpeg"
        disabled={isUploading}
      />
      <div>
        <Button variant="outline" onClick={handleButtonClick} disabled={isUploading}>
            {isUploading ? "Subiendo..." : "Cambiar Foto"}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">JPG o PNG. Máximo 5MB.</p>
      </div>
    </div>
  );
}
