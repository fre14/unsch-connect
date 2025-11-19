"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { addDays, format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, addWeeks } from "date-fns";
import { es } from "date-fns/locale";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
            default: return null;
        }
    }
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
                <div className="flex items-center">
                    <Button variant="outline" size="icon" onClick={handlePrevWeek} className="rounded-r-none"><ChevronLeft/></Button>
                    <Button variant="outline" size="icon" onClick={handleNextWeek} className="rounded-l-none border-l-0"><ChevronRight/></Button>
                </div>
                <Button className="gap-2">
                    <PlusCircle className="h-5 w-5" />
                    <span className="hidden sm:inline">Agregar</span>
                </Button>
            </div>
        </div>
        <p className="text-lg font-semibold text-foreground mb-4">
            {capitalize(format(start, "MMMM", {locale: es}))} {format(end, "yyyy")}
        </p>
        <Card className="flex-1 overflow-hidden">
            <CardContent className="p-0 h-full overflow-x-auto">
                <div className="flex h-full min-w-[7 * 120px] sm:min-w-full">
                    {weekDays.map((day, index) => (
                      <React.Fragment key={day.toString()}>
                        <DayColumn day={weekDayNames[index]} items={scheduleData[weekDayNames[index]]} date={day} />
                      </React.Fragment>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
