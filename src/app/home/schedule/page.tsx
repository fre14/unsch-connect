"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { addDays, format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, addWeeks } from "date-fns";
import { es } from "date-fns/locale";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"


const scheduleData: ScheduleByDay = {
  lunes: [],
  martes: [
      { time: "10:00 - 12:00", course: "Cálculo II", room: "Aula 301", type: 'class' },
      { time: "14:00 - 16:00", course: "Estructuras de Datos", room: "Lab. 02", type: 'class' },
  ],
  miercoles: [],
  jueves: [
      { time: "08:00 - 10:00", course: "Cálculo II", room: "Aula 301", type: 'class' },
      { time: "11:00 - 13:00", course: "Base de Datos I", room: "Lab. 01", type: 'class' },
  ],
  viernes: [],
  sabado: [],
  domingo: [],
};

type ScheduleItem = {
    time: string;
    course: string;
    room: string;
    type: 'class' | 'event' | 'task';
}

type ScheduleByDay = {
    [key: string]: ScheduleItem[];
}

const DayColumn = ({ day, items, date }: { day: string, items: ScheduleItem[], date: Date }) => {
    const getTypeBadge = (type: ScheduleItem['type']) => {
        switch(type) {
            case 'class': return <Badge variant="secondary">Clase</Badge>;
            case 'event': return <Badge variant="default" className="bg-accent text-accent-foreground">Evento</Badge>;
            case 'task': return <Badge variant="destructive">Tarea</Badge>;
        }
    }
    return (
        <div className="flex-1 min-w-[150px]">
            <h3 className="font-headline text-sm sm:text-base font-semibold text-center py-3 border-b capitalize sticky top-0 bg-card z-10">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.substring(0,3)}</span>
                <p className="text-xs font-normal text-muted-foreground">{format(date, 'd')}</p>
            </h3>
            <div className="p-2 space-y-2 h-full">
                {items.length > 0 ? items.map((item, index) => (
                    <div key={index} className="p-3 rounded-lg border bg-card/80 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start gap-2">
                           <p className="font-semibold text-sm leading-tight">{item.course}</p>
                           {getTypeBadge(item.type)}
                        </div>
                        <p className="text-xs text-muted-foreground pt-1">{item.time}</p>
                        <p className="text-xs text-muted-foreground">{item.room}</p>
                    </div>
                )) : (
                    <div className="text-center text-muted-foreground pt-10 h-full flex items-center justify-center">
                    </div>
                )}
            </div>
        </div>
    )
}

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("semana");

  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start, end });
  const weekDayNames = Object.keys(scheduleData);

  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  return (
    <div className="h-full flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h1 className="font-headline text-3xl font-bold">Mi Horario</h1>
            <div className="flex items-center gap-2">
                 <ToggleGroup type="single" defaultValue="semana" value={view} onValueChange={(v) => v && setView(v)}>
                    <ToggleGroupItem value="semana">Semana</ToggleGroupItem>
                    <ToggleGroupItem value="mes" disabled>Mes</ToggleGroupItem>
                </ToggleGroup>
                <Button variant="outline" size="icon" onClick={handlePrevWeek}><ChevronLeft/></Button>
                <Button variant="outline" size="icon" onClick={handleNextWeek}><ChevronRight/></Button>
                <Button className="gap-2">
                    <PlusCircle className="h-5 w-5" />
                    <span className="hidden sm:inline">Agregar Actividad</span>
                </Button>
            </div>
        </div>
        <p className="text-lg font-semibold text-foreground mb-4">
            {format(start, "d 'de' MMMM", {locale: es})} - {format(end, "d 'de' MMMM, yyyy", {locale: es})}
        </p>
        <Card className="flex-1">
            <CardContent className="p-0 h-full">
                <div className="flex h-full overflow-x-auto">
                    {weekDays.map((day, index) => (
                      <React.Fragment key={day.toString()}>
                        <DayColumn day={weekDayNames[index]} items={scheduleData[weekDayNames[index]]} date={day} />
                        {index < weekDays.length - 1 && <div className="border-l" />}
                      </React.Fragment>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
