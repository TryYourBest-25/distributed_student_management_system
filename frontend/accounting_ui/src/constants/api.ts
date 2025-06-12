export const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "1";

// Base URL của API Gateway  
export const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:5000";

// Routes cho các microservices thông qua API Gateway
export const API_ROUTES = {
  // Tuition Service - quản lý học phí 
  TUITION: `${API_GATEWAY_URL}/tuition/v${API_VERSION}`,
  
  // Academic Service - quản lý học vụ
  ACADEMIC: `${API_GATEWAY_URL}/academic/v${API_VERSION}`,
  
  // Faculty Service - quản lý khoa
  FACULTY: `${API_GATEWAY_URL}/faculty/v${API_VERSION}`,
} as const;

// Backward compatibility
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || API_ROUTES.TUITION;