import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Rose, Sunflower, Tulip, Daisy, CherryBlossom, getRandomFlower } from '@/components/ui/Flowers';
import { Catfish } from '@/components/ui/Fish';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';


import { resetArtistSelection } from './explore'; // Add this import


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const [backgroundObjects, setBackgroundObjects] = useState([]);
  const animationRef = useRef(null);
  const objectIdRef = useRef(0);


  // Create falling objects (flowers and catfish)
  useEffect(() => {
    const createObject = () => {
      const id = objectIdRef.current++;
      const startX = Math.random() * screenWidth;
      const speed = 1 + Math.random() * 2;
      
      // 20% chance for catfish, 80% chance for flowers
      const isCatfish = Math.random() < 0.2;
      
      if (isCatfish) {
        return {
          id,
          x: startX,
          y: -50,
          speed,
          type: 'catfish',
          rotation: Math.random() * 360,
        };
      } else {
        const flowerType = getRandomFlower();
        return {
          id,
          x: startX,
          y: -50,
          speed,
          type: 'flower',
          flowerType,
          rotation: Math.random() * 360,
        };
      }
    };

    // Animation loop
    animationRef.current = setInterval(() => {
      setBackgroundObjects(prev => {
        let objects = [...prev];
        
        // Add new object randomly
        if (Math.random() < 0.05) {
          objects.push(createObject());
        }
        
        // Update positions
        objects = objects.map(obj => ({
          ...obj,
          y: obj.y + obj.speed,
          rotation: obj.rotation + 1,
        }));
        
        // Remove objects that went off screen
        return objects.filter(obj => obj.y < screenHeight + 50);
      });
    }, 16);

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  const startGame = () => {
    resetArtistSelection(); // Reset any previous artist selection
    router.push('/(tabs)/explore');
  };

  return (
    <ThemedView style={styles.container}>
      {/* Falling objects background */}
      <View style={styles.backgroundContainer}>
        {backgroundObjects.map(obj => {
          if (obj.type === 'catfish') {
            return (
              <View
                key={obj.id}
                style={[
                  styles.backgroundObject,
                  {
                    left: obj.x,
                    top: obj.y,
                    transform: [{ rotate: `${obj.rotation}deg` }],
                  },
                ]}
              >
                <Catfish size={80} />
              </View>
            );
          } else {
            const FlowerComponent = obj.flowerType.component;
            return (
              <View
                key={obj.id}
                style={[
                  styles.backgroundObject,
                  {
                    left: obj.x,
                    top: obj.y,
                    transform: [{ rotate: `${obj.rotation}deg` }],
                  },
                ]}
              >
                <FlowerComponent size={80} />
              </View>
            );
          }
        })}
      </View>

      {/* Blur overlay */}
      <BlurView intensity={20} style={styles.blurOverlay} tint="dark" />

      {/* Main content */}
      <View style={styles.contentContainer}>
        <View style={styles.titleSection}>
          <ThemedText style={styles.gameTitle}>Flower Giver</ThemedText>
          <ThemedText style={styles.subtitle}>Give flowers to your inspiration</ThemedText>
        </View>

        <View style={styles.instructionsContainer}>
          <ThemedText style={styles.instructionTitle}>How to Play</ThemedText>
          
          <View style={styles.instructionItem}>
            <ThemedText style={styles.instructionEmoji}>🌸</ThemedText>
            <ThemedText style={styles.instructionText}>
              Collect flowers for artist that inspired you
            </ThemedText>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.instructionEmoji}>
              <Catfish size={36} />
            </View>
            <ThemedText style={styles.instructionText}>
              Avoid catfish - they give flowers to imposters!
            </ThemedText>
          </View>

          <View style={styles.instructionItem}>
            <ThemedText style={styles.instructionEmoji}>⏱️</ThemedText>
            <ThemedText style={styles.instructionText}>
              You have 30 seconds to collect flowers
            </ThemedText>
          </View>

          <View style={styles.instructionItem}>
            <ThemedText style={styles.instructionEmoji}>🏆</ThemedText>
            <ThemedText style={styles.instructionText}>
              Win by giving more flowers to the real artist
            </ThemedText>
          </View>

          <ThemedText style={styles.warningText}>
            Catch 3 catfish = Game Over!
          </ThemedText>
        </View>

        <TouchableOpacity style={styles.playButton} onPress={startGame}>
          <ThemedText style={styles.playButtonText}>Play Game</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001122',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundObject: {
    position: 'absolute',
    opacity: 0.5,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20, // Reduced from 30 to give more space
    paddingTop: Platform.select({ ios: 80, android: 60, default: 60 }), // Increased padding
    paddingBottom: 20, // Added bottom padding
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 10, // Added padding to title section
  },
  gameTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15, // Increased margin
    lineHeight: 56, // Added line height for better text spacing
    textShadowColor: 'rgba(0, 170, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15, // Reduced from 20 to prevent overflow
    includeFontPadding: false, // Prevents extra padding on Android
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 24, // Added line height
  },
  instructionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 40,
    width: '100%',
    maxWidth: 400,
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  instructionEmoji: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
    justifyContent: 'center', // Center the catfish icon
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
    opacity: 0.9,
  },
  warningText: {
    fontSize: 22,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
  playButton: {
    backgroundColor: '#00aaff',
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#00aaff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  playButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});