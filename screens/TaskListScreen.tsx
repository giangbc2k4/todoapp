// screens/TaskListScreen.tsx
import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import Screen from "../components/ui/Screen";
import TaskItem, { Task, DueStatus } from "../components/tasks/TaskItem";
import Icon from "react-native-vector-icons/Feather";
import { fetchTasks, updateTask, deleteTask } from "../api/tasks";

type FilterTab = "today" | "all";
type StatusFilter = "all" | "active" | "done";

type TaskListScreenProps = {
  token: string;
  userName?: string;
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
  onLogout: () => void;
};

function getDueMeta(dueDate?: string): { label?: string; status: DueStatus } {
  if (!dueDate) return { label: undefined, status: "none" };

  const d = new Date(dueDate);
  if (Number.isNaN(d.getTime())) return { label: undefined, status: "none" };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let prefix: string;
  let status: DueStatus;

  if (diffDays < 0) {
    prefix = `Trễ ${Math.abs(diffDays)} ngày`;
    status = "overdue";
  } else if (diffDays === 0) {
    prefix = "Hôm nay";
    status = "today";
  } else if (diffDays === 1) {
    prefix = "Ngày mai";
    status = "upcoming";
  } else {
    prefix = `Sau ${diffDays} ngày`;
    status = "upcoming";
  }

  const timeString = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    label: `${prefix} • ${timeString}`,
    status,
  };
}

function getGreeting(userName?: string) {
  const hour = new Date().getHours();
  let label = "XIN CHÀO";
  if (hour < 12) label = "CHÀO BUỔI SÁNG";
  else if (hour < 18) label = "CHÀO BUỔI CHIỀU";
  else label = "CHÀO BUỔI TỐI";

  const name = userName || "bạn";

  return {
    greetingLabel: label,
    greetingText: `${name}, hôm nay bạn làm gì?`,
  };
}

