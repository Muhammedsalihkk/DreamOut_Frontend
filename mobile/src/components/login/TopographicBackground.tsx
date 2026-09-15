import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export const TopographicBackground: React.FC = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg
        height="100%"
        width="100%"
        viewBox="0 0 400 800"
        style={styles.svg}
      >
        {/* Subtle contour map line paths */}
        <Path
          d="M -50 650 Q 100 580 250 640 T 450 610"
          stroke="rgba(255, 107, 0, 0.15)"
          strokeWidth="1.5"
          fill="none"
        />
        <Path
          d="M -50 680 Q 80 610 230 670 T 450 640"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1.2"
          fill="none"
        />
        <Path
          d="M -50 710 Q 120 640 270 700 T 450 670"
          stroke="rgba(255, 107, 0, 0.12)"
          strokeWidth="1"
          fill="none"
        />
        <Path
          d="M -50 740 Q 60 670 210 730 T 450 700"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth="1"
          fill="none"
        />
        <Path
          d="M -50 770 Q 140 700 290 760 T 450 730"
          stroke="rgba(255, 107, 0, 0.08)"
          strokeWidth="0.8"
          fill="none"
        />
        {/* Subtle mountain top elevation accent */}
        <Path
          d="M 280 500 C 310 470 340 480 370 450"
          stroke="rgba(255, 107, 0, 0.18)"
          strokeWidth="1"
          strokeDasharray="4,4"
          fill="none"
        />
        <Path
          d="M 260 520 C 300 490 330 500 380 470"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
          fill="none"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  svg: {
    opacity: 0.85,
  },
});
