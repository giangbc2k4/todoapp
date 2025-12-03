// api/tasks.ts
import { Task } from "../components/tasks/TaskItem";
import { TaskFormValues } from "../components/tasks/TaskForm";

const API_URL = "https://todoapp-ashy-tau.vercel.app";

async function handleResponse(res: Response) {
  let data: any = null;

  try {
    data = await res.json();
  } catch {

  }

  if (!res.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}


function mapTask(doc: any): Task {
  return {
    id: doc._id || doc.id,
    title: doc.title,
    description: doc.description || undefined,
    completed: !!doc.completed,
    userId: doc.user?._id || doc.user,
    dueDate: doc.dueDate ? new Date(doc.dueDate).toISOString() : undefined,
    createdAt: doc.createdAt
      ? new Date(doc.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: doc.updatedAt
      ? new Date(doc.updatedAt).toISOString()
      : new Date().toISOString(),
  };
}

// GET /api/tasks/all
export async function fetchTasks(token: string): Promise<Task[]> {
  const res = await fetch(`${API_URL}/api/tasks/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await handleResponse(res);


  if (!Array.isArray(data.tasks)) return [];
  return data.tasks.map(mapTask);
}

// POST /api/tasks/createtask
export async function createTask(
  values: TaskFormValues,
  token: string
): Promise<{ message: string }> {
  const payload: any = {
    title: values.title,
    description: values.description,
    dueDate: values.dueDate || undefined,
  };

  const res = await fetch(`${API_URL}/api/tasks/createtask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(res);
  return { message: data.message || "Tạo task thành công" };
}

// PUT /api/tasks/:id
export async function updateTask(
  id: string,
  values: TaskFormValues,
  token: string
): Promise<Task> {
  const payload: any = {
    title: values.title,
    description: values.description,
    completed: values.completed,
    dueDate: values.dueDate || null,
  };

  const res = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(res);

  return mapTask(data.task);
}

// DELETE /api/tasks/:id
export async function deleteTask(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await handleResponse(res);
}
