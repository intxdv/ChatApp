import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { auth, /*signInAnonymously,*/ } from "./firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import { ActivityIndicator, View } from "react-native";

// import halaman
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ChatScreen from "./screens/ChatScreen";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Chat: { name: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // signInAnonymously(auth).catch(console.error);
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // if (!user) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // Uda login, tampilin halaman chat
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{ title: "Chat Room" }}
            initialParams={{ name: user.email || "User"}}
          />
        ) : (
          // Blum login
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ title: "Masuk Aplikasi" }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: "Daftar Akun Baru" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}