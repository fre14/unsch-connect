"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { addDays, format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, addWeeks, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";

// Helper function to capitalize strings
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);


const scheduleData: ScheduleByDay = {
  lunes: [],
  martes: [],
  miercoles: [],
  jueves: [],
  viernes: [],
  sabado: [],
  domingo: [],
};

type ScheduleItem = {
    time: string;
    course: string;
    room: string;
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
    return (
        <div className="flex-1 min-w-[120px] sm:min-w-[150px] border-l first:border-l-0">
            <h3 className="font-headline text-sm sm:text-base font-semibold text-center py-2 border-b capitalize sticky top-0 bg-card z-10">
                <span>{capitalize(day.substring(0,3))}</span>
                <p className="text-xs font-normal text-muted-foreground">{format(date, 'd')}</p>
            </h3>
            <div className="p-2 space-y-2 h-[60vh] overflow-y-auto">
                {items.length > 0 ? items.map((item, index) => (
                    <div key={index} className="p-2.5 rounded-lg border bg-card/80 hover:bg-muted/50 transition-colors shadow-sm">
                        <div className="flex justify-between items-start gap-2">
                           <p className="font-semibold text-sm leading-tight">{item.course}</p>
                           {getTypeBadge(item.type)}
                        </div>
                        <p className="text-xs text-muted-foreground pt-1">{item.time}</p>
                        <p className="text-xs text-muted-foreground">{item.room}</p>
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

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("semana");
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())

  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start, end });
  const weekDayNames = Object.keys(scheduleData);

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

  const monthEvents = Object.values(scheduleData).flat().filter(event => selectedDate && isSameDay(event.date, selectedDate));

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
                <Dialog>
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
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Título</Label>
                                <Input id="title" placeholder="Ej: Examen de Cálculo" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="type">Tipo</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="class">Clase</SelectItem>
                                        <SelectItem value="event">Evento</SelectItem>
                                        <SelectItem value="task">Tarea</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="date">Fecha</Label>
                                    <Input id="date" type="date" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="time">Hora</Label>
                                    <Input id="time" type="time" />
                                </div>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="room">Aula (Opcional)</Label>
                                <Input id="room" placeholder="Ej: B-301" />
                            </div>
                            <Button type="submit" className="w-full mt-2">Guardar Evento</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>

        {view === 'semana' && (
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

        {view === 'mes' && (
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
                        {monthEvents.length > 0 ? monthEvents.map((item, index) => (
                             <div key={index} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors shadow-sm flex items-center gap-4">
                                <div className="flex-shrink-0 text-center w-12">
                                    <p className="font-semibold text-sm leading-tight">{item.time.split('-')[0]}</p>
                                    <p className="text-xs text-muted-foreground">{item.time.split('-')[1]}</p>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="font-semibold text-base leading-tight">{item.course}</p>
                                        {getTypeBadge(item.type)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{item.room}</p>
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
