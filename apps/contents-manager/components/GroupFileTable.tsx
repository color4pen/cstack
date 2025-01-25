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
import { Fragment, type ReactNode, useState } from "react";
import { Card } from "@workspace/ui/components/card";
import {
	ArrowDownUp,
	CircleCheck,
	NavigationOff,
	Trash2,
	Undo2,
} from "lucide-react";
import { deleteFile, formatBytes, generateDeleteURL, updateFiles } from "@workspace/lib";
import type { File, FileGroup } from "@prisma/client";
import { GridImage } from "@/components/GridImage";
import Link from "next/link";
import { useAlert } from "@/providers/AlertModalProvider";
import { useLoading } from "@/providers/LoadingProvider";
import { useRouter } from "next/navigation";
import { useFileSelect } from "@/hooks/useFileSelect";
import { FileTableMenu } from "./FileTableMenu";
import { GroupFileMenu } from "./GroupFileMenu";
import { Badge } from "@workspace/ui/components/badge";
import {
	DndContext,
	closestCenter,
	useSensor,
	useSensors,
	type DragEndEvent,
	TouchSensor,
	MouseSensor,
	type Modifier,
} from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
	arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type GroupFileTableProps = {
	files: File[];
	fileGroup: FileGroup;
};

// ドラック可能列
const SortableItem = ({
	order,
	children,
	onClick,
	isDraggable,
}: {
	order: number;
	children: ReactNode;
	onClick: () => void;
	isDraggable: boolean;
}) => {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: order, disabled: !isDraggable });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<TableRow
			ref={setNodeRef}
			onClick={onClick}
			style={style}
			{...attributes}
			{...listeners}
		>
			{children}
		</TableRow>
	);
};

const restrictToVerticalAxis: Modifier = ({ transform }) => {
	return {
		...transform,
		x: 0,
	};
};

