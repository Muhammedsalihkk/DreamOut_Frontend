import React, { useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
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
      <StatusBar style="light" />

      {/* Cinematic Adventure Wallpaper */}
      <ImageBackground
        source={require('@/assets/images/login-background.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        {/* Layered Gradient: Preserves Mountain Visibility while Maximizing Text Legibility */}
        <LinearGradient
          colors={[
            'rgba(8, 10, 15, 0.50)',
            'rgba(8, 10, 15, 0.18)',
            'rgba(8, 10, 15, 0.68)',
            'rgba(6, 7, 11, 0.96)',
          ]}
          locations={[0, 0.28, 0.62, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Ambient Topographic Contours */}
        <TopographicBackground />

        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {/* TOP BRANDING & HEADLINE */}
              <View style={styles.headerWrapper}>
                <View style={styles.headerSection}>
                  {/* Brand Row with Pill & Badge */}
                  <View style={styles.logoRow}>
                    <View style={styles.brandPill}>
                      <Ionicons name="compass" size={18} color="#FF6B00" style={styles.brandIcon} />
                      <Text style={styles.logoText}>
                        Dream<Text style={styles.logoAccent}>Out</Text>
                      </Text>
                    </View>
                    <View style={styles.badge}>
                      <View style={styles.badgeDot} />
                      <Text style={styles.badgeText}>EXPLORE BEYOND</Text>
                    </View>
                  </View>

                  {/* Hero Title */}
                  <Text style={styles.titleText}>
                    Discover Your Next{'\n'}
                    <Text style={styles.titleAccent}>Adventure</Text>
                  </Text>

                  {/* Subtitle */}
                  <Text style={styles.subtitle}>
                    Curated routes, live waypoints & memorable journeys.
                  </Text>

                  {/* Subtle Accent Glow Indicator */}
                  <View style={styles.accentLineContainer}>
                    <View style={styles.accentLine} />
                    <View style={styles.accentDot} />
                  </View>
                </View>
              </View>

              {/* TRANSLUCENT GLASS LOGIN CARD */}
              <View style={styles.cardWrapper}>
                <View style={styles.loginCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Welcome Back</Text>
                    <Text style={styles.cardSubtitle}>
                      Sign in to continue your journey
                    </Text>
                  </View>

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
                      <Ionicons name="alert-circle" size={17} color="#EF4444" style={styles.serverErrorIcon} />
                      <Text style={styles.serverErrorText}>{serverError}</Text>
                    </View>
                  ) : null}

                  {/* Forgot Password */}
                  <TouchableOpacity
                    style={styles.forgotPasswordContainer}
                    onPress={handleForgotPasswordPress}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  {/* Sign In CTA with Vibrant Sunset Orange Gradient */}
                  <TouchableOpacity
                    style={[styles.signInButton, isLoading && { opacity: 0.7 }]}
                    onPress={handleSignIn}
                    activeOpacity={0.88}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={['#FF7A1A', '#FF5500']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.signInGradient}
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
                    </LinearGradient>
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
                    <TouchableOpacity
                      onPress={handleSignUpPress}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.signUpLinkText}>Sign Up</Text>
                    </TouchableOpacity>
                  </View>
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
    backgroundColor: '#08090D',
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 8 : 10,
    paddingBottom: 20,
  },

  /* HEADER BRANDING */
  headerWrapper: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  headerSection: {
    marginTop: 6,
    marginBottom: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  brandIcon: {
    marginRight: 6,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  logoAccent: {
    color: '#FF6B00',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 0, 0.14)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.32)',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B00',
    marginRight: 6,
  },
  badgeText: {
    color: '#FF8822',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  titleText: {
    fontSize: 29,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  titleAccent: {
    color: '#FF7A1A',
  },
  subtitle: {
    fontSize: 13.5,
    color: '#A0A6B5',
    marginTop: 6,
    fontWeight: '400',
    lineHeight: 18,
  },
  accentLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 4,
  },
  accentLine: {
    width: 28,
    height: 3,
    backgroundColor: '#FF6B00',
    borderRadius: 2,
  },
  accentDot: {
    width: 5,
    height: 3,
    backgroundColor: 'rgba(255, 107, 0, 0.5)',
    borderRadius: 1.5,
  },

  /* LOGIN CARD */
  cardWrapper: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  loginCard: {
    backgroundColor: 'rgba(15, 18, 26, 0.86)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.11)',
    borderTopColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 20,
    paddingVertical: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 10,
    marginVertical: 4,
  },
  cardHeader: {
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: '#94A3B8',
    marginTop: 3,
  },

  /* FORGOT PASSWORD */
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 14,
    paddingVertical: 2,
  },
  forgotPasswordText: {
    color: '#FF7A1A',
    fontSize: 12.5,
    fontWeight: '600',
  },

  /* SERVER ERROR BANNER */
  serverErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 6,
  },
  serverErrorIcon: {
    marginRight: 8,
  },
  serverErrorText: {
    color: '#F87171',
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },

  /* SIGN IN BUTTON */
  signInButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 10,
    elevation: 6,
  },
  signInGradient: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonIcon: {
    marginLeft: 7,
  },

  /* DIVIDER */
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  dividerText: {
    color: '#8A92A6',
    fontSize: 11.5,
    marginHorizontal: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  /* SOCIAL ROW */
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  /* SIGN UP FOOTER */
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  signUpText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  signUpLinkText: {
    color: '#FF7A1A',
    fontSize: 13,
    fontWeight: '700',
  },
});
