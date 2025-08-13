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
  InteractionManager,
} from 'react-native';
import { Rose, Sunflower, Tulip, Daisy, CherryBlossom, flowerTypes, getRandomFlower } from '@/components/ui/Flowers';
import { Catfish } from '@/components/ui/Fish';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { getSelectedArtist } from './explore'; // Import the selected artist getter

import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SlideGameScreen() {
  // Get selected artist
  const selectedArtist = getSelectedArtist();
  
  const [gameObjects, setGameObjects] = useState([]);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPlayerX, setCurrentPlayerX] = useState(screenWidth / 2 - 50); // Adjusted for 100px player
  const [catfishCount, setCatfishCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [flowersCollected, setFlowersCollected] = useState(0);
  const [flowersToImposter, setFlowersToImposter] = useState(0);
  const [flowersToArtist, setFlowersToArtist] = useState(0);
  const [extensionsUsed, setExtensionsUsed] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [roundStartTime, setRoundStartTime] = useState(null);
  const [totalSessionTime, setTotalSessionTime] = useState(0);
  const [pausedTime, setPausedTime] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState(null);
  const [roundTimes, setRoundTimes] = useState([]); // Track time for each completed round
  
  // Artist names - use selected artist or defaults
  const realArtist = selectedArtist ? selectedArtist.name : "Kendrick Lamar";
  const fakeArtist = selectedArtist ? `Fake ${selectedArtist.name}` : "Kendrick Kumar";
  
  // Use native driver for player position - runs on UI thread
  const playerPosition = useRef(new Animated.Value(screenWidth / 2 - 50)).current; // Adjusted for 100px player
  
  // Separate refs for different processes
  const gameLoop = useRef(null);
  const timerRef = useRef(null);
  const objectId = useRef(0);
  const playerXRef = useRef(screenWidth / 2 - 50); // Keep sync reference for collision detection (100px player)
  
  // Check if artist is selected on component mount
  useEffect(() => {
    if (!selectedArtist) {
      Alert.alert(
        'No Artist Selected',
        'Please select an artist first to play the game.',
        [
          {
            text: 'Select Artist',
            onPress: () => router.push('/(tabs)/explore')
          }
        ],
        { cancelable: false }
      );
      return;
    }
  }, [selectedArtist]);
  
  // Calculate accurate total time played for the entire session
  const getTotalTimePlayed = () => {
    const currentRoundTime = getCurrentRoundTime();
    return totalSessionTime + currentRoundTime;
  };

  // Calculate current round time based on timer usage (not elapsed time)
  const getCurrentRoundTime = () => {
    // Calculate how much of the 30-second timer was used
    const timeUsed = 30 - timeLeft;
    return Math.max(0, timeUsed);
  };

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}s`;
  };

  // Initial game setup - start only when screen is focused
  useFocusEffect(
    useCallback(() => {
      // Only start if artist is selected
      if (!selectedArtist) return;
      
      // Use InteractionManager to defer game start until after animations
      InteractionManager.runAfterInteractions(() => {
        setGameStarted(true);
        setIsGamePaused(false);
        setIsGameRunning(true);
        const now = Date.now();
        setGameStartTime(now); // Track when entire session starts
        setRoundStartTime(now); // Track when this round starts
        setPausedTime(0); // Reset paused time
        setPauseStartTime(null); // Reset pause start time
        resetGame();
      });
      
      // Cleanup when screen loses focus
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        if (gameLoop.current) {
          clearInterval(gameLoop.current);
          gameLoop.current = null;
        }
        setIsGameRunning(false);
        setGameObjects([]);
      };
    }, [selectedArtist])
  );

  const continueGame = () => {
    // Add current round time to total session time before starting new round
    const currentRoundTime = getCurrentRoundTime();
    setTotalSessionTime(prev => prev + currentRoundTime);
    
    // Add the completed round time to our round times array
    setRoundTimes(prev => [...prev, currentRoundTime]);
    
    const newExtensionsUsed = extensionsUsed + 1;
    setExtensionsUsed(newExtensionsUsed);
    
    // ONLY reset catfish if they lost due to 3 catfish (not if timer ran out)
    if (catfishCount >= 3) {
      setCatfishCount(1); // Remove 2 catfish, leave them with 1 as penalty
    }
    // If they survived the full round, they keep all their catfish
    
    // ALWAYS set timer to exactly 30 seconds for new round (not adding to current time)
    setTimeLeft(30);
    setIsGameRunning(true);
    setIsGamePaused(false);
    
    // Start tracking new round time - reset pause tracking
    setRoundStartTime(Date.now());
    setPausedTime(0); // Reset paused time for new round
    setPauseStartTime(null);
    
    // Check if this was the 3rd extension (final one)
    if (newExtensionsUsed >= 3) {
      // Show thank you message and end game after this extension
      setTimeout(() => {
        setIsGameRunning(false);
        setIsGamePaused(true); // Pause the timer
        const totalTimePlayed = getTotalTimePlayed();
        Alert.alert(
          'Thank You for Playing! 🌸',
          `You've completed all 3 rounds with ${realArtist}!\n\nTotal time played: ${formatTime(totalTimePlayed)}\n\nHope you enjoyed giving flowers to ${realArtist}!`,
          [
            { 
              text: 'End Game', 
              onPress: () => router.push('/(tabs)/'),
            }
          ],
          { cancelable: false }
        );
      }, 100); // Small delay to let the time update show
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setIsGameRunning(true);
    resetGame();
  };

  // Optimized pause/resume with accurate time tracking
