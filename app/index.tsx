import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { login } from "../scripts/api";
import '../global.css'

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const response = await login({ username, password });
      await AsyncStorage.setItem("token", response.data.data.access_token);
      //@ts-ignore
      navigation.navigate("dashboard");
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Xatolik",
        text2: "Notog‘ri login yoki parol terilgan",
      });
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-[#002A50] px-4">
      <View className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <Text className="mb-6 text-2xl font-bold text-center text-[#002A50]">
          Login
        </Text>
        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700">Login</Text>
            <TextInput
              className="w-full px-3 py-2 mt-1 border rounded-md focus:border-[#002A50]"
              placeholder="Login kiriting"
              value={username}
              onChangeText={setUsername}
            />
          </View>
          <View>
            <Text className="text-sm font-medium text-gray-700">Password</Text>
            <TextInput
              className="w-full px-3 py-2 mt-1 border rounded-md focus:border-[#002A50]"
              placeholder="Parol kiriting"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
          <TouchableOpacity
            onPress={handleLogin}
            className="w-full px-4 py-2 mt-6 text-white bg-[#002A50] rounded-md items-center"
          >
            <Text className="text-white text-lg">Kirish</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginPage;
