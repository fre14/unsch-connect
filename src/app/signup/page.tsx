import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
       <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <Card className="w-full max-w-md animate-fade-in-up border-accent/20 bg-card/80 shadow-lg shadow-accent/10 backdrop-blur-sm">
        <CardHeader className="items-center text-center">
            <div className="mb-4 flex items-center gap-3 text-accent">
                <GraduationCap size={32} />
                <h1 className="font-headline text-3xl font-bold tracking-tighter text-foreground">
                UNCH Connect
                </h1>
            </div>
            <CardTitle className="font-headline text-2xl">Crear una cuenta</CardTitle>
            <CardDescription>Usa tu correo institucional para registrarte.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Correo Institucional</Label>
                <Input id="email" type="email" placeholder="codigo@unsch.edu.pe" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="student-code">Código de Estudiante</Label>
                <Input id="student-code" type="text" placeholder="Tu código de estudiante" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Crea una Contraseña</Label>
                <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Registrarse</Button>
            <div className="mt-4 text-center text-sm">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/" className="underline text-accent hover:text-accent/80">
                    Iniciar sesión
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
