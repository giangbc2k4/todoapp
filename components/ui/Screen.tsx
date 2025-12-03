// components/ui/Screen.tsx
import React from "react";
import { View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = {
  children: React.ReactNode;
  centerContent?: boolean;
};

const Screen: React.FC<ScreenProps> = ({ children, centerContent }) => {
  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <View
        className={`flex-1 px-4 ${centerContent ? "justify-center" : ""}`}
        style={{ paddingTop: 20 }} // 👈 tụt cả màn xuống 20px
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

export default Screen;
