'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Menu, Moon, Sun } from 'lucide-react';
import { Fragment } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { SimpleTooltip } from '@/components/ui/tooltip';
import { NotificationsBell } from '@/components/notifications/NotificationsBell';

interface TopBarProps {
  onOpenMobileMenu: () => void;
}

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  tickets: 'Tickets',
  new: 'New Ticket',
  edit: 'Edit',
  admin: 'Admin',
};

export function TopBar({ onOpenMobileMenu }: TopBarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const segments = pathname.split('/').filter(Boolean);

  const breadcrumbs = segments.map((seg, index) => {
    const rawHref = `/${segments.slice(0, index + 1).join('/')}`;
    const href = rawHref === '/admin' ? '/admin/dashboard' : rawHref;
    const label =
      SEGMENT_LABELS[seg] || (seg.length === 24 ? `#${seg.slice(-6)}` : seg);
    const isLast = index === segments.length - 1;
    return { key: rawHref, href, label, isLast };
  });

  const themeLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm sm:px-6">
      {/* Left: mobile menu + breadcrumbs */}
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-muted transition-colors duration-150 hover:bg-hover hover:text-foreground md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px]">
          {breadcrumbs.map((crumb, idx) => (
            <Fragment key={crumb.key}>
              {idx > 0 ? (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
              ) : null}
              {crumb.isLast ? (
                <span className="truncate font-medium text-foreground">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="truncate text-muted transition-colors duration-150 hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              )}
            </Fragment>
          ))}
        </nav>
      </div>

      {/* Right: theme toggle, notifications */}
      <div className="flex items-center gap-1.5 shrink-0">
        <SimpleTooltip label={themeLabel} side="bottom">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={themeLabel}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ opacity: 0, rotate: -20, scale: 0.85 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 20, scale: 0.85 }}
                transition={{ duration: 0.14 }}
                className="inline-flex items-center justify-center"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-muted" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4 text-muted" aria-hidden="true" />
                )}
              </motion.span>
            </AnimatePresence>
          </Button>
        </SimpleTooltip>

        <NotificationsBell />
      </div>
    </header>
  );
}
