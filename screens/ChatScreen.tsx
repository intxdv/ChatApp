import AsyncStorage from "@react-native-async-storage/async-storage";
import { launchImageLibrary } from "react-native-image-picker";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import {
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  messagesCollection,
  auth,
} from "../firebase";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type MessageType = {
  id: string;
  text: string;
  user: string;
  userName?: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
  imageBase64?: string;
};

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

export default function ChatScreen({ route, navigation }: Props) {
  const { name } = route.params;
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const flatListRef = useRef<FlatList>(null);
  
  // Load username dari AsyncStorage
  useEffect(() => {
    const loadUserName = async () => {
      try {
        const savedName = await AsyncStorage.getItem("user_display_name");
        if (savedName) {
          setUserName(savedName);
        } else {
          setUserName(name.split('@')[0]);
        }
      } catch (error) {
        console.log("Error loading username:", error);
        setUserName(name.split('@')[0]);
      }
    };
    loadUserName();
  }, [name]);

  const requestPermission = async() => {
    if (Platform.OS !== 'android') return true;

    try {
      const permission = Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;   
      const granted = await PermissionsAndroid.request(permission, {
        title: "Izin Akses Galeri",
        message: "Aplikasi butuh akses galeri untuk mengirim gambar.",
        buttonNeutral: "Nanti",
        buttonNegative: "Tolak",
        buttonPositive: "Izinkan",
      });

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  useEffect(() => {
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

    loadCache();

    const q = query(messagesCollection, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
        const list: MessageType[] = [];
        snapshot.forEach((doc) => {
            list.push({
                id: doc.id,
                ...(doc.data() as Omit<MessageType, "id">),
            });
        });

        setMessages(list);
        AsyncStorage.setItem("chat_history", JSON.stringify(list));
        
        // Auto scroll ke bawah setelah ada pesan baru
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    });

    return () => unsub();
  }, []);

  const sendMessage = async () => {
    if (!message.trim() && !imageBase64) {
      Alert.alert("Eits!", "Ketik pesan atau pilih gambar dulu dong.");
      return;
    }

    try {
      if (imageBase64) {
        const sizeInBytes = imageBase64.length * 0.75;
        const sizeInKB = sizeInBytes / 1024;
        
        if (sizeInKB > 800) {
          Alert.alert(
            "Gambar Terlalu Besar", 
            `Ukuran gambar ${sizeInKB.toFixed(0)}KB. Max 800KB.\n\nCoba pilih gambar yang lebih kecil.`
          );
          return;
        }
      }

      await addDoc(messagesCollection, {
        text: message,
        user: name,
        userName: userName,
        createdAt: serverTimestamp(),
        imageBase64: imageBase64 || null,
      });

      setMessage("");
      setImageUri(null);
      setImageBase64(null);
      
      // Tutup keyboard setelah kirim
      Keyboard.dismiss();

    } catch (error: any) {
      console.error("ERROR DETAIL:", error);
      
      let errorMsg = error.message;
      if (error.code === 'invalid-argument') {
        errorMsg = "Gambar terlalu besar untuk Firestore. Coba gambar yang lebih kecil.";
      }
      
      Alert.alert("Gagal Kirim", errorMsg);
    }
  };

  const renderItem = ({ item }: { item: MessageType }) => {
      const isMyMessage = item.user === name;
      const displayName = item.userName || item.user.split('@')[0];
      
      return (
        <View
          style={[
            styles.msgBox,
            isMyMessage ? styles.myMsg : styles.otherMsg,
          ]}
        >
          {!isMyMessage && (
            <Text style={styles.sender}>{displayName}</Text>
          )}

          {item.imageBase64 && (
            <Image
              source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          )}

          {item.text ? (
            <Text style={styles.msgText}>
              {item.text}
            </Text>
          ) : null}
        </View>
      );
  };

  const pickImage = async () => {
      const hasPermission = await requestPermission();
      if(!hasPermission) {
        Alert.alert("Ditolak", "Gagal membuka galeri karena izin ditolak.");
        return;
      }

      launchImageLibrary({ 
        mediaType: 'photo', 
        quality: 0.3,
        maxWidth: 800,
        maxHeight: 800,
        includeBase64: true,
      }, (response) => {
          if (response.didCancel) {
              console.log('User batal pilih gambar');
          } else if (response.errorMessage) {
              console.log('Error ImagePicker: ', response.errorMessage);
          } else if (response.assets && response.assets.length > 0) {
              const asset = response.assets[0];
              
              if (asset.fileSize && asset.fileSize > 1024 * 1024) {
                Alert.alert(
                  "Gambar Terlalu Besar",
                  "Pilih gambar yang lebih kecil (max 1MB)"
                );
                return;
              }
              
              setImageUri(asset.uri || null);
              setImageBase64(asset.base64 || null);
          }
      });
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Yakin mau keluar?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          onPress: async () => {
            try {
              await auth.signOut();
              await AsyncStorage.removeItem("user_display_name");
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  const handleSwitchUser = () => {
    Alert.alert(
      "Ganti User",
      "Yakin mau ganti user? Kamu harus login lagi.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Ganti",
          onPress: async () => {
            try {
              await auth.signOut();
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="light-content" backgroundColor="#202225" translucent={false} />
      
      {/* Header dengan gradient */}
      <LinearGradient
        colors={['#2f3136', '#202225']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>Chat Room</Text>
              <Text style={styles.headerSubtitle}>{userName}</Text>
            </View>
          </View>
          
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={handleSwitchUser}
              activeOpacity={0.7}
            >
              <Text style={styles.headerButtonText}>👥</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.headerButtonText}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        style={styles.flatList}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      
        {imageUri && (
          <View style={styles.previewContainer}>
              <Image
                  source={{ uri: imageUri }}
                  style={styles.previewImage}
              />
              <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => {
                    setImageUri(null);
                    setImageBase64(null);
                  }}
              >
                  <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
          </View> 
        )}
        
        <View style={styles.inputContainer}>
          <TouchableOpacity
              style={styles.attachButton}
              onPress={pickImage}
          >
              <Text style={styles.attachText}>📎</Text>
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder="Ketik pesan..."
            placeholderTextColor="#72767d"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={sendMessage}
            activeOpacity={0.7}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#36393f",
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#5865f2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 1,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonText: {
    fontSize: 18,
  },
  flatList: {
    flex: 1,
  },
  listContainer: {
    padding: 12,
    paddingBottom: 20,
  },
  msgBox: {
    padding: 10,
    paddingHorizontal: 12,
    marginVertical: 3,
    borderRadius: 8,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  myMsg: {
    backgroundColor: "rgba(88, 101, 242, 0.95)",
    alignSelf: "flex-end",
    marginLeft: 60,
  },
  otherMsg: {
    backgroundColor: "rgba(47, 49, 54, 0.95)",
    alignSelf: "flex-start",
    marginRight: 60,
  },
  sender: {
    fontWeight: "600",
    marginBottom: 3,
    fontSize: 12,
    color: "#b9bbbe",
  },
  msgText: {
    fontSize: 14.5,
    color: "#ffffff",
    lineHeight: 19,
  },
  messageImage: {
    width: 220,
    height: 165,
    borderRadius: 6,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    paddingHorizontal: 10,
    backgroundColor: "#2f3136",
    alignItems: "center",
    gap: 6,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: "#40444b",
    maxHeight: 100,
    minHeight: 40,
    fontSize: 15,
    color: "#dcddde",
  },
  sendButton: {
    backgroundColor: "#5865f2",
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
  },
  attachButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
  },
  attachText: {
    fontSize: 22,
    opacity: 0.7,
  },
  previewContainer: {
    padding: 10,
    backgroundColor: "#2f3136",
    flexDirection: "row",
    alignItems: "center",
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: 6,
    left: 68,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});