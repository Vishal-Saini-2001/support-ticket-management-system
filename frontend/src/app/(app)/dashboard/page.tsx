'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, FolderKanban, Inbox, Plus } from 'lucide-react';
import { useAppRouter } from '@/hooks/useAppRouter';
import { useAuth } from '@/hooks/useAuth';
import { useStats } from '@/hooks/useStats';
import { useTickets } from '@/hooks/useTickets';
import { extractApiError } from '@/lib/errors';
import { formatRelativeTime } from '@/lib/utils';
import type { Ticket } from '@/types/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Button } from '@/components/ui/button';

export default function UserDashboardPage() {
  const { user } = useAuth();
  const router = useAppRouter();

  const statsQuery = useStats();
  const recentTicketsQuery = useTickets({ limit: 5, sort: '-createdAt', page: 1 });

  const columns: DataTableColumn<Ticket>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (ticket) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{ticket.title}</p>
        </div>
      ),
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

  const stats = statsQuery.data;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.name || 'there'}`}
        description="Track the status of your support requests and recent updates."
        actions={
          <Link href="/tickets/new">
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              New ticket
            </Button>
          </Link>
        }
      />

      {/* Stat Cards */}
      {statsQuery.isError ? (
        <ErrorState
          title="Could not load ticket statistics"
          message={extractApiError(statsQuery.error).message}
          onRetry={() => {
            void statsQuery.refetch();
          }}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total tickets"
            value={stats?.total ?? 0}
            icon={FolderKanban}
            isLoading={statsQuery.isLoading}
          />
          <StatCard
            label="Open"
            value={stats?.byStatus.open ?? 0}
            icon={Inbox}
            isLoading={statsQuery.isLoading}
          />
          <StatCard
            label="In Progress"
            value={stats?.byStatus['in-progress'] ?? 0}
            icon={Clock}
            isLoading={statsQuery.isLoading}
          />
          <StatCard
            label="Resolved"
            value={stats?.byStatus.resolved ?? 0}
            icon={CheckCircle2}
            isLoading={statsQuery.isLoading}
          />
        </div>
      )}

      {/* Recent Tickets */}
      <section className="space-y-3" aria-labelledby="recent-tickets-heading">
        <div className="flex items-center justify-between">
          <h2 id="recent-tickets-heading" className="text-[16px] font-semibold text-foreground">
            Recent tickets
          </h2>
          <Link
            href="/tickets"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {recentTicketsQuery.isError ? (
          <ErrorState
            title="Could not load recent tickets"
            message={extractApiError(recentTicketsQuery.error).message}
            onRetry={() => {
              void recentTicketsQuery.refetch();
            }}
          />
        ) : (
          <DataTable
            data={recentTicketsQuery.data?.data ?? []}
            columns={columns}
            keyExtractor={(ticket) => ticket._id}
            isLoading={recentTicketsQuery.isLoading}
            skeletonCount={4}
            onRowClick={(ticket) => router.push(`/tickets/${ticket._id}`)}
            emptyState={
              <EmptyState
                title="No tickets yet"
                description="Create your first support ticket and our team will help you out."
                action={
                  <Link href="/tickets/new">
                    <Button size="sm">
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      Create ticket
                    </Button>
                  </Link>
                }
              />
            }
          />
        )}
      </section>
    </div>
  );
}
