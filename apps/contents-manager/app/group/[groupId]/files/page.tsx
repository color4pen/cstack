"use server";
import { prisma } from "@workspace/db";
import { GroupFileTable } from "@/components/GroupFileTable";
import { Fragment } from "react";
import { redirect } from "next/navigation";
import { getUserInfo } from "@workspace/lib";

// グループファイル管理
export default async function FilePage({
	params,
}: { params: { groupId: string } }) {
	const { groupId } = params;
	const userInfo = await getUserInfo();
	const fileGroup = await prisma.fileGroup.findFirst({
		where: {
			id: groupId,
			deletedAt: null,
		},
	});
	if (!fileGroup) {
		redirect("/");
	}

	// 所有者でない時
	if (fileGroup.createdBy !== userInfo?.sub) {
		// プライベートの時はホーム画面に移動
		if (fileGroup.publicRange === "private") {
			redirect("/");
		}
		// パブリックの時はプレビュー画面に移動
		if (fileGroup.publicRange === "public") {
			redirect(`/group/${fileGroup.id}`);
		}
	}

	const files = await prisma.file.findMany({
		where: { groupId },
		orderBy: {
			order: "asc",
		},
	});

	return (
		<Fragment>
			<div className="text-3xl m-4">{fileGroup.name}</div>
			<div className="container mx-auto px-4">
				<GroupFileTable files={files} fileGroup={fileGroup} />
			</div>
		</Fragment>
	);
}
