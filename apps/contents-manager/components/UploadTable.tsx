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
import { ChangeEvent, useRef, useState } from "react";
import { v7 as uuidv7 } from "uuid";
import { useRouter } from "next/navigation";
import { Card } from "@workspace/ui/components/card";
import { CircleCheck, Plus, Undo2 } from "lucide-react";
import { useLoading } from "@/providers/LoadingProvider";
import { useAlert } from "@/providers/AlertModalProvider";
import { formatBytes, generateUploadURL, getUserInfo, getUserInfoByRefreshToken, insertFile } from "@workspace/lib";
import Link from "next/link";

interface UploadFile {
	id: string;
	name: string;
	type: string;
	size: number;
	imageUrl: string;
}

type UploadTableProps = {
	groupId: string;
};

export default function UploadTable(props: UploadTableProps) {
	const { groupId } = props;
	const fileInputRef = useRef<HTMLInputElement>(null);
	const handleSelectButtonClick = () => fileInputRef.current?.click();
	const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
	const [selectIds, setSelectIds] = useState<string[]>([]);
	const { showLoading, hideLoading } = useLoading();
	const router = useRouter();
	const { showAlert } = useAlert();
	function fileSelectHandler(event: ChangeEvent<HTMLInputElement>) {
		if (event.target.files) {
			const files = Array.from(event.target.files);
			const newFiles: UploadFile[] = [];
			for (const file of files) {
				newFiles.push({
					id: uuidv7(),
					name: file.name,
					type: file.type,
					size: file.size,
					imageUrl: URL.createObjectURL(file),
				});
			}
			setUploadFiles([...uploadFiles, ...newFiles]);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	}

	function clickRowHandler(fileId: string) {
		if (selectIds.indexOf(fileId) === -1) {
			setSelectIds([...selectIds, fileId]);
		} else {
			setSelectIds(selectIds.filter((id) => id !== fileId));
		}
	}

	function deleteFileHandler() {
		setUploadFiles(uploadFiles.filter((file) => !selectIds.includes(file.id)));
		setSelectIds([]);
	}

	async function uploadHandler() {
		showLoading();
		const userInfo =
			(await getUserInfo()) || (await getUserInfoByRefreshToken(true));
		if (!userInfo) {
			router.push("/auth/login");
			return;
		}
		try {
			console.log(uploadFiles);
			for (const file of uploadFiles) {
				const filePath = `${userInfo.sub}/${file.id}.${file.name.split(".").pop()}`;
				const uploadUrl = await generateUploadURL(filePath);
				const imageRes = await fetch(file.imageUrl);
				const imageData = await imageRes.blob();

				// Perform the upload using the fetched URL
				const response = await fetch(uploadUrl, {
					method: "PUT",
					body: imageData,
					headers: {
						"Content-Type": file.type,
					},
				});

				console.log(response);
				if (response.ok) {
					await insertFile(groupId, file, filePath, userInfo.sub);
				} else {
					throw Error("アップロードに失敗しました。");
				}
			}
			// const uploadPromises = uploadFiles.map(async (file) => {
			//   const filePath = `${userInfo.sub}/${file.id}.${file.name.split(".").pop()}`
			//   const uploadUrl = await generateUploadURL(filePath)
			//   const imageRes = await fetch(file.imageUrl)
			//   const imageData = await imageRes.blob()

			//   // Perform the upload using the fetched URL
			//   const response = await fetch(uploadUrl, {
			//     method: 'PUT',
			//     body: imageData,
			//     headers: {
			//       'Content-Type': file.type
			//     }
			//   });

			//   console.log(response)
			//   if (response.ok) {
			//     await insertFile(groupId, file, filePath, userInfo.sub)
			//   } else {
			//     console.error(`Failed to upload file: ${file.name}`)
			//   }
			// })

			// await Promise.all(uploadPromises)

			showAlert({
				title: "ファイルアップロード",
				message: "アップロードに成功しました。",
				onClose: () => router.push(`/group/${groupId}`),
			});
		} catch (e) {
			let message = "ファイルアップロードに失敗しました。";
			if (e instanceof Error) {
				message = e.message;
			}
			showAlert({
				title: "ファイルアップロード",
				message,
			});
		} finally {
			hideLoading();
		}
	}

	function clearHandler() {
		setSelectIds([]);
	}

	return (
		<div className="container mx-auto px-4">
			<input
				accept="image/*"
				className="hidden"
				type="file"
				ref={fileInputRef}
				onChange={fileSelectHandler}
				multiple
			/>
			<div className="flex gap-2 my-2">
				<Link href={`/group/${groupId}`}>
					<Button>
						<Undo2 />
					</Button>
				</Link>
				<Button
					onClick={uploadHandler}
					disabled={uploadFiles.length === 0}
					className="bg-green-700 hover:bg-green-600"
				>
					ファイルをアップロード
				</Button>
				<Button onClick={handleSelectButtonClick}>
					<Plus />
				</Button>
			</div>
			<div className="flex gap-2 my-2">
				<Button
					onClick={deleteFileHandler}
					variant="destructive"
					disabled={selectIds.length === 0}
				>
					選択削除
				</Button>
				<Button onClick={clearHandler} disabled={selectIds.length === 0}>
					選択クリア
				</Button>
			</div>
			<Card className="mt-2">
				<Table>
					<TableHeader>
						<TableRow className="hidden md:table-row">
							<TableHead className="text-center">プレビュー</TableHead>
							<TableHead className="text-center">ファイル名</TableHead>
							<TableHead className="text-center">ファイルタイプ</TableHead>
							<TableHead className="text-right">サイズ</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{uploadFiles.map((file, index) => (
							<TableRow
								key={index}
								onClick={() => clickRowHandler(file.id)}
								data-state={selectIds.includes(file.id) && "selected"}
								className="cursor-pointer"
							>
								<TableCell className="font-medium md:max-w-[100px] relative">
									{selectIds.includes(file.id) && (
										<CircleCheck
											className="absolute left-2 top-2"
											fill="green"
											size={40}
										/>
									)}
									<img
										alt={file.name}
										src={file.imageUrl}
										className="max-w-[100px]"
									/>
								</TableCell>
								<TableCell className="hidden md:table-cell">
									{file.name}
								</TableCell>
								<TableCell className="hidden md:table-cell">
									{file.type}
								</TableCell>
								<TableCell className="text-right hidden md:table-cell">
									{formatBytes(file.size)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Card>
		</div>
	);
}
