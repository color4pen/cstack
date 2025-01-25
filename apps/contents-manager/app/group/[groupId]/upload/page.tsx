"use server";

import UploadTable from "@/components/UploadTable";
import { prisma } from "@workspace/db";
import { getUserInfo } from "@workspace/lib";
import { redirect } from "next/navigation";
import { Fragment } from "react";

// ファイルグループファイルのアップロード画面
export default async function UploadPage({
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
		redirect(`/`);
	}

	// 所有者でない時
	if (fileGroup.createdBy !== userInfo?.sub) {
		// プライベートの時はホーム画面に移動
		if (fileGroup.publicRange === "private") {
			redirect(`/`);
		}
		// パブリックの時はプレビュー画面に移動
		if (fileGroup.publicRange === "public") {
			redirect(`/group/${fileGroup.id}`);
		}
	}

	return (
		<Fragment>
			<div className="text-3xl m-4">{fileGroup?.name}</div>
			<UploadTable groupId={groupId} />
		</Fragment>
	);
}
