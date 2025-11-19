
"use client";

import React, { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/placeholder-images";
import { Camera } from "lucide-react";

export function ImageUpload() {
  const [imagePreview, setImagePreview] = useState<string | null>(getImageUrl('user-avatar-main'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="h-20 w-20">
          <AvatarImage src={imagePreview || ''} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <Button 
            variant="outline" 
            size="icon" 
            className="absolute bottom-0 right-0 rounded-full h-7 w-7 bg-card hover:bg-muted"
            onClick={handleButtonClick}
            >
            <Camera className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Change profile picture</span>
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
