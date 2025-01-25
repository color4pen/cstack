"use server";

import { FileGroupList } from "@/components/FileGroupList";
import { prisma } from "@workspace/db";

// トップ画面
export default async function Home() {
	const publicFileGroupList = await prisma.fileGroup.findMany({
		where: {
			deletedAt: null,
			publicRange: "public",
		},
		include: {
			files: true,
		},
		orderBy: {
			createdAt: "asc",
		},
	});

	return <FileGroupList fileGroupList={publicFileGroupList} />;
}
