// screens/CreateTaskScreen.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import Screen from "../components/ui/Screen";
import TaskForm, { TaskFormValues } from "../components/tasks/TaskForm";
import Icon from "react-native-vector-icons/Feather";
import { createTask } from "../api/tasks";

type CreateTaskScreenProps = {
  token: string;
  onDone: () => void; // về TaskList
  onBack: () => void; // nút back trên header
};

const CreateTaskScreen: React.FC<CreateTaskScreenProps> = ({
  token,
  onDone,
  onBack,
}) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: TaskFormValues) => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const res = await createTask(values, token);
      console.log("Create task ok:", res.message);
      onDone(); 
    } catch (error: any) {
      console.error("Create task error:", error);
      Alert.alert(
        "Lỗi",
        error?.message || "Không thể tạo task mới, vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!submitting) {
      onBack();
    }
  };

  return (
    <Screen>
      {/* Background accent */}
      <View className="absolute -top-10 -left-16 h-52 w-52 rounded-full bg-sky-500/20 blur-3xl" />
      <View className="absolute top-24 -right-10 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl" />
      <View className="absolute bottom-0 -left-10 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />

      {/* Header */}
      <View className="pt-8 pb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleCancel}
            activeOpacity={0.8}
            className="h-9 w-9 rounded-full bg-slate-900/80 border border-slate-700 items-center justify-center mr-3"
          >
            <Icon name="chevron-left" size={18} color="#e5e7eb" />
          </TouchableOpacity>
          <View>
            <Text className="text-xs text-slate-400">Tạo mới</Text>
            <Text className="text-lg font-semibold text-slate-50">
              Task mới
            </Text>
          </View>
        </View>

        <View className="h-9 w-9 rounded-2xl bg-slate-900/80 border border-slate-700 items-center justify-center">
          <Icon name="edit-3" size={17} color="#e5e7eb" />
        </View>
      </View>

      <View className="flex-1">
        <TaskForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </View>
    </Screen>
  );
};

export default CreateTaskScreen;