export function GroupFileTable(props: GroupFileTableProps) {
	const { files, fileGroup } = props;
	const groupId = fileGroup.id;
	const { selectFiles, selectFileIds, clickFile, clearFileSelect } =
		useFileSelect();
	const { showAlert } = useAlert();
	const { showLoading, hideLoading } = useLoading();
	const router = useRouter();
	const alert = useAlert();
	const [isSort, setSort] = useState(false);

	// ドラッグ用のセンサー
	const sensors = useSensors(
		useSensor(MouseSensor),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 250,
				tolerance: 5,
			},
		}),
	);

	/**
	 * ドラッグ＆ドロップ操作が終了した際のハンドラー関数。
	 * ファイルの順序を更新し、データベースに変更を反映します。
	 *
	 * @async
	 * @function handleDragEnd
	 * @param {DragEndEvent} event - dnd-kitのドラッグ終了イベントオブジェクト
	 * @param {Object} event.active - ドラッグされた要素の情報
	 * @param {Object} event.over - ドロップ先の要素の情報
	 * @throws {Error} 並び替え操作中にエラーが発生した場合
	 *
	 * @description
	 * この関数は以下の手順で動作します：
	 * 1. ドラッグされた要素と、ドロップ先の要素のインデックスを特定します。
	 * 2. インデックスが変更された場合のみ処理を続行します。
	 * 3. ローディング表示を開始します。
	 * 4. 配列内の要素を新しい順序に並び替え、各要素の順序（order）を更新します。
	 * 5. 更新されたファイル情報をデータベースに保存します。
	 * 6. ルーターをリフレッシュして、UIを更新します。
	 * 7. エラーが発生した場合、アラートを表示します。
	 * 8. 最後に、ローディング表示を終了します。
	 *
	 */
	async function handleDragEnd(event: DragEndEvent) {
		try {
			const { active, over } = event;
			const oldIndex = files.findIndex((file) => file.order === active.id);
			const newIndex = files.findIndex((file) => file.order === over?.id);
			if (oldIndex === newIndex) return;
			// 並び替えが発生している場合ローディングを実行
			showLoading();
			const newFiles = arrayMove(files, oldIndex, newIndex).map(
				(file, index) => ({
					...file,
					order: index + 1,
				}),
			);
			await updateFiles(newFiles);
			router.refresh();
		} catch (e) {
			let message = "並び替えに失敗しました。";
			if (e instanceof Error) {
				message = e.message;
			}
			alert.showAlert({ message });
		} finally {
			hideLoading();
		}
	}
	/**
	 * 選択されたファイルを削除するための非同期ハンドラー関数。
	 *
	 * @async
	 * @function deleteHandler
	 * @throws {Error} ファイルの削除プロセス中にエラーが発生した場合
	 *
	 * @description
	 * この関数は以下の手順で動作します：
	 * 1. ローディング表示を開始します。
	 * 2. 選択された各ファイルに対して以下の処理を行います：
	 *    a) ファイルの削除URLを生成します。
	 *    b) 生成されたURLに対してDELETEリクエストを送信します。
	 *    c) データベースからファイル情報を削除します。
	 * 3. 全てのファイルの削除が成功した場合、成功メッセージを表示し、
	 *    指定されたグループページにリダイレクトします。
	 * 4. エラーが発生した場合、エラーメッセージを表示します。
	 * 5. 最後に、ローディング表示を終了します。
	 *
	 * @requires selectFiles - 削除対象のファイル配列（グローバルまたはクロージャースコープで定義）
	 * @requires selectFileIds - 削除対象のファイルID配列（グローバルまたはクロージャースコープで定義）
	 * @requires groupId - 現在のグループID（グローバルまたはクロージャースコープで定義）
	 *
	 * @see generateDeleteURL - ファイルの削除URLを生成する関数
	 * @see deleteFile - データベースからファイルを削除する関数
	 * @see showLoading - ローディング表示を開始する関数
	 * @see hideLoading - ローディング表示を終了する関数
	 * @see showAlert - アラートメッセージを表示する関数
	 * @see router.replace - ページ遷移を行うルーター関数
	 *
	 * @example
	 * // ボタンクリックイベントにdeleteHandler関数を割り当てる例
	 * <button onClick={deleteHandler}>選択したファイルを削除</button>
	 */
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
				onClose: () => router.replace(`/group/${groupId}`),
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
				<Link href={`/group/${groupId}`}>
					<Button>
						<Undo2 />
					</Button>
				</Link>
				<Button
					onClick={clearFileSelect}
					size="icon"
					disabled={selectFiles.length === 0}
				>
					<NavigationOff />
				</Button>
				<Button
					onMouseDown={() =>
						showAlert({
							message: "選択されたファイルを削除しますか？",
							onYes: deleteHandler,
						})
					}
					size="icon"
					variant="destructive"
					disabled={selectFiles.length === 0}
				>
					<Trash2 />
				</Button>
				<Button
					onClick={() => {
						setSort(!isSort);
						clearFileSelect();
					}}
					size="icon"
					variant={isSort ? "default" : "ghost"}
				>
					<ArrowDownUp />
				</Button>
				<div className="grow" />
				<FileTableMenu groupId={groupId} />
			</div>
			<Card className="mt-2">
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
					modifiers={[restrictToVerticalAxis]}
				>
					<Table>
						<TableHeader>
							<TableRow className="hidden md:table-row">
								<TableHead className="text-center w-32">プレビュー</TableHead>
								<TableHead>ファイル名</TableHead>
								<TableHead>ファイルタイプ</TableHead>
								<TableHead className="text-right">サイズ</TableHead>
								<TableHead className="text-right">作成日</TableHead>
								<TableHead className="text-right">タグ</TableHead>
								<TableHead />
							</TableRow>
						</TableHeader>
						<TableBody>
							<SortableContext
								items={files.map((file) => file.order)}
								strategy={verticalListSortingStrategy}
							>
								{files.map((file) => (
									<SortableItem
										isDraggable={isSort}
										order={file.order}
										key={file.id}
										onClick={() => clickFile(file)}
										data-state={selectFileIds.includes(file.id) && "selected"}
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
										<TableCell className="flex flex-wrap p-1 gap-2">
											{fileGroup.thumbnailImagePath === file.path && (
												<Badge className="text-nowrap">サムネイル</Badge>
											)}
										</TableCell>
										<TableCell className="excluded-area text-center">
											<GroupFileMenu
												fileGroup={fileGroup}
												file={file}
												disabled={isSort}
											/>
										</TableCell>
									</SortableItem>
								))}
							</SortableContext>
						</TableBody>
					</Table>
				</DndContext>
			</Card>
		</Fragment>
	);
}
