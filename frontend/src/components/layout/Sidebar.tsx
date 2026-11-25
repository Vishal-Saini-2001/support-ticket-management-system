'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { CALM_EASE } from '@/components/ui/motion';
import {
  ChevronsUpDown,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  ShieldCheck,
  Sun,
  Ticket,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { cn, getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { SimpleTooltip } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const USER_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Tickets', href: '/tickets', icon: Ticket },
  { label: 'New Ticket', href: '/tickets/new', icon: PlusCircle },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Admin Overview', href: '/admin/dashboard', icon: ShieldCheck },
  { label: 'All Tickets', href: '/admin/tickets', icon: Ticket },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isAdmin = user?.role === 'admin';
  const isCollapsed = collapsed && !mobileOpen;

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [mobileOpen, onCloseMobile]);

  const renderNavSection = (title: string | null, items: NavItem[]) => (
    <div className="space-y-0.5">
      {title && !isCollapsed ? (
        <div className="px-2.5 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wider text-muted">
          {title}
        </div>
      ) : null}
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== '/tickets/new' &&
            item.href !== '/dashboard' &&
            item.href !== '/admin/dashboard' &&
            pathname.startsWith(`${item.href}/`));

        return (
          <SimpleTooltip
            key={item.href}
            label={item.label}
            side="right"
            enabled={isCollapsed}
          >
            <Link
              href={item.href}
              onClick={onCloseMobile}
              aria-label={item.label}
              className={cn(
                'group relative flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-[14px] transition-colors duration-150',
                isActive
                  ? 'font-medium text-foreground'
                  : 'text-muted hover:bg-hover hover:text-foreground',
                isCollapsed && 'justify-center px-2'
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId={mobileOpen ? 'sidebar-active-mobile' : 'sidebar-active-desktop'}
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-sm bg-hover"
                  aria-hidden="true"
                />
              ) : null}
              <motion.span
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.14 }}
                className="relative z-10 inline-flex shrink-0 items-center justify-center"
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              </motion.span>
              {!isCollapsed ? (
                <span className="relative z-10 truncate">{item.label}</span>
              ) : null}
            </Link>
          </SimpleTooltip>
        );
      })}
    </div>
  );

  const sidebarContent = (
    <div className="flex h-full flex-col border-r border-border bg-sidebar">
      {/* Workspace header */}
      <div
        className={cn(
          'flex border-b border-border',
          isCollapsed
            ? 'flex-col-reverse items-center justify-center gap-1.5 px-2 py-2.5'
            : 'h-14 flex-row items-center justify-between px-3'
        )}
      >
        <SimpleTooltip label="Helpdesk" side="right" enabled={isCollapsed}>
          <Link
            href={isAdmin ? '/admin/dashboard' : '/dashboard'}
            onClick={onCloseMobile}
            className={cn(
              'group flex items-center gap-2.5 rounded-sm px-1.5 py-1 transition-colors duration-150 hover:bg-hover',
              isCollapsed && 'justify-center px-1'
            )}
          >
            <motion.span
              whileHover={{ scale: 1.08, rotate: -6 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.16 }}
              className="flex h-6 w-6 items-center justify-center rounded-sm bg-accent text-white"
            >
              <LifeBuoy className="h-3.5 w-3.5" aria-hidden="true" />
            </motion.span>
            {!isCollapsed ? (
              <span className="text-[14px] font-semibold tracking-tight text-foreground">
                Helpdesk
              </span>
            ) : null}
          </Link>
        </SimpleTooltip>

        {/* Collapse / expand button (desktop) */}
        <SimpleTooltip
          label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          side="right"
        >
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-sm text-muted transition-colors duration-150 hover:bg-hover hover:text-foreground md:inline-flex"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </SimpleTooltip>

        {/* Close button (mobile) */}
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-muted transition-colors duration-150 hover:bg-hover hover:text-foreground md:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-2 py-3 space-y-2">
        {isAdmin ? renderNavSection(null, ADMIN_NAV) : renderNavSection(null, USER_NAV)}
      </nav>

      {/* Bottom User Menu */}
      <div className="border-t border-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account menu"
              className={cn(
                'flex w-full items-center gap-2.5 rounded-sm px-2 py-2 text-left transition-colors duration-150 hover:bg-hover',
                isCollapsed && 'justify-center px-1'
              )}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[12px] font-semibold text-accent">
                {getInitials(user?.name || 'User')}
              </span>
              {!isCollapsed ? (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium text-foreground">
                      {user?.name}
                    </div>
                    <div className="truncate text-[11px] text-muted">{user?.email}</div>
                  </div>
                  <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
                </>
              ) : null}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-60">
            <DropdownMenuLabel className="flex items-center justify-between gap-2 py-1.5">
              <span className="truncate text-[12px] font-medium text-foreground">
                {user?.name}
              </span>
              <Badge tone={isAdmin ? 'accent' : 'neutral'} className="capitalize">
                {user?.role}
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-muted" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4 text-muted" aria-hidden="true" />
              )}
              <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                void logout();
              }}
              className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.18, ease: CALM_EASE }}
        className="hidden shrink-0 md:block"
      >
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen ? (
          <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/40"
              onClick={onCloseMobile}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.2, ease: CALM_EASE }}
              className="relative z-10 h-full w-64 bg-sidebar"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

