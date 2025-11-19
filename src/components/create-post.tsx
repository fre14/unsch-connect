
"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Globe } from "lucide-react";
import { getImageUrl } from "@/lib/placeholder-images";
import { Card, CardContent } from "./ui/card";

export function CreatePost() {
  return (
    <Card className="sm:border-b sm:rounded-none sm:shadow-none sm:p-0">
      <CardContent className="p-4">
        <div className="grid grid-cols-[auto,1fr] gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={getImageUrl('user-avatar-main')} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Textarea
              placeholder="¿Qué está pasando?"
              className="border-none focus-visible:ring-0 resize-none text-lg p-0 shadow-none bg-transparent"
              rows={3}
            />
            <div className="flex justify-between items-center pt-2">
                <div className="flex gap-1 text-primary">
                    <Button variant="ghost" size="icon"><ImageIcon className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon"><Globe className="h-5 w-5" /></Button>
                </div>
              <Button className="rounded-full">Publicar</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
