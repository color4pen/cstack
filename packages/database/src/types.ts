import type { Prisma } from '@prisma/client';

// ファイルを含むFileGroup
export type FileGroupWithFiles = Prisma.FileGroupGetPayload<{
	include: { files: true }
}>;

// グループを含むFile
export type FileWithGroup = Prisma.FileGetPayload<{
	include: { group: true }
}>;

// ファイルとグループを含むUser
export type UserWithAll = Prisma.UserGetPayload<{
	include: {
		files: true
		groups: true
	}
}>;