"use client";

import { Button } from "@workspace/ui/components/button";
import { Fragment, type MouseEvent, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
	EllipsisVertical,
	Eye,
	Link,
	Trash,
	User as UserIcon,
} from "lucide-react";
import { File, User } from "@workspace/db";

type GroupFileMenuProps = {
	file: File;
	user: User;
};

export function UserFileMenu(props: GroupFileMenuProps) {
	const { file } = props;
	const [isPreview, setPreview] = useState(false);
	const src = `${process.env.NEXT_PUBLIC_DISTRIBUTION_DOMAIN_URL}/${file.path}`;

	async function preview(e: MouseEvent<HTMLDivElement>) {
		e.stopPropagation();
		setPreview(true);
	}

	return (
		<Fragment>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
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
					<DropdownMenuItem>
						<UserIcon className="mr-1 h-4 w-4" />
						<span>プロフィール画像に設定</span>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Link className="mr-1 h-4 w-4" />
						<span>グループに割り当て</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem className="text-red-600 cursor-pointer flex items-center">
						<Trash className="mr-1 h-4 w-4" />
						<span>ファイルを削除</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{isPreview && src && (
				<div
					className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
					onMouseDown={(e) => {
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
