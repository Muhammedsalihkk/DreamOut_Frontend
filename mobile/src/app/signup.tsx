import React, { useState } from 'react';
import {
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
import { useRouter } from 'expo-router';
import { LoginInput } from '@/components/login/LoginInput';
import { SocialLoginButton, SocialProvider } from '@/components/login/SocialLoginButton';
import { TopographicBackground } from '@/components/login/TopographicBackground';

export default function SignUpScreen() {
  const router = useRouter();

  // Form Field States
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Frontend Validation Handler
  const handleCreateAccount = () => {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Please enter your Full Name.');
      return;
    }
    const cleanUsername = username.trim();
    if (!cleanUsername || cleanUsername.length < 3) {
      Alert.alert('Validation Error', 'Username must be at least 3 characters long.');
      return;
    }
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      Alert.alert('Validation Error', 'Please enter your Email address.');
      return;
    }
    if (!password || password.length < 8) {
      Alert.alert('Validation Error', 'Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)' as any);
    }, 400);
  };

  const handleSocialSignUp = (provider: SocialProvider) => {
    router.replace('/(tabs)' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ImageBackground
        source={require('@/assets/images/login-background.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            'rgba(10, 11, 15, 0.65)',
            'rgba(10, 11, 15, 0.35)',
            'rgba(10, 11, 15, 0.82)',
            'rgba(8, 9, 12, 0.98)',
          ]}
          locations={[0, 0.35, 0.68, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

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
              {/* HEADER */}
              <View style={styles.headerSection}>
                <View style={styles.logoRow}>
                  <Text style={styles.logoText}>
                    Dream<Text style={styles.logoAccent}>Out</Text>
                  </Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>EXPLORE BEYOND</Text>
                  </View>
                </View>

                <Text style={styles.titleText}>
                  Create Your <Text style={styles.titleAccent}>Account</Text>
                </Text>
                <Text style={styles.subtitle}>
                  Start your journey with DreamOut
                </Text>
                <View style={styles.accentLine} />
              </View>

              {/* SIGNUP CARD */}
              <View style={styles.signupCard}>
                <Text style={styles.cardTitle}>Create Your Account</Text>
                <Text style={styles.cardSubtitle}>
                  Join DreamOut and start exploring.
                </Text>

                <LoginInput
                  placeholder="Full Name"
                  iconName="person-outline"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />

                <LoginInput
                  placeholder="Username"
                  iconName="at-outline"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />

                <LoginInput
                  placeholder="Email"
                  iconName="mail-outline"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <LoginInput
                  placeholder="Password"
                  iconName="lock-closed-outline"
                  isPassword
                  value={password}
                  onChangeText={setPassword}
                />

                <LoginInput
                  placeholder="Confirm Password"
                  iconName="shield-checkmark-outline"
                  isPassword
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />

                <TouchableOpacity
                  style={styles.createAccountButton}
                  onPress={handleCreateAccount}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  <Text style={styles.createAccountButtonText}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                  {!loading && (
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color="#FFFFFF"
                      style={styles.buttonIcon}
                    />
                  )}
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialRow}>
                  <SocialLoginButton
                    provider="google"
                    onPress={() => handleSocialSignUp('google')}
                  />
                  <SocialLoginButton
                    provider="apple"
                    onPress={() => handleSocialSignUp('apple')}
                  />
                </View>

                <View style={styles.loginLinkContainer}>
                  <Text style={styles.loginLinkText}>
                    Already have an account?{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/login')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.signInLinkText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

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
  headerSection: {
    marginTop: 4,
    marginBottom: 6,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
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
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 32,
    letterSpacing: -0.6,
  },
  titleAccent: {
    color: '#FF6B00',
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '400',
  },
  accentLine: {
    width: 32,
    height: 3,
    backgroundColor: '#FF6B00',
    borderRadius: 2,
    marginTop: 6,
  },
  signupCard: {
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
    marginBottom: 10,
  },
  createAccountButton: {
    backgroundColor: '#FF6B00',
    height: 48,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  createAccountButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonIcon: {
    marginLeft: 6,
  },
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
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  loginLinkText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  signInLinkText: {
    color: '#FF6B00',
    fontSize: 13,
    fontWeight: '700',
  },
});
