import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import axios from 'axios';

const { width: screenWidth } = Dimensions.get('window');

const CLIENT_ID = '0078bb6ab5d747c6878f034dcd343cad';
const CLIENT_SECRET = '003998be4bae4368b28e83d357bbe0b3';

interface SpotifyAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
  images: SpotifyImage[];
  popularity: number;
}

interface SpotifySearchResponse {
  artists: {
    items: SpotifyArtist[];
  };
}

interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  popularity: number;
}

let accessToken: string | null = null;
let tokenExpiryTime = 0;

const getAuthorizationToken = async (): Promise<string> => {
  try {
    const now = Date.now();
    if (accessToken && tokenExpiryTime > now) {
      return accessToken;
    }

    const authString = `${CLIENT_ID}:${CLIENT_SECRET}`;
    const base64Auth = btoa(authString);

    console.log('🔑 Requesting token with axios...');
    
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${base64Auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    console.log('✅ Token received successfully via axios');
    const data = response.data as SpotifyAuthResponse;
    accessToken = data.access_token;
    tokenExpiryTime = now + (data.expires_in - 60) * 1000;

    return accessToken;
  } catch (error) {
    console.error('❌ Axios token error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

const searchArtists = async (query: string): Promise<Artist[]> => {
  try {
    const token = await getAuthorizationToken();

    console.log(`🔍 Searching for: ${query}`);
    
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=50`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    const data = response.data as SpotifySearchResponse;
    const artists = data.artists.items.map(artist => ({
      id: artist.id,
      name: artist.name,
      imageUrl: artist.images.length > 0 ? artist.images[0].url : 'https://via.placeholder.com/400?text=No+Image', 
      popularity: artist.popularity
    }));
    
    console.log(`✅ Found ${artists.length} artists for query: ${query}`);
    return artists;

  } catch (error) {
    console.error('❌ Axios search error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

const getTopArtists = async (): Promise<Artist[]> => {
  try {
    const genres = ['pop', 'rock', 'hip hop', 'rap', 'electronic', 'r&b', 'country', 'jazz', 'classical'];
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    
    const artists = await searchArtists(randomGenre);
    
    return artists
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 100);
  } catch (error) {
    console.error('Error getting top Spotify artists:', error);
    throw error;
  }
};

// Simple store for selected artist
let selectedArtistGlobal: Artist | null = null;

// Function to reset selection when coming from home
export const resetArtistSelection = () => {
  selectedArtistGlobal = null;
};

export default function ExploreScreen() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  // Reset selection every time the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Explore screen focused - resetting artist selection');
      setSelectedArtist(null);
      selectedArtistGlobal = null;
      setSearchQuery(''); // Also reset search query
      loadMockArtists(); // Reload the artist list
    }, [])
  );

  // Keep the useEffect as backup
  useEffect(() => {
    loadMockArtists();
  }, []);

  const loadMockArtists = async () => {
    setLoading(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockArtists: Artist[] = [
      {
        id: 'taylor-swift',
        name: 'Taylor Swift',
        imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb859e4c14fa59296c8649e0e4',
        popularity: 100
      },
      {
        id: 'drake',
        name: 'Drake',
        imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9',
        popularity: 99
      },
      {
        id: 'billie-eilish',
        name: 'Billie Eilish',
        imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb5a00969a4698c3132957b12e',
        popularity: 97
      },
      {
        id: 'ariana-grande',
        name: 'Ariana Grande',
        imageUrl: 'https://i.scdn.co/image/ab6761610000e5ebcdce7620dc940db079bf4952',
        popularity: 96
      },
      {
        id: 'kendrick-lamar',
        name: 'Kendrick Lamar',
        imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb437b9e2a82505b3d93ff1022',
        popularity: 95
      },
      {
        id: 'bad-bunny',
        name: 'Bad Bunny',
        imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb13b3e37318a0c29f3dcd58d5',
        popularity: 94
      },
      {
        id: 'michael-jackson',
        name: 'Michael Jackson',
        imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb0e08ea2c4d6789fbf5cccbf6',
        popularity: 93
      },
      {
        id: 'willow-smith',
        name: 'Willow Smith',
        imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb5dd2c616e95a6eb5b3c2a5e1',
        popularity: 92
      },
      {
        id: 'beyonce',
        name: 'Beyoncé',
        imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb0d45b6a5de8b9a5b1e1e4e9a',
        popularity: 91
      },
      {
        id: 'pharrell-williams',
        name: 'Pharrell Williams',
        imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb8c5c7c3c7c3c7c3c7c3c7c3c',
        popularity: 90
      }
    ];
    
    setArtists(mockArtists);
    setLoading(false);
  };

  const loadTopArtists = loadMockArtists;

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      loadTopArtists();
      return;
    }

    setLoading(true);
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock search - filter existing artists by name
    const searchResults = artists.filter(artist => 
      artist.name.toLowerCase().includes(query.toLowerCase())
    );
    
    // If no results, add some mock search results
    if (searchResults.length === 0) {
      const mockSearchResults: Artist[] = [
        {
          id: `search-${query}-1`,
          name: `${query} (Artist)`,
          imageUrl: 'https://via.placeholder.com/400?text=' + encodeURIComponent(query),
          popularity: 85
        },
        {
          id: `search-${query}-2`,
          name: `${query} Band`,
          imageUrl: 'https://via.placeholder.com/400?text=' + encodeURIComponent(query + ' Band'),
          popularity: 75
        }
      ];
      setArtists(mockSearchResults);
    } else {
      setArtists(searchResults);
    }
    
    setLoading(false);
  };

  const handleArtistSelect = (artist: Artist) => {
    // If this artist is already selected, clear the selection
    if (selectedArtist?.id === artist.id) {
      setSelectedArtist(null);
      selectedArtistGlobal = null;
      return;
    }

    // Otherwise, select this artist
    setSelectedArtist(artist);
    selectedArtistGlobal = artist;
  };

  // Clear the selected artist
  const handleClearSelection = () => {
    Alert.alert(
      "Clear Selection",
      "Are you sure you want to clear your artist selection?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Clear",
          onPress: () => {
            setSelectedArtist(null);
            selectedArtistGlobal = null;
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleStartGame = () => {
    if (!selectedArtist) {
      Alert.alert('Select an Artist', 'Please select an artist that inspired you before starting the game.');
      return;
    }

    selectedArtistGlobal = selectedArtist;
    router.push('/(tabs)/game');
  };

  const renderArtist = ({ item }: { item: Artist }) => {
    const isSelected = selectedArtist?.id === item.id;
    
    return (
      <TouchableOpacity
        style={[styles.artistCard, isSelected && styles.selectedCard]}
        onPress={() => handleArtistSelect(item)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.artistImage} />
        <View style={styles.artistInfo}>
          <Text style={styles.artistName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.popularityText}>
            Popularity: {item.popularity}
          </Text>
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title}>Choose Your Inspiration</ThemedText>
          <ThemedText style={styles.subtitle}>
            Select the artist that inspired you
          </ThemedText>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for artists..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Selected Artist Display */}
      {selectedArtist && (
        <View style={styles.selectedArtistContainer}>
          <ThemedText style={styles.selectedLabel}>Selected Artist:</ThemedText>
          <View style={styles.selectedArtistCard}>
            <Image 
              source={{ uri: selectedArtist.imageUrl }} 
              style={styles.selectedArtistImage} 
            />
            <ThemedText style={styles.selectedArtistName}>
              {selectedArtist.name}
            </ThemedText>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={handleClearSelection}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Artists List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00aaff" />
          <ThemedText style={styles.loadingText}>Loading artists...</ThemedText>
        </View>
      ) : (
        <FlatList
          data={artists}
          renderItem={renderArtist}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Start Game Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.startGameButton, !selectedArtist && styles.disabledButton]} 
          onPress={handleStartGame}
          disabled={!selectedArtist}
        >
          <Text style={styles.playIcon}>▶</Text>
          <ThemedText style={styles.startGameText}>
            {selectedArtist ? `Start Game with ${selectedArtist.name}` : 'Select an Artist to Start'}
          </ThemedText>
        </TouchableOpacity>
        
        {/* Clear Selection Button */}
        {selectedArtist && (
          <TouchableOpacity 
            style={styles.clearSelectionButton}
            onPress={handleClearSelection}
          >
            <Text style={styles.clearSelectionIcon}>✕</Text>
            <ThemedText style={styles.clearSelectionText}>
              Clear Selection
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

// Export the selected artist getter for use in game screen
export const getSelectedArtist = (): Artist | null => selectedArtistGlobal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001122',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingTop: 10,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 10,
    color: '#999',
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectedArtistContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  selectedLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  selectedArtistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 170, 255, 0.2)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 2,
    borderColor: '#00aaff',
  },
  selectedArtistImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  selectedArtistName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  clearButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
  },
  list: {
    padding: 20,
    paddingBottom: 100,
  },
  artistCard: {
    flex: 1,
    margin: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
    maxWidth: (screenWidth - 64) / 2,
  },
  selectedCard: {
    backgroundColor: 'rgba(0, 170, 255, 0.3)',
    borderWidth: 2,
    borderColor: '#00aaff',
  },
  artistImage: {
    width: '100%',
    height: 120,
  },
  artistInfo: {
    padding: 12,
  },
  artistName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  popularityText: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 12,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#00aaff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 17, 34, 0.9)',
  },
  startGameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00aaff',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: '#00aaff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  disabledButton: {
    backgroundColor: '#555',
    shadowOpacity: 0,
  },
  playIcon: {
    marginRight: 10,
    color: '#FFFFFF',
    fontSize: 16,
  },
  startGameText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearSelectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 10,
  },
  clearSelectionIcon: {
    marginRight: 8,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearSelectionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});