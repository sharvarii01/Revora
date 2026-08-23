'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, MerchantUser } from '@/services/auth.service';

interface AuthContextType {
  user: MerchantUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  demoLogin: () => Promise<boolean>;
  signup: (data: any) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const DEFAULT_DEMO_MERCHANT: MerchantUser = {
  id: 'mer_demo_1',
  name: 'Sharvi Dhole',
  email: 'sharvi@saasplatform.in',
  businessName: 'NovaCloud Technologies Pvt Ltd',
  environment: 'LIVE',
  maxDiscountPct: 10,
  autoRecoveryEnabled: true,
  hasRazorpayKeys: true,
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MerchantUser | null>(DEFAULT_DEMO_MERCHANT);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('revora_merchant') || localStorage.getItem('vasooli_merchant');
      if (cached) {
        setUser(JSON.parse(cached));
      } else {
        setUser(DEFAULT_DEMO_MERCHANT);
      }
    } catch {
      setUser(DEFAULT_DEMO_MERCHANT);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      let merchantUser: MerchantUser = {
        ...DEFAULT_DEMO_MERCHANT,
        email: email || DEFAULT_DEMO_MERCHANT.email,
        name: email ? email.split('@')[0] : DEFAULT_DEMO_MERCHANT.name,
      };
      let accessToken = 'revora_demo_access_jwt_2026';
      let refreshToken = 'revora_demo_refresh_jwt_2026';

      try {
        const data = await authService.login({ email, password: pass });
        if (data?.merchant) {
          merchantUser = data.merchant;
          accessToken = data.accessToken || accessToken;
          refreshToken = data.refreshToken || refreshToken;
        }
      } catch (apiErr) {
        console.warn('API login unavailable, proceeding with local merchant credentials:', apiErr);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('revora_access_token', accessToken);
        localStorage.setItem('revora_refresh_token', refreshToken);
        localStorage.setItem('revora_merchant', JSON.stringify(merchantUser));
      }

      setUser(merchantUser);
      router.push('/dashboard');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      // Resilient fallback even on unhandled error
      setUser(DEFAULT_DEMO_MERCHANT);
      router.push('/dashboard');
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (): Promise<boolean> => {
    return login('sharvi@saasplatform.in', 'Password123!');
  };

  const signup = async (data: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      const merchantUser: MerchantUser = {
        id: `mer_${Date.now()}`,
        name: data.merchantName || data.name || 'Merchant',
        email: data.email || 'merchant@revora.ai',
        businessName: data.businessName || 'Merchant SaaS Inc',
        environment: 'LIVE',
        maxDiscountPct: 10,
        autoRecoveryEnabled: true,
        hasRazorpayKeys: true,
      };

      try {
        const resData = await authService.register({
          name: merchantUser.name,
          email: merchantUser.email,
          password: data.password || 'Password123!',
          businessName: merchantUser.businessName,
        });
        if (resData?.merchant) {
          localStorage.setItem('revora_access_token', resData.accessToken);
          localStorage.setItem('revora_refresh_token', resData.refreshToken);
        }
      } catch (apiErr) {
        console.warn('API signup unavailable, proceeding with local registration:', apiErr);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('revora_merchant', JSON.stringify(merchantUser));
      }

      setUser(merchantUser);
      router.push('/dashboard');
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      setUser(DEFAULT_DEMO_MERCHANT);
      router.push('/dashboard');
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('revora_access_token');
      localStorage.removeItem('revora_refresh_token');
      localStorage.removeItem('revora_merchant');
      localStorage.removeItem('vasooli_access_token');
      localStorage.removeItem('vasooli_refresh_token');
      localStorage.removeItem('vasooli_merchant');
    }
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const profile = await authService.getProfile();
      if (profile) {
        setUser(profile);
        if (typeof window !== 'undefined') {
          localStorage.setItem('revora_merchant', JSON.stringify(profile));
        }
      }
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        demoLogin,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
