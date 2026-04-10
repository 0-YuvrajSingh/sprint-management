import { AlertCircle, BarChart3, Eye, EyeOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Logo } from '../components/Logo';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isInitializing } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated
    if (!isInitializing && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isInitializing, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo');
    setError('');
    try {
      setLoading(true);
      await login(demoEmail, 'demo');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Visual */}
      <div className="hidden lg:flex lg:flex-1 bg-primary items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-white/20">
            <BarChart3 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-4xl font-bold mb-6">Welcome back</h2>
          <p className="text-xl text-primary-foreground/80 mb-12 leading-relaxed">
            Continue building amazing products with your team on AgileTrack.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <p className="text-sm text-primary-foreground/70 mb-4">Quick demo access:</p>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-primary-foreground/80">Admin:</span>
                <code className="text-primary-foreground bg-white/10 px-2 py-0.5 rounded text-xs">sarah@agiletrack.com</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary-foreground/80">Manager:</span>
                <code className="text-primary-foreground bg-white/10 px-2 py-0.5 rounded text-xs">marcus@agiletrack.com</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary-foreground/80">Developer:</span>
                <code className="text-primary-foreground bg-white/10 px-2 py-0.5 rounded text-xs">emily@agiletrack.com</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex mb-8">
              <Logo className="scale-110" />
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-2">Sign in to your account</h1>
            <p className="text-muted-foreground">Welcome back! Please enter your details.</p>
          </div>

          <div className="bg-card rounded-lg border p-8 shadow-sm">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full mt-4"
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign up
              </Link>
            </div>
          </div>

          {/* Demo accounts - visible on mobile */}
          <div className="mt-6 lg:hidden bg-primary/5 rounded-lg p-4 border border-primary/10">
            <p className="text-sm font-medium text-foreground mb-3">Try demo accounts:</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleDemoLogin('sarah@agiletrack.com')}
                disabled={loading}
              >
                Admin Demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleDemoLogin('marcus@agiletrack.com')}
                disabled={loading}
              >
                Manager Demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleDemoLogin('emily@agiletrack.com')}
                disabled={loading}
              >
                Developer Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
