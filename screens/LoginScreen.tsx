import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  Alert 
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import {
    auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from "../firebase"

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
//   const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = () => {
    // if (!name.trim()) {
    //   Alert.alert("Error", "Nama tidak boleh kosong!");
    //   return;
    // }
    
    // 1. Cek form gabole kosong
    if (!email.trim() || !password.trim()) {
        Alert.alert("Error", "Email dan Password tidak boleh kosong!");
        return;
    }

    // 2. Panggil Firebase untuk cek password
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Berhasil
            // App.tsx otomatis mendeteksi user login dan mindahin ke halaman chat
            console.log("Login berhasil!");
        })
        .catch((error) => {
            // Gagal
            Alert.alert("Login Gagal", error.message);
        });
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Chat App</Text>
      <Text style={styles.subtitle}>Masukkan Email dan Password</Text>
      
      {/* <TextInput
        style={styles.input}
        // placeholder="Nama kamu"
        // value={name}
        // onChangeText={setName}
      /> */}

      <TextInput
        style={styles.input}
        placeholder="Email kamu"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        returnKeyType="done"
        onSubmitEditing={handleLogin}
      />
      <TextInput
        style={styles.input}
        placeholder="Password-nya apa??"
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
        <Text style={styles.buttonText}>Masuk Chat</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Register")}
        activeOpacity={0.8}
      >    
        <Text style={styles.buttonText}>Daftar Akun Baru</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 20,
    backgroundColor: "#f5f5f5"
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold",
    textAlign: "center", 
    marginBottom: 10,
    color: "#333"
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666"
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

