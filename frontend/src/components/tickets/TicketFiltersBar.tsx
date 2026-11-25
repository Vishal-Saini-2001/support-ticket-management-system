'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TicketPriority, TicketStatus } from '@/types/api';

export const TICKET_CATEGORIES = ['Technical', 'Billing', 'General', 'Feature Request'] as const;

interface TicketFiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: TicketStatus | '';
  onStatusChange: (value: TicketStatus | '') => void;
  priority: TicketPriority | '';
  onPriorityChange: (value: TicketPriority | '') => void;
  category: string;
  onCategoryChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export function TicketFiltersBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  onReset,
  hasActiveFilters,
}: TicketFiltersBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-3 lg:flex-row lg:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tickets by title or description…"
          aria-label="Search tickets"
          className="pl-9"
        />
      </div>

      {/* Filters & Sort */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <Select
          value={status || 'all'}
          onValueChange={(val) => onStatusChange(val === 'all' ? '' : (val as TicketStatus))}
        >
          <SelectTrigger aria-label="Filter by status" className="w-full sm:w-[138px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={priority || 'all'}
          onValueChange={(val) => onPriorityChange(val === 'all' ? '' : (val as TicketPriority))}
        >
          <SelectTrigger aria-label="Filter by priority" className="w-full sm:w-[136px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={category || 'all'}
          onValueChange={(val) => onCategoryChange(val === 'all' ? '' : val)}
        >
          <SelectTrigger aria-label="Filter by category" className="w-full sm:w-[152px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {TICKET_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort || '-createdAt'} onValueChange={onSortChange}>
          <SelectTrigger aria-label="Sort tickets" className="w-full sm:w-[156px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-createdAt">Newest first</SelectItem>
            <SelectItem value="createdAt">Oldest first</SelectItem>
            <SelectItem value="-updatedAt">Recently updated</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="title">Title (A–Z)</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="col-span-2 sm:col-span-1 text-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Reset
          </Button>
        ) : null}
      </div>
    </div>
  );
}

