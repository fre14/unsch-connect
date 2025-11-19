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

const signUpSchema = z.object({
  email: z.string().email("Correo inválido").refine(email => email.endsWith('@unsch.edu.pe'), {
    message: 'Debe ser un correo institucional de la UNSCH.',
  }),
  studentCode: z.string().length(8, "El código debe tener 8 dígitos.").regex(/^\d{8}$/, "El código solo debe contener números."),
  career: z.string().min(3, "La carrera debe tener al menos 3 caracteres."),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      studentCode: '',
      career: '',
      password: '',
    }
  });
  
  function onSubmit(data: SignUpFormValues) {
    console.log(data);
    // On successful signup, redirect to login
    router.push('/');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
       <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <Card className="w-full max-w-md animate-fade-in-up border-primary/20 bg-card/80 shadow-lg shadow-primary/10 backdrop-blur-sm">
        <CardHeader className="items-center text-center">
            <div className="mb-4 flex items-center gap-3 text-primary">
                <GraduationCap size={40} strokeWidth={1.5} />
                <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground">
                UNSCH Connect
                </h1>
            </div>
            <CardTitle className="font-headline text-2xl">Crear una cuenta</CardTitle>
            <CardDescription>Usa tu correo institucional para registrarte.</CardDescription>
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="studentCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 2024..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="career"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carrera</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Ing. Sistemas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                Registrarse
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/" className="font-semibold underline text-primary hover:text-primary/80 transition-colors">
                  Inicia sesión
              </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
