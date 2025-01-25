"use server";
import { prisma } from "@workspace/db";
import { Fragment } from "react";
import { redirect } from "next/navigation";
import { UserFileTable } from "@/components/UserFileTable";
import { getUserInfo } from "@workspace/lib";

type PageParams = {
	searchParams: { page: number };
};

// ユーザーファイル管理画面
export default async function UserFilePage({ searchParams }: PageParams) {
	const { page } = searchParams;
	const parItem = 10;
	const userInfo = await getUserInfo();
	const user = await prisma.user.findFirst({
		where: {
			id: userInfo?.sub,
		},
		include: {
			files: {
				where: {
					deletedAt: null,
				},
				skip: (page - 1) * parItem || 0,
				take: parItem,
				include: {
					group: {
						where: {
							deletedAt: null,
						},
					},
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
			<div className="container mx-auto px-4">
				<UserFileTable files={user?.files} user={user} />
			</div>
		</Fragment>
	);
}
