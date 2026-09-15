import React from 'react';
import { LoginScreen } from '@/components/login/LoginScreen';
import { useRouter } from 'expo-router';

export default function IndexPage() {
  const router = useRouter();

  const handleGoToHome = () => {
    // Navigate directly to the (tabs) Home page
    router.replace('/(tabs)' as any);
  };

  return (
    <LoginScreen
      onLoginSuccess={handleGoToHome}
      onNavigateToSignUp={() => {
        router.push('/signup');
      }}
      onForgotPassword={() => {
        router.push('/forgot-password');
      }}
    />
  );
}
