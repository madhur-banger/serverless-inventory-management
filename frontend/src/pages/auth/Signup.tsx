import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Package, Loader2, AlertCircle, CheckCircle, Mail } from 'lucide-react';

export default function Signup() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(
    searchParams.get('confirm') === 'true'
  );
  const [confirmationCode, setConfirmationCode] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);

  const { signup, confirmSignup, resendCode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('confirm') === 'true' && searchParams.get('email')) {
      setShowConfirmation(true);
      setEmail(searchParams.get('email') || '');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(email, password);
      if (!result.isConfirmed) {
        setShowConfirmation(true);
      } else {
        navigate('/login');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create account';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await confirmSignup(email, confirmationCode);
      navigate('/login', {
        state: { message: 'Account confirmed! Please sign in.' },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to confirm account';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setResendSuccess(false);
    try {
      await resendCode(email);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to resend code';
      setError(message);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-gray-600" />
            </div>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We've sent a confirmation code to{' '}
              <strong className="text-gray-900">{email}</strong>
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleConfirm}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-start gap-2 text-sm">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {resendSuccess && (
                <div className="bg-green-50 text-green-600 p-3 rounded-md flex items-start gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>Confirmation code sent successfully!</span>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="code">Confirmation Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  required
                  autoComplete="one-time-code"
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  'Confirm Account'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendCode}
                className="w-full"
              >
                Resend Code
              </Button>
              <p className="text-sm text-gray-600">
                <button
                  type="button"
                  onClick={() => setShowConfirmation(false)}
                  className="text-gray-900 font-medium hover:underline"
                >
                  Use a different email
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 mb-4"
          >
            <Package className="h-8 w-8" />
            <span className="text-xl font-semibold">Inventory</span>
          </Link>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Enter your details to get started</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-start gap-2 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <p className="text-xs text-gray-500">
                Must be at least 8 characters with uppercase, lowercase, and
                numbers
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-gray-900 font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}