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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { getImageUrl } from '@/lib/placeholder-images';

// --- Listas de Opciones ---
const careers = [
    "Administración de Empresas", "Agronomía", "Ciencias Físico - Matemáticas: Matemática", "Ciencias Físico - Matemáticas: Física",
    "Ciencias Físico - Matemáticas: Estadística", "Contabilidad y Auditoría", "Economía", "Ingeniería Agrícola", "Ingeniería Agroforestal",
    "Ingeniería Agroindustrial", "Ingeniería Civil", "Ingeniería de Minas", "Ingeniería de Sistemas", "Ingeniería en Industrias Alimentarias",
    "Ingeniería Química", "Arquitectura", "Ingeniería Ambiental", "Antropología Social", "Arqueología Historia: Arqueología",
    "Arqueolgía e Historia: História", "Ciencias de la Comunicación", "Derecho", "Educación Física", "Educación Inicial",
    "Educación Primaria", "Educación Secundaria: Lengua Española y Literatura", "Educación Secundaria: Matemática, Física e Informática",
    "Educación Secundaria: Ciencias Sociales y Filosofía", "Educación Secundaria: Ingles y Lengua Española", "Trabajo Social",
    "Biología: Microbiología", "Biología: Biotecnología", "Biología: Ecología y Recursos Naturales", "Enfermería", "Farmacia y Bioquímica",
    "Medicina Humana", "Medicina Veterinaria", "Obstetricia", "Psicología",
];
const faculties = [
    "Facultad de Ingeniería Química y Metalurgia", "Facultad de Ciencias Sociales", "Facultad de Ingeniería de Minas, Geología y Civil",
    "Facultad de Ciencias Biológicas", "Facultad de Ciencias de la Educación", "Facultad de Ciencias Agrarias",
    "Facultad de Derecho y Ciencias Políticas", "Facultad de Ciencias de la Salud", "Facultad de Ciencias Económicas, Administrativas y contables",
];

const officialDepartments = [
    "ASAMBLEA UNIVERSITARIA", "CONSEJO UNIVERSITARIO", "RECTORADO", "DIRECCIÓN GENERAL DE ADMINISTRACIÓN",
    "OFICINA DE TECNOLOGÍAS DE LA INFORMACIÓN", "SECRETARÍA GENERAL", "OFICINA DE ASESORÍA JURÍDICA",
    "OFICINA DE COOPERACIÓN Y RELACIONES INTERNACIONALES", "OFICINA DE PLANEAMIENTO Y PRESUPUESTO",
    "OFICINA DE GESTIÓN DE LA CALIDAD, LICENCIAMIENTO Y ACREDITACIÓN", "OFICINA DE COMUNICACIÓN E IMAGEN INSTITUCIONAL",
    "DECANATOS", "Departamentos Académicos", "Direccion de Escuela",
];
const rectoradoSubDepts = ["Vicerrectorado Académico", "Vicerrectorado de Investigación"];
const vrAcademicoSubDepts = ["Dirección de Gestión Académica", "Dirección de Admisión y Estudios Generales", "Dirección de Responsabilidad Social, Proyección y Extensión Cultural", "Dirección de Bienestar Universitario"];
const vrInvestigacionSubDepts = ["Dirección de Innovación y Transferencia Tecnológica", "Instituto de Investigación", "Dirección de Incubadora de Empresas", "Dirección de Fomento a la Formación Científica"];


// --- Esquemas de Validación con Zod ---
const passwordSchema = z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.');
const baseSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido."),
  lastName: z.string().min(1, "El apellido es requerido."),
  email: z.string().email("Correo inválido").refine(
    (email) => email.endsWith('@unsch.edu.pe'), {
      message: 'Debe ser un correo institucional de la UNSCH.'
    }
  ).refine(
    (email) => {
      // Expresión regular para validar el formato nombre.apellido.codigo@unsch.edu.pe
      const emailRegex = /^[a-z]+\.[a-z]+\.\d{2}@unsch\.edu\.pe$/;
      return emailRegex.test(email);
    },
    {
      message: "El formato debe ser 'nombre.apellido.codigo@unsch.edu.pe' (ej: juan.perez.01@unsch.edu.pe)."
    }
  ),
  password: passwordSchema,
  confirmPassword: passwordSchema,
});

