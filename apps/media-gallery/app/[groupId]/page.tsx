"use server";

import { prisma } from "@workspace/db";
import { redirect } from "next/navigation";
import Image from "next/image";
import { getUserInfo } from "@workspace/lib";
import { GridImage } from "@workspace/ui/components/grid-image";
import { Separator } from "@workspace/ui/components/separator";
import { Pagination } from "@workspace/ui/components/pagination-component";

type PageParams = {
	params: { groupId: string };
	searchParams: { page: number };
};

// グループページ、ファイル一覧
export default async function GroupPage({ params, searchParams }: PageParams) {
	const { groupId } = params;
	const { page } = searchParams;
	const userInfo = await getUserInfo()
	const parItem = 12;
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
	}

	const files = await prisma.file.findMany({
		where: { groupId },
		orderBy: {
			order: fileGroup.sortOrder,
		},
		skip:
			fileGroup.displayType !== "fullColumn"
				? (page - 1) * parItem || 0
				: undefined,
		take:
			fileGroup.displayType !== "fullColumn"
				? parItem
				: undefined,
	});
	const fileCount = await prisma.file.count({
		where: { groupId },
	});
	const maxPage = Math.ceil(fileCount / parItem);

	return (
		<>
			<div className="text-3xl m-4">{fileGroup?.name}</div>
			<div className="container mx-auto px-4 justify-center">
				{fileGroup.displayType === "list" && (
					<div className="flex flex-col items-center">
						{files.map((file, index) => (
							<div key={fileGroup.id}>
								<div className="flex flex-col sm:flex-row gap-4">
									<div className="sm:w-1/3">
										<div className="relative aspect-video">
											<GridImage
												filePath={file.path}
												alter={file.name}
												size={300}
												preview
											/>
										</div>
									</div>
									<div className="sm:w-2/3 space-y-2">
										<h2 className="text-2xl font-bold">{file.name}</h2>
										<p className="text-sm text-gray-500">
											{file.createdAt.toLocaleString()}
										</p>
									</div>
								</div>
								{index < files.length - 1 && <Separator className="my-6" />}
							</div>
						))}
					</div>
				)}
				{fileGroup.displayType === "column" && (
					<div className="flex flex-col items-center">
						{files.map((file) => (
							<Image
								key={file.id}
								src={`${process.env.NEXT_PUBLIC_DISTRIBUTION_DOMAIN_URL}/${file.path}`}
								alt={file.name}
								width={600}
								height={600}
							/>
						))}
					</div>
				)}
				{fileGroup.displayType === "fullColumn" && (
					<div className="w-full">
						{files.map((file) => (
							<img
								key={file.id}
								src={`${process.env.NEXT_PUBLIC_DISTRIBUTION_DOMAIN_URL}/${file.path}`}
								alt={file.name}
							/>
						))}
					</div>
				)}
				{fileGroup.displayType === "grid" && (
					<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{files.map((file) => (
							<GridImage
								filePath={file.path}
								alter={file.name}
								key={file.id}
								preview
								size={500}
							/>
						))}
					</div>
				)}
				<div className="my-5">
					<Pagination totalPages={maxPage} />
				</div>
			</div>
		</>
	);
}
