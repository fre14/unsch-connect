
"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Globe } from "lucide-react";
import { useUser } from "@/context/user-context";
import { Card, CardContent } from "./ui/card";
import { usePosts } from "@/context/post-context";

export function CreatePost() {
  const { avatar } = useUser();
  const { addPost } = usePosts();
  const [content, setContent] = React.useState("");
  
  const handlePublish = () => {
    if (content.trim()) {
        const newPost = {
            id: Date.now().toString(),
            author: {
                name: 'Estudiante Ejemplar',
                username: '@estudiante_ejemplar',
                avatarId: 'user-avatar-main',
            },
            time: 'justo ahora',
            content: content,
            stats: {
                likes: 0,
                comments: 0,
                reposts: 0
            }
        };
        addPost(newPost);
        setContent("");
    }
  };

  return (
    <Card className="sm:border-b sm:rounded-none sm:shadow-none sm:p-0">
      <CardContent className="p-4">
        <div className="grid grid-cols-[auto,1fr] gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatar} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Textarea
              placeholder="¿Qué está pasando?"
              className="border-none focus-visible:ring-0 resize-none text-lg p-0 shadow-none bg-transparent"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-between items-center pt-2">
                <div className="flex gap-1 text-primary">
                    <Button variant="ghost" size="icon"><ImageIcon className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon"><Globe className="h-5 w-5" /></Button>
                </div>
              <Button className="rounded-full" onClick={handlePublish} disabled={!content.trim()}>
                Publicar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

    