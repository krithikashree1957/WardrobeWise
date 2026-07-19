import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { api } from '../lib/axios';
import { getErrorMessage } from '../lib/utils';

interface FormValues {
  email: string;
}

/** Forgot Password - extends the Login screen's visual language (same glass card, gradient bg). */
export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    try {
      await api.post('/auth/forgot-password', values);
      setSent(true);
      toast.success('If that email exists, a reset link has been sent.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div
      className="font-body-lg text-on-surface antialiased flex flex-col min-h-screen items-center justify-center px-container-padding-mobile"
      style={{
        background:
          'radial-gradient(circle at top left, #f3f0ff, #ffffff), radial-gradient(circle at bottom right, #e0f2fe, #ffffff)',
      }}
    >
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-stack-lg">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight mb-stack-sm">
            Reset Password
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="glass-surface rounded-lg p-gutter">
          {sent ? (
            <div className="text-center py-stack-md">
              <span className="material-symbols-outlined text-primary text-4xl mb-2">mark_email_read</span>
              <p className="text-body-lg">Check your inbox for a reset link.</p>
            </div>
          ) : (
            <form className="space-y-stack-md" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant block ml-2">Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full px-4 py-4 rounded-xl border border-outline-variant bg-white/50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <p className="text-error text-body-sm ml-2">{errors.email.message}</p>}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full lavender-gradient text-on-primary font-title-md text-title-md py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 button-glow"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-stack-md font-body-sm text-on-surface-variant">
          Remembered it?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
