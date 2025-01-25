"use server";

import { prisma } from "@workspace/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Fragment } from "react";
import { GridImage } from "@workspace/ui/components/grid-image";
import { Pagination } from "@workspace/ui/components/pagination-component";
import { FileGroupList } from "@workspace/ui/components/file-group-list";

type PageParams = {
	params: { userId: string };
	searchParams: { page: number };
};
// プロフィールページ
export default async function ProfilePage({
	params,
	searchParams,
}: PageParams) {
	const { userId } = params;
	const { page } = searchParams;
	const parItem = 8;
	const user = await prisma.user.findFirst({
		where: {
			id: userId,
		},
		include: {
			profile: true,
			files: {
				where: {
					group: {
						publicRange: "public",
					},
				},
				skip: (page - 1) * parItem || 0,
				take: parItem,
			},
			fileGroups: {
				include: {
					files: true,
				},
				where: {
					deletedAt: null,
					publicRange: "public",
				},
			},
		},
	});
	if (!user) return "ユーザーが見つかりませんでした。";
	const fileCount = await prisma.file.count({
		where: {
			group: {
				publicRange: "public",
			},
			createdBy: user.id,
		},
	});
	const maxPage = Math.ceil(fileCount / parItem);

	return (
		<Fragment>
			<div className="font-bold text-2xl my-3">{user.name}</div>
			<Tabs defaultValue="bio">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="bio">bio</TabsTrigger>
					<TabsTrigger value="media">メディア</TabsTrigger>
					<TabsTrigger value="group">グループ</TabsTrigger>
				</TabsList>
				<TabsContent value="bio">
					<ReactMarkdown className="prose" remarkPlugins={[remarkGfm]}>
						{user.profile?.bio}
					</ReactMarkdown>
				</TabsContent>
				<TabsContent value="media">
					<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{user.files.map((file) => (
							<GridImage
								filePath={file.path}
								alter={file.name}
								key={file.id}
								preview
								size={300}
							/>
						))}
					</div>
					<div className="my-5">
						<Pagination totalPages={maxPage} />
					</div>
				</TabsContent>
				<TabsContent value="group">
					<FileGroupList fileGroupList={user.fileGroups} linkPrefix="/g/" />
				</TabsContent>
			</Tabs>
		</Fragment>
	);
}
