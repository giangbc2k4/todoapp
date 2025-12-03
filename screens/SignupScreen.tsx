// screens/SignupScreen.tsx
import React from "react";
import { View, Text, Alert } from "react-native";
import Screen from "../components/ui/Screen";
import SignupForm from "../components/auth/SignupForm";
import Icon from "react-native-vector-icons/Feather";
import { signup } from "../api/auth";

type SignupScreenProps = {
  onGoLogin: () => void;
};

const SignupScreen: React.FC<SignupScreenProps> = ({ onGoLogin }) => {
  const handleSignup = async (values: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      // name trên form == displayName trên backend
      const res = await signup(values.name, values.email, values.password);

      Alert.alert("Thành công", res.message || "Tạo tài khoản thành công", [
        {
          text: "Đăng nhập",
          onPress: onGoLogin,
        },
      ]);
    } catch (error: any) {
      console.error("Signup error:", error);
      Alert.alert(
        "Đăng ký thất bại",
        error?.message || "Vui lòng kiểm tra lại thông tin."
      );
    }
  };

  const handleLoginPress = () => {
    onGoLogin();
  };

  return (
    <Screen centerContent>
      {/* Background accent */}
      <View className="absolute -top-10 -left-16 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
      <View className="absolute bottom-0 -right-10 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />

      <View className="gap-8">
        {/* Brand section */}
        <View className="items-center">
          <View className="h-14 w-14 rounded-2xl bg-emerald-400 items-center justify-center shadow-xl shadow-emerald-400/40 mb-3">
            <Icon name="user-plus" size={26} color="#020617" />
          </View>

          <Text className="text-2xl font-bold text-slate-50">
            Tạo tài khoản mới
          </Text>
          <Text className="text-sm text-slate-400 mt-1 text-center">
            Chỉ vài bước nữa để bạn bắt đầu quản lý mọi việc trong ngày.
          </Text>
        </View>

        <SignupForm
          onSubmit={handleSignup}
          onLoginPress={handleLoginPress}
        />
      </View>
    </Screen>
  );
};

export default SignupScreen;
