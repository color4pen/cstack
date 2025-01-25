"use server";

import path from "node:path";
import { DisplayType, File, FileGroup, PublicRange, prisma } from "@workspace/db";
import { getUserInfo, getUserInfoByRefreshToken } from "./auth";

interface UploadFile {
	id: string;
	name: string;
	type: string;
	size: number;
	imageUrl: string;
}

export async function insertFile(
	groupId: string,
	file: UploadFile,
	filePath: string,
	userId: string,
) {
	try {
		const fileExtension = path.extname(file.name);
		const maxOrderFile = await prisma.file.aggregate({
			_max: {
				order: true,
			},
		});

		const newFile = await prisma.file.create({
			data: {
				id: file.id,
				name: file.name,
				path: filePath,
				mimetype: file.type,
				originName: file.name,
				ext: fileExtension,
				size: file.size,
				createdBy: userId,
				groupId: groupId,
				order: maxOrderFile._max.order ? maxOrderFile._max.order + 1 : 1,
			},
		});

		return { success: true, newFile };
	} catch (error) {
		console.error("Error inserting file:", error);
		return { success: false, error: "Failed to insert file" };
	}
}

type ServerActionResponse<T> = {
	ok: boolean;
	message: string;
	data?: T;
};

export async function addFileGroup(
	formData: FormData,
): Promise<ServerActionResponse<FileGroup>> {
	try {
		const name = formData.get("name")?.toString();
		const description = formData.get("description")?.toString();
		const userInfo =
			(await getUserInfo()) || (await getUserInfoByRefreshToken(true));
		if (!userInfo) {
			return { ok: false, message: "再度ログインして下さい。" };
		}
		if (!name) {
			return { ok: false, message: "グループ名が設定されていません。" };
		}

		const fileGroup = await prisma.fileGroup.create({
			data: {
				name,
				description: description || "",
				createdBy: userInfo?.sub,
			},
		});
		return {
			ok: true,
			message: "ファイルグループを作成しました。",
			data: fileGroup,
		};
	} catch (e) {
		if (e instanceof Error) {
			return { ok: false, message: e.message };
		}
		console.error(e);
		return { ok: false, message: "ファイルグループを作成に失敗しました。" };
	}
}

export async function deleteFile(fileId: string) {
	await prisma.file.delete({
		where: {
			id: fileId,
		},
	});
}

export async function deleteFileGroup(groupId: string) {
	await prisma.fileGroup.updateMany({
		where: { id: groupId },
		data: {
			deletedAt: new Date(),
		},
	});
}

export async function switchFileGroupSortOrder(fileGroup: FileGroup) {
	return await prisma.fileGroup.update({
		where: { id: fileGroup.id },
		data: {
			sortOrder: fileGroup.sortOrder === "asc" ? "desc" : "asc",
		},
	});
}

export async function switchFileGroupPublish(
	fileGroup: FileGroup,
	nextRange: PublicRange,
) {
	return await prisma.fileGroup.update({
		where: { id: fileGroup.id },
		data: {
			publicRange: nextRange,
		},
	});
}

export async function switchFileGroupDisplayType(
	fileGroup: FileGroup,
	nextType: DisplayType,
) {
	return await prisma.fileGroup.update({
		where: { id: fileGroup.id },
		data: {
			displayType: nextType,
		},
	});
}

export async function updateGroupThumbnail(groupId: string, imagePath: string) {
	return await prisma.fileGroup.update({
		where: {
			id: groupId,
		},
		data: {
			thumbnailImagePath: imagePath,
		},
	});
}

export async function updateFiles(files: File[]) {
	return Promise.all(
		files.map((file) => {
			return prisma.file.update({
				where: {
					id: file.id,
				},
				data: file,
			});
		}),
	);
}