const studentSchema = baseSchema.extend({
  roleType: z.literal('student'),
  studentCode: z.string().length(8, "El código debe tener 8 dígitos.").regex(/^\d{8}$/, "El código solo debe contener números."),
  career: z.string().min(1, "Debes seleccionar una carrera."),
});

const teacherSchema = baseSchema.extend({
  roleType: z.literal('teacher'),
  teacherCode: z.string().min(1, "El código de docente es requerido."),
  faculty: z.string().min(1, "Debes seleccionar una facultad."),
  employmentType: z.enum(['contratado', 'nombrado'], { required_error: 'Debes seleccionar el tipo de contrato.' }),
  academicDegree: z.string().min(1, 'Tu grado o título es requerido.'),
});

const officialSchema = baseSchema.extend({
  roleType: z.literal('official'),
  mainDepartment: z.string().min(1, "Debes seleccionar un departamento."),
  subDepartment: z.string().optional(),
  specificArea: z.string().optional(),
  verificationCode: z.string().refine(code => code === 'UNSCH-OFICIAL', { message: 'Código de verificación incorrecto.' })
});

const adminSchema = baseSchema.extend({
  roleType: z.literal('admin'),
  dni: z.string().length(8, "El DNI debe tener 8 dígitos.").regex(/^\d{8}$/, "El DNI solo debe contener números."),
  verificationCode: z.string().refine(code => code === 'ADMIN_UNSCH', { message: 'Código de administrador incorrecto.' })
});