const togglePause = useCallback(() => {
  if (isGamePaused) {
    // Resuming: add paused time to total
    if (pauseStartTime) {
      const pauseDuration = (Date.now() - pauseStartTime) / 1000;
      setPausedTime(prev => prev + pauseDuration);
      setPauseStartTime(null);
    }
    setIsGamePaused(false);
    setIsGameRunning(true);
  } else {
    // Pausing: record when pause started
    setPauseStartTime(Date.now());
    setIsGamePaused(true);
    setIsGameRunning(false);
    Alert.alert(
      'Game Paused',
      `Take a break from collecting flowers for ${realArtist}!`,
      [
        { 
          text: 'Resume', 
          onPress: () => {
            // Resume and track pause time
            if (pauseStartTime) {
              const pauseDuration = (Date.now() - pauseStartTime) / 1000;
              setPausedTime(prev => prev + pauseDuration);
              setPauseStartTime(null);
            }
            setIsGamePaused(false);
            setIsGameRunning(true);
          }
        },
        { 
          text: 'Restart', 
          onPress: () => {
            // Clear any remaining objects and reset the game
            setGameObjects([]);
            resetGame();
            setIsGameRunning(true);
            setIsGamePaused(false);
          }
        },
        { 
          text: 'Quit', 
          onPress: () => {
            // Clear any remaining objects and go back to home screen
            setGameObjects([]);
            setIsGameRunning(false);
            setIsGamePaused(false);
            router.push('/(tabs)/');
          },
          style: 'destructive'
        }
      ],
      { cancelable: false }
    );
  }
}, [isGamePaused, pauseStartTime, realArtist, router]);

  // Optimized pan responder with native driver support
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Stop any running animations
        playerPosition.stopAnimation();
      },
      onPanResponderMove: (evt, gestureState) => {
        const newX = Math.max(0, Math.min(screenWidth - 100, evt.nativeEvent.pageX - 50)); // Adjusted for 100px player
        
        // Update animated value without causing re-renders
        playerPosition.setValue(newX);
        
        // Update ref for collision detection (avoid state updates during panning)
        playerXRef.current = newX;
      },
      onPanResponderRelease: () => {
        // Sync state only when gesture ends
        setCurrentPlayerX(playerXRef.current);
      },
    })
  ).current;

  // Optimized game object creation with MUCH MORE NOTICEABLE speed progression
  const createGameObject = useCallback(() => {
    const id = objectId.current++;
    const isCatfish = Math.random() < 0.15;
    const objectSize = 50;
    const startX = Math.random() * (screenWidth - objectSize);
    
    // DRAMATICALLY INCREASED SPEED PROGRESSION - Much more noticeable!
    // Round 1 (extensionsUsed = 0): speed 3-6 (average 4.5)
    // Round 2 (extensionsUsed = 1): speed 7-12 (average 9.5) - MUCH FASTER!
    // Round 3 (extensionsUsed = 2): speed 13-20 (average 16.5) - VERY FAST!
    const baseSpeed = 3 + Math.random() * 3; // 3-6 range (increased from 2-5)
    const speedMultiplier = extensionsUsed * 5; // 0, 5, 10 (increased from 0, 2, 4)
    const additionalBoost = extensionsUsed * extensionsUsed * 2; // 0, 2, 8 (exponential boost!)
    const speed = baseSpeed + speedMultiplier + additionalBoost;
    
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
  }, [extensionsUsed]); // Add extensionsUsed as dependency

  // Timer countdown with reduced frequency
  useEffect(() => {
    if (isGameRunning && !isGamePaused && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
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

  // Batched state updates for game events
  const handleCatfishCaught = useCallback(() => {
    const newCatfishCount = catfishCount + 1;
    const flowersLost = Math.floor(flowersCollected / 3);
    
    // Batch multiple state updates
    requestAnimationFrame(() => {
      setCatfishCount(newCatfishCount);
      setFlowersToImposter(prev => prev + flowersLost);
    });
  }, [catfishCount, flowersCollected]);

  const handleFlowerCaught = useCallback(() => {
    requestAnimationFrame(() => {
      setFlowersCollected(prev => prev + 1);
    });
  }, []);

  // Update flowers to artist calculation
  useEffect(() => {
    setFlowersToArtist(flowersCollected - flowersToImposter);
  }, [flowersCollected, flowersToImposter]);

  const endGame = () => {
    if (!isGameRunning) return;
    
    // IMMEDIATELY stop ALL game interactions and timer
    setIsGameRunning(false);
    setIsGamePaused(true);
    
    // Clear timers immediately to stop any further time accumulation
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (gameLoop.current) {
      clearInterval(gameLoop.current);
      gameLoop.current = null;
    }
    
    // Calculate times AFTER stopping everything
    const currentRoundTime = getCurrentRoundTime();
    const finalTotalTime = totalSessionTime + currentRoundTime;
    
    // Calculate current round number (extensions used + 1)
    const currentRoundNumber = extensionsUsed + 1;
    
    // Create final round times array including current round
    const finalRoundTimes = [...roundTimes, currentRoundTime];
    
    // Capture final game state before any potential changes
    const finalFlowersCollected = flowersCollected;
    const finalFlowersToArtist = flowersToArtist;
    const finalFlowersToImposter = flowersToImposter;
    const finalCatfishCount = catfishCount;
    
    const didWin = finalFlowersToArtist > finalFlowersToImposter && finalCatfishCount < 3;
    
    let title, message, buttons;
    
    if (finalCatfishCount >= 3) {
      title = '💔 Too Many Imposters!';
      message = `You caught 3 catfish!\n\n${fakeArtist} stole all your flowers!\n\nFlowers collected: ${finalFlowersCollected}\nFlowers to ${realArtist}: 0\nFlowers to ${fakeArtist}: ${finalFlowersCollected}\n\nTotal Rounds Played: ${currentRoundNumber}\nThis round: ${formatTime(currentRoundTime)}\nTotal time played: ${formatTime(finalTotalTime)}`;
    } else if (didWin) {
      title = '🌸 Victory! 🌸';
      message = `You gave more flowers to ${realArtist}!\n\nFlowers collected: ${finalFlowersCollected}\nFlowers to ${realArtist}: ${finalFlowersToArtist}\nFlowers to ${fakeArtist}: ${finalFlowersToImposter}\n\nTotal Rounds Played: ${currentRoundNumber}\nThis round: ${formatTime(currentRoundTime)}\nTotal time played: ${formatTime(finalTotalTime)}`;
    } else {
      title = '😔 The Imposter Won';
      message = `${fakeArtist} got more flowers!\n\nFlowers collected: ${finalFlowersCollected}\nFlowers to ${realArtist}: ${finalFlowersToArtist}\nFlowers to ${fakeArtist}: ${finalFlowersToImposter}\n\nTotal Rounds Played: ${currentRoundNumber}\nThis round: ${formatTime(currentRoundTime)}\nTotal time played: ${formatTime(finalTotalTime)}`;
    }
    
    // Different button options based on extensions used
    if (extensionsUsed >= 2) {
      // After 2nd extension (3rd round), show thank you message
      buttons = [
        { 
          text: 'End Game', 
          onPress: () => {
            // Clear any remaining objects before going home
            setGameObjects([]);
            router.push('/(tabs)/');
          },
        }
      ];
      
      // Determine overall game result for final message
      let gameResultMessage = '';
      if (finalCatfishCount >= 3) {
        gameResultMessage = `💔 GAME LOST - Too many imposters!\n${fakeArtist} stole all your flowers!\n\n`;
      } else if (finalFlowersToArtist > finalFlowersToImposter) {
        gameResultMessage = `🎉 VICTORY! You gave more flowers to the real artist!\n${realArtist} got ${finalFlowersToArtist} vs ${fakeArtist}'s ${finalFlowersToImposter}!\n\n`;
      } else if (finalFlowersToArtist < finalFlowersToImposter) {
        gameResultMessage = `😔 GAME LOST - The imposter got more flowers!\n${fakeArtist} got ${finalFlowersToImposter} vs ${realArtist}'s ${finalFlowersToArtist}!\n\n`;
      } else {
        gameResultMessage = `🤝 TIE GAME!\nBoth ${realArtist} and ${fakeArtist} got ${finalFlowersToArtist} flowers!\n\n`;
      }
      
      // Override the message for the final round
      title = 'Max Rounds Reached';
      
      // Create round breakdown string
      let roundBreakdown = '';
      finalRoundTimes.forEach((time, index) => {
        roundBreakdown += `Round ${index + 1}: ${formatTime(time)}\n`;
      });
      
      message = `${gameResultMessage}Thank You for Playing with ${realArtist}! 🌸\n\nYou've completed all 3 rounds!\n\nFinal Stats:\nFlowers collected: ${finalFlowersCollected}\nFlowers to ${realArtist}: ${finalFlowersToArtist}\nFlowers to ${fakeArtist}: ${finalFlowersToImposter}\n\nTotal Rounds Played: ${currentRoundNumber}\nThis round: ${formatTime(currentRoundTime)}\nTotal time played: ${formatTime(finalTotalTime)}\n\n${roundBreakdown}\nHope you enjoyed giving flowers to ${realArtist}!`;
    } else {
      const roundNumber = extensionsUsed + 1; // Current round (1, 2, or 3)
      const roundsLeft = 2 - extensionsUsed; // Rounds remaining (2, 1, or 0)
      
      buttons = [
        { 
          text: 'Go Home', 
          onPress: () => {
            // Clear any remaining objects before going home
            setGameObjects([]);
            router.push('/(tabs)/');
          },
          style: 'cancel'
        },
        { 
          text: `Another Round (+30s) [${roundsLeft} left]`, 
          onPress: () => {
            // Resume the game when continue is pressed
            setIsGamePaused(false);
            continueGame();
          }
        },
        { 
          text: 'Restart Game', 
          onPress: () => {
            // Reset and restart the game directly (stay on game screen)
            resetGame();
            setIsGameRunning(true);
            setIsGamePaused(false);
          }
        }
      ];
    }
    
    // Clear falling objects immediately to stop visual distractions
    setGameObjects([]);
    
    Alert.alert(title, message, buttons, { cancelable: false });
  };

  // Optimized game loop with requestAnimationFrame for smoother animations
  useEffect(() => {
    if (!isGameRunning || isGamePaused) return;

    let animationFrame;
    let lastUpdate = Date.now();
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const gameLoopFunction = () => {
      const now = Date.now();
      const deltaTime = now - lastUpdate;

      if (deltaTime >= frameInterval) {
        setGameObjects(prevObjects => {
          let newObjects = [...prevObjects];
          
          // Create new objects with INCREASED SPAWN RATE for higher rounds
          const spawnRate = 0.02 + (extensionsUsed * 0.015); // Round 1: 0.02, Round 2: 0.035, Round 3: 0.05
          if (Math.random() < spawnRate) {
            newObjects.push(createGameObject());
          }

          // Update positions and check collisions
          const playerBottom = 100;
          const playerTop = screenHeight - playerBottom - 100; // Adjusted for 100px player height
          const playerLeft = playerXRef.current; // Use ref for real-time position
          const playerRight = playerLeft + 100; // Adjusted for 100px player width

          newObjects = newObjects.map(obj => {
            const updatedObj = { ...obj, y: obj.y + obj.speed };
            
            // Collision detection using ref values
            const objectSize = obj.size || 30;
            const objectBottom = updatedObj.y + objectSize;
            const objectTop = updatedObj.y;
            const objectLeft = updatedObj.x;
            const objectRight = updatedObj.x + objectSize;
            
            // Collision detection using ref values - ONLY if game is still running
            if (!obj.collected && isGameRunning && !isGamePaused &&
                objectRight > playerLeft - 10 &&
                objectLeft < playerRight + 10 &&
                objectBottom > playerTop - 10 &&
                objectTop < playerTop + 130) {
              updatedObj.collected = true;
              
              // Use callbacks to avoid state dependencies in game loop
              if (obj.type === 'catfish') {
                // Schedule state update
                setTimeout(() => handleCatfishCaught(), 0);
              } else {
                setTimeout(() => handleFlowerCaught(), 0);
              }
            }
            
            return updatedObj;
          });

          // Remove collected objects and objects off screen
          return newObjects.filter(obj => !obj.collected && obj.y < screenHeight + 50);
        });

        lastUpdate = now;
      }

      if (isGameRunning && !isGamePaused) {
        animationFrame = requestAnimationFrame(gameLoopFunction);
      }
    };

    animationFrame = requestAnimationFrame(gameLoopFunction);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isGameRunning, isGamePaused, createGameObject, handleCatfishCaught, handleFlowerCaught]);

  const resetGame = () => {
    setGameObjects([]);
    setCatfishCount(0);
    setFlowersCollected(0);
    setFlowersToImposter(0);
    setFlowersToArtist(0);
    setTimeLeft(30);
    setExtensionsUsed(0); // Reset extensions when starting new game
    setRoundTimes([]); // Reset round times array
    const now = Date.now();
    setGameStartTime(now); // Reset session start time
    setRoundStartTime(now); // Reset round start time
    setTotalSessionTime(0); // Reset total session time
    setPausedTime(0); // Reset paused time
    setPauseStartTime(null); // Reset pause start time
    setIsGamePaused(false);
    const initialX = screenWidth / 2 - 50; // Adjusted for smaller player (100px)
    playerPosition.setValue(initialX);
    setCurrentPlayerX(initialX);
    playerXRef.current = initialX;
  };

  // Memoized components to prevent unnecessary re-renders
  const FallingObject = React.memo(({ obj }) => {
    if (obj.type === 'catfish') {
      return (
        <View
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
  });

  // Create array for catfish display
  const catfishArray = Array.from({ length: catfishCount }, (_, i) => i);

  // Don't render game if no artist selected
  if (!selectedArtist) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.noArtistContainer}>
          <ThemedText style={styles.noArtistText}>Please select an artist first!</ThemedText>
          <TouchableOpacity 
            style={styles.selectArtistButton} 
            onPress={() => router.push('/(tabs)/explore')}
          >
            <ThemedText style={styles.selectArtistButtonText}>Select Artist</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  if (!gameStarted) {
    return <ThemedView style={styles.container} />;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.gameArea} {...panResponder.panHandlers}>
        {/* Falling objects */}
        {gameObjects.map(obj => (
          <FallingObject key={obj.id} obj={obj} />
        ))}

        {/* Player square with native driver animation - now shows selected artist image */}
        <Animated.View
          style={[
            styles.player,
            {
              transform: [
                { translateX: playerPosition },
              ],
            },
          ]}
          shouldRasterizeIOS={true} // Optimize rendering on iOS
          renderToHardwareTextureAndroid={true} // Optimize rendering on Android
        >
          <Image 
            source={{ uri: selectedArtist.imageUrl }}
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

      {/* Reorganized Center UI */}
      <ThemedView style={styles.centerUI}>
        <ThemedText style={styles.artistName}>
          For: {realArtist}
        </ThemedText>
        
        <ThemedText style={styles.totalFlowers}>
          Total Collected: {flowersCollected}
        </ThemedText>
        
        <View style={styles.scoreContainer}>
          <View style={styles.scoreBox}>
            <ThemedText style={[styles.scoreLabel, { color: '#4CAF50' }]}>
              Real {realArtist}
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
        
        <View style={styles.catfishRow}>
          <View style={styles.catfishDisplay}>
            {catfishArray.map(index => (
              <View key={index} style={styles.catfishIcon}>
                <Catfish size={35} />
              </View>
            ))}
          </View>
        </View>
        
        <ThemedText style={styles.timer}>
          Time: {timeLeft >= 60 ? Math.floor(timeLeft / 60) + ':' + (timeLeft % 60).toString().padStart(2, '0') : timeLeft + 's'}
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
    width: 100, // Reduced from 120 to 100
    height: 100, // Reduced from 120 to 100
    backgroundColor: '#00aaff',
    borderRadius: 12,
    shadowColor: '#00aaff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
    bottom: 100,
    left: 0,
    overflow: 'hidden',
  },
  playerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
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
  centerUI: {
    position: 'absolute',
    top: Platform.select({ ios: 70, android: 50, default: 60 }), // Moved down from top
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
    marginBottom: 12, // Increased spacing
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  totalFlowers: {
    fontSize: 16, // Made larger and more prominent
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
  },
  scoreContainer: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 15, // Increased spacing
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
  catfishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'center',
    minHeight: 35, // Reserve space even when no catfish
  },
  catfishDisplay: {
    flexDirection: 'row',
    gap: 5,
  },
  catfishIcon: {
    opacity: 0.9,
  },
  timer: {
    fontSize: 20, // Made slightly smaller since it's moved
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  noArtistContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#001122',
  },
  noArtistText: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  selectArtistButton: {
    backgroundColor: '#00aaff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  selectArtistButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});