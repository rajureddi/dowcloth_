import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Text as SvgText, G } from 'react-native-svg';

export default function Logo({ size = 100, color = '#2563EB', showText = true }) {
  const scale = size / 100;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform={`scale(${scale})`}>
          {/* Outline D */}
          <Path
            d="M30 20 H55 C75 20 85 35 85 50 C85 65 75 80 55 80 H30 V20"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            opacity="0.5"
            transform="translate(-3, -3)"
          />
          {/* Solid D */}
          <Path
            d="M30 20 H55 C75 20 85 35 85 50 C85 65 75 80 55 80 H30 V20 M45 35 V65 H55 C65 65 70 60 70 50 C70 40 65 35 55 35 H45"
            fill={color}
          />
        </G>
      </Svg>
      {showText && (
        <View style={{ marginTop: 10 }}>
          <SvgText
            fill="#334155"
            fontSize="18"
            fontWeight="bold"
            fontFamily="System"
            textAnchor="middle"
            x="50"
            y="120"
          >
            DowCloth
          </SvgText>
        </View>
      )}
    </View>
  );
}
