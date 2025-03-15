"use client";

import localFont from "next/font/local";
import "./globals.css";

import * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const router = useRouter();
	const { user, loading } = useAuth();

	// Redirect to login if user is not authenticated and loading is complete
	useEffect(() => {
		if (!loading && !user) {
			router.push("/account/login");
		}
	}, [user, loading, router]);

	return (
		<html lang="en">
			<head>
				<title>The Data Workspace</title>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
		</html>
	);
}
