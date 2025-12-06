"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";
import { useUser } from "@/context/user-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFirestore, useFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { getImageUrl } from "@/lib/placeholder-images";

const profileSchema = z.object({
    firstName: z.string().min(1, "El nombre es requerido."),
    lastName: z.string().min(1, "El apellido es requerido."),
    description: z.string().max(160, "La biografía no puede exceder los 160 caracteres.").optional(),
    website: z.string().url("Debe ser una URL válida.").or(z.literal("")).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
    const { userProfile, refetchUserProfile } = useUser();
    const firestore = useFirestore();
    const { user } = useFirebase();

    const [avatar, setAvatar] = useState(userProfile?.profilePicture || getImageUrl('default-user-avatar'));
    const [coverImage, setCoverImage] = useState(userProfile?.coverImage || getImageUrl('cover-default'));


    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            description: "",
            website: "",
        }
    });

     useEffect(() => {
        if (userProfile) {
            form.reset({
                firstName: userProfile.firstName || "",
                lastName: userProfile.lastName || "",
                description: userProfile.description || "",
                website: userProfile.website || "",
            });
            setAvatar(userProfile.profilePicture || getImageUrl('default-user-avatar'));
            setCoverImage(userProfile.coverImage || getImageUrl('cover-default'));
        }
    }, [userProfile, form]);

    async function onProfileSubmit(data: ProfileFormValues) {
        if (!user || !firestore) {
            toast({ variant: "destructive", title: "Error", description: "Usuario no autenticado." });
            return;
        }

        const userDocRef = doc(firestore, "userProfiles", user.uid);
        const updatedData = {
            ...data,
            profilePicture: avatar,
            coverImage: coverImage,
        };

        updateDoc(userDocRef, updatedData)
            .then(() => {
                toast({ title: "Perfil actualizado", description: "Tu información ha sido guardada." });
                if(refetchUserProfile) refetchUserProfile();
            })
            .catch(serverError => {
                 const permissionError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'update',
                    requestResourceData: updatedData,
                });
                errorEmitter.emit('permission-error', permissionError);
                toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar tu perfil. Puede que no tengas permisos." });
            });
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="font-headline text-3xl font-bold">Configuración</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Perfil</CardTitle>
                    <CardDescription>Gestiona tu información pública.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label>Foto de Perfil</Label>
                                <ImageUpload 
                                    initialImage={avatar} 
                                    onImageChange={setAvatar} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Foto de Portada</Label>
                                <ImageUpload 
                                    initialImage={coverImage} 
                                    onImageChange={setCoverImage}
                                    aspectRatio="aspect-[16/5]"
                                />
                            </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                        <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Apellido</FormLabel>
                                        <FormControl>
                                        <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Biografía</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Cuéntanos un poco sobre ti..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sitio Web / Red Social</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://tu-portfolio.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </form>
                    </Form>
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
