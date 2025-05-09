import { AccountService } from "@0xfutbol/id";

import { API_CONFIG } from "@/config/api";

export const accountService = new AccountService(API_CONFIG.backendUrl);