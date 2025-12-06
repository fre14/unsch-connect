"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Bell, CalendarDays, GraduationCap, LogOut, Menu, Megaphone, MoreHorizontal, Plus, Search, Settings, User, Users, LoaderCircle } from 'lucide-react';
import { getImageUrl } from '@/lib/placeholder-images';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreatePost } from '@/components/create-post';
import { UserProvider, useUser } from '@/context/user-context';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

const navItems = [
  { href: '/home/community', label: 'Comunidad', icon: Users },
  { href: '/home/announcements', label: 'Anuncios', icon: Megaphone },
  { href: '/home/schedule', label: 'Horario', icon: CalendarDays },
  { href: '/home/profile', label: 'Perfil', icon: User },
];

const notifications = [
    { text: 'Admisión UNSCH ha publicado un nuevo anuncio.', time: 'hace 5 minutos', avatarId: 'admision-avatar' },
    { text: 'A Juan Pérez le ha gustado tu publicación.', time: 'hace 1 hora', avatarId: 'user-avatar-1' },
    { text: 'El Rectorado ha emitido un comunicado importante.', time: 'hace 3 horas', avatarId: 'rector-avatar' },
];

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get('search') || '');
  const { avatar, userProfile, isUserLoading } = useUser();
  const [showNotificationDot, setShowNotificationDot] = React.useState(true);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

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

  const MobileCreatePostDialog = () => (
    <Dialog>
        <DialogTrigger asChild>
          <Button aria-label="Crear nueva publicación" className="fixed bottom-20 right-6 sm:hidden rounded-full w-14 h-14 shadow-lg z-40 bg-accent hover:bg-accent/90">
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Publicación</DialogTitle>
          </DialogHeader>
          <CreatePost />
        </DialogContent>
      </Dialog>
  );
  
  const sidebarContent = (
    <div className="flex flex-col h-full bg-card text-card-foreground">
      <div className="p-4 border-b">
        <Link href="/home/community" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="font-headline text-xl font-bold">UNSCH Connect</span>
        </Link>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
           const Icon = item.icon;
           const isActive = pathname.startsWith(item.href) || (pathname === '/home' && item.href === '/home/community');
          return (
            <Link key={item.href} href={item.href} onClick={() => isMobileSheetOpen && setIsMobileSheetOpen(false)}>
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
                  <AvatarImage src={avatar} />
                  <AvatarFallback>{userProfile?.firstName?.charAt(0) || userProfile?.email?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                 {isUserLoading ? (
                    <div className="flex-1 flex items-center">
                        <LoaderCircle className="animate-spin h-5 w-5 text-muted-foreground" />
                    </div>
                ) : (
                <div className="text-left flex-1 truncate">
                  <p className="font-semibold text-sm truncate">{`${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || userProfile?.email?.split('@')[0] || 'Usuario'}</p>
                  <p className="text-xs text-muted-foreground truncate">{userProfile?.email || 'cargando...'}</p>
                </div>
                )}
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
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-card md:flex flex-col">
          {sidebarContent}
        </div>
        <div className="flex flex-col">
          <header className="flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6 sticky top-0 z-30">
            <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
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
            
            <DropdownMenu onOpenChange={(open) => !open && setShowNotificationDot(false)}>
                <DropdownMenuTrigger asChild>
                   <Tooltip>
                        <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full relative" aria-label="Notificaciones">
                            <Bell className="h-5 w-5" />
                            <span className="sr-only">Notificaciones</span>
                            {showNotificationDot && (
                                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary/80"></span>
                                </span>
                            )}
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Notificaciones</p>
                        </TooltipContent>
                    </Tooltip>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.map((notification, index) => (
                         <DropdownMenuItem key={index} className="flex items-start gap-3 p-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={getImageUrl(notification.avatarId)} />
                                <AvatarFallback>{notification.text.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="text-sm leading-tight whitespace-normal">{notification.text}</p>
                                <p className="text-xs text-muted-foreground">{notification.time}</p>
                            </div>
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                     <DropdownMenuItem className="justify-center text-sm text-primary hover:!bg-accent">
                        Ver todas las notificaciones
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 bg-background">{children}</main>
          {pathname === '/home/community' && <MobileCreatePostDialog />}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </UserProvider>
  )
}
