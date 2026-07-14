import { createContext } from "react";

export interface ThemeContextType {
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
