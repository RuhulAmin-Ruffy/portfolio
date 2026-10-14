import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";

export const display = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-display" });
export const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
export const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const fontVars = `${display.variable} ${body.variable} ${mono.variable}`;
