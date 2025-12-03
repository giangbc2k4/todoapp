// components/auth/SignupForm.tsx
import React, { useEffect, useRef, useState } from "react";
import { Animated, View, Text } from "react-native";
import Input from "../ui/Input";
import Button from "../ui/Button";

interface SignupFormProps {
  onSubmit?: (values: { name: string; email: string; password: string }) => void;
  onLoginPress?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({
  onSubmit,
  onLoginPress,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [nameError, setNameError] = useState<string | undefined>();
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

  const handleSignupPress = () => {
    setNameError(undefined);
    setEmailError(undefined);
    setPasswordError(undefined);
    setFormError(undefined);

    let hasError = false;

    if (!name.trim()) {
      setNameError("Vui lòng nhập tên hiển thị");
      hasError = true;
    }

    if (!email.trim()) {
      setEmailError("Vui lòng nhập email");
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError("Vui lòng nhập mật khẩu");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (onSubmit) {
        onSubmit({
          name: name.trim(),
          email: email.trim(),
          password,
        });
      } else {
        console.log("Signup with:", { name, email, password });
      }
    }, 700);
  };

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
        borderRadius: 24,
        backgroundColor: "rgba(15,23,42,0.85)", // bg-slate-900/85
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(30,64,175,0.6)",
        shadowColor: "#22c55e",
        shadowOpacity: 0.25,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 12 },
        elevation: 10,
      }}
    >
      <View className="space-y-1">
        <Text className="text-xl font-semibold text-slate-50">
          Tạo tài khoản ✨
        </Text>
        <Text className="text-sm text-slate-400">
          Chỉ mất vài giây để bắt đầu sắp xếp công việc của bạn.
        </Text>
      </View>

      <View className="h-3" />

      <Input
        label="Tên hiển thị"
        placeholder="Ví dụ: Minh, An, ..."
        value={name}
        onChangeText={setName}
        error={nameError}
        leftIconName="user"
      />

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

      <View className="mt-2" />

      <Button
        title="Đăng ký"
        onPress={handleSignupPress}
        loading={loading}
        fullWidth
      />

      <Button
        title="Đã có tài khoản? Đăng nhập"
        onPress={onLoginPress || (() => {})}
        variant="outline"
        fullWidth
      />
    </Animated.View>
  );
};

export default SignupForm;
