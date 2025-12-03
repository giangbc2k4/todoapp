
const API_URL = "https://todoapp-ashy-tau.vercel.app";

export interface AuthUser {
  email: string;
  displayName?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

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

// LOGIN: POST /api/auth/login
export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await handleResponse(res);

  const token = data.token;
  if (!token) {
    console.log("LOGIN RAW RESPONSE (no token found):", data);
    throw new Error("Không tìm thấy token trong phản hồi API");
  }

  return {
    token,
    user: {
      email: data.email,
      displayName: data.displayName,
    },
  };
}

// SIGNUP: POST /api/auth/signup
export async function signup(
  displayName: string,
  email: string,
  password: string
): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ displayName, email, password }),
  });

  const data = await handleResponse(res);

  return { message: data.message || "Tạo tài khoản thành công" };
}
