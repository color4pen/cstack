"use client";

import { Button } from "@workspace/ui/components/button";
import { Fragment } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { ArrowUpDown, EllipsisVertical, Globe, GlobeLock } from "lucide-react";
import type { FileGroup } from "@prisma/client";
import Link from "next/link";
import { switchFileGroupPublish, switchFileGroupSortOrder } from "@workspace/lib";
import { useAuth } from "@workspace/ui/providers/AuthProvider";

type FileGroupPageMenuProps = {
	fileGroup: FileGroup;
};

export function FileGroupPageMenu(props: FileGroupPageMenuProps) {
	const { fileGroup } = props;
	const { user } = useAuth();
	return (
		<Fragment>
			{user && (
				<div className="flex gap-2 my-2">
					<Link href={`/group/${fileGroup.id}/files`}>
						<Button>ファイル管理</Button>
					</Link>
					<Link href={`/group/${fileGroup.id}/upload`}>
						<Button>アップロード</Button>
					</Link>
					<div className="grow" />
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost">
								<EllipsisVertical />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
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

							<DropdownMenuItem
								onClick={async () => {
									await switchFileGroupSortOrder(fileGroup);
									window.location.reload();
								}}
							>
								<ArrowUpDown className="mr-1 h-4 w-4" />
								<span>並び順切り替え</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			)}
		</Fragment>
	);
}
