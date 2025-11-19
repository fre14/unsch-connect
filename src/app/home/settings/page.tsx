
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";

export default function SettingsPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="font-headline text-3xl font-bold">Configuración</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Perfil</CardTitle>
                    <CardDescription>Gestiona tu información pública.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Foto de Perfil</Label>
                        <ImageUpload />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" defaultValue="Estudiante Ejemplar" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Nombre de usuario</Label>
                        <Input id="username" defaultValue="@estudiante_ejemplar" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">Biografía</Label>
                        <Textarea id="bio" defaultValue="Estudiante de Ingeniería de Sistemas en la UNSCH. Apasionado por la tecnología y el desarrollo de software." />
                    </div>
                    <Button>Guardar Cambios</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Seguridad</CardTitle>
                    <CardDescription>Cambia tu contraseña.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="current-password">Contraseña Actual</Label>
                        <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">Nueva Contraseña</Label>
                        <Input id="new-password" type="password" />
                    </div>
                    <Button>Cambiar Contraseña</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notificaciones</CardTitle>
                    <CardDescription>Configura tus preferencias de notificación.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Nuevos seguidores</p>
                            <p className="text-sm text-muted-foreground">Recibir notificación cuando alguien te siga.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Separator />
                     <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Comentarios en tus posts</p>
                            <p className="text-sm text-muted-foreground">Recibir notificación de nuevos comentarios.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                     <Separator />
                     <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Anuncios oficiales</p>
                            <p className="text-sm text-muted-foreground">Recibir notificaciones push de la universidad.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
