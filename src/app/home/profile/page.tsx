import Image from 'next/image';
import { PostCard, PostProps } from '@/components/post-card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit } from "lucide-react";
import Link from 'next/link';
import { getImageUrl } from '@/lib/placeholder-images';

const userPosts: PostProps[] = [
    {
      author: { name: 'Estudiante', username: '@estudiante_ejemplar', avatarId: 'user-avatar-main' },
      time: 'hace 1 día',
      content: '¡Qué gran día en el campus! El sol brilla y la energía es increíble. #VidaUniversitaria',
      imageId: 'campus-image',
      imageAlt: 'Sunny day on campus',
      stats: { likes: 102, comments: 15, reposts: 7 },
    }
];

const reposts: PostProps[] = [
    {
      author: { name: 'Rectorado UNSCH', username: '@rectorado', avatarId: 'rector-avatar' },
      time: 'hace 2 días',
      content: '¡Feliz 347° Aniversario, Universidad Nacional de San Cristóbal de Huamanga! Un día para celebrar nuestra historia y mirar hacia el futuro con esperanza y compromiso.',
      imageId: 'aniversary-banner',
      imageAlt: 'University anniversary banner',
      isOfficial: true,
      stats: { likes: 890, comments: 110, reposts: 250 },
    }
]

export default function ProfilePage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Card className="overflow-hidden">
                <div className="h-32 md:h-48 bg-gradient-to-r from-primary to-accent" />
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-20">
                        <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-card">
                            <AvatarImage src={getImageUrl('profile-pic-large')} />
                            <AvatarFallback>E</AvatarFallback>
                        </Avatar>
                        <div className="sm:ml-auto flex gap-2">
                             <Link href="/home/settings" passHref>
                                <Button variant="outline" className="gap-2">
                                    <Edit className="h-4 w-4" /> Editar Perfil
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="font-headline text-2xl font-bold">Estudiante Ejemplar</h2>
                        <p className="text-muted-foreground">@estudiante_ejemplar</p>
                        <p className="mt-2 text-sm max-w-prose">
                            Estudiante de Ingeniería de Sistemas en la UNSCH. Apasionado por la tecnología y el desarrollo de software.
                        </p>
                        <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                            <span><span className="font-bold text-foreground">120</span> Seguidores</span>
                            <span><span className="font-bold text-foreground">85</span> Seguidos</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="posts" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="posts">Publicaciones</TabsTrigger>
                    <TabsTrigger value="reposts">Reposteos</TabsTrigger>
                </TabsList>
                <TabsContent value="posts">
                    <div className="space-y-6 mt-6">
                        {userPosts.map((post, index) => (
                            <PostCard key={index} {...post} />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="reposts">
                    <div className="space-y-6 mt-6">
                        {reposts.map((post, index) => (
                            <PostCard key={index} {...post} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
