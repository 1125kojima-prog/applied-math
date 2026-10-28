export type ThemeMode = "light" | "dark";
export declare function getStoredTheme(): ThemeMode | null;
export declare function applyTheme(mode: ThemeMode): void;
export declare function setTheme(mode: ThemeMode): void;
export declare function initTheme(): ThemeMode;
export declare function toggleTheme(): ThemeMode;
export declare function prefersReducedMotion(): boolean;
