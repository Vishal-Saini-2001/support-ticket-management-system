'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, FolderKanban, Inbox } from 'lucide-react';
import { useAppRouter } from '@/hooks/useAppRouter';
import { useStats } from '@/hooks/useStats';
import { useTickets } from '@/hooks/useTickets';
import { extractApiError } from '@/lib/errors';
import { formatRelativeTime } from '@/lib/utils';
import type { Ticket, User } from '@/types/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { AdminStatsCharts } from '@/components/admin/AdminStatsCharts';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboardPage() {
  const router = useAppRouter();
  const statsQuery = useStats();
  const recentTicketsQuery = useTickets({ limit: 5, sort: '-createdAt', page: 1 });

  const stats = statsQuery.data;

  const columns: DataTableColumn<Ticket>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (ticket) => (
        <span className="block max-w-[300px] truncate font-medium text-foreground">
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
        return <span className="text-[13px] text-muted">{creator?.name || 'User'}</span>;
      },
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Dashboard"
        description="Global ticket metrics, workload distribution, and triage queue."
        actions={<Badge tone="accent">Admin</Badge>}
      />

      {/* Global Stat Cards */}
      {statsQuery.isError ? (
        <ErrorState
          title="Could not load workspace statistics"
          message={extractApiError(statsQuery.error).message}
          onRetry={() => {
            void statsQuery.refetch();
          }}
        />
      ) : (
        <>
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

          <AdminStatsCharts stats={stats} isLoading={statsQuery.isLoading} />
        </>
      )}

      {/* Recent Workspace Tickets */}
      <section className="space-y-3" aria-labelledby="admin-recent-heading">
        <div className="flex items-center justify-between">
          <h2 id="admin-recent-heading" className="text-[16px] font-semibold text-foreground">
            Latest tickets
          </h2>
          <Link
            href="/admin/tickets"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
          >
            Manage all
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {recentTicketsQuery.isError ? (
          <ErrorState
            title="Could not load latest tickets"
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
            onRowClick={(ticket) => router.push(`/admin/tickets/${ticket._id}`)}
            emptyState={
              <EmptyState
                title="No tickets in workspace"
                description="Tickets submitted by users will appear here for triage."
              />
            }
          />
        )}
      </section>
    </div>
  );
}
