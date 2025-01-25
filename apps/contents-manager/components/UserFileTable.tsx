"use client";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import { Fragment } from "react";
import { Card } from "@workspace/ui/components/card";
import { CircleCheck } from "lucide-react";
import { deleteFile, formatBytes, generateDeleteURL } from "@workspace/lib";
import { User } from "@prisma/client";
import { GridImage } from "@/components/GridImage";
import { useAlert } from "@/providers/AlertModalProvider";
import { useLoading } from "@/providers/LoadingProvider";
import { useFileSelect } from "@/hooks/useFileSelect";
import { UserFileMenu } from "./UserFileMenu";
import { Pagination } from "./Pagenation";
import { FileWithGroup } from "@workspace/db";

type UserFileTableProps = {
	user: User;
	files: FileWithGroup[];
};

export function UserFileTable(props: UserFileTableProps) {
	const { user, files } = props;
	const { selectFiles, selectFileIds, clickFile, clearFileSelect } =
		useFileSelect();
	const { showAlert } = useAlert();
	const { showLoading, hideLoading } = useLoading();

	async function deleteHandler() {
		try {
			showLoading();
			for (const selectFile of selectFiles) {
				const deleteUrl = await generateDeleteURL(selectFile.path);
				await fetch(deleteUrl, { method: "DELETE" });
				await deleteFile(selectFile.id);
			}
			showAlert({
				message: `${selectFileIds.length}件のファイルを削除しました。`,
				onClose: () => window.location.reload(),
			});
		} catch (e) {
			let message = "ファイルの削除に失敗しました。";
			if (e instanceof Error) {
				message = e.message;
			}
			showAlert({ message });
		} finally {
			hideLoading();
		}
	}

	return (
		<Fragment>
			<div className="flex gap-2 my-2">
				<Button onClick={clearFileSelect} disabled={selectFiles.length === 0}>
					選択をクリア
				</Button>
				<Button
					onClick={deleteHandler}
					variant="destructive"
					disabled={selectFiles.length === 0}
				>
					選択ファイルを削除
				</Button>
			</div>
			<Card className="mt-2">
				<div className="py-2">
					<Pagination totalPages={10} />
				</div>
				<Table>
					<TableHeader>
						<TableRow className="hidden md:table-row">
							<TableHead className="text-center w-32">プレビュー</TableHead>
							<TableHead>ファイル名</TableHead>
							<TableHead>ファイルタイプ</TableHead>
							<TableHead className="text-right">サイズ</TableHead>
							<TableHead className="text-right">作成日</TableHead>
							<TableHead className="text-center">グループ名</TableHead>
							<TableHead />
						</TableRow>
					</TableHeader>
					<TableBody>
						{files.map((file, index) => (
							<TableRow
								key={index}
								onClick={() => clickFile(file)}
								data-state={selectFileIds.includes(file.id) && "selected"}
								className="cursor-pointer"
							>
								<TableCell className="font-medium p-1 min-w-[100px] max-w-[100px] md:max-w-[200px] relative">
									<GridImage
										filePath={file.path}
										alter={file.name}
										size={150}
									/>
									{selectFileIds.includes(file.id) && (
										<CircleCheck
											className="absolute left-1 top-1"
											fill="green"
											size={30}
										/>
									)}
								</TableCell>
								<TableCell className="hidden md:table-cell">
									{file.name}
								</TableCell>
								<TableCell className="hidden md:table-cell">
									{file.mimetype}
								</TableCell>
								<TableCell className="text-right hidden md:table-cell">
									{formatBytes(file.size)}
								</TableCell>
								<TableCell className="text-right hidden md:table-cell">
									{file.createdAt.toLocaleString()}
								</TableCell>
								<TableCell className="hidden md:table-cell text-center">
									{file.group?.name}
								</TableCell>
								<TableCell className="text-center">
									<UserFileMenu user={user} file={file} />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Card>
		</Fragment>
	);
}
