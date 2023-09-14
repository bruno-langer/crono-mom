import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';



export default function App() {

  const [isCouting, setCounting] = useState(false)
  const [startTime, setStartTime] = useState(() => Date.now())
  const [diffTime, setDiffTime] = useState(0)

  useEffect(() => {
    const time = setInterval(() => {
      setDiffTime(Date.now() - startTime)
    }, [])
    return () => clearInterval(time)
  }, [startTime])



  return (
    <View style={styles.container}>
      <Text>Contador tempo contração</Text>
      <Text>{isCouting ? Math.floor(diffTime / 1000) : ""}</Text>
      <Button onPress={() => {
        setStartTime(Date.now())
        setCounting(true)
      }}
        title="Começar"
      />
      <Button onPress={() => {
        setDiffTime(0)
        setCounting(false)
        setStartTime(Date.now())
      }} title="Parar" />
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
