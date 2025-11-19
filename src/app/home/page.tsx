import { PostCard, PostProps } from '@/components/post-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image as ImageIcon, ListVideo, Mic, Paperclip, Send, Smile } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getImageUrl } from '@/lib/placeholder-images';

const posts: PostProps[] = [
  {
    author: { name: 'Ana Sofía', username: '@anasofia', avatarId: 'user-avatar-1' },
    time: 'hace 5 min',
    content: '¡Emocionada por el inicio del nuevo ciclo! ¿Alguien más en Cálculo III? Busco grupo de estudio. 📚 #UNSCH #NuevoCiclo',
    stats: { likes: 25, comments: 4, reposts: 2 },
  },
  {
    author: { name: 'Juan Carlos', username: '@jc_reyes', avatarId: 'user-avatar-2' },
    time: 'hace 2 horas',
    content: 'Recordatorio amistoso: La fecha límite para la entrega del proyecto de Programación Avanzada es este viernes. ¡No lo dejen para el último momento!',
    imageId: 'post-image-code',
    imageAlt: 'Laptop with code on screen',
    stats: { likes: 42, comments: 11, reposts: 8 },
  },
  {
    author: { name: 'Comedor Universitario', username: '@comedorunsch', avatarId: 'comedor-avatar' },
    time: 'hace 8 horas',
    content: '📢 ¡Anuncio Importante! El menú de mañana será: Sopa de quinua, Lomo saltado y refresco de maracuyá. ¡Los esperamos!',
    isOfficial: true,
    stats: { likes: 150, comments: 23, reposts: 30 },
  }
];


const CreatePost = () => {
    return (
        <Card>
            <CardHeader className="p-4">
                <div className="flex items-start gap-4">
                    <Avatar>
                        <AvatarImage src={getImageUrl('user-avatar-main')} />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="w-full">
                        <Textarea
                            placeholder="¿Qué estás pensando, Estudiante?"
                            className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[60px] resize-none text-base"
                        />
                         <div className="flex justify-between items-center mt-2">
                            <div className="flex gap-1 text-muted-foreground">
                                <Button variant="ghost" size="icon"><ImageIcon className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon"><ListVideo className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon"><Mic className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon"><Paperclip className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon"><Smile className="h-5 w-5" /></Button>
                            </div>
                            <Button className="gap-2"><Send className="h-4 w-4" /> Publicar</Button>
                        </div>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
};

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6">
        <CreatePost />
        <Tabs defaultValue="foryou" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="foryou">Para ti</TabsTrigger>
            <TabsTrigger value="following">Siguiendo</TabsTrigger>
          </TabsList>
          <TabsContent value="foryou">
            <div className="space-y-6 mt-6">
              {posts.map((post, index) => (
                <PostCard key={index} {...post} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="following">
            <div className="text-center text-muted-foreground p-8">
              <p>Las publicaciones de la gente que sigues aparecerán aquí.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
