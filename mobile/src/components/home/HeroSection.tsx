import React from 'react';
import { StyleSheet, View, Text, ImageBackground, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

export const HeroSection: React.FC = () => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.92}
      onPress={() => router.push('/explore')}
    >
      <ImageBackground
        source={require('@/assets/images/login-background.jpg')}
        style={styles.imageBackground}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(10, 11, 15, 0.35)', 'rgba(10, 11, 15, 0.88)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.contentContainer}>
          <Text style={styles.headline}>
            Life is Better{'\n'}in the <Text style={styles.accentText}>Outdoors</Text>
          </Text>
          <Text style={styles.subheadline}>
            Discover new places, create your own routes, and share your stories.
          </Text>

          {/* CTA Button */}
          <View style={styles.ctaButton}>
            <Text style={styles.ctaText}>Explore Now</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
    marginVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  imageBackground: {
    height: 160,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: 20,
  },
  contentContainer: {
    padding: 16,
  },
  headline: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  accentText: {
    color: '#FF6B00',
  },
  subheadline: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 6,
    fontWeight: '400',
    lineHeight: 16,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF6B00',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    marginTop: 12,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
