"use client";

import { DeleteFIleGroupModal } from "@/components/DeleteFIleGroupModal";
import { Button } from "@workspace/ui/components/button";
import { Fragment, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { EllipsisVertical, Trash, Upload } from "lucide-react";
import Link from "next/link";

type FileTableMenuProps = {
	groupId: string;
};

export function FileTableMenu(props: FileTableMenuProps) {
	const { groupId } = props;
	const [showDeleteModal, setDeleteModal] = useState(false);
	return (
		<Fragment>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost">
						<EllipsisVertical />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<Link href={`/group/${groupId}/upload`}>
						<DropdownMenuItem className="cursor-pointer flex items-center p-1">
							<Upload className="mr-1 h-4 w-4" />
							<span>アップロード</span>
						</DropdownMenuItem>
					</Link>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="text-red-600 cursor-pointer flex items-center p-1"
						onClick={() => setDeleteModal(true)}
					>
						<Trash className="mr-1 h-4 w-4" />
						<span>ファイルグループを削除</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<DeleteFIleGroupModal
				groupId={groupId}
				open={showDeleteModal}
				onOpenChange={setDeleteModal}
			/>
		</Fragment>
	);
}
