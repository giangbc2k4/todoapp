// App.tsx
import "./global.css";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";

import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import TaskListScreen from "./screens/TaskListScreen";
import CreateTaskScreen from "./screens/CreateTaskScreen";
import EditTaskScreen from "./screens/EditTaskScreen";

import {
  getToken,
  getUser,
  saveToken,
  saveUser,
  clearAuth,
  StoredUser,
} from "./storage/authStorage";
import { Task } from "./components/tasks/TaskItem";

type Screen = "Login" | "Signup" | "TaskList" | "CreateTask" | "EditTask";

export default function App() {
  const [screen, setScreen] = useState<Screen>("Login");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [booting, setBooting] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Load token + user khi mở app
  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          getToken(),
          getUser(),
        ]);
        if (storedToken) {
          setToken(storedToken);
          if (storedUser) setUser(storedUser);
          setScreen("TaskList");
        }
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const handleAuthSuccess = async (newToken: string, userInfo: StoredUser) => {
    setToken(newToken);
    setUser(userInfo);
    await Promise.all([saveToken(newToken), saveUser(userInfo)]);
    setScreen("TaskList");
  };

  const handleLogout = async () => {
    setToken(null);
    setUser(null);
    await clearAuth();
    setScreen("Login");
  };

  if (booting) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-950">
        <ActivityIndicator />
        <Text className="text-slate-400 text-sm mt-2">
          Đang khởi động ứng dụng...
        </Text>
      </View>
    );
  }

  // =============== AUTH FLOW ===============
  if (!token) {
    if (screen === "Signup") {
      return (
        <SignupScreen
          onGoLogin={() => setScreen("Login")}
        />
      );
    }

    return (
      <LoginScreen
        onAuthSuccess={handleAuthSuccess}
        onGoSignup={() => setScreen("Signup")}
      />
    );
  }

  const userName = user?.displayName || user?.email || "bạn";

  // =============== APP FLOW ===============

  if (screen === "TaskList") {
    return (
      <TaskListScreen
        token={token}
        userName={userName}
        onCreateTask={() => setScreen("CreateTask")}
        onEditTask={(task) => {
          setEditingTask(task);
          setScreen("EditTask");
        }}
        onLogout={handleLogout}
      />
    );
  }

  if (screen === "CreateTask") {
    return (
      <CreateTaskScreen
        token={token}
        onDone={() => setScreen("TaskList")}
        onBack={() => setScreen("TaskList")}
      />
    );
  }

  if (screen === "EditTask" && editingTask) {
    return (
      <EditTaskScreen
        token={token}
        task={editingTask}
        onDone={() => setScreen("TaskList")}
        onBack={() => setScreen("TaskList")}
      />
    );
  }

  // Fallback
  return (
    <TaskListScreen
      token={token as string}
      userName={userName}
      onCreateTask={() => setScreen("CreateTask")}
      onEditTask={(task) => {
        setEditingTask(task);
        setScreen("EditTask");
      }}
      onLogout={handleLogout}
    />
  );
}
