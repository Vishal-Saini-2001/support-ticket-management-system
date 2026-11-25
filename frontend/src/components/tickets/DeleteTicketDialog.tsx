'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeleteTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
}

export function DeleteTicketDialog({
  open,
  onOpenChange,
  ticketTitle,
  isDeleting,
  onConfirm,
}: DeleteTicketDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete ticket</DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete{' '}
            <span className="font-medium text-foreground">&ldquo;{ticketTitle}&rdquo;</span>? This
            will also remove all comments on this ticket and cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Deleting…
              </>
            ) : (
              'Delete ticket'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

