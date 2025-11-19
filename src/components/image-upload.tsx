
"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface ImageUploadProps {
    initialImage: string;
    onImageChange: (newImage: string) => void;
    aspectRatio?: string;
}

export function ImageUpload({ initialImage, onImageChange, aspectRatio = "aspect-square" }: ImageUploadProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImagePreview(initialImage);
  }, [initialImage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        onImageChange(result);
      };
      reader.readAsDataURL(file);
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
            <div className={cn("relative w-32 rounded-md overflow-hidden", aspectRatio)}>
                {imagePreview && <Image src={imagePreview} alt="Preview" fill className="object-cover" />}
            </div>
        )}
        <Button 
            variant="outline" 
            size="icon" 
            className="absolute bottom-0 right-0 rounded-full h-7 w-7 bg-card hover:bg-muted -translate-x-1 translate-y-1"
            onClick={handleButtonClick}
            >
            <Camera className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Change image</span>
        </Button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        className="hidden"
        accept="image/png, image/jpeg"
      />
      <div>
        <Button variant="outline" onClick={handleButtonClick}>Cambiar Foto</Button>
        <p className="text-xs text-muted-foreground mt-2">JPG o PNG. Máximo 5MB.</p>
      </div>
    </div>
  );
}
