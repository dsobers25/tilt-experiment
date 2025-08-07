import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  Animated,
  Platform,
  PanResponder,
  Alert,
} from 'react-native';
import { Rose, Sunflower, Tulip, Daisy, CherryBlossom, flowerTypes, getRandomFlower } from '@/components/ui/Flowers';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';

import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Catfish SVG Component
const Catfish = ({ size = 50 }) => (
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

export default function SlideGameScreen() {
  const [score, setScore] = useState(0);
  const [gameObjects, setGameObjects] = useState([]);
  const [isGameRunning, setIsGameRunning] = useState(true);
  const [currentPlayerX, setCurrentPlayerX] = useState(screenWidth / 2 - 25);
  const [catfishCount, setCatfishCount] = useState(0);
  
  const playerPosition = useRef(new Animated.Value(screenWidth / 2 - 25)).current;
  const gameLoop = useRef(null);
  const objectId = useRef(0);

  // Create pan responder for touch controls
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // Calculate new position based on touch location
        const newX = Math.max(0, Math.min(screenWidth - 50, evt.nativeEvent.pageX - 25));
        playerPosition.setValue(newX);
        setCurrentPlayerX(newX);
      },
    })
  ).current;

  // Game object creation - USING FLOWERS AND CATFISH
  const createGameObject = () => {
    const id = objectId.current++;
    const startX = Math.random() * (screenWidth - 30);
    const speed = 2 + Math.random() * 3;
    
    // 15% chance to spawn a catfish instead of a flower
    const isCatfish = Math.random() < 0.15;
    
    if (isCatfish) {
      return {
        id,
        x: startX,
        y: -30,
        speed,
        type: 'catfish',
        collected: false,
      };
    } else {
      const flowerType = getRandomFlower();
      return {
        id,
        x: startX,
        y: -30,
        speed,
        type: 'flower',
        flowerType,
        collected: false,
      };
    }
  };

  // Check for game over
  useEffect(() => {
    if (catfishCount >= 3 && isGameRunning) {
      setIsGameRunning(false);
      Alert.alert(
        'Game Over!',
        `You caught 3 catfish! Final Score: ${score}`,
        [
          { text: 'Play Again', onPress: resetGame }
        ]
      );
    }
  }, [catfishCount, score, isGameRunning]);

  // Game loop
  useEffect(() => {
    if (!isGameRunning) return;

    gameLoop.current = setInterval(() => {
      setGameObjects(prevObjects => {
        let newObjects = [...prevObjects];
        
        // Create new flowers with random probability
        if (Math.random() < 0.03) {
          newObjects.push(createGameObject());
        }

        // Update positions and check collisions
        newObjects = newObjects.map(obj => {
          const updatedObj = { ...obj, y: obj.y + obj.speed };
          
          // Player position from bottom
          const playerBottom = 100;
          const playerTop = screenHeight - playerBottom - 50;
          
          // Collision boundaries
          const flowerBottom = updatedObj.y + 30;
          const flowerTop = updatedObj.y;
          const flowerLeft = updatedObj.x;
          const flowerRight = updatedObj.x + 30;
          
          const playerLeft = currentPlayerX;
          const playerRight = currentPlayerX + 50;
          
          // Check collision with generous buffer
          if (!obj.collected &&
              flowerRight > playerLeft - 10 &&
              flowerLeft < playerRight + 10 &&
              flowerBottom > playerTop - 10 &&
              flowerTop < playerTop + 60) {
            updatedObj.collected = true;
            
            // Check if it's a catfish or flower
            if (obj.type === 'catfish') {
              setCatfishCount(prev => prev + 1);
            } else {
              setScore(prev => prev + 10);
            }
          }
          
          return updatedObj;
        });

        // Remove collected flowers and flowers that went off screen
        return newObjects.filter(obj => !obj.collected && obj.y < screenHeight + 50);
      });
    }, 16);

    return () => {
      if (gameLoop.current) {
        clearInterval(gameLoop.current);
      }
    };
  }, [isGameRunning, currentPlayerX]);

  const resetGame = () => {
    setScore(0);
    setGameObjects([]);
    setCatfishCount(0);
    setIsGameRunning(true);
    const initialX = screenWidth / 2 - 25;
    playerPosition.setValue(initialX);
    setCurrentPlayerX(initialX);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.gameArea} {...panResponder.panHandlers}>
        {/* Falling Flowers and Catfish */}
        {gameObjects.map(obj => {
          if (obj.type === 'catfish') {
            return (
              <View
                key={obj.id}
                style={[
                  styles.gameObject,
                  {
                    left: obj.x,
                    top: obj.y,
                  },
                ]}
              >
                <Catfish size={30} />
              </View>
            );
          } else {
            const FlowerComponent = obj.flowerType.component;
            return (
              <View
                key={obj.id}
                style={[
                  styles.gameObject,
                  {
                    left: obj.x,
                    top: obj.y,
                  },
                ]}
              >
                <FlowerComponent size={30} />
              </View>
            );
          }
        })}

        {/* Player square */}
        <Animated.View
          style={[
            styles.player,
            {
              transform: [
                { translateX: playerPosition },
              ],
            },
          ]}
        />
      </View>

      <ThemedView style={styles.uiContainer}>
        <ThemedText type="title" style={styles.score}>
          Score: {score}
        </ThemedText>
        <ThemedText style={styles.catfishWarning}>
          Catfish: {catfishCount}/3 ⚠️
        </ThemedText>
        <ThemedText style={styles.instructions}>
          Touch anywhere and drag to move the blue square!
        </ThemedText>
        <ThemedText style={styles.instructions}>
          Collect flowers (+10 pts) but avoid catfish!
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#001122',
  },
  player: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: '#00aaff',
    borderRadius: 8,
    shadowColor: '#00aaff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
    bottom: 100,
    left: 0,
  },
  gameObject: {
    position: 'absolute',
    width: 30,
    height: 30,
  },
  uiContainer: {
    position: 'absolute',
    top: Platform.select({ ios: 60, android: 40, default: 50 }),
    left: 20,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  score: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  catfishWarning: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
    color: '#FFFFFF',
    opacity: 0.9,
  },
});