"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GraduationCap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

const forgotPasswordSchema = z.object({
  email: z.string().email("Correo inválido"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    }
  });
  
  async function onSubmit(data: ForgotPasswordFormValues) {
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Servicio de autenticación no disponible. Inténtalo más tarde.",
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, data.email);
      toast({
        title: "Enlace enviado",
        description: `Se ha enviado un enlace para restablecer tu contraseña a ${data.email}.`,
      });
      router.push('/');
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el correo. Verifica que la dirección sea correcta o inténtalo más tarde.",
      });
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,hsl(var(--primary)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.05)_1px,transparent_1px)] bg-[size:14px_24px]"></div>
       <Card className="w-full max-w-md animate-fade-in-up border-border/50 shadow-lg">
        <CardHeader className="items-center text-center">
            <div className="mb-4 flex items-center gap-3 text-primary">
                <GraduationCap size={40} strokeWidth={2} />
                <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground">
                UNSCH Connect
                </h1>
            </div>
            <CardTitle className="font-headline text-2xl">Recuperar Contraseña</CardTitle>
            <CardDescription>Ingresa tu correo para recibir un enlace de recuperación.</CardDescription>
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
              <Button type="submit" className="w-full !mt-6 font-semibold bg-accent text-accent-foreground hover:bg-accent/90" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Enviando...' : 'Enviar Enlace'}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
              ¿Recuerdas tu contraseña?{' '}
              <Link href="/" className="font-semibold text-accent hover:underline">
                  Inicia sesión
              </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
