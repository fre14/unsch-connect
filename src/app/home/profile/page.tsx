"use client";

import Image from 'next/image';
import { PostCard, PostProps } from '@/components/post-card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Mail, Link as LinkIcon, CalendarDays, XCircle } from "lucide-react";
import Link from 'next/link';
import { getImageUrl } from '@/lib/placeholder-images';
import { useUser } from '@/context/user-context';

const userPosts: PostProps[] = [
    // Data removed as requested
];

const reposts: PostProps[] = [
    // Data removed as requested
]

export default function ProfilePage() {
    const { avatar } = useUser();
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Card className="overflow-hidden shadow-md">
                <div className="relative w-full h-36 md:h-48">
                    <Image src={getImageUrl('aniversary-banner')} alt="Profile Banner" fill className="object-cover" />
                </div>
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-end gap-4 -mt-16 sm:-mt-20">
                        <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-background ring-2 ring-primary/50">
                            <AvatarImage src={avatar} />
                            <AvatarFallback>E</AvatarFallback>
                        </Avatar>
                        <div className="ml-auto flex gap-2 pb-2">
                             <Link href="/home/settings" passHref>
                                <Button variant="outline" className="gap-2 rounded-full">
                                    <Edit className="h-4 w-4" /> Editar Perfil
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="font-headline text-2xl font-bold">Estudiante Ejemplar</h2>
                        <p className="text-muted-foreground font-mono text-sm">@estudiante_ejemplar</p>
                        <p className="mt-3 text-base max-w-prose text-foreground/90">
                            Estudiante de Ingeniería de Sistemas en la UNSCH. Apasionado por la tecnología y el desarrollo de software.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5"><Mail className="h-4 w-4"/><span>c2024@unsch.edu.pe</span></div>
                            <div className="flex items-center gap-1.5"><LinkIcon className="h-4 w-4"/> <a href="#" className="hover:underline">website.com</a></div>
                            <div className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4"/><span>Se unió en Julio, 2024</span></div>
                        </div>
                        <div className="mt-4 flex gap-6 text-sm">
                            <Link href="#" className="hover:underline"><span className="font-bold text-foreground">120</span> <span className="text-muted-foreground">Seguidores</span></Link>
                            <Link href="#" className="hover:underline"><span className="font-bold text-foreground">85</span> <span className="text-muted-foreground">Siguiendo</span></Link>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="posts" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="posts">Publicaciones</TabsTrigger>
                    <TabsTrigger value="reposts">Reposts</TabsTrigger>
                </TabsList>
                <TabsContent value="posts">
                    <div className="space-y-6 mt-6">
                        {userPosts.length > 0 ? userPosts.map((post, index) => (
                            <PostCard key={index} {...post} />
                        )) : (
                            <Card className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg bg-card">
                                <XCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-xl font-semibold text-foreground">Sin publicaciones</h3>
                                <p className="mt-2">Este usuario aún no ha publicado nada.</p>
                            </Card>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="reposts">
                    <div className="space-y-6 mt-6">
                        {reposts.length > 0 ? reposts.map((post, index) => (
                            <PostCard key={index} {...post} />
                        )) : (
                             <Card className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg bg-card">
                                <XCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-xl font-semibold text-foreground">Sin reposts</h3>
                                <p className="mt-2">Este usuario aún no ha compartido ninguna publicación.</p>
                            </Card>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
