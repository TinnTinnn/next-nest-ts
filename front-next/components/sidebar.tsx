'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Box,
  ClipboardList,
  FileSpreadsheet,
  Home,
  LogOut,
  Menu,
  Moon,
  Package,
  PackagePlus,
  Settings,
  ShoppingCart,
  Sun,
  Users,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSidebar } from './sidebar-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';

export function Sidebar() {
  const { user, isLoading, logout } = useUser()
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebar();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading]);


  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) return null


  return (
    <>
      <div
        className={cn(
          'fixed inset-y-0 z-50 flex flex-col bg-background border-r transition-all duration-300',
          isOpen ? 'w-64' : 'w-[70px]',
        )}
      >
        <div className="flex h-14 items-center px-4 border-b bg-gradient-to-r from-background to-muted">
          {isOpen ? (
            <div className="flex items-center gap-2 font-semibold text-lg">
              <Box className="h-6 w-6 text-primary" />
              <span>Inventory Pro</span>
            </div>
          ) : (
            <Box className="h-6 w-6 mx-auto text-primary" />
          )}
          <Button variant="ghost" size="icon" className="ml-auto" onClick={toggle}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-2 bg-gradient-to-b from-background to-background/80">
          <nav className="grid gap-1 px-2">
            <Link
              href="/"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground',
                pathname === '/' ? 'bg-accent text-accent-foreground font-medium shadow-sm' : 'text-muted-foreground',
              )}
            >
              <Home className="h-4 w-4" />
              {isOpen && <span>Home</span>}
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground',
                pathname === '/dashboard'
                  ? 'bg-accent text-accent-foreground font-medium shadow-sm'
                  : 'text-muted-foreground',
              )}
            >
              <BarChart3 className="h-4 w-4" />
              {isOpen && <span>Dashboard</span>}
            </Link>
            <div className={cn('my-2 px-3', !isOpen && 'px-2')}>
              {isOpen ? (
                <div className="text-xs font-medium text-muted-foreground">INVENTORY MANAGEMENT</div>
              ) : (
                <div className="h-px bg-muted" />
              )}
            </div>
            <Link
              href="/products"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground',
                pathname === '/products'
                  ? 'bg-accent text-accent-foreground font-medium shadow-sm'
                  : 'text-muted-foreground',
              )}
            >
              <Package className="h-4 w-4" />
              {isOpen && <span>Products</span>}
            </Link>
            <Link
              href="/stock-in"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground',
                pathname === '/stock-in'
                  ? 'bg-accent text-accent-foreground font-medium shadow-sm'
                  : 'text-muted-foreground',
              )}
            >
              <PackagePlus className="h-4 w-4" />
              {isOpen && <span>Stock In</span>}
            </Link>
            <Link
              href="/stock-out"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground',
                pathname === '/stock-out'
                  ? 'bg-accent text-accent-foreground font-medium shadow-sm'
                  : 'text-muted-foreground',
              )}
            >
              <ShoppingCart className="h-4 w-4" />
              {isOpen && <span>Stock Out</span>}
            </Link>
            <Link
              href="/inventory"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground',
                pathname === '/inventory'
                  ? 'bg-accent text-accent-foreground font-medium shadow-sm'
                  : 'text-muted-foreground',
              )}
            >
              <ClipboardList className="h-4 w-4" />
              {isOpen && <span>Inventory Check</span>}
            </Link>
            <div className={cn('my-2 px-3', !isOpen && 'px-2')}>
              {isOpen ? (
                <div className="text-xs font-medium text-muted-foreground">REPORTS</div>
              ) : (
                <div className="h-px bg-muted" />
              )}
            </div>
            <Link
              href="/reports"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground',
                pathname === '/reports'
                  ? 'bg-accent text-accent-foreground font-medium shadow-sm'
                  : 'text-muted-foreground',
              )}
            >
              <FileSpreadsheet className="h-4 w-4" />
              {isOpen && <span>Reports</span>}
            </Link>
            <div className={cn('my-2 px-3', !isOpen && 'px-2')}>
              {isOpen ? (
                <div className="text-xs font-medium text-muted-foreground">SYSTEM</div>
              ) : (
                <div className="h-px bg-muted" />
              )}
            </div>
            <Link
              href="/users"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground',
                pathname === '/users'
                  ? 'bg-accent text-accent-foreground font-medium shadow-sm'
                  : 'text-muted-foreground',
              )}
            >
              <Users className="h-4 w-4" />
              {isOpen && <span>Users</span>}
            </Link>
            <Link
              href="/settings"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground',
                pathname === '/settings'
                  ? 'bg-accent text-accent-foreground font-medium shadow-sm'
                  : 'text-muted-foreground',
              )}
            >
              <Settings className="h-4 w-4" />
              {isOpen && <span>Settings</span>}
            </Link>

            { mounted && (
              <>
                {isOpen ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="mt-2 justify-start px-3"
                    suppressHydrationWarning
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="mt-2 mx-auto"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span className="sr-only">Toggle Theme</span>
                  </Button>
                )}
              </>
            )}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t bg-gradient-to-b from-muted/50 to-background">
          {isOpen ? (
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 h-auto w-auto">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/10">
                      <AvatarImage src="/placeholder-user.jpg" alt="@user" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>

              </div>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto w-auto mx-auto">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/10">
                    <AvatarImage src="/placeholder-user.jpg" alt="@user" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      {/* Overlay for mobile */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-all duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={toggle}
      />
      {/* Main content padding */}
      <div className={cn('transition-all duration-300', isOpen ? 'pl-64' : 'pl-[70px]')}></div>
    </>
  );
}