const TaskListScreen: React.FC<TaskListScreenProps> = ({
  token,
  userName,
  onCreateTask,
  onEditTask,
  onLogout,
}) => {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const searchInputRef = useRef<TextInput | null>(null);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(15)).current;

  const { greetingLabel, greetingText } = getGreeting(userName);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
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
  }, [fadeIn, translateY]);

  // load tasks
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchTasks(token);
        if (!cancelled) {
          setTasks(data);
        }
      } catch (error: any) {
        console.error("Fetch tasks error:", error);
        if (!cancelled) {
          Alert.alert(
            "Lỗi tải task",
            error?.message || "Không thể tải danh sách công việc."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // auto focus khi mở search
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const viewTasks = useMemo(
    () =>
      tasks.map((t) => {
        const meta = getDueMeta(t.dueDate);
        return {
          task: t,
          dueLabel: meta.label,
          dueStatus: meta.status,
        };
      }),
    [tasks]
  );

  const totalCount = tasks.length;
  const completedCount = useMemo(
    () => tasks.filter((t) => t.completed).length,
    [tasks]
  );
  const activeCount = useMemo(
    () => tasks.filter((t) => !t.completed).length,
    [tasks]
  );

  const filteredViewTasks = useMemo(() => {
    // lọc theo ngày
    let base =
      filter === "all"
        ? viewTasks
        : viewTasks.filter(
            (v) =>
              v.dueStatus === "today" ||
              v.dueStatus === "overdue" ||
              v.dueStatus === "none"
          );

    // lọc theo trạng thái
    if (statusFilter === "active") {
      base = base.filter((v) => !v.task.completed);
    } else if (statusFilter === "done") {
      base = base.filter((v) => v.task.completed);
    }

    // lọc theo search
    const q = searchQuery.trim().toLowerCase();
    if (q.length > 0) {
      base = base.filter((v) => {
        const title = v.task.title?.toLowerCase() || "";
        const desc = v.task.description?.toLowerCase() || "";
        return title.includes(q) || desc.includes(q);
      });
    }

    return base;
  }, [filter, statusFilter, viewTasks, searchQuery]);

  const handleToggleTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const prevTasks = tasks;
    const optimistic = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(optimistic);

    try {
      await updateTask(
        id,
        {
          title: target.title,
          description: target.description,
          completed: !target.completed,
          dueDate: target.dueDate,
        },
        token
      );
    } catch (error) {
      console.error("Toggle task error:", error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái task.");
      setTasks(prevTasks);
    }
  };

  const handlePressTask = (id: string) => {
    const t = tasks.find((x) => x.id === id);
    if (t) {
      setSelectedTask(t); // mở modal chi tiết
    }
  };

  const handleQuickEditTask = (id: string) => {
    const t = tasks.find((x) => x.id === id);
    if (t) {
      onEditTask(t); // đi thẳng sang màn chỉnh sửa
    }
  };

  const handleDeleteTask = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    Alert.alert(
      "Xoá task",
      `Bạn có chắc muốn xoá "${target.title}"?`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            const prev = tasks;
            setTasks((current) => current.filter((t) => t.id !== id));
            try {
              await deleteTask(id, token);
            } catch (error: any) {
              console.error("Delete task error:", error);
              Alert.alert(
                "Lỗi",
                error?.message || "Không thể xoá task, vui lòng thử lại."
              );
              setTasks(prev);
            }
          },
        },
      ]
    );
  };

  const renderFilterChip = (value: FilterTab, label: string) => {
    const isActive = filter === value;
    return (
      <TouchableOpacity
        key={value}
        onPress={() => setFilter(value)}
        className={`px-3 py-1.5 rounded-full mr-2 flex-row items-center ${
          isActive ? "bg-sky-500" : "bg-slate-900/80"
        }`}
        activeOpacity={0.8}
      >
        <Text
          className={`text-xs font-medium ${
            isActive ? "text-slate-950" : "text-slate-300"
          }`}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderStatusCard = (
    key: StatusFilter,
    label: string,
    count: number,
    _accent: "default" | "active" | "done",
    isLast?: boolean
  ) => {
    const isActive = statusFilter === key;

    const bgClass = isActive ? "bg-sky-500" : "bg-slate-900/80";
    const borderClass = isActive ? "border-sky-300" : "border-slate-800";
    const countTextColor = isActive ? "text-slate-950" : "text-slate-100";
    const labelColor = isActive ? "text-slate-900/80" : "text-slate-400";
    const subTextColor = isActive ? "text-slate-900/70" : "text-slate-500";

    return (
      <TouchableOpacity
        key={key}
        onPress={() => setStatusFilter(key)}
        activeOpacity={0.9}
        style={{ flex: 1, marginRight: isLast ? 0 : 8 }}
        className={`rounded-2xl px-3 py-2 border ${bgClass} ${borderClass}`}
      >
        <Text className={`text-[10px] ${labelColor}`}>{label}</Text>
        <Text
          className={`text-lg font-semibold mt-0.5 ${countTextColor}`}
          numberOfLines={1}
        >
          {count}
        </Text>
        <Text className={`text-[10px] mt-0.5 ${subTextColor}`}>task</Text>
      </TouchableOpacity>
    );
  };

  const toggleSearch = () => {
    setSearchOpen((prev) => {
      const next = !prev;
      if (!next) setSearchQuery("");
      return next;
    });
  };

  return (
    <Screen>
      {/* background blur */}
      <View className="absolute -top-10 -right-16 h-52 w-52 rounded-full bg-sky-500/20 blur-3xl" />
      <View className="absolute top-24 -left-10 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl" />
      <View className="absolute bottom-0 -right-10 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />

      <Animated.View
        className="flex-1"
        style={{
          opacity: fadeIn,
          transform: [{ translateY }],
        }}
      >
        {/* HEADER */}
        <View className="pb-3 flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-xs font-medium text-slate-400">
              {greetingLabel}
            </Text>
            <Text className="text-2xl font-bold text-slate-50 mt-1">
              {greetingText}
            </Text>
          </View>

          {/* Nút avatar + Đăng xuất */}
          <TouchableOpacity
            onPress={onLogout}
            activeOpacity={0.9}
            className="flex-row items-center px-3 py-1.5 rounded-full bg-sky-500/15 border border-sky-400/60 shadow-sm shadow-sky-500/40"
          >
            <View className="h-8 w-8 rounded-full bg-sky-500/90 items-center justify-center mr-1.5">
              <Icon name="user" size={16} color="#020617" />
            </View>
            <Text className="text-[11px] text-white font-medium mr-1.5">
              Đăng xuất
            </Text>
            <Icon name="log-out" size={14} color="#e5e7eb" />
          </TouchableOpacity>
        </View>

        {/* FILTER (ngày) + SEARCH BTN */}
        <View className="flex-row items-center mb-2 justify-between">
          <View className="flex-row">
            {renderFilterChip("all", "Tất cả ngày")}
            {renderFilterChip("today", "Hôm nay")}
          </View>

          <TouchableOpacity
            onPress={toggleSearch}
            activeOpacity={0.9}
            className={`h-9 w-9 rounded-full border items-center justify-center ml-2 ${
              searchOpen
                ? "bg-sky-500 border-sky-300"
                : "bg-slate-900/80 border-slate-700"
            }`}
          >
            <Icon
              name={searchOpen ? "x" : "search"}
              size={15}
              color={searchOpen ? "#020617" : "#e5e7eb"}
            />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        {searchOpen && (
          <View className="mb-2 rounded-2xl bg-slate-900/90 border border-slate-800 px-3 py-2 flex-row items-center">
            <Icon name="search" size={14} color="#9ca3af" />
            <TextInput
              ref={searchInputRef}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Tìm theo tiêu đề hoặc mô tả..."
              placeholderTextColor="#6b7280"
              className="flex-1 ml-2 text-[13px] text-slate-100"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="x-circle" size={14} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* 3 CỘT TỔNG / CHƯA / ĐÃ HOÀN THÀNH */}
        <View className="flex-row mb-3">
          {renderStatusCard("all", "Tổng task", totalCount, "default")}
          {renderStatusCard(
            "active",
            "Chưa hoàn thành",
            activeCount,
            "active"
          )}
          {renderStatusCard(
            "done",
            "Đã hoàn thành",
            completedCount,
            "done",
            true
          )}
        </View>

        {/* LIST */}
        <View className="flex-1 mt-1">
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator />
              <Text className="text-xs text-slate-400 mt-2">
                Đang tải danh sách công việc...
              </Text>
            </View>
          ) : filteredViewTasks.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <View className="h-14 w-14 rounded-2xl bg-slate-900/90 border border-slate-800 items-center justify-center mb-3">
                <Icon name="inbox" size={24} color="#9ca3af" />
              </View>
              <Text className="text-sm font-medium text-slate-300">
                Không có task nào ở đây
              </Text>
              <Text className="text-xs text-slate-500 mt-1 text-center px-8">
                Thử tạo task mới hoặc thay đổi bộ lọc / tìm kiếm.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredViewTasks}
              keyExtractor={(item) => item.task.id}
              renderItem={({ item }) => (
                <TaskItem
                  task={item.task}
                  dueLabel={item.dueLabel}
                  dueStatus={item.dueStatus}
                  onToggle={handleToggleTask}
                  onPress={handlePressTask}         // chạm card → xem chi tiết
                  onQuickEdit={handleQuickEditTask} // icon bút → edit nhanh
                  onDelete={handleDeleteTask}
                />
              )}
              contentContainerStyle={{ paddingBottom: 160 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* FAB + */}
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
          }}
        >
          <TouchableOpacity
            onPress={onCreateTask}
            activeOpacity={0.9}
            style={{
              width: 72,
              height: 72,
              borderRadius: 9999,
              backgroundColor: "#0ea5e9",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(125,211,252,0.8)",
              shadowColor: "#0ea5e9",
              shadowOpacity: 0.6,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
            }}
          >
            <Icon name="plus" size={30} color="#020617" />
          </TouchableOpacity>
        </View>

        {/* MODAL XEM CHI TIẾT TASK */}
                {/* MODAL XEM CHI TIẾT TASK */}
        {selectedTask && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            className="bg-black/60 items-center justify-center px-4"
          >
            {/* click nền để đóng */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setSelectedTask(null)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />

            {/* CARD CHI TIẾT – cao 90%, bo 20, padding to, block to */}
            <View
              className="w-full bg-slate-950 border border-slate-800"
              style={{
                borderRadius: 20,
                height: "90%",
                paddingHorizontal: 24, // px-6
                paddingTop: 24,        // pt-6
                paddingBottom: 20,     // pb-5
                overflow: "hidden",
              }}
            >
              {/* glow nền trong card */}
              <View className="absolute -top-12 right-0 h-28 w-28 rounded-full bg-sky-500/18 blur-3xl" />
              <View className="absolute bottom-0 -left-8 h-28 w-28 rounded-full bg-emerald-500/15 blur-3xl" />

              <View style={{ flex: 1 }}>
                {/* HEADER */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                      paddingRight: 12,
                    }}
                  >
                    <View
                      style={{
                        height: 44,
                        width: 44,
                        borderRadius: 16,
                        backgroundColor: "rgba(56,189,248,0.2)", // sky-500/20
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Icon name="clipboard" size={22} color="#38bdf8" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text className="text-[12px] text-slate-400 uppercase">
                        Chi tiết công việc
                      </Text>
                      <Text
                        className="text-slate-50"
                        style={{
                          fontSize: 20,
                          fontWeight: "600",
                          marginTop: 4,
                        }}
                        numberOfLines={3}
                      >
                        {selectedTask.title}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => setSelectedTask(null)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{
                      height: 36,
                      width: 36,
                      borderRadius: 18,
                      backgroundColor: "#020617", // slate-900
                      borderWidth: 1,
                      borderColor: "#1f2937", // slate-700
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name="x" size={18} color="#e5e7eb" />
                  </TouchableOpacity>
                </View>

                {/* NỘI DUNG CHÍNH (có scroll nếu dài) */}
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingBottom: 16 }}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Trạng thái + hạn */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 20,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 20,
                      }}
                    >
                      <Icon
                        name={
                          selectedTask.completed ? "check-circle" : "clock"
                        }
                        size={18}
                        color={
                          selectedTask.completed ? "#4ade80" : "#38bdf8"
                        }
                      />
                      <Text
                        style={{
                          fontSize: 14,
                          marginLeft: 8,
                          color: "#e5e7eb",
                        }}
                      >
                        {selectedTask.completed
                          ? "Đã hoàn thành"
                          : "Chưa hoàn thành"}
                      </Text>
                    </View>

                    {selectedTask.dueDate && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          flex: 1,
                        }}
                      >
                        <Icon name="calendar" size={16} color="#e5e7eb" />
                        <Text
                          style={{
                            fontSize: 13,
                            marginLeft: 8,
                            color: "#e5e7eb",
                          }}
                          numberOfLines={1}
                        >
                          {new Date(
                            selectedTask.dueDate
                          ).toLocaleString("vi-VN", {
                            weekday: "short",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Mô tả – block to, minHeight rõ ràng */}
                  <View style={{ marginBottom: 20 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        marginBottom: 8,
                      }}
                    >
                      Mô tả
                    </Text>
                    <View
                      style={{
                        borderRadius: 18,
                        backgroundColor: "rgba(15,23,42,0.9)", // slate-900/90
                        borderWidth: 1,
                        borderColor: "#1f2937", // slate-800
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        minHeight: 120, // 👈 block to rõ ràng
                        justifyContent: "flex-start",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          lineHeight: 22,
                          color: "#f9fafb",
                        }}
                      >
                        {selectedTask.description?.trim()
                          ? selectedTask.description
                          : "Không có mô tả."}
                      </Text>
                    </View>
                  </View>

                  {/* Thời gian – block to */}
                  {(selectedTask.createdAt || selectedTask.updatedAt) && (
                    <View style={{ marginBottom: 8 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#9ca3af",
                          marginBottom: 8,
                        }}
                      >
                        Thời gian
                      </Text>
                      <View
                        style={{
                          borderRadius: 18,
                          backgroundColor: "rgba(15,23,42,0.9)",
                          borderWidth: 1,
                          borderColor: "#1f2937",
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          minHeight: 90,
                          justifyContent: "center",
                        }}
                      >
                        {selectedTask.createdAt && (
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#9ca3af",
                            }}
                          >
                            Tạo lúc{" "}
                            <Text style={{ color: "#e5e7eb" }}>
                              {new Date(
                                selectedTask.createdAt
                              ).toLocaleString("vi-VN")}
                            </Text>
                          </Text>
                        )}
                        {selectedTask.updatedAt && (
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#9ca3af",
                              marginTop: 4,
                            }}
                          >
                            Cập nhật lần cuối{" "}
                            <Text style={{ color: "#e5e7eb" }}>
                              {new Date(
                                selectedTask.updatedAt
                              ).toLocaleString("vi-VN")}
                            </Text>
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </ScrollView>

                {/* NÚT HÀNH ĐỘNG – cố định đáy card */}
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 8,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setSelectedTask(null)}
                    activeOpacity={0.9}
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 18,
                      backgroundColor: "#020617",
                      borderWidth: 1,
                      borderColor: "#1f2937",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#e5e7eb",
                        fontWeight: "500",
                      }}
                    >
                      Đóng
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      const t = selectedTask;
                      setSelectedTask(null);
                      if (t) onEditTask(t);
                    }}
                    activeOpacity={0.9}
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 18,
                      backgroundColor: "#0ea5e9",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#020617",
                        fontWeight: "600",
                      }}
                    >
                      Chỉnh sửa
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

      </Animated.View>
    </Screen>
  );
};

export default TaskListScreen;
