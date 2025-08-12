import React from 'react';
import Svg, { Circle, Path, Ellipse } from 'react-native-svg';

// Catfish SVG Component
export const Catfish = ({ size = 50 }) => (
  <Svg width={size} height={size} viewBox="0 0 30 30">
    {/* Main body */}
    <Ellipse cx="15" cy="15" rx="10" ry="6" fill="#4A5568" />
    <Ellipse cx="15" cy="15" rx="9" ry="5" fill="#718096" />
    
    {/* Tail fin */}
    <Path d="M5 15 L1 11 L1 19 Z" fill="#2D3748" />
    
    {/* Top fin */}
    <Path d="M15 9 L13 6 L17 6 Z" fill="#2D3748" />
    
    {/* Bottom fins */}
    <Path d="M10 18 L8 20 L11 19 Z" fill="#2D3748" />
    <Path d="M20 18 L19 19 L22 20 Z" fill="#2D3748" />
    
    {/* Whiskers */}
    <Path d="M24 13 Q28 11 30 12" stroke="#1A202C" strokeWidth="0.5" fill="none" />
    <Path d="M24 17 Q28 19 30 18" stroke="#1A202C" strokeWidth="0.5" fill="none" />
    <Path d="M24 15 Q28 15 30 15" stroke="#1A202C" strokeWidth="0.5" fill="none" />
    
    {/* Eye */}
    <Circle cx="21" cy="14" r="1.5" fill="#FFFFFF" />
    <Circle cx="21.5" cy="14" r="0.8" fill="#000000" />
    
    {/* Mouth */}
    <Path d="M24 16 Q22 17 20 16" stroke="#1A202C" strokeWidth="0.5" fill="none" />
  </Svg>
);