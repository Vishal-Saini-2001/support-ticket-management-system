'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useAppRouter } from '@/hooks/useAppRouter';
import { useTickets } from '@/hooks/useTickets';
import { useDebounce } from '@/hooks/useDebounce';
import { extractApiError } from '@/lib/errors';
import { formatRelativeTime } from '@/lib/utils';
import type { Ticket, TicketPriority, TicketStatus, User } from '@/types/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { TicketFiltersBar } from '@/components/tickets/TicketFiltersBar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const PAGE_LIMIT = 10;

function AdminTicketsContent() {
  const router = useRouter();
  const appRouter = useAppRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get('search') || '';
  const status = (searchParams.get('status') || '') as TicketStatus | '';
  const priority = (searchParams.get('priority') || '') as TicketPriority | '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 200);
  const lastSyncedSearchRef = useRef(urlSearch);

  useEffect(() => {
    if (urlSearch !== lastSyncedSearchRef.current) {
      lastSyncedSearchRef.current = urlSearch;
      setSearchInput(urlSearch);
    }
  }, [urlSearch]);

  const updateQueryParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '' || (key === 'sort' && value === '-createdAt')) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      const queryString = next.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      lastSyncedSearchRef.current = debouncedSearch;
      updateQueryParams({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, urlSearch, updateQueryParams]);

  const { data, isLoading, isError, error, refetch } = useTickets({
    search: urlSearch,
    status,
    priority,
    category,
    sort,
    page,
    limit: PAGE_LIMIT,
  });

  const hasActiveFilters = Boolean(urlSearch || status || priority || category || sort !== '-createdAt');

  const handleResetFilters = () => {
    setSearchInput('');
    router.replace(pathname, { scroll: false });
  };

  const columns: DataTableColumn<Ticket>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (ticket) => (
        <span className="block max-w-[280px] truncate font-medium text-foreground">
          {ticket.title}
        </span>
      ),
    },
    {
      key: 'createdBy',
      header: 'Created by',
      render: (ticket) => {
        const creator =
          typeof ticket.createdBy === 'object' && ticket.createdBy !== null
            ? (ticket.createdBy as User)
            : null;
        return (
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium text-foreground">
              {creator?.name || 'User'}
            </div>
            {creator?.email ? (
              <div className="truncate text-[11px] text-muted">{creator.email}</div>
            ) : null}
          </div>
        );
      },
    },
    {
      key: 'category',
      header: 'Category',
      render: (ticket) => <span className="text-[13px] text-muted">{ticket.category}</span>,
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (ticket) => <PriorityBadge priority={ticket.priority} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (ticket) => <StatusBadge status={ticket.status} />,
    },
    {
      key: 'updated',
      header: 'Updated',
      className: 'text-right',
      render: (ticket) => (
        <span className="text-[12px] text-muted">{formatRelativeTime(ticket.updatedAt)}</span>
      ),
    },
  ];

  const tickets = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, data?.pages ?? 1);

  return (
    <div className="space-y-5">
      <PageHeader
        title="All Tickets"
        description="Browse, filter, and triage support tickets across all users."
      />

      <TicketFiltersBar
        search={searchInput}
        onSearchChange={setSearchInput}
        status={status}
        onStatusChange={(val) => updateQueryParams({ status: val, page: 1 })}
        priority={priority}
        onPriorityChange={(val) => updateQueryParams({ priority: val, page: 1 })}
        category={category}
        onCategoryChange={(val) => updateQueryParams({ category: val, page: 1 })}
        sort={sort}
        onSortChange={(val) => updateQueryParams({ sort: val, page: 1 })}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {isError ? (
        <ErrorState
          title="Could not load workspace tickets"
          message={extractApiError(error).message}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : (
        <>
          <DataTable
            data={tickets}
            columns={columns}
            keyExtractor={(ticket) => ticket._id}
            isLoading={isLoading}
            onRowClick={(ticket) => appRouter.push(`/admin/tickets/${ticket._id}`)}
            emptyState={
              hasActiveFilters ? (
                <EmptyState
                  title="No matching tickets"
                  description="Adjust your search or filters to see more tickets."
                  action={
                    <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  title="No tickets submitted yet"
                  description="Incoming support requests from users will appear here."
                />
              )
            }
          />

          {!isLoading && total > 0 ? (
            <div className="flex flex-col items-center justify-between gap-3 pt-1 text-[13px] text-muted sm:flex-row">
              <span>
                Showing {(page - 1) * PAGE_LIMIT + 1}–{Math.min(page * PAGE_LIMIT, total)} of{' '}
                {total} {total === 1 ? 'ticket' : 'tickets'}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => updateQueryParams({ page: page - 1 })}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Previous
                </Button>
                <span className="px-2 text-[12px] text-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => updateQueryParams({ page: page + 1 })}
                >
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export default function AdminTicketsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <AdminTicketsContent />
    </Suspense>
  );
}

