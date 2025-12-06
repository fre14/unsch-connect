import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPostTime = (timestamp: any) => {
    if (!timestamp) return 'hace un momento';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.ceil(diff / (1000 * 60));
    const diffHours = Math.ceil(diff / (1000 * 60 * 60));
    
    if (diffMinutes < 60) return `hace ${diffMinutes} min`;
    if (diffHours < 24) return `hace ${diffHours} h`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
};

    