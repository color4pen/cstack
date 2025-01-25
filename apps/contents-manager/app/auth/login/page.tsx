"use client";

import { Fragment, useState } from "react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { loginUser } from "@workspace/lib";

export default function LoginPage() {
	const { user } = useAuth()
	const router = useRouter()
	const [message, setMessage] = useState("");

	async function onSubmit(formData: FormData) {
		const result = await loginUser(formData);
		setMessage(result.message);
		if (result.success) {
			router.replace("/");
		}
	}

	if (user) {
		return <Fragment />
	}

	return (
		<div className="flex justify-center items-center grow">
			<Card className="shadow-md w-full md:w-[400px] m-4">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-semibold text-center">
						ログイン
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form action={onSubmit} className="space-y-4">
						<div className="space-y-2">
							<label
								htmlFor="email"
								className="text-sm font-medium text-gray-700"
							>
								メールアドレス
							</label>
							<Input
								id="email"
								name="email"
								type="email"
								placeholder="you@example.com"
								required
								className="w-full"
							/>
						</div>
						<div className="space-y-2">
							<label
								htmlFor="password"
								className="text-sm font-medium text-gray-700"
							>
								パスワード
							</label>
							<Input
								id="password"
								name="password"
								type="password"
								required
								className="w-full"
							/>
						</div>
						<Button type="submit" className="w-full">
							ログイン
						</Button>
					</form>
					{message && (
						<p className="mt-4 text-sm text-center text-gray-600">{message}</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
