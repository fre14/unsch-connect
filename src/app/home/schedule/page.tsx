import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const scheduleData = {
  lunes: [{ time: '08:00 - 10:00', course: 'Cálculo III', room: 'A-201', type: 'class' }],
  martes: [
    { time: '10:00 - 12:00', course: 'Programación Avanzada', room: 'Lab-C4', type: 'class' },
    { time: '16:00 - 18:00', course: 'Taller de Liderazgo', room: 'Auditorio', type: 'event' }
  ],
  miercoles: [{ time: '08:00 - 10:00', course: 'Cálculo III', room: 'A-201', type: 'class' }],
  jueves: [
    { time: '10:00 - 12:00', course: 'Programación Avanzada', room: 'Lab-C4', type: 'class' },
    { time: '14:00 - 15:00', course: 'Exposición: Fisica II', room: 'B-105', type: 'task' }
  ],
  viernes: [{ time: '11:00 - 13:00', course: 'Estadística Aplicada', room: 'C-303', type: 'class' }],
  sabado: [],
  domingo: [],
};

type ScheduleItem = {
    time: string;
    course: string;
    room: string;
    type: 'class' | 'event' | 'task';
}

const DayColumn = ({ day, items }: { day: string, items: ScheduleItem[] }) => {
    const getTypeBadge = (type: ScheduleItem['type']) => {
        switch(type) {
            case 'class': return <Badge variant="secondary">Clase</Badge>;
            case 'event': return <Badge variant="default" className="bg-accent text-accent-foreground">Evento</Badge>;
            case 'task': return <Badge variant="destructive">Tarea</Badge>;
        }
    }
    return (
        <div className="flex-1 min-w-[220px] sm:min-w-[250px]">
            <h3 className="font-headline text-lg font-semibold text-center py-3 border-b">{day}</h3>
            <div className="p-2 space-y-2 h-full">
                {items.length > 0 ? items.map((item, index) => (
                    <div key={index} className="p-3 rounded-lg border bg-card/50">
                        <div className="flex justify-between items-start">
                           <p className="font-semibold">{item.course}</p>
                           {getTypeBadge(item.type)}
                        </div>
                        <p className="text-sm text-muted-foreground pt-1">{item.time}</p>
                        <p className="text-sm text-muted-foreground">{item.room}</p>
                    </div>
                )) : (
                    <div className="text-center text-muted-foreground pt-10 h-full flex items-center justify-center">
                        <p className="text-sm">Sin actividades</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function SchedulePage() {
  return (
    <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h1 className="font-headline text-3xl font-bold">Mi Horario Académico</h1>
            <Button className="gap-2 self-start sm:self-center">
                <PlusCircle className="h-5 w-5" />
                Agregar Actividad
            </Button>
        </div>
        <Card>
            <CardContent className="p-0">
                <div className="flex overflow-x-auto">
                    <DayColumn day="Lunes" items={scheduleData.lunes} />
                    <div className="border-l" />
                    <DayColumn day="Martes" items={scheduleData.martes} />
                    <div className="border-l" />
                    <DayColumn day="Miércoles" items={scheduleData.miercoles} />
                    <div className="border-l" />
                    <DayColumn day="Jueves" items={scheduleData.jueves} />
                    <div className="border-l" />
                    <DayColumn day="Viernes" items={scheduleData.viernes} />
                    <div className="border-l" />
                    <DayColumn day="Sábado" items={scheduleData.sabado} />
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
