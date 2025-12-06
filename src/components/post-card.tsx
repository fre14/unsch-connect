import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MessageCircle, Heart, Repeat, MoreHorizontal, Bookmark, Flag, BadgeCheck } from 'lucide-react';
import { getImageUrl } from '@/lib/placeholder-images';

export type PostProps = {
  id?: string;
  author: {
    name: string;
    username: string;
    avatarId: string;
  };
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
  category?: string;
};

export function PostCard({ id, author, time, content, imageId, imageAlt, stats, isOfficial = false }: PostProps) {
  const authorAvatarUrl = getImageUrl(author.avatarId);
  const postImageUrl = imageId ? getImageUrl(imageId) : null;

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
       <div className="p-4 flex gap-4">
        <Avatar className="h-11 w-11">
          <AvatarImage src={authorAvatarUrl} alt={author.name} />
          <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
            <div className='flex justify-between items-start'>
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold font-headline hover:underline cursor-pointer">{author.name}</p>
                        {isOfficial && <BadgeCheck className="h-4 w-4 text-primary" />}
                        <p className="text-sm text-muted-foreground">@{author.username}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{time}</p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Más opciones">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem><Bookmark className="mr-2 h-4 w-4" /> Guardar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive/90"><Flag className="mr-2 h-4 w-4" /> Reportar</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <p className="whitespace-pre-wrap text-base">{content}</p>
            {postImageUrl && imageAlt && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                <Image src={postImageUrl} alt={imageAlt} fill className="object-cover" />
            </div>
            )}
            <div className="flex justify-between items-center pt-2 -ml-2">
                <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary" aria-label={`${stats.comments} comentarios`}>
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
