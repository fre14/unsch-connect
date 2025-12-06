"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ChevronLeft, ChevronRight, XCircle, LoaderCircle, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay, isSameMonth, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFirestore, useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, Timestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const scheduleFormSchema = z.object({
  courseName: z.string().min(1, "El título es requerido."),
  startTime: z.string().min(1, "La hora de inicio es requerida."),
  endTime: z.string().min(1, "La hora de fin es requerida."),
  location: z.string().optional(),
  type: z.enum(["class", "event", "task"], { required_error: "El tipo es requerido."}),
  date: z.date({ required_error: "La fecha es requerida."}),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type ScheduleItem = {
    id: string;
    courseName: string;
    location?: string;
    startTime: string;
    endTime: string;
    type: 'class' | 'event' | 'task';
    date: Date;
    dayOfWeek: string;
}

const getTypeBadge = (type: ScheduleItem['type']) => {
    switch(type) {
        case 'class': return <Badge variant="secondary">Clase</Badge>;
        case 'event': return <Badge variant="default" className="bg-accent text-accent-foreground">Evento</Badge>;
        case 'task': return <Badge variant="destructive">Tarea</Badge>;
        default: return null;
    }
}

function AddOrEditScheduleForm({ setDialogOpen, editingItem }: { setDialogOpen: (open: boolean) => void, editingItem?: ScheduleItem | null }) {
    const { user } = useFirebase();
    const firestore = useFirestore();

    const form = useForm<ScheduleFormValues>({
        resolver: zodResolver(scheduleFormSchema),
        defaultValues: {
            courseName: "",
            startTime: "",
            endTime: "",
            location: "",
        },
    });

    useEffect(() => {
        if (editingItem) {
            form.reset({
                courseName: editingItem.courseName,
                type: editingItem.type,
                date: editingItem.date,
                startTime: editingItem.startTime,
                endTime: editingItem.endTime,
                location: editingItem.location || "",
            });
        } else {
            form.reset();
        }
    }, [editingItem, form]);

    async function onSubmit(data: ScheduleFormValues) {
        if (!user || !firestore) {
            toast({ variant: "destructive", title: "Error", description: "Debes iniciar sesión para gestionar tu horario." });
            return;
        }
        
        const scheduleData = {
            ...data,
            dayOfWeek: format(data.date, 'eeee', { locale: es }).toLowerCase(),
            userProfileId: user.uid,
        };

        try {
            if (editingItem) {
                // Update existing item
                const itemDocRef = doc(firestore, "userProfiles", user.uid, "academicSchedules", editingItem.id);
                await updateDoc(itemDocRef, scheduleData);
                toast({ title: "Evento actualizado", description: "Tu horario ha sido actualizado." });
            } else {
                // Add new item
                const scheduleCollectionRef = collection(firestore, "userProfiles", user.uid, "academicSchedules");
                await addDoc(scheduleCollectionRef, { ...scheduleData, createdAt: serverTimestamp() });
                toast({ title: "Evento guardado", description: "Tu horario ha sido actualizado." });
            }
            form.reset();
            setDialogOpen(false);
        } catch (error) {
            console.error("Error saving document: ", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el evento." });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <FormField control={form.control} name="courseName" render={({ field }) => (<FormItem><FormLabel>Título</FormLabel><FormControl><Input placeholder="Ej: Examen de Cálculo" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Tipo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger></FormControl><SelectContent><SelectItem value="class">Clase</SelectItem><SelectItem value="event">Evento</SelectItem><SelectItem value="task">Tarea</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="date" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Fecha</FormLabel><Dialog><DialogTrigger asChild><FormControl><Button variant="outline" className="pl-3 text-left font-normal">{field.value ? format(field.value, "PPP", { locale: es }) : <span>Elige una fecha</span>}</Button></FormControl></DialogTrigger><DialogContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={es} /></DialogContent></Dialog><FormMessage /></FormItem>)} />
                 <div className="grid grid-cols-2 gap-4">
                     <FormField control={form.control} name="startTime" render={({ field }) => ( <FormItem><FormLabel>Hora de inicio</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="endTime" render={({ field }) => (<FormItem><FormLabel>Hora de fin</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                 <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Aula (Opcional)</FormLabel><FormControl><Input placeholder="Ej: B-301" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <Button type="submit" className="w-full mt-2" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Guardando..." : (editingItem ? "Guardar Cambios" : "Guardar Evento")}
                </Button>
            </form>
        </Form>
    );
}

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  const { user } = useFirebase();
  const firestore = useFirestore();

  const scheduleQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    const scheduleCollectionRef = collection(firestore, "userProfiles", user.uid, "academicSchedules");
    return query(scheduleCollectionRef, orderBy("startTime", "asc"));
  }, [user, firestore]);
  
  const { data: rawScheduleData, isLoading } = useCollection(scheduleQuery);

  const scheduleItems: ScheduleItem[] = useMemo(() => {
    if (!rawScheduleData) return [];
    return rawScheduleData.map(item => ({
      ...item,
      id: item.id,
      date: item.date instanceof Timestamp ? item.date.toDate() : (typeof item.date === 'string' ? parseISO(item.date) : new Date(item.date)),
    })).filter(item => item.date instanceof Date && !isNaN(item.date.valueOf())) as ScheduleItem[];
  }, [rawScheduleData]);

  const monthEvents = useMemo(() => {
    return scheduleItems.filter(event => selectedDate && isSameDay(event.date, selectedDate));
  }, [scheduleItems, selectedDate]);

  const handlePrevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  
  const handleEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingItem(null);
    setFormOpen(true);
  }

  const handleDelete = async (itemId: string) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, "userProfiles", user.uid, "academicSchedules", itemId);
    try {
        await deleteDoc(docRef);
        toast({ title: "Evento eliminado", description: "El evento ha sido eliminado de tu horario." });
    } catch (error) {
        console.error("Error deleting document: ", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el evento." });
    }
  };


  return (
    <div className="h-full flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h1 className="font-headline text-3xl font-bold">Mi Horario</h1>
            <div className="flex items-center gap-2">
                <div className="flex items-center">
                    <Button variant="outline" size="icon" onClick={handlePrevMonth} className="rounded-r-none" aria-label="Mes anterior"><ChevronLeft/></Button>
                     <span className="px-4 text-lg font-semibold text-foreground w-40 text-center">
                        {capitalize(format(currentMonth, "MMMM yyyy", {locale: es}))}
                    </span>
                    <Button variant="outline" size="icon" onClick={handleNextMonth} className="rounded-l-none border-l-0" aria-label="Siguiente mes"><ChevronRight/></Button>
                </div>
                <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" onClick={handleAddNew}>
                            <PlusCircle className="h-5 w-5" />
                            <span className="hidden sm:inline">Agregar</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? "Editar Evento" : "Agregar al Horario"}</DialogTitle>
                        </DialogHeader>
                        <AddOrEditScheduleForm setDialogOpen={setFormOpen} editingItem={editingItem} />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
        
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
             <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
            <div className="flex-1 flex flex-col md:flex-row gap-6">
                <Card className="flex-shrink-0">
                     <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        className="p-0"
                        locale={es}
                        modifiers={{
                            hasEvent: scheduleItems.map(item => item.date)
                        }}
                        modifiersClassNames={{
                            hasEvent: 'has-event'
                        }}
                    />
                </Card>
                <div className="flex-1">
                     <h2 className="font-headline text-xl font-bold mb-4">
                        Eventos para el {selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: es }) : "..."}
                    </h2>
                     <div className="space-y-3">
                        {monthEvents.length > 0 ? monthEvents.map((item) => (
                             <div key={item.id} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors shadow-sm flex items-center gap-4 group">
                                <div className="flex-shrink-0 text-center w-16">
                                    <p className="font-semibold text-sm leading-tight">{item.startTime}</p>
                                    <p className="text-xs text-muted-foreground">{item.endTime}</p>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="font-semibold text-base leading-tight">{item.courseName}</p>
                                        {getTypeBadge(item.type)}
                                    </div>
                                    {item.location && <p className="text-sm text-muted-foreground">{item.location}</p>}
                                </div>
                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                <AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará el evento de tu horario.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        )) : (
                           <Card className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg bg-card h-full flex flex-col justify-center">
                                <XCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-xl font-semibold text-foreground">No hay eventos</h3>
                                <p className="mt-2">No hay nada programado para este día.</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        )}
        <style jsx>{`
            .has-event:not([aria-selected]) {
                position: relative;
            }
            .has-event:not([aria-selected])::after {
                content: '';
                position: absolute;
                bottom: 4px;
                left: 50%;
                transform: translateX(-50%);
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background-color: hsl(var(--primary));
            }
        `}</style>
    </div>
  );
}

    