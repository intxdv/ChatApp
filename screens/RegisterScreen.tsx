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

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleRegister = () => {
    if(!email.trim() || !password.trim()) {
        Alert.alert("Error", "Email dan Password tidak boleh kosong!")
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Berhasil
            const user = userCredential.user;
            console.log("Register berhasil!", user.email);

            // Navigate ke Chat
            // navigation.replace("Chat", {name}); gajadi, uda dihandle di App.tsx
        })
        .catch((error) => {
            // Gagal
            Alert.alert("Gagal Daftar", error.message);
        });
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Chat App</Text>
      <Text style={styles.subtitle}>Masukkan Email dan Password</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nama kamu"
        value={name}
        autoCapitalize="words"
        onChangeText={setName}
        onSubmitEditing={handleRegister}
      />
      <TextInput
        style={styles.input}
        // placeholder="Nama kamu"
        // value={name}
        // onChangeText={setName}
        placeholder="Email kamu"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        returnKeyType="done"
        onSubmitEditing={handleRegister}
      />

      <TextInput
        style={styles.input}
        placeholder="Password-nya apa??"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        returnKeyType="done"
        onSubmitEditing={handleRegister}
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleRegister}
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

