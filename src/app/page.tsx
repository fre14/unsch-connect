"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, 'La contraseña es requerida.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });
  
  function onSubmit(data: LoginFormValues) {
    console.log(data);
    // On successful login, redirect
    router.push('/home/community');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
       <Card className="w-full max-w-md animate-fade-in-up border-border/50 shadow-lg">
        <CardHeader className="items-center text-center">
            <div className="mb-4 flex items-center gap-3 text-primary">
                <GraduationCap size={40} strokeWidth={2} />
                <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground">
                UNCH Connect
                </h1>
            </div>
            <CardTitle className="font-headline text-2xl">Bienvenido de vuelta</CardTitle>
            <CardDescription>Ingresa a tu cuenta para continuar.</CardDescription>
        </CardHeader>
        <CardContent>
           <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Institucional</FormLabel>
                    <FormControl>
                      <Input placeholder="codigo@unsch.edu.pe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                        <FormLabel>Contraseña</FormLabel>
                         <Link href="#" className="text-sm font-medium text-primary hover:underline">
                            ¿Olvidaste tu contraseña?
                         </Link>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full !mt-6 font-semibold">
                Iniciar Sesión
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
              ¿No tienes una cuenta?{' '}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                  Regístrate aquí
              </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
