import React, { useState, useEffect } from 'react';
import { Text, View, Button, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import axios from 'axios';
import google_api_key from './keys/google_api_key';

export default function App() {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const type = Camera.Constants.Type.back;
  const [loading, setLoading] = useState<boolean>(false);
  const [text, setText] = useState<string>('');
  let camera: Camera | null;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if(camera) {
      setLoading(true);
      let photo = await camera.takePictureAsync({ base64: true });
      axios.post(`https://vision.googleapis.com/v1/images:annotate?key=${google_api_key}`, { 
        requests: [
          {
            image: {
              content: photo.base64
            },
            features: [
              {
                type: "TEXT_DETECTION"
              }
            ]
          }
        ] 
      })
      .then(res => setText(res.data.responses[0].textAnnotations[0].description))
      .finally(() => setLoading(false));
    }
  }

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View>
      <Camera 
        type={type}
        ref={ref => {
          camera = ref;
        }}
      >
        <View
          style={{
            width: 300,
            height: 300,
            backgroundColor: 'transparent',
            flexDirection: 'row',
          }}>
        </View>
      </Camera>
      <Button title="Take Picture" onPress={() => takePicture()} disabled={loading}></Button>
      <Text>{text}</Text>
    </View>
  );
}
