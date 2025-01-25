"use client";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
import { Card } from "@workspace/ui/components/card";
import { DisplayType, type User } from "@prisma/client";
import { GridImage } from "@/components/GridImage";
import { UserFileGroupMenu } from "./UserFileGroupMenu";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import { FileGroupWithFiles } from "@workspace/db";
import { Button } from "@workspace/ui/components/button";
import { switchFileGroupDisplayType } from "@workspace/lib";

type UserFileGroupTableProps = {
	user: User;
	fileGroups: FileGroupWithFiles[];
};

export function UserFileGroupTable(props: UserFileGroupTableProps) {
	const { user, fileGroups } = props;

	return (
		<Card className="mt-2">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="text-center w-32">サムネイル</TableHead>
						<TableHead className="text-center">グループ名</TableHead>
						<TableHead className="text-center hidden md:table-cell max-w-[200px]">
							作成日
						</TableHead>
						<TableHead className="text-center">表示設定</TableHead>
						<TableHead />
					</TableRow>
				</TableHeader>
				<TableBody>
					{fileGroups.map((fileGroup) => (
						<TableRow key={fileGroup.id} className="cursor-pointer">
							<TableCell className="font-medium p-1 min-w-[100px] max-w-[100px] md:max-w-[200px] relative">
								{fileGroup.thumbnailImagePath ? (
									<GridImage
										filePath={fileGroup.thumbnailImagePath}
										alter="サムネイル"
										size={150}
									/>
								)
									:
									<div className="w-[150px] h-[150px] flex flex-col justify-center items-center select-none">
										<div>
											未設定
										</div>
									</div>
								}
							</TableCell>
							<TableCell>{fileGroup.name}</TableCell>
							<TableCell className="text-center hidden md:table-cell max-w-[200px]">
								{fileGroup.createdAt.toLocaleDateString()}
							</TableCell>
							<TableCell className="text-center">
								<Select
									value={fileGroup.displayType}
									onValueChange={async (nextType: DisplayType) => {
										await switchFileGroupDisplayType(fileGroup, nextType);
										window.location.reload();
									}}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{Object.values(DisplayType).map((type) => (
												<SelectItem value={type} key={type}>
													{type}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</TableCell>
							<TableCell>
								<div className="flex gap-1">
									<Link href={`/group/${fileGroup.id}`}>
										<Button variant="outline">
											<EyeIcon className="h-4 w-4" />
										</Button>
									</Link>
									<UserFileGroupMenu fileGroup={fileGroup} user={user} />
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Card>
	);
}
