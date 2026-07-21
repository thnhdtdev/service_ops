"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeProviderContext = {
	theme: Theme;
	resolvedTheme: ResolvedTheme;
	setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeProviderContext | null>(null);

const THEME_STORAGE_KEY = "serviceops-theme";
const THEME_CHANGE_EVENT = "serviceops-theme-change";

function isTheme(value: string | null): value is Theme {
	return value === "light" || value === "dark" || value === "system";
}

function getSystemTheme(): ResolvedTheme {
	if (typeof window === "undefined") {
		return "light";
	}

	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ResolvedTheme) {
	const root = window.document.documentElement;

	root.classList.remove("light", "dark");
	root.classList.add(theme);
}

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
};

export function ThemeProvider({ children, defaultTheme = "system" }: ThemeProviderProps) {
	const subscribeToTheme = React.useCallback((onStoreChange: () => void) => {
		window.addEventListener("storage", onStoreChange);
		window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

		return () => {
			window.removeEventListener("storage", onStoreChange);
			window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
		};
	}, []);

	const getThemeSnapshot = React.useCallback((): Theme => {
		const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

		return isTheme(storedTheme) ? storedTheme : defaultTheme;
	}, [defaultTheme]);

	const theme = React.useSyncExternalStore(
		subscribeToTheme,
		getThemeSnapshot,
		() => defaultTheme
	);

	const subscribeToSystemTheme = React.useCallback((onStoreChange: () => void) => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		mediaQuery.addEventListener("change", onStoreChange);

		return () => {
			mediaQuery.removeEventListener("change", onStoreChange);
		};
	}, []);

	const systemTheme = React.useSyncExternalStore(
		subscribeToSystemTheme,
		getSystemTheme,
		(): ResolvedTheme => "light"
	);
	const resolvedTheme = theme === "system" ? systemTheme : theme;

	React.useEffect(() => {
		applyTheme(resolvedTheme);
	}, [resolvedTheme]);

	const setTheme = React.useCallback((nextTheme: Theme) => {
		window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
		window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
	}, []);

	const value = React.useMemo(
		() => ({
			theme,
			resolvedTheme,
			setTheme
		}),
		[theme, resolvedTheme, setTheme]
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const context = React.useContext(ThemeContext);

	if (!context) {
		throw new Error("useTheme must be used within ThemeProvider");
	}

	return context;
}
