"use client";

import { Button } from "@workspace/ui/components/button";
import { Fragment, MouseEvent, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { EllipsisVertical, Eye, Star, Unlink } from "lucide-react";
import { File, FileGroup } from "@prisma/client";
import { updateGroupThumbnail } from "@workspace/lib";
import { useAlert } from "@workspace/ui/providers/AlertModalProvider";

type GroupFileMenuProps = {
	file: File;
	fileGroup: FileGroup;
	disabled?: boolean;
};

export function GroupFileMenu(props: GroupFileMenuProps) {
	const { file, fileGroup, disabled = false } = props;
	const { showAlert } = useAlert();
	const [isPreview, setPreview] = useState(false);
	const src = process.env.NEXT_PUBLIC_DISTRIBUTION_DOMAIN_URL + "/" + file.path;

	async function preview(e: MouseEvent<HTMLDivElement>) {
		e.stopPropagation();
		setPreview(true);
	}

	async function setGroupThumbnail(e: MouseEvent<HTMLDivElement>) {
		e.stopPropagation();
		try {
			await updateGroupThumbnail(fileGroup.id, file.path);
			showAlert({
				message: `${file.name}をサムネイルに設定しました。`,
			});
		} catch (e) {
			showAlert({
				message: "サムネイルの設定に失敗しました。",
			});
		}
	}

	return (
		<Fragment>
			<DropdownMenu>
				<DropdownMenuTrigger asChild disabled={disabled}>
					<Button variant="ghost">
						<EllipsisVertical />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuLabel>{file.name}</DropdownMenuLabel>
					<DropdownMenuItem onClick={preview}>
						<Eye className="mr-1 h-4 w-4" />
						<span>プレビュー</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={setGroupThumbnail}>
						<Star className="mr-1 h-4 w-4" />
						<span>グループサムネイルに設定</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem className="text-red-600 cursor-pointer flex items-center">
						<Unlink className="mr-1 h-4 w-4" />
						<span>ファイルをグループから外す</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{isPreview && src && (
				<div
					className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
					onClick={(e) => {
						e.stopPropagation();
						setPreview(false);
					}}
				>
					<div className="max-w-[90vw] max-h-[95vh]">
						<img
							src={src}
							alt={file.name}
							className="select-none max-w-full max-h-[95vh] object-contain"
						/>
					</div>
				</div>
			)}
		</Fragment>
	);
}
