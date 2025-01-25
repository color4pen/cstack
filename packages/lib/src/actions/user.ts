"use server";

import { prisma } from "@workspace/db";
import { redirect } from "next/navigation";

export async function upsertProfile(formData: FormData) {
	const name = formData.get("name")?.toString();
	const bio = formData.get("bio")?.toString();
	const userId = formData.get("userId")?.toString();
	const userEmail = formData.get("userEmail")?.toString();

	if (!userId || !userEmail) {
		redirect("/");
	}

	await prisma.user.upsert({
		where: {
			id: userId,
		},
		create: {
			id: userId,
			email: userEmail,
			name: name,
		},
		update: {
			name: name,
		},
	});

	await prisma.profile.upsert({
		where: { userId },
		create: {
			userId,
			bio: bio,
		},
		update: {
			bio: bio,
		},
	});
	redirect(`/user/${userId}`);
}
