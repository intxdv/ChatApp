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
    createUserWithEmailAndPassword,
    db,
} from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleRegister = async () => {
    // Validasi
    if(!username.trim() || !password.trim()) {
        Alert.alert("Error", "Username dan Password tidak boleh kosong!");
        return;
    }

    if (username.length < 3) {
        Alert.alert("Error", "Username minimal 3 karakter!");
        return;
    }

    if (password.length < 6) {
        Alert.alert("Error", "Password minimal 6 karakter!");
        return;
    }

    if (password !== confirmPassword) {
        Alert.alert("Error", "Password tidak cocok!");
        return;
    }

    try {
        // Buat email palsu dari username untuk Firebase Auth
        // Format: username@chatapp.local
        const email = `${username.toLowerCase().trim()}@chatapp.local`;

        console.log("Mendaftarkan dengan email:", email);

        // 1. Buat akun di Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("User berhasil dibuat:", user.uid);

        // 2. Simpan username ke Firestore (untuk referensi)
        await setDoc(doc(db, "users", user.uid), {
            username: username,
            email: email,
            createdAt: new Date(),
        });

        // 3. Simpan username ke AsyncStorage untuk digunakan di chat
        await AsyncStorage.setItem("user_display_name", username);

        console.log("Register berhasil!");
        Alert.alert("Sukses", "Akun berhasil dibuat!");

    } catch (error: any) {
        console.error("Error register:", error);
        
        // Handle error messages
        let errorMessage = error.message;
        if (error.code === "auth/email-already-in-use") {
            errorMessage = "Username sudah digunakan!";
        } else if (error.code === "auth/weak-password") {
            errorMessage = "Password terlalu lemah!";
        }
        
        Alert.alert("Gagal Daftar", errorMessage);
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
          <Text style={styles.title}>Daftar Akun</Text>
          <Text style={styles.subtitle}>Buat akun baru untuk memulai</Text>
        </View>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Username (min 3 karakter)"
            placeholderTextColor="#72767d"
            value={username}
            autoCapitalize="none"
            onChangeText={setUsername}
            returnKeyType="next"
          />

          <TextInput
            style={styles.input}
            placeholder="Password (min 6 karakter)"
            placeholderTextColor="#72767d"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            returnKeyType="next"
          />

          <TextInput
            style={styles.input}
            placeholder="Konfirmasi Password"
            placeholderTextColor="#72767d"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Daftar Sekarang</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >    
          <Text style={styles.linkText}>Sudah punya akun? Login di sini</Text>
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