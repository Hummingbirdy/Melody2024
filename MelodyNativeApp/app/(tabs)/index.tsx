import { ActivityIndicator, FlatList, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { Audio } from "expo-av"
import { FontAwesome } from '@expo/vector-icons';
import { Sound } from 'expo-av/build/Audio';

type Song = {
  youTubeId: string,
  songName: string,
  artist: string,
  createdDate: Date,
  isValid: boolean,
  inAzure: boolean,
  uploadFailed: boolean
}


export default function TabOneScreen() {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<Song[]>([]);
  const [index, setIndex] = useState(0);
  const [sound, setSound] = useState(new Audio.Sound());
  const [soundLoaded, setSoundLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);

  const getSongs = async () => {
    try {
      const response = await fetch('https://melodyapi.azurewebsites.net/api/song');
      const songJson = await response.json();
      setData(songJson);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    };

  }

  useEffect(() => {
    getSongs();
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: true           
    })
  }, []);

  async function PlaySong(change: number): Promise<void> {
    console.log('playing at location' + index + ' + ' + change)
    if(soundLoaded){
      await sound.unloadAsync();
      console.log('unloaded sound')
    }
    let nextSong = index + change;
    setIndex(nextSong);
    console.log('loading song' + data[nextSong].songName);
    let Uri = 'https://melodymusic.blob.core.windows.net/mp4storage/' + data[nextSong].youTubeId + '.mp3'
    await sound.loadAsync({
      uri: Uri
    });
    setSoundLoaded(true);
    sound.setOnPlaybackStatusUpdate(trackStatus);
    await sound.playAsync();
    setPlaying(true)
    console.log('play')
  }

  async function PlayAtLocation(youTubeId: string): Promise<void> {
    console.log('playing selected song');
    if(soundLoaded){
      await sound.unloadAsync();
    }
    let nextSong = data.findIndex(function(song) {
      return song.youTubeId == youTubeId
    });
    setIndex(nextSong);
    console.log('loading song' + data[nextSong].songName);
    let Uri = 'https://melodymusic.blob.core.windows.net/mp4storage/' + data[nextSong].youTubeId + '.mp3'
    await sound.loadAsync({
      uri: Uri
    });
    setSoundLoaded(true);
    sound.setOnPlaybackStatusUpdate(trackStatus);
    await sound.playAsync();
    setPlaying(true);
    console.log('play')
  }

  async function Pause() : Promise<void>{
    await sound.pauseAsync();
    setPlaying(false);
  }

  async function trackStatus(playbackStatus: any): Promise<void> {
    if(playbackStatus.didJustFinish){
      PlaySong(1)
    }
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <View style={{flex: 10}}>
          <View style={{ flex: 3, justifyContent: 'center', alignContent: 'center' }}>
            <Text style={styles.title}>{data[index].songName}</Text>
          </View>
          <View style={{ flex: 2, padding: 24 }}>
            <FlatList
              data={data}
              keyExtractor={({ youTubeId }) => youTubeId}
              renderItem={({ item }) => (
                <View style={item.youTubeId == data[index].youTubeId ? styles.playingSongBubble : styles.songBubble}>
                  <TouchableOpacity onPress={() => PlayAtLocation(item.youTubeId)}>
                  <Text style={styles.songTitle}>
                    {item.songName}
                  </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      )}
      <View style={styles.controls}>

        <FontAwesome.Button style={styles.directionButton} name="backward" backgroundColor="purple" onPress={() => PlaySong(-1)}></FontAwesome.Button>
      {
        playing ? (
          <FontAwesome.Button style={styles.playButton} name="pause" backgroundColor="purple" onPress={() => Pause()}></FontAwesome.Button>
        ) : (
          <FontAwesome.Button style={styles.playButton} name="play" backgroundColor="purple" onPress={() => PlaySong(0)}></FontAwesome.Button>
        )
      }


        <FontAwesome.Button style={styles.directionButton} name="forward" backgroundColor="purple" onPress={() => PlaySong(1)}></FontAwesome.Button>

      </View>
    </View>
  );



}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
  },
  songTitle: {
    fontSize: 18,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  playingSongBubble: {
    flex: 1,
    padding: 5,
    margin: 5,
    height: 35,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'white',
    backgroundColor: 'light purple'
  },
  songBubble: {
    flex: 1,
    padding: 5,
    margin: 5,
    height: 35,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'purple'
  },
  controls: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignContent: 'center'
  },
  directionButton: {
    width: 50,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  playButton: {
    width: 75,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
