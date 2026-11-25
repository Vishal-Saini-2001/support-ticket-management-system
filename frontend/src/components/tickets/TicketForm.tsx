'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { extractApiError } from '@/lib/errors';
import type { Ticket, TicketPriority } from '@/types/api';
import { TICKET_CATEGORIES } from './TicketFiltersBar';

const ticketFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .trim()
    .min(5, 'Description must be at least 5 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),
  category: z.string().trim().min(2, 'Please select a category'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
});

export type TicketFormValues = z.infer<typeof ticketFormSchema>;

interface TicketFormProps {
  mode: 'create' | 'edit';
  initialTicket?: Ticket;
  canModify?: boolean;
  lockedReason?: string;
  onSubmitValues: (values: TicketFormValues) => Promise<void>;
  onCancel: () => void;
  onRequestDelete?: () => void;
}

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export function TicketForm({
  mode,
  initialTicket,
  canModify = true,
  lockedReason = 'Tickets can only be edited or deleted while status is open.',
  onSubmitValues,
  onCancel,
  onRequestDelete,
}: TicketFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      title: initialTicket?.title || '',
      description: initialTicket?.description || '',
      category: initialTicket?.category || 'Technical',
      priority: initialTicket?.priority || 'medium',
    },
  });

  const isLocked = mode === 'edit' && !canModify;

  const handleFormSubmit = async (values: TicketFormValues) => {
    if (isLocked) {
      return;
    }
    setServerError(null);
    try {
      await onSubmitValues(values);
    } catch (error) {
      const parsed = extractApiError(error, 'Failed to save ticket');
      setServerError(parsed.message);
      for (const [field, message] of Object.entries(parsed.fieldErrors)) {
        if (
          field === 'title' ||
          field === 'description' ||
          field === 'category' ||
          field === 'priority'
        ) {
          setError(field, { message });
        }
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      className="space-y-5 rounded-md border border-border bg-background p-6"
    >
      {isLocked ? (
        <div
          role="status"
          className="rounded-sm border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[13px] text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"
        >
          {lockedReason}
        </div>
      ) : null}

      {serverError ? (
        <div
          role="alert"
          className="rounded-sm border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        >
          {serverError}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="ticket-title" className="block text-[13px] font-medium text-foreground">
          Title
        </label>
        <Input
          id="ticket-title"
          placeholder="Brief summary of the issue or request"
          disabled={isLocked || isSubmitting}
          aria-invalid={Boolean(errors.title)}
          {...register('title')}
        />
        {errors.title ? (
          <p className="text-[12px] text-red-600 dark:text-red-400">{errors.title.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="ticket-category" className="block text-[13px] font-medium text-foreground">
            Category
          </label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isLocked || isSubmitting}
              >
                <SelectTrigger id="ticket-category" aria-invalid={Boolean(errors.category)}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                  {!TICKET_CATEGORIES.includes(field.value as (typeof TICKET_CATEGORIES)[number]) &&
                  field.value ? (
                    <SelectItem value={field.value}>{field.value}</SelectItem>
                  ) : null}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category ? (
            <p className="text-[12px] text-red-600 dark:text-red-400">{errors.category.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="ticket-priority" className="block text-[13px] font-medium text-foreground">
            Priority
          </label>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={mode === 'edit' || isSubmitting}
              >
                <SelectTrigger id="ticket-priority" aria-invalid={Boolean(errors.priority)}>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {mode === 'edit' ? (
            <p className="text-[11px] text-muted">
              Priority can only be adjusted by an admin after submission.
            </p>
          ) : null}
          {errors.priority ? (
            <p className="text-[12px] text-red-600 dark:text-red-400">{errors.priority.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="ticket-description" className="block text-[13px] font-medium text-foreground">
          Description
        </label>
        <Textarea
          id="ticket-description"
          rows={6}
          placeholder="Include steps to reproduce, expected behavior, or relevant account context…"
          disabled={isLocked || isSubmitting}
          aria-invalid={Boolean(errors.description)}
          {...register('description')}
        />
        {errors.description ? (
          <p className="text-[12px] text-red-600 dark:text-red-400">
            {errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div>
          {mode === 'edit' && onRequestDelete ? (
            isLocked ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="inline-block">
                    <Button variant="secondary" type="button" disabled>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Delete ticket
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{lockedReason}</TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="ghost"
                type="button"
                onClick={onRequestDelete}
                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete ticket
              </Button>
            )
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          {isLocked ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="inline-block">
                  <Button type="button" disabled>
                    Save changes
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>{lockedReason}</TooltipContent>
            </Tooltip>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  {mode === 'create' ? 'Creating…' : 'Saving…'}
                </>
              ) : mode === 'create' ? (
                'Submit ticket'
              ) : (
                'Save changes'
              )}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

