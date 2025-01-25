"use server";
import { prisma } from "@workspace/db";
import { Fragment } from "react";
import { redirect } from "next/navigation";
import { UserFileGroupTable } from "@/components/UserFileGroupTable";
import { AddFileGroup } from "@/components/AddFileGroup";
import { getUserInfo } from "@workspace/lib";

// ユーザーファイルグループ管理画面
export default async function UserFileGroupPage() {
	const userInfo = await getUserInfo();
	const user = await prisma.user.findFirst({
		where: {
			id: userInfo?.sub,
		},
		include: {
			fileGroups: {
				where: {
					deletedAt: null,
				},
				include: {
					files: true,
				},
				orderBy: {
					createdAt: "desc",
				},
			},
		},
	});
	if (!user) {
		redirect("/");
	}

	return (
		<Fragment>
			<div className="container mx-auto px-4 mt-2">
				<div className="flex">
					<div className="grow" />
					<AddFileGroup />
				</div>
				<UserFileGroupTable fileGroups={user?.fileGroups} user={user} />
			</div>
		</Fragment>
	);
}
