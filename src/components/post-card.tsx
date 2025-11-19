import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MessageCircle, Heart, Repeat, MoreHorizontal, Bookmark, Flag, BadgeCheck } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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

export function PostCard({ author, time, content, imageId, imageAlt, stats, isOfficial = false }: PostProps) {
  const authorAvatar = PlaceHolderImages.find(img => img.id === author.avatarId);
  const postImage = imageId ? PlaceHolderImages.find(img => img.id === imageId) : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 flex flex-row items-start gap-4">
        <Avatar>
          {authorAvatar && <AvatarImage src={authorAvatar.imageUrl} alt={author.name} />}
          <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold font-headline">{author.name}</p>
            {isOfficial && <BadgeCheck className="h-4 w-4 text-accent" />}
            <p className="text-sm text-muted-foreground">{author.username}</p>
            <span className="text-sm text-muted-foreground hidden sm:inline">·</span>
            <p className="text-sm text-muted-foreground">{time}</p>
          </div>
          <p className="text-sm text-muted-foreground">{isOfficial ? 'Anuncio Oficial' : 'Estudiante'}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem><Bookmark className="mr-2 h-4 w-4" /> Guardar</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive/90"><Flag className="mr-2 h-4 w-4" /> Reportar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-4 pb-2 space-y-4">
        <p className="whitespace-pre-wrap">{content}</p>
        {postImage && imageAlt && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
            <Image src={postImage.imageUrl} alt={imageAlt} fill className="object-cover" data-ai-hint={postImage.imageHint} />
          </div>
        )}
      </CardContent>
      <CardFooter className="px-4 py-2 flex justify-between">
        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">{stats.comments}</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-green-500">
          <Repeat className="h-5 w-5" />
          <span className="hidden sm:inline">{stats.reposts}</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-red-500">
          <Heart className="h-5 w-5" />
          <span className="hidden sm:inline">{stats.likes}</span>
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bookmark className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
