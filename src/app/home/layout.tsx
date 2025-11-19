"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Bell, CalendarDays, GraduationCap, LogOut, Menu, Megaphone, MoreHorizontal, PlusSquare, Search, Settings, User, Users } from 'lucide-react';
import { getImageUrl } from '@/lib/placeholder-images';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreatePost } from '@/components/create-post';

const navItems = [
  { href: '/home/community', label: 'Comunidad', icon: Users },
  { href: '/home/announcements', label: 'Anuncios', icon: Megaphone },
  { href: '/home/schedule', label: 'Horario', icon: CalendarDays },
  { href: '/home/profile', label: 'Perfil', icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get('search') || '');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };
  
  const sidebarContent = (
    <div className="flex flex-col h-full bg-card text-card-foreground">
      <div className="p-4 border-b">
        <Link href="/home/community" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="font-headline text-xl font-bold">UNCH Connect</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
           const Icon = item.icon;
           const isActive = pathname.startsWith(item.href) || (pathname === '/home' && item.href === '/home/community');
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-3 text-base h-11"
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>
      <div className="p-2 mt-auto border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-auto p-2">
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={getImageUrl('user-avatar-main')} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="text-left flex-1 truncate">
                  <p className="font-semibold text-sm truncate">Estudiante</p>
                  <p className="text-xs text-muted-foreground truncate">c2024@unsch.edu.pe</p>
                </div>
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/home/profile"><User className="mr-2 h-4 w-4" /> Perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/home/settings"><Settings className="mr-2 h-4 w-4" /> Ajustes</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/"><LogOut className="mr-2 h-4 w-4" /> Cerrar sesión</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-card md:flex flex-col">
          {sidebarContent}
        </div>
        <div className="flex flex-col">
          <header className="flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6 sticky top-0 z-30">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0 w-[280px]">
                {sidebarContent}
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
               {pathname === '/home/announcements' && (
                 <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar en anuncios..."
                      className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </form>
               )}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="primary" size="icon" className="gap-2 hidden sm:flex rounded-full h-10 w-10">
                        <PlusSquare className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Crear publicación</p>
                    </TooltipContent>
                </Tooltip>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Publicación</DialogTitle>
                </DialogHeader>
                <CreatePost />
              </DialogContent>
            </Dialog>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notificaciones</span>
                   <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary/80"></span>
                    </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                  <p>Notificaciones</p>
                </TooltipContent>
            </Tooltip>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 bg-background">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
