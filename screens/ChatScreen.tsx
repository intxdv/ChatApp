import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    ref, 
    uploadBytes, 
    getDownloadURL
} from "firebase/storage";
import { launchImageLibrary } from "react-native-image-picker";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  messagesCollection,
  storage
} from "../firebase";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { count } from "firebase/firestore";

type MessageType = {
  id: string;
  text: string;
  user: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
  imageUrl?: string; // tanda ? tu maksudnya opsional
};

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

export default function ChatScreen({ route }: Props) {
  const { name } = route.params;
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    // const q = query(messagesCollection, orderBy("createdAt", "asc"));
    // const unsub = onSnapshot(q, (snapshot) => {
    //   const list: MessageType[] = [];
    //   snapshot.forEach((doc) => {
    //     list.push({
    //       id: doc.id,
    //       ...(doc.data() as Omit<MessageType, "id">),
    //     });
    //   });
    //   setMessages(list);
    // });
    // return () => unsub();

    // A. Cek chat tersimpan di hp ngga, kalo ada tampilkan dulu
    const loadCache = async () => {
        try {
            const cachedMessages = await AsyncStorage.getItem("chat_history");
            if (cachedMessages) {
                setMessages(JSON.parse(cachedMessages));
            }
        } catch (error) {
            console.log("gagal memuat cache:", error);
        }
    };

    loadCache(); // Memanggil fungsi laod cache segera

    // B. Koneksi ke Firebase + fitur simpan
    const q = query(messagesCollection, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
        const list: MessageType[] = [];
        snapshot.forEach((doc) => {
            list.push({
                id: doc.id,
                ...(doc.data() as Omit<MessageType, "id">),
            });
        });

        setMessages(list); // Menampilkan data dari internet

        // C. Simpan data terbaru ke memori HP (cache)
        AsyncStorage.setItem("chat_history", JSON.stringify(list));
    });

    return () => unsub();
  }, []);

//   const sendMessage = async () => {
//     if (!message.trim()) return;
    
//     try {
//       await addDoc(messagesCollection, {
//         text: message,
//         user: name,
//         createdAt: serverTimestamp(),
//       });
//       setMessage("");
//     } catch (error) {
//       console.error("Error sending message:", error);
//     }
//   };

const sendMessage = async () => {
    console.log("1. Tombol ditekan"); 
    console.log("2. Isi pesan:", message); // Cek apa isi pesannya
    console.log("3. Nama pengirim:", name); // Cek siapa pengirimnya

    if (!message.trim()) {
      console.log("GAGAL: Pesan kosong"); // Log ke console juga
      Alert.alert("Debug Info", "Pesan dianggap kosong.");
      return;
    }
    
    if (!name) {
       console.log("GAGAL: Nama kosong"); // Log ke console juga
       Alert.alert("Debug Info", "Nama pengirim tidak ditemukan!");
       return;
    }

    console.log("4. Mencoba kirim ke Firebase..."); // Log sebelum aksi
    try {
      await addDoc(messagesCollection, {
        text: message,
        user: name,
        createdAt: serverTimestamp(),
      });
      console.log("5. BERHASIL TERKIRIM!"); 
      setMessage(""); 
    } catch (error: any) {
      console.error("ERROR:", error);
      Alert.alert("Gagal Kirim", error.message);
    }
  };

  const renderItem = ({ item }: { item: MessageType }) => {
    const isMyMessage = item.user === name;
    
    return (
      <View
        style={[
          styles.msgBox,
          isMyMessage ? styles.myMsg : styles.otherMsg,
        ]}
      >
        <Text style={styles.sender}>{item.user}</Text>
        <Text style={styles.msgText}>{item.text}</Text>
      </View>
    );
  };

  const [imageUri, setImageUri] = useState<string | null>(null); // State buat gambar sementara

  // Fungsi buat buka galeri HP
  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.5 }, (response) => {
        if (response.didCancel) {
            console.log('User batal pilih gambar');
        } else if (response.errorMessage) {
            console.log('Error ImagePicker: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
            const source = response.assets[0].uri;
            setImageUri(source || null); // Simpen gambar yg dipilih
        }
    });
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        inverted={false}
        style={{ flex: 1 }}
      />
      
      <View style={styles.inputContainer}>
        <TouchableOpacity
            style={styles.attachButton}
            onPress={pickImage}
        >
            <Text style={styles.attachText}>+</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Ketik pesan..."
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={sendMessage}
          activeOpacity={0.7}
        >
          <Text style={styles.sendButtonText}>Kirim</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  msgBox: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 12,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myMsg: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
  },
  otherMsg: {
    backgroundColor: "#E5E5EA",
    alignSelf: "flex-start",
  },
  sender: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 12,
    color: "#666",
  },
  msgText: {
    fontSize: 15,
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    maxHeight: 100,
    minHeight: 45,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  attachButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    paddingHorizontal: 5,
  },
  attachText: {
    fontSize: 30,
    color: "#007AFF",
  }
});