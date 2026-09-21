import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LoginInput } from './LoginInput';
import { SocialLoginButton, SocialProvider } from './SocialLoginButton';
import { TopographicBackground } from './TopographicBackground';
import { useAuthStore } from '@/store/useAuthStore';

interface LoginScreenProps {
  onLoginSuccess?: (email: string) => void;
  onNavigateToSignUp?: () => void;
  onForgotPassword?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToSignUp,
  onForgotPassword,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');

  const { login, isLoading } = useAuthStore();

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) setEmailError('');
    if (serverError) setServerError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
    if (serverError) setServerError('');
  };

  const handleSignIn = async () => {
    setEmailError('');
    setPasswordError('');
    setServerError('');

    let isValid = true;
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setEmailError('Email address is required.');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        setEmailError('Please enter a valid email address.');
        isValid = false;
      }
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    }

    if (!isValid) return;

    const success = await login({ email: cleanEmail, password });
    if (success) {
      if (onLoginSuccess) {
        onLoginSuccess(cleanEmail);
      }
    } else {
      const errorMsg = useAuthStore.getState().error;
      setServerError(errorMsg || 'Invalid email or password.');
    }
  };



  const handleSocialLogin = (provider: SocialProvider) => {
    if (onLoginSuccess) {
      onLoginSuccess(provider);
    }
  };

  const handleForgotPasswordPress = () => {
    if (onForgotPassword) {
      onForgotPassword();
    }
  };

  const handleSignUpPress = () => {
    if (onNavigateToSignUp) {
      onNavigateToSignUp();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Full Screen Background Mountain Image */}
      <ImageBackground
        source={require('@/assets/images/login-background.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        {/* Layered Gradient Overlays for Contrast (pointerEvents="none") */}
        <LinearGradient
          colors={[
            'rgba(10, 11, 15, 0.65)',
            'rgba(10, 11, 15, 0.35)',
            'rgba(10, 11, 15, 0.80)',
            'rgba(8, 9, 12, 0.96)',
          ]}
          locations={[0, 0.35, 0.68, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Subtle Map Topographic Contour Decoration */}
        <TopographicBackground />

        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {/* TOP BRANDING & HEADLINE SECTION */}
              <View style={styles.headerSection}>
                {/* Logo & Tagline */}
                <View style={styles.logoRow}>
                  <Text style={styles.logoText}>
                    Dream<Text style={styles.logoAccent}>Out</Text>
                  </Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>EXPLORE BEYOND</Text>
                  </View>
                </View>

                {/* Streamlined Hero Title */}
                <Text style={styles.titleText}>
                  Discover <Text style={styles.titleAccent}>Amazing</Text> Places
                </Text>

                {/* Subtitle */}
                <Text style={styles.subtitle}>
                  Plan. Explore. Make every journey count.
                </Text>

                {/* Accent Line */}
                <View style={styles.accentLine} />
              </View>

              {/* TRANSLUCENT GLASS LOGIN CARD */}
              <View style={styles.loginCard}>
                <Text style={styles.cardTitle}>Welcome Back</Text>
                <Text style={styles.cardSubtitle}>
                  Sign in to continue your journey
                </Text>

                {/* Inputs */}
                <LoginInput
                  placeholder="Email address"
                  iconName="mail-outline"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={emailError}
                />

                <LoginInput
                  placeholder="Password"
                  iconName="lock-closed-outline"
                  isPassword
                  value={password}
                  onChangeText={handlePasswordChange}
                  error={passwordError}
                />

                {/* Server Error Banner */}
                {serverError ? (
                  <View style={styles.serverErrorBanner}>
                    <Ionicons name="alert-circle" size={16} color="#EF4444" style={styles.serverErrorIcon} />
                    <Text style={styles.serverErrorText}>{serverError}</Text>
                  </View>
                ) : null}

                {/* Forgot Password */}
                <TouchableOpacity
                  style={styles.forgotPasswordContainer}
                  onPress={handleForgotPasswordPress}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>


                {/* Sign In Button */}
                <TouchableOpacity
                  style={[styles.signInButton, isLoading && { opacity: 0.7 }]}
                  onPress={handleSignIn}
                  activeOpacity={0.85}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.signInButtonText}>Sign In</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={18}
                        color="#FFFFFF"
                        style={styles.buttonIcon}
                      />
                    </>
                  )}
                </TouchableOpacity>


                {/* Social Login Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Buttons */}
                <View style={styles.socialRow}>
                  <SocialLoginButton
                    provider="google"
                    onPress={() => handleSocialLogin('google')}
                  />
                  <SocialLoginButton
                    provider="apple"
                    onPress={() => handleSocialLogin('apple')}
                  />
                  <SocialLoginButton
                    provider="facebook"
                    onPress={() => handleSocialLogin('facebook')}
                  />
                </View>

                {/* Sign Up Link */}
                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>
                    Don't have an account?{' '}
                  </Text>
                  <TouchableOpacity onPress={handleSignUpPress} activeOpacity={0.7}>
                    <Text style={styles.signUpLinkText}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B0E',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 6 : 6,
    paddingBottom: 16,
  },

  /* HEADER BRANDING */
  headerSection: {
    marginTop: 4,
    marginBottom: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: '#FF6B00',
  },
  badge: {
    backgroundColor: 'rgba(255, 107, 0, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.35)',
  },
  badgeText: {
    color: '#FF6B00',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 34,
    letterSpacing: -0.6,
  },
  titleAccent: {
    color: '#FF6B00',
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '400',
  },
  accentLine: {
    width: 32,
    height: 3,
    backgroundColor: '#FF6B00',
    borderRadius: 2,
    marginTop: 8,
  },

  /* LOGIN CARD */
  loginCard: {
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 18,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
    marginVertical: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },

  /* FORGOT PASSWORD */
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 2,
    marginBottom: 12,
    paddingVertical: 2,
  },
  forgotPasswordText: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '600',
  },

  /* SERVER ERROR BANNER */
  serverErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 6,
  },
  serverErrorIcon: {
    marginRight: 8,
  },
  serverErrorText: {
    color: '#EF4444',
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },

  /* SIGN IN BUTTON */

  signInButton: {
    backgroundColor: '#FF6B00',
    height: 48,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonIcon: {
    marginLeft: 6,
  },

  /* DIVIDER */
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  dividerText: {
    color: '#8A8F9B',
    fontSize: 11,
    marginHorizontal: 10,
    fontWeight: '500',
  },

  /* SOCIAL ROW */
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  /* SIGN UP FOOTER */
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  signUpText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  signUpLinkText: {
    color: '#FF6B00',
    fontSize: 13,
    fontWeight: '700',
  },
});
