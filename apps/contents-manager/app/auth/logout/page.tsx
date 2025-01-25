"use client";

import { logout } from "@workspace/lib";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
	const router = useRouter()
	useEffect(() => {
		async function logoutFunction() {
			await logout();
			router.replace("/");
		}
		logoutFunction();
	}, [router]);

	return <div />;
}
