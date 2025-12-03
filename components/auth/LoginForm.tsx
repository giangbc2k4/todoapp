// components/auth/LoginForm.tsx
import React, { useEffect, useRef, useState } from "react";
import { Animated, View, Text } from "react-native";
import Input from "../ui/Input";
import Button from "../ui/Button";

interface LoginFormProps {
  onSubmit?: (values: { email: string; password: string }) => Promise<void> | void;
  onSignupPress?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, onSignupPress }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  const handleLoginPress = async () => {
    if (loading) return;

    setEmailError(undefined);
    setPasswordError(undefined);
    setFormError(undefined);

    let hasError = false;

    if (!email.trim()) {
      setEmailError("Vui lòng nhập email");
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError("Vui lòng nhập mật khẩu");
      hasError = true;
    }

    if (hasError) return;

    if (!onSubmit) {
      console.log("Login with:", { email, password });
      return;
    }

    try {
      setLoading(true);
      await onSubmit({ email: email.trim(), password });
    } catch (err: any) {
      console.log("LoginForm error:", err);
      setFormError(
        err?.message || "Đăng nhập thất bại, vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
      }}
    >
      {/* Card duy nhất bao hết header + input + button */}
      <View
        style={{
          borderRadius: 28,
          backgroundColor: "rgba(15,23,42,0.92)", // slate-950/92
          paddingHorizontal: 20,
          paddingVertical: 20,
          borderWidth: 1,
          borderColor: "rgba(56,189,248,0.6)", // sky-500-ish
          shadowColor: "#0ea5e9",
          shadowOpacity: 0.4,
          shadowRadius: 2000,
          shadowOffset: { width: 0, height: 16 },
          elevation: 12,
        }}
      >
        {/* HEADER FORM */}
        <View className="mb-4">
          <Text className="text-xl font-semibold text-slate-50">
            Chào mừng trở lại
          </Text>
          <Text className="text-sm text-slate-400 mt-1">
            Đăng nhập để tiếp tục quản lý công việc của bạn.
          </Text>
        </View>

        {/* INPUTS */}
        <Input
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          leftIconName="mail"
        />

        <Input
          label="Mật khẩu"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={passwordError}
          leftIconName="lock"
        />

        {formError && (
          <Text className="text-xs text-rose-400 mt-1">{formError}</Text>
        )}

        {/* BUTTONS */}
        <View className="mt-3">
          <Button
            title="Đăng nhập"
            onPress={handleLoginPress}
            loading={loading}
            fullWidth
          />
        </View>

        <View className="mt-2">
          <Button
            title="Tạo tài khoản mới"
            onPress={onSignupPress || (() => {})}
            variant="outline"
            fullWidth
          />
        </View>
      </View>
    </Animated.View>
  );
};

export default LoginForm;
