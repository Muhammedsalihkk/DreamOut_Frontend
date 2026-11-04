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
        preserveAspectRatio="xMidYMid slice"
        style={styles.svg}
      >
        {/* Subtle contour map line paths - Top Elevation */}
        <Path
          d="M -30 160 Q 80 120 200 170 T 430 140"
          stroke="rgba(255, 107, 0, 0.12)"
          strokeWidth="1.2"
          fill="none"
        />
        <Path
          d="M -30 190 Q 110 150 230 200 T 430 170"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
          fill="none"
        />
        <Path
          d="M -30 220 Q 90 180 210 230 T 430 200"
          stroke="rgba(255, 107, 0, 0.08)"
          strokeWidth="1"
          strokeDasharray="4,6"
          fill="none"
        />

        {/* Lower Contour Waves */}
        <Path
          d="M -50 670 Q 90 620 220 670 T 450 640"
          stroke="rgba(255, 107, 0, 0.08)"
          strokeWidth="1"
          fill="none"
        />
        <Path
          d="M -50 710 Q 70 660 200 710 T 450 680"
          stroke="rgba(255, 255, 255, 0.04)"
          strokeWidth="1"
          fill="none"
        />
        <Path
          d="M -50 750 Q 110 700 240 750 T 450 720"
          stroke="rgba(255, 107, 0, 0.06)"
          strokeWidth="0.8"
          fill="none"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  svg: {
    opacity: 0.9,
  },
});
