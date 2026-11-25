'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CALM_EASE } from '@/components/ui/motion';
import { useAddComment, useTicketComments } from '@/hooks/useTicketDetail';
import { extractApiError } from '@/lib/errors';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { SimpleTooltip } from '@/components/ui/tooltip';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';

const commentSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(3000, 'Comment cannot exceed 3000 characters'),
});

type CommentFormValues = z.infer<typeof commentSchema>;

export function CommentsSection({ ticketId }: { ticketId: string }) {
  const commentsQuery = useTicketComments(ticketId);
  const addComment = useAddComment(ticketId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { message: '' },
  });

  const onSubmit = async (values: CommentFormValues) => {
    try {
      await addComment.mutateAsync(values.message);
      reset();
      toast.success('Comment added');
    } catch (error) {
      toast.error(extractApiError(error, 'Failed to post comment').message);
    }
  };

  const comments = commentsQuery.data ?? [];

  return (
    <section aria-labelledby="comments-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="comments-heading" className="text-[16px] font-semibold text-foreground">
          Comments
          {!commentsQuery.isLoading ? (
            <span className="ml-2 text-[13px] font-normal text-muted">({comments.length})</span>
          ) : null}
        </h2>
      </div>

      {/* Comments list */}
      {commentsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="rounded-md border border-border bg-background p-4 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      ) : commentsQuery.isError ? (
        <ErrorState
          title="Could not load comments"
          message={extractApiError(commentsQuery.error).message}
          onRetry={() => {
            void commentsQuery.refetch();
          }}
        />
      ) : comments.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No comments yet"
          description="Add a reply below to share updates or ask a question."
          className="py-8"
        />
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const authorName = comment.author?.name || 'Unknown';
            const authorRole = comment.author?.role || 'user';
            const isOptimistic = comment._id.startsWith('optimistic-');

            return (
              <motion.article
                key={comment._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: CALM_EASE }}
                className="rounded-md border border-border bg-background p-4 transition-colors duration-150"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[11px] font-semibold text-accent">
                      {getInitials(authorName)}
                    </span>
                    <span className="truncate text-[13px] font-medium text-foreground">
                      {authorName}
                    </span>
                    <Badge
                      tone={authorRole === 'admin' ? 'accent' : 'neutral'}
                      className="capitalize"
                    >
                      {authorRole}
                    </Badge>
                  </div>
                  <SimpleTooltip label={new Date(comment.createdAt).toLocaleString()}>
                    <time
                      dateTime={comment.createdAt}
                      className="shrink-0 cursor-default text-[12px] text-muted"
                    >
                      {isOptimistic ? 'Sending…' : formatRelativeTime(comment.createdAt)}
                    </time>
                  </SimpleTooltip>
                </div>
                <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground">
                  {comment.message}
                </p>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Add comment form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="rounded-md border border-border bg-surface p-4 space-y-3"
      >
        <label htmlFor="comment-message" className="block text-[13px] font-medium text-foreground">
          Add a comment
        </label>
        <Textarea
          id="comment-message"
          rows={3}
          placeholder="Write a reply…"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.message)}
          {...register('message')}
        />
        {errors.message ? (
          <p className="text-[12px] text-red-600 dark:text-red-400">{errors.message.message}</p>
        ) : null}
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Posting…
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                Post comment
              </>
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}

