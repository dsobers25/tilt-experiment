import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Rose, Sunflower, Tulip, Daisy, CherryBlossom, flowerTypes, getRandomFlower } from '@/components/ui/Flowers';

import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function TiltGameScreen() {
  const [score, setScore] = useState(0);
  const [gameObjects, setGameObjects] = useState([]);
  const [tiltData, setTiltData] = useState({ x: 0, y: 0 });
  const [isGameRunning, setIsGameRunning] = useState(true);
  
  const playerPosition = useRef(new Animated.ValueXY({ 
    x: screenWidth / 2 - 25, 
    y: screenHeight - 150 
  })).current;
  const gameLoop = useRef(null);
  const objectId = useRef(0);

  // Initialize accelerometer
  useEffect(() => {
    const subscription = Accelerometer.addListener(accelerometerData => {
      setTiltData({
        x: accelerometerData.x * 300,
        y: accelerometerData.y * 300,
      });
    });

    Accelerometer.setUpdateInterval(8);

    return () => subscription && subscription.remove();
  }, []);

  // Move player based on tilt
  useEffect(() => {
    if (!isGameRunning) return;

    const currentX = playerPosition.x._value;
    const newX = Math.max(0, Math.min(screenWidth - 50, currentX + tiltData.x * 0.8));

    Animated.timing(playerPosition.x, {
      toValue: newX,
      duration: 20,
      useNativeDriver: false,
    }).start();
  }, [tiltData, isGameRunning]);

  // Game object creation - NOW USING FLOWERS
  const createGameObject = () => {
    const id = objectId.current++;
    const startX = Math.random() * (screenWidth - 30);
    const speed = 2 + Math.random() * 3;
    const flowerType = getRandomFlower(); // Get random flower
    
    return {
      id,
      x: startX,
      y: -30,
      speed,
      flowerType, // Store the flower type
      collected: false,
    };
  };

  // Game loop
  useEffect(() => {
    if (!isGameRunning) return;

    gameLoop.current = setInterval(() => {
      setGameObjects(prevObjects => {
        let newObjects = [...prevObjects];
        
        if (Math.random() < 0.02) {
          newObjects.push(createGameObject());
        }

        newObjects = newObjects.map(obj => {
          const updatedObj = { ...obj, y: obj.y + obj.speed };
          
          const playerX = playerPosition.x._value;
          const playerY = playerPosition.y._value;
          
          if (!obj.collected &&
              updatedObj.x < playerX + 50 &&
              updatedObj.x + 30 > playerX &&
              updatedObj.y < playerY + 50 &&
              updatedObj.y + 30 > playerY) {
            updatedObj.collected = true;
            setScore(prev => prev + 10);
          }
          
          return updatedObj;
        });

        return newObjects.filter(obj => !obj.collected && obj.y < screenHeight + 50);
      });
    }, 16);

    return () => {
      if (gameLoop.current) {
        clearInterval(gameLoop.current);
      }
    };
  }, [isGameRunning]);

  const resetGame = () => {
    setScore(0);
    setGameObjects([]);
    setIsGameRunning(true);
    playerPosition.setValue({ x: screenWidth / 2 - 25, y: screenHeight - 150 });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.gameArea}>
        {/* Falling Flowers - NOW RENDERS ACTUAL FLOWERS */}
        {gameObjects.map(obj => {
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
        })}

        <Animated.View
          style={[
            styles.player,
            {
              transform: [
                { translateX: playerPosition.x },
                { translateY: playerPosition.y },
              ],
            },
          ]}
        />
      </View>

      <ThemedView style={styles.uiContainer}>
        <ThemedText type="title" style={styles.score}>
          Score: {score}
        </ThemedText>
        <ThemedText style={styles.tiltInfo}>
          Tilt: X: {tiltData.x.toFixed(1)}, Y: {tiltData.y.toFixed(1)}
        </ThemedText>
        <ThemedText style={styles.instructions}>
          Tilt your device to move the blue square and collect beautiful flowers!
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
    color: '#FFFFFF'
  },
  tiltInfo: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    opacity: 0.7,
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFFFFF'
  },
});


// what artist was most influencial to your passion for wanting to learn music
// learning

// flowers