const signUpSchema = z.discriminatedUnion('roleType', [
  studentSchema,
  teacherSchema,
  officialSchema,
  adminSchema
]).refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { roleType: 'student' },
  });

  const roleType = form.watch('roleType');
  const mainDepartment = form.watch('mainDepartment');
  const subDepartment = form.watch('subDepartment');
  
  async function onSubmit(data: SignUpFormValues) {
    if (!auth || !firestore) {
      toast({ variant: "destructive", title: "Error", description: "Servicios de Firebase no disponibles." });
      return;
    }
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        let userProfile: any = {
            id: user.uid,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            profilePicture: getImageUrl('default-user-avatar'),
            description: '',
            role: data.roleType === 'student' ? 'student_teacher' : data.roleType,
        };

        if (data.roleType === 'student') {
            userProfile.studentCode = data.studentCode;
            userProfile.school = data.career;
            userProfile.cycle = 'I';
        } else if (data.roleType === 'teacher') {
            userProfile.teacherCode = data.teacherCode;
            userProfile.faculty = data.faculty;
            userProfile.employmentType = data.employmentType;
            userProfile.academicDegree = data.academicDegree;
        } else if (data.roleType === 'official') {
            userProfile.mainDepartment = data.mainDepartment;
            userProfile.subDepartment = data.subDepartment;
            userProfile.specificArea = data.specificArea;
        } else if (data.roleType === 'admin') {
            userProfile.dni = data.dni;
        }

        const userDocRef = doc(firestore, "userProfiles", user.uid);
        
        setDoc(userDocRef, userProfile).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'create',
                requestResourceData: userProfile,
            });
            errorEmitter.emit('permission-error', permissionError);
        });

        toast({ title: "¡Cuenta creada!", description: "Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión." });
        router.push('/');

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error al registrarse",
            description: error.code === 'auth/email-already-in-use' ? "Este correo ya está en uso." : "Ocurrió un error.",
        });
    }
  }

  const renderConditionalFields = () => {
    switch(roleType) {
        case 'student':
            return (
                <>
                    <FormField control={form.control} name="studentCode" render={({ field }) => (<FormItem><FormLabel>Código de Estudiante</FormLabel><FormControl><Input placeholder="Ej: 2024..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="career" render={({ field }) => (<FormItem><FormLabel>Carrera Profesional</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona tu carrera" /></SelectTrigger></FormControl><SelectContent>{careers.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                </>
            );
        case 'teacher':
             return (
                <>
                    <FormField control={form.control} name="teacherCode" render={({ field }) => (<FormItem><FormLabel>Código de Docente</FormLabel><FormControl><Input placeholder="Tu código de docente" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="faculty" render={({ field }) => (<FormItem><FormLabel>Facultad donde enseña</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona una facultad" /></SelectTrigger></FormControl><SelectContent>{faculties.map(f => (<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="employmentType" render={({ field }) => (<FormItem><FormLabel>Tipo de Contrato</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona el tipo" /></SelectTrigger></FormControl><SelectContent><SelectItem value="contratado">Contratado</SelectItem><SelectItem value="nombrado">Nombrado</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="academicDegree" render={({ field }) => (<FormItem><FormLabel>Grado o Título</FormLabel><FormControl><Input placeholder="Ej: Magister en..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                </>
            );
        case 'official':
            return (
                <>
                    <FormField control={form.control} name="mainDepartment" render={({ field }) => (<FormItem><FormLabel>Departamento Principal</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona un departamento" /></SelectTrigger></FormControl><SelectContent>{officialDepartments.map(d => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                    {mainDepartment === 'RECTORADO' && (
                        <FormField control={form.control} name="subDepartment" render={({ field }) => (<FormItem><FormLabel>Vicerrectorado</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona un vicerrectorado" /></SelectTrigger></FormControl><SelectContent>{rectoradoSubDepts.map(d => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                    )}
                    {subDepartment === 'Vicerrectorado Académico' && (
                         <FormField control={form.control} name="specificArea" render={({ field }) => (<FormItem><FormLabel>Dirección Específica</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona una dirección" /></SelectTrigger></FormControl><SelectContent>{vrAcademicoSubDepts.map(d => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                    )}
                     {subDepartment === 'Vicerrectorado de Investigación' && (
                         <FormField control={form.control} name="specificArea" render={({ field }) => (<FormItem><FormLabel>Dirección Específica</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona una dirección" /></SelectTrigger></FormControl><SelectContent>{vrInvestigacionSubDepts.map(d => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                    )}
                    {['DECANATOS', 'Departamentos Académicos', 'Direccion de Escuela'].includes(mainDepartment || '') && (
                        <FormField control={form.control} name="specificArea" render={({ field }) => (<FormItem><FormLabel>Nombre Específico</FormLabel><FormControl><Input placeholder={`Nombre de ${mainDepartment?.slice(0, -1)}`} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    )}
                    <FormField control={form.control} name="verificationCode" render={({ field }) => (<FormItem><FormLabel>Código de Verificación Oficial</FormLabel><FormControl><Input placeholder="Ingresa el código" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </>
            );
        case 'admin':
            return (
                <>
                    <FormField control={form.control} name="dni" render={({ field }) => (<FormItem><FormLabel>DNI</FormLabel><FormControl><Input placeholder="Tu número de DNI" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="verificationCode" render={({ field }) => (<FormItem><FormLabel>Código de Administrador</FormLabel><FormControl><Input placeholder="Ingresa el código de admin" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </>
            );
        default: return null;
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
       <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,hsl(var(--primary)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.05)_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <Card className="w-full max-w-md animate-fade-in-up border-border/50 shadow-lg">
        <CardHeader className="items-center text-center">
            <div className="mb-4 flex items-center gap-3 text-primary">
                <GraduationCap size={40} strokeWidth={2} />
                <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground">UNSCH Connect</h1>
            </div>
            <CardTitle className="font-headline text-2xl">Crear una cuenta</CardTitle>
            <CardDescription>Usa tu correo institucional para registrarte.</CardDescription>
        </CardHeader>
        <CardContent>
           <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>Nombres</FormLabel><FormControl><Input placeholder="Tus nombres" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Apellidos</FormLabel><FormControl><Input placeholder="Tus apellidos" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                
                 <FormField control={form.control} name="roleType" render={({ field }) => (
                    <FormItem><FormLabel>¿Qué eres?</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona un rol" /></SelectTrigger></FormControl><SelectContent><SelectItem value="student">Estudiante</SelectItem><SelectItem value="teacher">Profesor</SelectItem><SelectItem value="official">Cuenta Oficial UNSCH</SelectItem><SelectItem value="admin">Administrador</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Correo Institucional</FormLabel><FormControl><Input placeholder="nombre.apellido.codigo@unsch.edu.pe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                
                {renderConditionalFields()}
              
              <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Contraseña</FormLabel><FormControl><Input type="password" placeholder="********" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>Confirmar Contraseña</FormLabel><FormControl><Input type="password" placeholder="********" {...field} /></FormControl><FormMessage /></FormItem>)} />
              
              <Button type="submit" className="w-full !mt-6 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors font-semibold" disabled={form.formState.isSubmitting}>
                 {form.formState.isSubmitting ? 'Registrando...' : 'Registrarse'}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/" className="font-semibold underline text-accent hover:text-accent/80 transition-colors">Inicia sesión</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
