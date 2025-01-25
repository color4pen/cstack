"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { AdminPasswordForm } from "@/components/AdminPasswordForm";
import { registerUser } from "@workspace/lib";

export default function RegisterPage() {
	const [message, setMessage] = useState("");

	async function onSubmit(formData: FormData) {
		const result = await registerUser(formData);
		setMessage(result.message);
	}

	return (
		<AdminPasswordForm>
			<div className="flex justify-center items-center">
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<Card className="w-[400px] shadow-2xl">
						<CardHeader className="space-y-1">
							<CardTitle className="text-2xl font-bold text-center">
								新規登録
							</CardTitle>
						</CardHeader>
						<CardContent>
							<form action={onSubmit} className="space-y-6">
								<div className="space-y-2">
									<label
										htmlFor="email"
										className="text-sm font-medium text-gray-700 dark:text-gray-300"
									>
										メールアドレス
									</label>
									<Input
										id="email"
										name="email"
										type="email"
										placeholder="you@example.com"
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
									/>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="password"
										className="text-sm font-medium text-gray-700 dark:text-gray-300"
									>
										パスワード
									</label>
									<Input
										id="password"
										name="password"
										type="password"
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
									/>
								</div>
								<Button
									type="submit"
									className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
								>
									登録する
								</Button>
							</form>
							{message && (
								<motion.p
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400"
								>
									{message}
								</motion.p>
							)}
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</AdminPasswordForm>
	);
}
