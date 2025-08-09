import React from 'react';
import Svg, { Circle, Path, Ellipse, Polygon } from 'react-native-svg';

// Rose - Red/Pink
export const Rose = ({ size = 30 }) => (
  <Svg width={size} height={size} viewBox="0 0 30 30">
    {/* Petals */}
    <Circle cx="15" cy="12" r="4" fill="#FF1744" opacity="0.8" />
    <Circle cx="11" cy="15" r="4" fill="#FF4569" opacity="0.8" />
    <Circle cx="19" cy="15" r="4" fill="#FF4569" opacity="0.8" />
    <Circle cx="15" cy="18" r="4" fill="#FF6B8A" opacity="0.8" />
    <Circle cx="13" cy="13" r="3" fill="#FF8FA3" opacity="0.8" />
    <Circle cx="17" cy="13" r="3" fill="#FF8FA3" opacity="0.8" />
    {/* Center */}
    <Circle cx="15" cy="15" r="2" fill="#8B0000" />
    {/* Stem */}
    <Path d="M15 21 L15 28" stroke="#4CAF50" strokeWidth="2" fill="none" />
  </Svg>
);

// Sunflower - Yellow/Orange
export const Sunflower = ({ size = 30 }) => (
  <Svg width={size} height={size} viewBox="0 0 30 30">
    {/* Outer petals */}
    <Ellipse cx="15" cy="8" rx="2" ry="6" fill="#FFC107" />
    <Ellipse cx="22" cy="15" rx="6" ry="2" fill="#FFC107" />
    <Ellipse cx="15" cy="22" rx="2" ry="6" fill="#FFC107" />
    <Ellipse cx="8" cy="15" rx="6" ry="2" fill="#FFC107" />
    {/* Diagonal petals */}
    <Ellipse cx="11" cy="11" rx="4" ry="2" fill="#FFD54F" transform="rotate(-45 11 11)" />
    <Ellipse cx="19" cy="11" rx="4" ry="2" fill="#FFD54F" transform="rotate(45 19 11)" />
    <Ellipse cx="19" cy="19" rx="4" ry="2" fill="#FFD54F" transform="rotate(-45 19 19)" />
    <Ellipse cx="11" cy="19" rx="4" ry="2" fill="#FFD54F" transform="rotate(45 11 19)" />
    {/* Center */}
    <Circle cx="15" cy="15" r="4" fill="#3E2723" />
    <Circle cx="15" cy="15" r="3" fill="#5D4037" />
    {/* Stem */}
    <Path d="M15 19 L15 28" stroke="#4CAF50" strokeWidth="2" fill="none" />
  </Svg>
);

// Tulip - Purple/Magenta
export const Tulip = ({ size = 30 }) => (
  <Svg width={size} height={size} viewBox="0 0 30 30">
    {/* Petals */}
    <Path d="M15 8 C12 8, 9 12, 12 18 L18 18 C21 12, 18 8, 15 8 Z" fill="#9C27B0" />
    <Path d="M15 8 C18 8, 21 12, 18 18 L12 18 C9 12, 12 8, 15 8 Z" fill="#BA68C8" opacity="0.8" />
    <Path d="M15 6 C13 6, 11 10, 13 16 L17 16 C19 10, 17 6, 15 6 Z" fill="#E1BEE7" opacity="0.6" />
    {/* Stem */}
    <Path d="M15 18 L15 28" stroke="#4CAF50" strokeWidth="2" fill="none" />
    {/* Leaves */}
    <Path d="M13 22 C8 20, 8 26, 13 24" fill="#66BB6A" opacity="0.7" />
  </Svg>
);

// Daisy - White/Yellow
export const Daisy = ({ size = 30 }) => (
  <Svg width={size} height={size} viewBox="0 0 30 30">
    {/* White petals */}
    <Ellipse cx="15" cy="7" rx="1.5" ry="5" fill="#FFFFFF" />
    <Ellipse cx="23" cy="15" rx="5" ry="1.5" fill="#FFFFFF" />
    <Ellipse cx="15" cy="23" rx="1.5" ry="5" fill="#FFFFFF" />
    <Ellipse cx="7" cy="15" rx="5" ry="1.5" fill="#FFFFFF" />
    <Ellipse cx="10" cy="10" rx="3.5" ry="1.2" fill="#F5F5F5" transform="rotate(-45 10 10)" />
    <Ellipse cx="20" cy="10" rx="3.5" ry="1.2" fill="#F5F5F5" transform="rotate(45 20 10)" />
    <Ellipse cx="20" cy="20" rx="3.5" ry="1.2" fill="#F5F5F5" transform="rotate(-45 20 20)" />
    <Ellipse cx="10" cy="20" rx="3.5" ry="1.2" fill="#F5F5F5" transform="rotate(45 10 20)" />
    {/* Yellow center */}
    <Circle cx="15" cy="15" r="3" fill="#FFEB3B" />
    <Circle cx="15" cy="15" r="2" fill="#FDD835" />
    {/* Stem */}
    <Path d="M15 18 L15 28" stroke="#4CAF50" strokeWidth="2" fill="none" />
  </Svg>
);

// Cherry Blossom - Pink/White
export const CherryBlossom = ({ size = 30 }) => (
  <Svg width={size} height={size} viewBox="0 0 30 30">
    {/* 5 rounded petals */}
    <Path d="M15 9 C13 7, 9 7, 9 11 C9 15, 13 13, 15 15" fill="#FCE4EC" />
    <Path d="M21 11 C23 9, 23 5, 19 5 C15 5, 17 9, 15 15" fill="#F8BBD9" />
    <Path d="M21 19 C23 21, 19 25, 15 21 C11 17, 15 19, 15 15" fill="#F48FB1" />
    <Path d="M9 19 C7 21, 7 25, 11 21 C15 17, 13 19, 15 15" fill="#FCE4EC" />
    <Path d="M15 9 C17 7, 21 11, 17 11 C13 11, 15 13, 15 15" fill="#F8BBD9" />
    {/* Center */}
    <Circle cx="15" cy="15" r="1.5" fill="#880E4F" />
    {/* Small stamens */}
    <Circle cx="13" cy="13" r="0.5" fill="#FF4081" />
    <Circle cx="17" cy="13" r="0.5" fill="#FF4081" />
    <Circle cx="15" cy="12" r="0.5" fill="#FF4081" />
    {/* Stem */}
    <Path d="M15 17 L15 28" stroke="#8BC34A" strokeWidth="1.5" fill="none" />
  </Svg>
);

// Flower type mapping for the game
export const flowerTypes = [
  { component: Rose, name: 'Rose', color: 'red' },
  { component: Sunflower, name: 'Sunflower', color: 'yellow' },
  { component: Tulip, name: 'Tulip', color: 'purple' },
  { component: Daisy, name: 'Daisy', color: 'white' },
  { component: CherryBlossom, name: 'Cherry Blossom', color: 'pink' }
];

// Helper function to get random flower
export const getRandomFlower = () => {
  const randomIndex = Math.floor(Math.random() * flowerTypes.length);
  return flowerTypes[randomIndex];
};