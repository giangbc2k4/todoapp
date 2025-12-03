// screens/LoginScreen.tsx
import React from "react";
import { View, Text, Alert } from "react-native";
import Screen from "../components/ui/Screen";
import LoginForm from "../components/auth/LoginForm";
import Icon from "react-native-vector-icons/Feather";
import { login } from "../api/auth";
import { StoredUser } from "../storage/authStorage";

type LoginScreenProps = {
  onAuthSuccess: (token: string, user: StoredUser) => void;
  onGoSignup: () => void;
};

const LoginScreen: React.FC<LoginScreenProps> = ({
  onAuthSuccess,
  onGoSignup,
}) => {
  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      const res = await login(values.email, values.password);
      const user: StoredUser = {
        email: res.user.email,
        displayName: res.user.displayName,
      };
      onAuthSuccess(res.token, user);
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert(
        "Đăng nhập thất bại",
        error?.message || "Vui lòng kiểm tra lại email / mật khẩu."
      );
    }
  };

  const handleSignupPress = () => {
    onGoSignup();
  };

  return (
    <Screen centerContent>
      {/* Background accent */}
      <View className="absolute -top-10 -right-16 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />
      <View className="absolute bottom-0 -left-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

      <View className="gap-8">
        {/* Brand section */}
        <View className="items-center">
          <View className="h-14 w-14 rounded-2xl bg-sky-500 items-center justify-center shadow-xl shadow-sky-500/40 mb-3">
            <Icon name="check-square" size={28} color="#020617" />
          </View>

          <Text className="text-2xl font-bold text-slate-50">FocusTodo</Text>
          <Text className="text-sm text-slate-400 mt-1 text-center">
            Tập trung hoàn thành từng đầu việc mỗi ngày.
          </Text>
        </View>

        <LoginForm
          onSubmit={handleLogin}
          onSignupPress={handleSignupPress}
        />
      </View>
    </Screen>
  );
};

export default LoginScreen;
