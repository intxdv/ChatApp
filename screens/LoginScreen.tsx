import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  Alert,
  StatusBar 
} from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import {
    auth,
    signInWithEmailAndPassword,
} from "../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = async () => {
    // Validasi
    if (!username.trim() || !password.trim()) {
        Alert.alert("Error", "Username dan Password tidak boleh kosong!");
        return;
    }

    try {
        // Konversi username ke email format
        const email = `${username.toLowerCase().trim()}@chatapp.local`;

        console.log("Mencoba login dengan:", email);

        // Login ke Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Simpan username untuk display
        await AsyncStorage.setItem("user_display_name", username);

        console.log("Login berhasil!");
        // App.tsx akan otomatis redirect ke Chat
        
    } catch (error: any) {
        console.error("Error login:", error);
        
        let errorMessage = "Username atau password salah!";
        if (error.code === "auth/user-not-found") {
            errorMessage = "Username tidak ditemukan!";
        } else if (error.code === "auth/wrong-password") {
            errorMessage = "Password salah!";
        } else if (error.code === "auth/too-many-requests") {
            errorMessage = "Terlalu banyak percobaan. Coba lagi nanti.";
        }
        
        Alert.alert("Login Gagal", errorMessage);
    }
  };

  return (
    <LinearGradient
      colors={['#2f3136', '#202225']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#202225" />
      
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Chat App</Text>
          <Text style={styles.subtitle}>Masuk ke akun kamu</Text>
        </View>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            returnKeyType="next"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Masuk</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate("Register")}
          activeOpacity={0.8}
        >    
          <Text style={styles.linkText}>Belum punya akun? Daftar di sini</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: { 
    fontSize: 32, 
    fontWeight: "bold",
    textAlign: "center", 
    marginBottom: 8,
    color: "#ffffff",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.7)",
  },
  card: {
    backgroundColor: "#2f3136",
    borderRadius: 12,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  input: {
    backgroundColor: "#40444b",
    borderWidth: 0,
    padding: 16,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    color: "#ffffff",
  },
  button: {
    backgroundColor: "#5865f2",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  linkButton: {
    marginTop: 25,
    alignItems: "center",
  },
  linkText: {
    color: "#b9bbbe",
    fontSize: 15,
    fontWeight: "600",
  },
});