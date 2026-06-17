export const PATHS = {
    LOGIN: "/login",
  } as const;
  
  export type OrderStatus = keyof typeof PATHS;