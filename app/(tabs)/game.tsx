import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  Animated,
  Platform,
  PanResponder,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Rose, Sunflower, Tulip, Daisy, CherryBlossom, flowerTypes, getRandomFlower } from '@/components/ui/Flowers';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

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
  const [gameObjects, setGameObjects] = useState([]);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPlayerX, setCurrentPlayerX] = useState(screenWidth / 2 - 60); // Adjusted for 120px box (half of 120)
  const [catfishCount, setCatfishCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [flowersCollected, setFlowersCollected] = useState(0);
  const [flowersToImposter, setFlowersToImposter] = useState(0);
  const [flowersToArtist, setFlowersToArtist] = useState(0);
  
  // Artist names - you can make this dynamic later
  const realArtist = "Kendrick Lamar";
  const fakeArtist = "Kendrick Kumar";
  
  const playerPosition = useRef(new Animated.Value(screenWidth / 2 - 60)).current; // Adjusted for 120px box
  const gameLoop = useRef(null);
  const timerRef = useRef(null);
  const objectId = useRef(0);

  // Initial game setup - start only when screen is focused
  useFocusEffect(
    useCallback(() => {
      // Reset and start the game when screen comes into focus
      setGameStarted(true);
      setIsGamePaused(false); // Make sure game is not paused
      setIsGameRunning(true);
      resetGame();
      
      // Cleanup when screen loses focus
      return () => {
        // Clear timers when leaving screen
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        if (gameLoop.current) {
          clearInterval(gameLoop.current);
          gameLoop.current = null;
        }
        // Stop game when leaving screen
        setIsGameRunning(false);
        setGameObjects([]); // Clear objects when leaving
      };
    }, [])
  );

  const continueGame = () => {
    setTimeLeft(30); // Add 30 more seconds
    setIsGameRunning(true);
    setIsGamePaused(false);
  };

  const startGame = () => {
    setGameStarted(true);
    setIsGameRunning(true);
    resetGame();
  };

  // Pause/Resume game
  const togglePause = () => {
    if (isGamePaused) {
      setIsGamePaused(false);
      setIsGameRunning(true);
    } else {
      setIsGamePaused(true);
      setIsGameRunning(false);
      Alert.alert(
        'Game Paused',
        'Take a break!',
        [
          { text: 'Resume', onPress: () => {
            setIsGamePaused(false);
            setIsGameRunning(true);
          }}
        ],
        { cancelable: false }
      );
    }
  };

  // Create pan responder for touch controls
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // Calculate new position based on touch location (adjusted for 120px width)
        const newX = Math.max(0, Math.min(screenWidth - 120, evt.nativeEvent.pageX - 60));
        playerPosition.setValue(newX);
        setCurrentPlayerX(newX);
      },
    })
  ).current;

  // Game object creation
  const createGameObject = () => {
    const id = objectId.current++;
    const isCatfish = Math.random() < 0.15;
    const objectSize = 50; // Both flowers and catfish are now 50
    const startX = Math.random() * (screenWidth - objectSize);
    const speed = 2 + Math.random() * 3;
    
    // 15% chance to spawn a catfish
    
    if (isCatfish) {
      return {
        id,
        x: startX,
        y: -objectSize,
        speed,
        type: 'catfish',
        size: objectSize,
        collected: false,
      };
    } else {
      const flowerType = getRandomFlower();
      return {
        id,
        x: startX,
        y: -objectSize,
        speed,
        type: 'flower',
        size: objectSize,
        flowerType,
        collected: false,
      };
    }
  };

  // Timer countdown
  useEffect(() => {
    if (isGameRunning && !isGamePaused && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isGameRunning && !isGamePaused) {
      endGame();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, isGameRunning, isGamePaused]);

  // Check for automatic loss (3 catfish)
  useEffect(() => {
    if (catfishCount >= 3 && isGameRunning) {
      endGame();
    }
  }, [catfishCount, isGameRunning]);

  // Calculate flowers distribution when catfish is caught
  const handleCatfishCaught = () => {
    const newCatfishCount = catfishCount + 1;
    setCatfishCount(newCatfishCount);
    
    // Calculate how many flowers go to imposter (1/3 of total collected)
    const flowersLost = Math.floor(flowersCollected / 3);
    setFlowersToImposter(prev => prev + flowersLost);
  };

  // Update flowers to artist calculation
  useEffect(() => {
    setFlowersToArtist(flowersCollected - flowersToImposter);
  }, [flowersCollected, flowersToImposter]);

  const endGame = () => {
    // Prevent multiple calls
    if (!isGameRunning) return;
    
    setIsGameRunning(false);
    
    // Clear all falling objects immediately
    setGameObjects([]);
    
    // Clear any pending timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (gameLoop.current) {
      clearInterval(gameLoop.current);
      gameLoop.current = null;
    }
    
    // Determine win/lose
    const didWin = flowersToArtist > flowersToImposter && catfishCount < 3;
    
    let title, message;
    
    if (catfishCount >= 3) {
      title = '💔 Too Many Imposters!';
      message = `You caught 3 catfish!\n\n${fakeArtist} stole all your flowers!\n\nFlowers collected: ${flowersCollected}\nFlowers to ${realArtist}: 0\nFlowers to ${fakeArtist}: ${flowersCollected}`;
    } else if (didWin) {
      title = '🌸 Victory! 🌸';
      message = `You gave more flowers to ${realArtist}!\n\nFlowers collected: ${flowersCollected}\nFlowers to ${realArtist}: ${flowersToArtist}\nFlowers to ${fakeArtist}: ${flowersToImposter}`;
    } else {
      title = '😔 The Imposter Won';
      message = `${fakeArtist} got more flowers!\n\nFlowers collected: ${flowersCollected}\nFlowers to ${realArtist}: ${flowersToArtist}\nFlowers to ${fakeArtist}: ${flowersToImposter}`;
    }
    
    Alert.alert(
      title,
      message,
      [
        { 
          text: 'Home', 
          onPress: () => {
            // Navigate back to home screen
            router.push('/(tabs)/');
          },
          style: 'cancel'
        },
        { 
          text: 'Continue (+30s)', 
          onPress: () => {
            continueGame();
          }
        },
        { 
          text: 'Play Again', 
          onPress: () => {
            resetGame();
            setIsGameRunning(true);
          }
        }
      ],
      { cancelable: false }
    );
  };

  // Game loop
  useEffect(() => {
    if (!isGameRunning || isGamePaused) return;

    gameLoop.current = setInterval(() => {
      setGameObjects(prevObjects => {
        let newObjects = [...prevObjects];
        
        // Create new objects
        if (Math.random() < 0.03) {
          newObjects.push(createGameObject());
        }

        // Update positions and check collisions
        newObjects = newObjects.map(obj => {
          const updatedObj = { ...obj, y: obj.y + obj.speed };
          
          // Player position from bottom (adjusted for 120px height)
          const playerBottom = 100;
          const playerTop = screenHeight - playerBottom - 120;
          
          // Collision boundaries
          const objectSize = obj.size || 30;
          const objectBottom = updatedObj.y + objectSize;
          const objectTop = updatedObj.y;
          const objectLeft = updatedObj.x;
          const objectRight = updatedObj.x + objectSize;
          
          const playerLeft = currentPlayerX;
          const playerRight = currentPlayerX + 120; // Adjusted for 120px width
          
          // Check collision (adjusted buffer for 120px player)
          if (!obj.collected &&
              objectRight > playerLeft - 10 &&
              objectLeft < playerRight + 10 &&
              objectBottom > playerTop - 10 &&
              objectTop < playerTop + 130) { // 120px height + 10px buffer
            updatedObj.collected = true;
            
            if (obj.type === 'catfish') {
              handleCatfishCaught();
            } else {
              setFlowersCollected(prev => prev + 1);
            }
          }
          
          return updatedObj;
        });

        // Remove collected objects and objects off screen
        return newObjects.filter(obj => !obj.collected && obj.y < screenHeight + 50);
      });
    }, 16);

    return () => {
      if (gameLoop.current) {
        clearInterval(gameLoop.current);
      }
    };
  }, [isGameRunning, isGamePaused, currentPlayerX, flowersCollected, catfishCount]);

  const resetGame = () => {
    setGameObjects([]);
    setCatfishCount(0);
    setFlowersCollected(0);
    setFlowersToImposter(0);
    setFlowersToArtist(0);
    setTimeLeft(30);
    setIsGamePaused(false); // Ensure game is not paused on reset
    const initialX = screenWidth / 2 - 60; // Adjusted for 120px box (half of 120)
    playerPosition.setValue(initialX);
    setCurrentPlayerX(initialX);
  };

  // Create array for catfish display
  const catfishArray = Array.from({ length: catfishCount }, (_, i) => i);

  if (!gameStarted) {
    return <ThemedView style={styles.container} />;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.gameArea} {...panResponder.panHandlers}>
        {/* Falling objects */}
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
                <Catfish size={50} />
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
                <FlowerComponent size={50} />
              </View>
            );
          }
        })}

        {/* Player square with Kendrick image */}
        <Animated.View
          style={[
            styles.player,
            {
              transform: [
                { translateX: playerPosition },
              ],
            },
          ]}
        >
          <Image 
            source={require('@/assets/images/kdot_pic_00.jpg')}
            style={styles.playerImage}
            resizeMode="cover"
          />
        </Animated.View>
      </View>

      {/* Top right - Pause button */}
      <TouchableOpacity 
        style={styles.pauseButton} 
        onPress={togglePause}
        disabled={!isGameRunning || isGamePaused}
      >
        <Ionicons 
          name={isGamePaused ? "play" : "pause"} 
          size={30} 
          color="#FFFFFF" 
        />
      </TouchableOpacity>

      {/* Top left UI - Timer and Catfish */}
      <View style={styles.topLeftUI}>
        <ThemedText style={styles.timer}>
          Time: {timeLeft}s
        </ThemedText>
        <View style={styles.catfishDisplay}>
          {catfishArray.map(index => (
            <View key={index} style={styles.catfishIcon}>
              <Catfish size={35} />
            </View>
          ))}
        </View>
      </View>

      {/* Center UI - Flower distribution */}
      <ThemedView style={styles.centerUI}>
        <ThemedText style={styles.artistName}>
          For: {realArtist}
        </ThemedText>
        <View style={styles.scoreContainer}>
          <View style={styles.scoreBox}>
            <ThemedText style={[styles.scoreLabel, { color: '#4CAF50' }]}>
              Real Artist
            </ThemedText>
            <ThemedText style={[styles.scoreValue, { color: '#4CAF50' }]}>
              {flowersToArtist} 🌸
            </ThemedText>
          </View>
          <View style={styles.scoreBox}>
            <ThemedText style={[styles.scoreLabel, { color: '#FF6B6B' }]}>
              {fakeArtist}
            </ThemedText>
            <ThemedText style={[styles.scoreValue, { color: '#FF6B6B' }]}>
              {flowersToImposter} 🌸
            </ThemedText>
          </View>
        </View>
        <ThemedText style={styles.totalFlowers}>
          Total Collected: {flowersCollected}
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
    width: 120,
    height: 120,
    backgroundColor: '#00aaff',
    borderRadius: 12,
    shadowColor: '#00aaff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
    bottom: 100,
    left: 0,
    overflow: 'hidden', // This ensures the image stays within the rounded corners
  },
  playerImage: {
    width: '100%',
    height: '100%',
  },
  gameObject: {
    position: 'absolute',
    width: 30,
    height: 30,
  },
  pauseButton: {
    position: 'absolute',
    top: Platform.select({ ios: 60, android: 40, default: 50 }),
    right: 20,
    zIndex: 1001,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topLeftUI: {
    position: 'absolute',
    top: Platform.select({ ios: 60, android: 40, default: 50 }),
    left: 20,
    zIndex: 1000,
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  catfishDisplay: {
    flexDirection: 'row',
    gap: 5,
  },
  catfishIcon: {
    opacity: 0.9,
  },
  centerUI: {
    position: 'absolute',
    top: Platform.select({ ios: 50, android: 30, default: 40 }),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  artistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 10,
  },
  scoreBox: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalFlowers: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
});