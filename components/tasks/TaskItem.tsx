// components/tasks/TaskItem.tsx
import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  GestureResponderEvent,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

export type DueStatus = "none" | "today" | "overdue" | "upcoming";

export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  userId?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

type TaskItemProps = {
  task: Task;
  dueLabel?: string;
  dueStatus: DueStatus;
  onToggle: (id: string) => void;
  onPress: (id: string) => void; // chạm card → xem chi tiết (mở modal)
  onDelete?: (id: string) => void; // xoá
  onQuickEdit?: (id: string) => void; // sửa nhanh (icon bút)
};

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  dueLabel,
  dueStatus,
  onToggle,
  onPress,
  onDelete,
  onQuickEdit,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: GestureResponderEvent) => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handleTogglePress = () => {
    onToggle(task.id);
  };

  const handleCardPress = () => {
    onPress(task.id);
  };

  const handleDeletePress = () => {
    if (onDelete) {
      onDelete(task.id);
    }
  };

  const handleQuickEditPress = () => {
    if (onQuickEdit) {
      onQuickEdit(task.id);
    } else {
      onPress(task.id);
    }
  };

  const isCompleted = task.completed;

  const dueChipClasses =
    dueStatus === "overdue"
      ? "bg-rose-500/15 border border-rose-500/40"
      : dueStatus === "today"
      ? "bg-sky-500/15 border border-sky-500/40"
      : dueStatus === "upcoming"
      ? "bg-amber-500/10 border border-amber-500/30"
      : "bg-slate-900/70 border border-slate-800/80";

  const dueTextClasses =
    dueStatus === "overdue"
      ? "text-rose-300"
      : dueStatus === "today"
      ? "text-sky-300"
      : dueStatus === "upcoming"
      ? "text-amber-200"
      : "text-slate-400";

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
      }}
      className="mb-2"
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleCardPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden"
      >
        {/* Left accent bar */}
        <View className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-sky-500 via-indigo-500 to-emerald-400 opacity-70" />

        <View className="flex-row p-3 pl-4">
          {/* Checkbox */}
          <TouchableOpacity
            onPress={handleTogglePress}
            activeOpacity={0.8}
            className="mr-3 mt-1"
          >
            <View
              className={`h-6 w-6 rounded-full items-center justify-center border ${
                isCompleted
                  ? "bg-emerald-500 border-emerald-400"
                  : "border-slate-600 bg-slate-950/60"
              }`}
            >
              {isCompleted ? (
                <Icon name="check" size={14} color="#020617" />
              ) : (
                <Icon name="circle" size={10} color="#64748b" />
              )}
            </View>
          </TouchableOpacity>

          {/* Content */}
          <View className="flex-1">
            {/* Title + due + quick actions */}
            <View className="flex-row items-center justify-between">
              <Text
                className={`text-[15px] font-semibold ${
                  isCompleted ? "text-slate-500 line-through" : "text-slate-50"
                }`}
                numberOfLines={1}
              >
                {task.title}
              </Text>

              <View className="flex-row items-center ml-2">
                {dueLabel && (
                  <View
                    className={`px-2 py-0.5 rounded-full flex-row items-center mr-2 ${dueChipClasses}`}
                  >
                    <View className="h-1.5 w-1.5 rounded-full bg-current mr-1" />
                    <Text
                      className={`text-[10px] font-medium ${dueTextClasses}`}
                    >
                      {dueLabel}
                    </Text>
                  </View>
                )}

                {/* Nút sửa nhanh */}
                <TouchableOpacity
                  onPress={handleQuickEditPress}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  activeOpacity={0.8}
                  className="h-7 w-7 rounded-full bg-sky-500/15 border border-sky-500/60 items-center justify-center mr-1"
                >
                  <Icon name="edit-3" size={13} color="#38bdf8" />
                </TouchableOpacity>

                {/* Nút xoá */}
                {onDelete && (
                  <TouchableOpacity
                    onPress={handleDeletePress}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    activeOpacity={0.8}
                    className="h-7 w-7 rounded-full bg-rose-500/15 border border-rose-500/50 items-center justify-center"
                  >
                    <Icon name="trash-2" size={13} color="#fb7185" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {!!task.description && (
              <Text
                className={`text-[12px] mt-1 ${
                  isCompleted ? "text-slate-600 line-through" : "text-slate-400"
                }`}
                numberOfLines={2}
              >
                {task.description}
              </Text>
            )}

            <View className="flex-row items-center mt-2">
              {isCompleted ? (
                <View className="flex-row items-center mr-3">
                  <Icon name="check-circle" size={13} color="#4ade80" />
                  <Text className="text-[11px] text-emerald-300 ml-1">
                    Đã hoàn thành
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center mr-3">
                  <Icon name="activity" size={13} color="#38bdf8" />
                  <Text className="text-[11px] text-sky-300 ml-1">
                    Đang chờ
                  </Text>
                </View>
              )}

              <View className="flex-row items-center">
                <Icon name="eye" size={12} color="#9ca3af" />
                <Text className="text-[11px] text-slate-400 ml-1">
                  Chạm để xem chi tiết
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default TaskItem;
