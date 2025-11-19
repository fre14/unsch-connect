import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const scheduleData = {
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
            <h3 className="font-headline text-lg font-semibold text-center py-3 border-b capitalize">{day}</h3>
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
                    {Object.entries(scheduleData).map(([day, items]) => (
                      <React.Fragment key={day}>
                        <DayColumn day={day} items={items as ScheduleItem[]} />
                        {day !== 'domingo' && <div className="border-l" />}
                      </React.Fragment>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
