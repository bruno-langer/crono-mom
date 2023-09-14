import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './app/pages/Home';
import Details from './app/pages/Details';
import Login from './app/pages/Login';
import CreateUser from './app/pages/CreateUser';
import Options from './app/pages/Options';
import { createContext, useState, SetStateAction, Dispatch } from 'react';


const Stack = createNativeStackNavigator();

export const TokenContext = createContext<{ token: string, setToken: Function }>({
  token: "",
  setToken: () => { },
})

export default function App() {

  const [token, setToken] = useState("");

  return (
    <TokenContext.Provider value={{ token, setToken }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="CreateUser" component={CreateUser} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerBackVisible: false, }} />
          <Stack.Screen name="Details" component={Details} />
          <Stack.Screen name="Options" component={Options} />
        </Stack.Navigator>
      </NavigationContainer>
    </TokenContext.Provider>
  );
}
