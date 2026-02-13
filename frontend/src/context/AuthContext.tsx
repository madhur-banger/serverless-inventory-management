import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
  } from 'react';
  import {
    signIn,
    signUp,
    signOut,
    confirmSignUp,
    getCurrentUser,
    fetchAuthSession,
    resendSignUpCode,
  } from 'aws-amplify/auth';
  import type { User } from '@/types';
  
  interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<{ isConfirmed: boolean }>;
    confirmSignup: (email: string, code: string) => Promise<void>;
    resendCode: (email: string) => Promise<void>;
    logout: () => Promise<void>;
    getAccessToken: () => Promise<string | null>;
  }
  
  const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
  export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  
    const checkAuth = useCallback(async () => {
      try {
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();
  
        const email =
          (session.tokens?.idToken?.payload?.email as string) || '';
  
        setUser({
          id: currentUser.userId,
          email: email,
        });
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }, []);
  
    useEffect(() => {
      checkAuth();
    }, [checkAuth]);
  
    const login = async (email: string, password: string) => {
      const result = await signIn({
        username: email,
        password,
      });
  
      if (result.isSignedIn) {
        await checkAuth();
      } else if (result.nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        throw new Error('CONFIRM_SIGN_UP');
      }
    };
  
    const signup = async (email: string, password: string) => {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });
  
      return {
        isConfirmed: result.isSignUpComplete,
      };
    };
  
    const confirmSignup = async (email: string, code: string) => {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
    };
  
    const resendCode = async (email: string) => {
      await resendSignUpCode({
        username: email,
      });
    };
  
    const logout = async () => {
      await signOut();
      setUser(null);
    };
  
    const getAccessToken = async (): Promise<string | null> => {
      try {
        const session = await fetchAuthSession();
        return session.tokens?.idToken?.toString() || null;
      } catch {
        return null;
      }
    };
  
    return (
      <AuthContext.Provider
        value={{
          user,
          isLoading,
          isAuthenticated: !!user,
          login,
          signup,
          confirmSignup,
          resendCode,
          logout,
          getAccessToken,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
  
  export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  }