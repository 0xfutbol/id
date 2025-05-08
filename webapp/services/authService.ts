import { AuthService } from "@0xfutbol/id";

import { API_CONFIG } from "@/config/api";

export const authService = new AuthService(API_CONFIG.backendUrl);
