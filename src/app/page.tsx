import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <Card className="w-full max-w-md animate-fade-in-up border-accent/20 bg-card/80 shadow-lg shadow-accent/10 backdrop-blur-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-4 flex items-center gap-3 text-accent">
            <GraduationCap size={48} />
            <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground">
              UNCH Connect
            </h1>
          </div>
          <CardTitle className="font-headline text-2xl">Bienvenido, estudiante.</CardTitle>
          <CardDescription className="text-muted-foreground">
            Tu espacio exclusivo para conectar, compartir y crecer en la UNSCH.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Link href="/home" passHref>
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">Iniciar Sesión</Button>
          </Link>
          <Link href="/signup" passHref>
            <Button variant="outline" className="w-full" size="lg">Registrarse</Button>
          </Link>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} UNSCH Connect. Todos los derechos reservados.</p>
        <p>Universidad Nacional de San Cristóbal de Huamanga.</p>
      </footer>
    </div>
  );
}
