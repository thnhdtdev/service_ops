export const PATHS = {
    DASHBOARD: "/",
    LOGIN: "/login",
  } as const;
  
  export type OrderStatus = keyof typeof PATHS;