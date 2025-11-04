// API Client for backend communication

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Get token from localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Set token in localStorage
export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

// Remove token from localStorage
export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Log the request for debugging
  if (options.body) {
    const bodyData = JSON.parse(options.body as string);
    console.log(`[api-client] ${options.method || 'GET'} ${endpoint}:`, {
      hasWorkExperiences: !!bodyData.workExperiences,
      workExperiencesCount: bodyData.workExperiences?.length || 0,
      hasEducations: !!bodyData.educations,
      educationsCount: bodyData.educations?.length || 0,
      hasProjects: !!bodyData.projects,
      projectsCount: bodyData.projects?.length || 0,
      firstName: bodyData.firstName,
      jobTitle: bodyData.jobTitle,
      title: bodyData.title,
    });
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "An error occurred",
    }));
    console.error(`[api-client] Error ${options.method || 'GET'} ${endpoint}:`, error);
    throw new Error(error.error || error.message || "Request failed");
  }

  const result = await response.json();
  console.log(`[api-client] ${options.method || 'GET'} ${endpoint} - Response:`, {
    id: result.id,
    hasWorkExperiences: !!result.workExperiences,
    workExperiencesCount: result.workExperiences?.length || 0,
    hasEducations: !!result.educations,
    educationsCount: result.educations?.length || 0,
  });

  return result;
}

// Auth API
export const authApi = {
  signUp: async (data: { name: string; email: string; password: string }) => {
    return apiRequest<{ user: any; token: string }>("/api/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  signIn: async (data: { email: string; password: string }) => {
    return apiRequest<{ user: any; token: string }>("/api/users/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  verifyToken: async () => {
    return apiRequest<{ user: any }>("/api/users/verify", {
      method: "GET",
    });
  },
};

// Resume API
export const resumeApi = {
  getAll: async () => {
    return apiRequest<any[]>("/api/resumes", {
      method: "GET",
    });
  },

  getById: async (id: string) => {
    return apiRequest<any>(`/api/resumes/${id}`, {
      method: "GET",
    });
  },

  create: async (data: any) => {
    return apiRequest<any>("/api/resumes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: any) => {
    return apiRequest<any>(`/api/resumes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/api/resumes/${id}`, {
      method: "DELETE",
    });
  },
};

// Upload API
export const uploadApi = {
  uploadImage: async (file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: "Upload failed",
      }));
      throw new Error(error.error || "Upload failed");
    }

    return response.json() as Promise<{
      url: string;
      filename: string;
      message: string;
    }>;
  },
};
