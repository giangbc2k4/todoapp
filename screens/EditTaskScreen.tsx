// screens/EditTaskScreen.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import Screen from "../components/ui/Screen";
import TaskForm, {
  TaskFormValues,
} from "../components/tasks/TaskForm";
import { Task } from "../components/tasks/TaskItem";
import Icon from "react-native-vector-icons/Feather";
import { updateTask, deleteTask } from "../api/tasks";

type EditTaskScreenProps = {
  token: string;
  task: Task;
  onDone: () => void; // quay về TaskList và (tuỳ bạn) reload
  onBack: () => void; // nút back trên header
};

const EditTaskScreen: React.FC<EditTaskScreenProps> = ({
  token,
  task,
  onDone,
  onBack,
}) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: TaskFormValues) => {
    if (submitting) return;
    try {
      setSubmitting(true);
      await updateTask(task.id, values, token);
      onDone(); // quay về TaskList
    } catch (error: any) {
      console.error("Update task error:", error);
      Alert.alert(
        "Lỗi",
        error?.message || "Không thể cập nhật task, vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!submitting) onBack();
  };

  const handleDelete = () => {
    if (submitting) return;

    Alert.alert("Xoá task", "Bạn có chắc muốn xoá task này?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            setSubmitting(true);
            await deleteTask(task.id, token);
            onDone();
          } catch (error: any) {
            console.error("Delete task error:", error);
            Alert.alert(
              "Lỗi",
              error?.message || "Không thể xoá task, vui lòng thử lại."
            );
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
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
          <View className="max-w-[220px]">
            <Text className="text-xs text-slate-400">Chỉnh sửa</Text>
            <Text
              className="text-lg font-semibold text-slate-50"
              numberOfLines={1}
            >
              {task.title}
            </Text>
          </View>
        </View>

        
      </View>

      <View className="flex-1">
        <TaskForm
          mode="edit"
          initialValues={{
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            completed: task.completed,
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </View>
    </Screen>
  );
};

export default EditTaskScreen;
