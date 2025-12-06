"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ChevronLeft, ChevronRight, XCircle, LoaderCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { addDays, format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, addWeeks, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFirestore, useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, Timestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const scheduleFormSchema = z.object({
  courseName: z.string().min(1, "El título es requerido."),
  dayOfWeek: z.string().optional(), // This will be calculated
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
    location: string;
    startTime: string;
    endTime: string;
    type: 'class' | 'event' | 'task';
    date: Date;
}

type ScheduleByDay = {
    [key: string]: ScheduleItem[];
}

const getTypeBadge = (type: ScheduleItem['type']) => {
    switch(type) {
        case 'class': return <Badge variant="secondary">Clase</Badge>;
        case 'event': return <Badge variant="default" className="bg-accent text-accent-foreground">Evento</Badge>;
        case 'task': return <Badge variant="destructive">Tarea</Badge>;
        default: return null;
    }
}

const DayColumn = ({ day, items, date }: { day: string, items: ScheduleItem[], date: Date }) => {
    const sortedItems = useMemo(() => {
        return items.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [items]);

    return (
        <div className="flex-1 min-w-[140px] sm:min-w-[160px] border-l first:border-l-0">
            <h3 className="font-headline text-sm sm:text-base font-semibold text-center py-2 border-b capitalize sticky top-0 bg-card z-10">
                <span>{capitalize(day.substring(0,3))}</span>
                <p className="text-xs font-normal text-muted-foreground">{format(date, 'd')}</p>
            </h3>
            <div className="p-2 space-y-2 h-[60vh] overflow-y-auto">
                {sortedItems.length > 0 ? sortedItems.map((item) => (
                    <div key={item.id} className="p-2.5 rounded-lg border bg-card/80 hover:bg-muted/50 transition-colors shadow-sm">
                        <div className="flex justify-between items-start gap-2">
                           <p className="font-semibold text-sm leading-tight">{item.courseName}</p>
                           {getTypeBadge(item.type)}
                        </div>
                        <p className="text-xs text-muted-foreground pt-1">{item.startTime} - {item.endTime}</p>
                        {item.location && <p className="text-xs text-muted-foreground">{item.location}</p>}
                    </div>
                )) : (
                    <div className="text-center text-muted-foreground text-xs pt-10 h-full flex items-center justify-center">
                        <p>No hay eventos</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function AddToScheduleForm({ setDialogOpen }: { setDialogOpen: (open: boolean) => void }) {
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

    async function onSubmit(data: ScheduleFormValues) {
        if (!user || !firestore) {
            toast({ variant: "destructive", title: "Error", description: "Debes iniciar sesión para agregar eventos." });
            return;
        }

        const scheduleCollectionRef = collection(firestore, "userProfiles", user.uid, "academicSchedules");
        
        const newScheduleItem = {
            ...data,
            dayOfWeek: format(data.date, 'eeee', { locale: es }).toLowerCase(),
            userProfileId: user.uid,
            createdAt: serverTimestamp(),
        };

        try {
            await addDoc(scheduleCollectionRef, newScheduleItem);
            toast({ title: "Evento guardado", description: "Tu horario ha sido actualizado." });
            form.reset();
            setDialogOpen(false);
        } catch (error) {
            console.error("Error adding document: ", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el evento." });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <FormField
                    control={form.control}
                    name="courseName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Título</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Examen de Cálculo" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un tipo" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="class">Clase</SelectItem>
                                    <SelectItem value="event">Evento</SelectItem>
                                    <SelectItem value="task">Tarea</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Fecha</FormLabel>
                             <Dialog>
                                <DialogTrigger asChild>
                                    <FormControl>
                                        <Button variant="outline" className="pl-3 text-left font-normal">
                                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                                        </Button>
                                    </FormControl>
                                </DialogTrigger>
                                <DialogContent className="w-auto p-0">
                                     <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                        locale={es}
                                    />
                                </DialogContent>
                            </Dialog>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <div className="grid grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hora de inicio</FormLabel>
                                <FormControl><Input type="time" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hora de fin</FormLabel>
                                <FormControl><Input type="time" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Aula (Opcional)</FormLabel>
                            <FormControl><Input placeholder="Ej: B-301" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full mt-2" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Guardando..." : "Guardar Evento"}
                </Button>
            </form>
        </Form>
    );
}

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("semana");
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useFirebase();
  const firestore = useFirestore();

  const scheduleQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    const scheduleCollectionRef = collection(firestore, "userProfiles", user.uid, "academicSchedules");
    return query(scheduleCollectionRef, orderBy("createdAt", "desc"));
  }, [user, firestore]);
  
  const { data: rawScheduleData, isLoading } = useCollection(scheduleQuery);

  const scheduleItems: ScheduleItem[] = useMemo(() => {
    if (!rawScheduleData) return [];
    return rawScheduleData.map(item => ({
      ...item,
      // Firestore Timestamps need to be converted to JS Date objects
      date: item.date instanceof Timestamp ? item.date.toDate() : (typeof item.date === 'string' ? parseISO(item.date) : item.date),
    })) as ScheduleItem[];
  }, [rawScheduleData]);

  const scheduleData = useMemo<ScheduleByDay>(() => {
    const data: ScheduleByDay = { lunes: [], martes: [], miercoles: [], jueves: [], viernes: [], sabado: [], domingo: [] };
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

    scheduleItems
        .filter(item => item.date >= weekStart && item.date <= weekEnd)
        .forEach(item => {
            const dayName = format(item.date, 'eeee', { locale: es }).toLowerCase();
            if (data[dayName]) {
                data[dayName].push(item);
            }
        });
    return data;
  }, [scheduleItems, currentDate]);

  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start, end });
  const weekDayNames = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  const handlePrev = () => {
    if (view === 'semana') {
        setCurrentDate(subWeeks(currentDate, 1));
    } else {
        setSelectedDate(prev => prev ? new Date(prev.setMonth(prev.getMonth() - 1)) : new Date());
    }
  };
  const handleNext = () => {
    if (view === 'semana') {
        setCurrentDate(addWeeks(currentDate, 1));
    } else {
        setSelectedDate(prev => prev ? new Date(prev.setMonth(prev.getMonth() + 1)) : new Date());
    }
  };

  const monthEvents = useMemo(() => {
    return scheduleItems.filter(event => selectedDate && isSameDay(event.date, selectedDate));
  }, [scheduleItems, selectedDate]);


  return (
    <div className="h-full flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h1 className="font-headline text-3xl font-bold">Mi Horario</h1>
            <div className="flex items-center gap-2">
                 <ToggleGroup type="single" defaultValue="semana" value={view} onValueChange={(v) => v && setView(v)}>
                    <ToggleGroupItem value="semana">Semana</ToggleGroupItem>
                    <ToggleGroupItem value="mes">Mes</ToggleGroupItem>
                </ToggleGroup>
                <div className="flex items-center">
                    <Button variant="outline" size="icon" onClick={handlePrev} className="rounded-r-none" aria-label={view === 'semana' ? 'Semana anterior' : 'Mes anterior'}><ChevronLeft/></Button>
                    <Button variant="outline" size="icon" onClick={handleNext} className="rounded-l-none border-l-0" aria-label={view === 'semana' ? 'Siguiente semana' : 'Siguiente mes'}><ChevronRight/></Button>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <PlusCircle className="h-5 w-5" />
                            <span className="hidden sm:inline">Agregar</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Agregar al Horario</DialogTitle>
                        </DialogHeader>
                        <AddToScheduleForm setDialogOpen={setIsDialogOpen} />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
        
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
             <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && view === 'semana' && (
            <>
                <p className="text-lg font-semibold text-foreground mb-4">
                    {capitalize(format(start, "MMMM", {locale: es}))} {format(end, "yyyy")}
                </p>
                <Card className="flex-1 overflow-hidden">
                    <CardContent className="p-0 h-full overflow-x-auto">
                        <div className="flex h-full min-w-max sm:min-w-full">
                            {weekDays.map((day, index) => (
                            <React.Fragment key={day.toString()}>
                                <DayColumn day={weekDayNames[index]} items={scheduleData[weekDayNames[index]]} date={day} />
                            </React.Fragment>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </>
        )}

        {!isLoading && view === 'mes' && (
            <div className="flex-1 flex flex-col md:flex-row gap-6">
                <Card className="flex-shrink-0">
                     <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        month={selectedDate}
                        onMonthChange={setSelectedDate}
                        className="p-0"
                        locale={es}
                    />
                </Card>
                <div className="flex-1">
                     <h2 className="font-headline text-xl font-bold mb-4">
                        Eventos para el {selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: es }) : "..."}
                    </h2>
                     <div className="space-y-3">
                        {monthEvents.length > 0 ? monthEvents.map((item) => (
                             <div key={item.id} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors shadow-sm flex items-center gap-4">
                                <div className="flex-shrink-0 text-center w-16">
                                    <p className="font-semibold text-sm leading-tight">{item.startTime}</p>
                                    <p className="text-xs text-muted-foreground">{item.endTime}</p>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="font-semibold text-base leading-tight">{item.courseName}</p>
                                        {getTypeBadge(item.type)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{item.location}</p>
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
    </div>
  );
}

    