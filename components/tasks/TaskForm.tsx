// components/tasks/TaskForm.tsx
import React, { useEffect, useRef, useState } from "react";
import { Animated, View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Input from "../ui/Input";
import Button from "../ui/Button";

export interface TaskFormValues {
  title: string;
  description?: string;
  dueDate?: string; // ISO string gửi lên API
  completed: boolean;
}

export interface TaskFormInitialValues {
  title?: string;
  description?: string;
  dueDate?: string; // ISO string từ backend
  completed?: boolean;
}

interface TaskFormProps {
  mode?: "create" | "edit";
  initialValues?: TaskFormInitialValues;
  onSubmit?: (values: TaskFormValues) => void;
  onCancel?: () => void;
}

// ---- helper ngoài component ----
const formatDueDisplay = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let prefix: string;
  if (diffDays < 0) {
    prefix = `Trễ ${Math.abs(diffDays)} ngày`;
  } else if (diffDays === 0) {
    prefix = "Hôm nay";
  } else if (diffDays === 1) {
    prefix = "Ngày mai";
  } else {
    prefix = `Sau ${diffDays} ngày`;
  }

  const timeString = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${prefix} • ${timeString}`;
};

const getInitialDue = (dueDateIso?: string) => {
  if (!dueDateIso) {
    return {
      date: undefined as Date | undefined,
      display: "Không có hạn",
    };
  }
  const d = new Date(dueDateIso);
  if (Number.isNaN(d.getTime())) {
    return {
      date: undefined as Date | undefined,
      display: "Không có hạn",
    };
  }
  return {
    date: d,
    display: formatDueDisplay(d),
  };
};

// ---- component chính ----
const TaskForm: React.FC<TaskFormProps> = ({
  mode = "create",
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const isEdit = mode === "edit";

  const { date: initDueDate, display: initDueDisplay } = getInitialDue(
    initialValues?.dueDate
  );

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? ""
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(initDueDate);
  const [dueDisplay, setDueDisplay] = useState<string>(initDueDisplay);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [completed, setCompleted] = useState<boolean>(
    initialValues?.completed ?? false
  );

  const [titleError, setTitleError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  // Nếu initialValues thay đổi (hiếm), sync lại
  useEffect(() => {
    setTitle(initialValues?.title ?? "");
    setDescription(initialValues?.description ?? "");
    const { date, display } = getInitialDue(initialValues?.dueDate);
    setDueDate(date);
    setDueDisplay(display);
    setCompleted(initialValues?.completed ?? false);
  }, [initialValues]);

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

  // QUICK CHIPS
  const selectNoDue = () => {
    setDueDate(undefined);
    setDueDisplay("Không có hạn");
  };

  const selectToday = () => {
    const now = new Date();
    setDueDate(now);
    setDueDisplay(formatDueDisplay(now));
  };

  const selectTomorrow = () => {
    const now = new Date();
    const tmr = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      now.getHours(),
      now.getMinutes()
    );
    setDueDate(tmr);
    setDueDisplay(formatDueDisplay(tmr));
  };

  // MODAL PICKER
  const handleConfirm = (date: Date) => {
    setPickerVisible(false);
    setDueDate(date);
    setDueDisplay(formatDueDisplay(date));
  };

  const handleCancelPicker = () => {
    setPickerVisible(false);
  };

  const handleSubmit = () => {
    setTitleError(undefined);
    setFormError(undefined);

    if (!title.trim()) {
      setTitleError("Vui lòng nhập tiêu đề");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const payload: TaskFormValues = {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        completed,
      };

      if (onSubmit) {
        onSubmit(payload);
      } else {
        console.log(isEdit ? "Update task:" : "Create task:", payload);
      }
    }, 700);
  };

  return (
    <>
      <Animated.View
        style={{
          opacity,
          transform: [{ translateY }],
          borderRadius: 24,
          backgroundColor: "rgba(15,23,42,0.85)", // bg-slate-900/85
          padding: 20,
          borderWidth: 1,
          borderColor: "rgba(30,64,175,0.6)",
          shadowColor: "#0ea5e9",
          shadowOpacity: 0.25,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 12 },
          elevation: 10,
        }}
      >
        <View className="space-y-1 mb-2">
          <Text className="text-xl font-semibold text-slate-50">
            {isEdit ? "Chỉnh sửa task" : "Task mới 📝"}
          </Text>
          <Text className="text-sm text-slate-400">
            {isEdit
              ? "Cập nhật lại nội dung hoặc hạn của công việc này."
              : "Ghi lại việc bạn cần làm, thêm hạn nếu cần."}
          </Text>
        </View>

        <Input
          label="Tiêu đề"
          placeholder="Ví dụ: Đi chợ, viết báo cáo..."
          value={title}
          onChangeText={setTitle}
          error={titleError}
          leftIconName="check-square"
        />

        <Input
          label="Mô tả"
          placeholder="Thêm ghi chú chi tiết (không bắt buộc)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          leftIconName="align-left"
        />

        {/* Chọn hạn (dueDate) */}
        <View className="mt-1 mb-3">
          <Text className="text-sm font-medium text-slate-200 mb-1.5">
            Hạn hoàn thành
          </Text>

          {/* Quick chips */}
          <View className="flex-row mb-2">
            <TouchableOpacity
              onPress={selectNoDue}
              activeOpacity={0.8}
              className={`px-3 py-1.5 rounded-full mr-2 flex-row items-center ${
                !dueDate
                  ? "bg-slate-100"
                  : "bg-slate-900/80 border border-slate-700"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  !dueDate ? "text-slate-900" : "text-slate-300"
                }`}
              >
                Không có
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={selectToday}
              activeOpacity={0.8}
              className={`px-3 py-1.5 rounded-full mr-2 flex-row items-center ${
                dueDate && formatDueDisplay(dueDate).startsWith("Hôm nay")
                  ? "bg-sky-500"
                  : "bg-slate-900/80"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  dueDate && formatDueDisplay(dueDate).startsWith("Hôm nay")
                    ? "text-slate-950"
                    : "text-slate-300"
                }`}
              >
                Hôm nay
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={selectTomorrow}
              activeOpacity={0.8}
              className={`px-3 py-1.5 rounded-full flex-row items-center ${
                dueDate && formatDueDisplay(dueDate).startsWith("Ngày mai")
                  ? "bg-emerald-400"
                  : "bg-slate-900/80"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  dueDate && formatDueDisplay(dueDate).startsWith("Ngày mai")
                    ? "text-slate-950"
                    : "text-slate-300"
                }`}
              >
                Ngày mai
              </Text>
            </TouchableOpacity>
          </View>

          {/* Nút mở modal picker */}
          <TouchableOpacity
            onPress={() => setPickerVisible(true)}
            activeOpacity={0.85}
            className="flex-row items-center self-start px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700"
          >
            <Icon name="calendar" size={14} color="#e5e7eb" />
            <Text className="ml-1.5 text-xs font-medium text-slate-200">
              Tuỳ chỉnh ngày & giờ
            </Text>
          </TouchableOpacity>

          {/* Hiển thị hạn hiện tại */}
          <View className="flex-row items-center mt-2">
            <Icon name="clock" size={14} color="#9ca3af" />
            <Text className="ml-1 text-[11px] text-slate-400">
              {dueDisplay}
            </Text>
          </View>

          <Text className="text-[11px] text-slate-500 mt-1">
            (Nhấn “Tuỳ chỉnh ngày & giờ” để mở picker dạng modal dễ dùng hơn)
          </Text>
        </View>

        {/* Completed toggle */}
        <TouchableOpacity
          onPress={() => setCompleted((prev) => !prev)}
          activeOpacity={0.8}
          className="flex-row items-center mb-3"
        >
          <View
            className={`h-5 w-5 rounded-md border items-center justify-center mr-2 ${
              completed ? "bg-emerald-400 border-emerald-400" : "border-slate-600"
            }`}
          >
            {completed && <Icon name="check" size={14} color="#020617" />}
          </View>
          <Text className="text-sm text-slate-200">
            Đánh dấu là đã hoàn thành
          </Text>
        </TouchableOpacity>

        {formError && (
          <Text className="text-xs text-rose-400 mt-1">{formError}</Text>
        )}

        <View className="mt-2" />

        <Button
          title={isEdit ? "Lưu thay đổi" : "Lưu task"}
          onPress={handleSubmit}
          loading={loading}
          fullWidth
        />

        <Button
          title="Huỷ"
          onPress={onCancel || (() => {})}
          variant="outline"
          fullWidth
        />
      </Animated.View>

      {/* MODAL DATETIME PICKER */}
      <DateTimePickerModal
        isVisible={pickerVisible}
        mode="datetime"
        date={dueDate || new Date()}
        onConfirm={handleConfirm}
        onCancel={handleCancelPicker}
      />
    </>
  );
};

export default TaskForm;
