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
import { TopographicBackground } from '@/components/login/TopographicBackground';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Check Your Inbox',
        `A password reset link has been sent to ${email}.`,
        [{ text: 'Back to Sign In', onPress: () => router.replace('/login') }]
      );
    }, 600);
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
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.logoRow}>
                  <Text style={styles.logoText}>
                    Dream<Text style={styles.logoAccent}>Out</Text>
                  </Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>RESET</Text>
                  </View>
                </View>

                <Text style={styles.titleText}>
                  Reset Your <Text style={styles.titleAccent}>Password</Text>
                </Text>
                <Text style={styles.subtitle}>
                  Enter your registered email to receive reset instructions.
                </Text>
                <View style={styles.accentLine} />
              </View>

              {/* FORGOT PASSWORD CARD */}
              <View style={styles.loginCard}>
                <Text style={styles.cardTitle}>Forgot Password?</Text>
                <Text style={styles.cardSubtitle}>
                  No worries, we'll help you get back to exploring.
                </Text>

                <LoginInput
                  placeholder="Email Address"
                  iconName="mail-outline"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={handleResetPassword}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  <Text style={styles.signInButtonText}>
                    {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
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

                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>Remembered your password? </Text>
                  <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.7}>
                    <Text style={styles.signUpLinkText}>Sign In</Text>
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
    marginBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
  signInButton: {
    backgroundColor: '#FF6B00',
    height: 48,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
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
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
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
