"use client";

import { Button } from "@workspace/ui/components/button";
import { Fragment } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
	EllipsisVertical,
	Folder,
	Globe,
	GlobeLock,
	Trash,
} from "lucide-react";
import Link from "next/link";
import type { FileGroup, User } from "@prisma/client";
import { switchFileGroupPublish } from "@workspace/lib";

type GroupFileMenuProps = {
	fileGroup: FileGroup;
	user: User;
};

export function UserFileGroupMenu(props: GroupFileMenuProps) {
	const { fileGroup } = props;

	return (
		<Fragment>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline">
						<EllipsisVertical />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<Link href={`/group/${fileGroup.id}/files`}>
						<DropdownMenuItem>
							<Folder className="mr-1 h-4 w-4" />
							<span>ファイル管理</span>
						</DropdownMenuItem>
					</Link>
					<DropdownMenuSeparator />

					{fileGroup.publicRange === "public" && (
						<DropdownMenuItem
							onClick={async () => {
								await switchFileGroupPublish(fileGroup, "private");
								window.location.reload();
							}}
						>
							<GlobeLock className="mr-1 h-4 w-4" />
							<span>ファイルを非公開にする</span>
						</DropdownMenuItem>
					)}

					{fileGroup.publicRange === "private" && (
						<DropdownMenuItem
							onClick={async () => {
								await switchFileGroupPublish(fileGroup, "public");
								window.location.reload();
							}}
						>
							<Globe className="mr-1 h-4 w-4" />
							<span>ファイルを公開する</span>
						</DropdownMenuItem>
					)}
					<DropdownMenuSeparator />
					<DropdownMenuItem className="text-red-600 cursor-pointer flex items-center">
						<Trash className="mr-1 h-4 w-4" />
						<span>グループを削除</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</Fragment>
	);
}
