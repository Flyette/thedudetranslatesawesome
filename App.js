import React, { useState, useRef, useEffect, Component } from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import { Audio } from 'expo-av';
import Translator from './components/Translator'

let recording = new Audio.Recording();

export default function App() {

  const [RecordedURI, SetRecordedURI] = useState('');
  const [AudioPerm, SetAudioPerm] = useState(false);
  const [isRecording, SetisRecording] = useState(false);
  const [isPLaying, SetisPLaying] = useState(false);
  const Player = useRef(new Audio.Sound());

  const ENCODING = 'LINEAR16';
  const SAMPLE_RATE_HERTZ = 41000;
  const LANGUAGE = 'en-US';


  useEffect(() => {
    GetPermission();
  }, []);

  const GetPermission = async () => {
    const getAudioPerm = await Audio.requestPermissionsAsync();
    SetAudioPerm(getAudioPerm.granted);
  };

  const startRecording = async () => {
    if (AudioPerm === true) {
      try {
        await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        await recording.prepareToRecordAsync(recordingOptions);
        await recording.startAsync();
        SetRecordedURI = '';
        SetisRecording(true);
      } catch (error) {
        console.log(error);
      }
    } else {
      GetPermission();
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const result = recording.getURI();
      SetRecordedURI(result); // Here is the URI

      recording = new Audio.Recording();
      SetisRecording(false);
      await getAudioTranscription();
    } catch (error) {
      console.log(error);
    }
  };

  const playSound = async () => {
    try {
      const result = await Player.current.loadAsync(
        { uri: RecordedURI },
        {},
        true
      );

      const response = await Player.current.getStatusAsync();
      if (response.isLoaded) {
        if (response.isPlaying === false) {
          Player.current.playAsync();
          SetisPLaying(true);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const stopSound = async () => {
    try {
      const checkLoading = await Player.current.getStatusAsync();
      if (checkLoading.isLoaded === true) {
        await Player.current.stopAsync();
        SetisPLaying(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAudioTranscription = async () => {
    try {

        const body = {
                      config: {
                          encoding:"FLAC",
                          sampleRateHertz: 16000,
                          languageCode: "en-US",
                          enableWordTimeOffsets: false
                            },
                      audio: {
                          uri: RecordedURI
                            }
                    };

        console.log('config body => '+body+' '+ body.config.encoding);

        const transcriptResponse = await fetch(
          "https://speech.googleapis.com/v1p1beta1/speech:recognize?key=AIzaSyCpv9I4SQDbxVuApznS_9EtH9EmP9TXstk",
          { method: "POST", body: JSON.stringify(body) }
        );
        const data = await transcriptResponse.json();

        const userMessage = data.results && data.results[0].alternatives[0].transcript || "";
        alert ('iiiiiiiiiiiiiii'+userMessage);
      }
    catch (error) {
      console.log("There was an error", error);
    }
    stopRecording();
  };

  return (
    <View style={styles.container}>

    < Translator />
    <Text style={styles.header}>The Dude Translate Awesome ! </Text>
    <Text style={styles.header}></Text>

      <Button
        title={isRecording ? "Je t'écoute" : "Commencer l'enregistrement !"}
        onPress={isRecording ? () => stopRecording() : () => startRecording()}
      />
      <Text style={styles.header}></Text>
      <Button
        title="Ecouter ce que tu as dit"
        onPress={isPLaying ? () => stopSound() : () => playSound()}
      />
      <Text style={styles.header}></Text>

      <Text style={styles.result}>{RecordedURI}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
    fontSize : 50,
  },
  result : {
    fontSize:15,
    color : 'magenta',
    fontWeight : 'bold',
    justifyContent: "center",
  },
  header : {
    alignItems: "center",
    justifyContent: "center",
    fontSize:20,
    color : 'black',
    fontWeight : 'bold',

  }
});
