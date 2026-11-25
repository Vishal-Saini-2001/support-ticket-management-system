'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LifeBuoy, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { CALM_EASE } from '@/components/ui/motion';
import { useAuth } from '@/hooks/useAuth';
import { extractApiError } from '@/lib/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const loggedInUser = await login(values);
      toast.success(`Welcome back, ${loggedInUser.name}`);
    } catch (error) {
      const parsed = extractApiError(error, 'Unable to sign in');
      setServerError(parsed.message);
      for (const [field, message] of Object.entries(parsed.fieldErrors)) {
        if (field === 'email' || field === 'password') {
          setError(field, { message });
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: CALM_EASE }}
      className="w-full max-w-[420px] rounded-md border border-border bg-background p-8 sm:p-9"
    >
      <div className="mb-7 space-y-3">
        <div className="inline-flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-accent text-white">
            <LifeBuoy className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            Helpdesk
          </span>
        </div>
        <div className="space-y-1.5">
          <h1 className="text-[20px] font-semibold text-foreground">Sign in to your workspace</h1>
          <p className="text-[13px] leading-relaxed text-muted">
            Enter your email and password to manage support tickets.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {serverError ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            role="alert"
            className="mb-5 rounded-sm border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
          >
            {serverError}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-[13px] font-medium text-foreground">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="h-10"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
          {errors.email ? (
            <p className="text-[12px] text-red-600 dark:text-red-400">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-[13px] font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="h-10 pr-10"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted transition-colors duration-150 hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password ? (
            <p className="text-[12px] text-red-600 dark:text-red-400">{errors.password.message}</p>
          ) : null}
        </div>

        <div className="pt-1">
          <Button type="submit" disabled={isSubmitting} className="h-10 w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </div>
      </form>

      <p className="mt-6 border-t border-border pt-5 text-center text-[13px] text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-accent hover:underline">
          Create one
        </Link>
      </p>
    </motion.div>
  );
}

