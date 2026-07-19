import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/utils';

interface LoginFormValues {
  email: string;
  password: string;
}

/**
 * Login Screen - ported 1:1 from Stitch export
 * (stitch_wardrobewise_ai_fashion_studio/login/code.html).
 * Radial-gradient background, glass login card, floating side visual on
 * desktop, and the exact same input/button treatment.
 */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div
      className="font-body-lg text-on-surface antialiased flex flex-col min-h-screen"
      style={{
        background:
          'radial-gradient(circle at top left, #f3f0ff, #ffffff), radial-gradient(circle at bottom right, #e0f2fe, #ffffff)',
      }}
    >
      {/* Hero Section / Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 flex-grow flex items-center justify-center px-container-padding-mobile md:px-container-padding-desktop py-stack-lg">
        <div className="w-full max-w-[480px]">
          {/* Brand Identity */}
          <div className="text-center mb-stack-lg">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary tracking-tight mb-stack-sm">
              WardrobeWise
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[320px] mx-auto">
              Your AI-powered high-fashion personal stylist and wardrobe manager.
            </p>
          </div>

          {/* Login Card */}
          <div className="glass-surface rounded-lg p-gutter md:p-stack-lg">
            <form className="space-y-stack-md" onSubmit={handleSubmit(onSubmit)}>
              {/* Email Input */}
              <div className="space-y-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant block ml-2" htmlFor="email">
                  Email Address
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                    mail
                  </span>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-outline-variant bg-white/50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                    {...register('email', { required: 'Email is required' })}
                  />
                </div>
                {errors.email && <p className="text-error text-body-sm ml-2">{errors.email.message}</p>}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-2">
                  <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="password">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="font-label-caps text-label-caps text-primary hover:underline transition-all"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 rounded-xl border border-outline-variant bg-white/50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                    {...register('password', { required: 'Password is required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {errors.password && <p className="text-error text-body-sm ml-2">{errors.password.message}</p>}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full lavender-gradient text-on-primary font-title-md text-title-md py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 button-glow mt-stack-md disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-stack-lg">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-outline-variant" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface-bright px-4 text-on-surface-variant font-label-caps text-label-caps">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={() => toast.info('Configure GOOGLE_CLIENT_ID to enable Google Sign-In')}
              className="w-full flex items-center justify-center gap-3 bg-white border border-outline-variant py-3 rounded-xl hover:bg-surface-container transition-colors duration-200 active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="font-body-lg text-body-lg font-semibold">Sign in with Google</span>
            </button>

            {/* Footer Links */}
            <div className="mt-stack-lg text-center">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-bold hover:underline transition-all">
                  Create Account
                </Link>
              </p>
            </div>
          </div>

          {/* Additional Links */}
          <div className="mt-stack-lg flex flex-wrap justify-center gap-stack-md px-4">
            <a className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors" href="#">
              Terms of Service
            </a>
            <a className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors" href="#">
              Help Center
            </a>
          </div>
        </div>
      </main>

      {/* Side Visual (Hidden on mobile) */}
      <div className="hidden lg:block fixed right-gutter top-1/2 -translate-y-1/2 w-[380px] h-[600px] z-0">
        <div className="glass-surface w-full h-full rounded-lg overflow-hidden flex flex-col p-stack-md rotate-3 translate-x-12 opacity-80 scale-95 blur-[1px]">
          <div
            className="w-full aspect-[3/4] rounded-lg mb-stack-md bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAMppVgGxujTc7RJCZI2v4vlfUuJrSvVUSKDgmqVIRhQm2re0fWVYOAujlEcRNyEWJ0Fx19l0w_j1OdT6z9q99HwQH0bRRX10u4vrlGd0dmITO3W4fbDg1-t4ZvI_vEV-SVKp9T0919TVdXERd-R55VCkztN9nV9Det6F-JViTVGKK0SBQKgV0bb_fTboA0bvU-zMENxu5fGlICBji-4M3lVJM5L3ixYIEscdE-euPj-QSbQSzG9niwP40EUcXsDVgQGtPPzLIyo7M')",
            }}
          />
          <div className="space-y-stack-sm px-2">
            <div className="h-4 w-3/4 bg-primary/20 rounded-full" />
            <div className="h-4 w-1/2 bg-on-surface-variant/10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
