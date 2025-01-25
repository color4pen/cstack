"use client";

import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import type { DialogProps } from "@radix-ui/react-dialog";
import { deleteFileGroup } from "@workspace/lib";
import { useLoading } from "@workspace/ui/providers/LoadingProvider";
import { useAlert } from "@workspace/ui/providers/AlertModalProvider";

type DeleteFIleGroupButtonProps = {
	groupId: string;
	open: DialogProps["open"];
	onOpenChange: (open: boolean) => void;
};

export function DeleteFIleGroupModal(props: DeleteFIleGroupButtonProps) {
	const { groupId, open, onOpenChange } = props;
	const { showLoading, hideLoading } = useLoading();
	const { showAlert } = useAlert();
	const router = useRouter();

	async function deleteHandler() {
		try {
			showLoading();
			await deleteFileGroup(groupId);

			showAlert({
				message: "ファイルグループを削除しました。",
				onClose: async () => {
					router.replace("/");
				},
			});
		} catch (e) {
			if (e instanceof Error) {
				showAlert({ message: e.message });
			} else {
				showAlert({ message: "ファイルの削除に失敗しました。" });
			}
		} finally {
			hideLoading();
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex gap-2 items-center">
						<TriangleAlert className="text-yellow-500" />
						ファイルグループ削除
					</DialogTitle>
					<DialogDescription>
						<div>ファイルグループを作成しますか？</div>
						<div>関係するファイルも全て削除されます</div>
					</DialogDescription>
				</DialogHeader>
				<div className="mt-4 flex flex-row-reverse justify-end">
					<Button onClick={() => onOpenChange(!open)} autoFocus>
						キャンセル
					</Button>
					<div className="grow" />
					<Button onClick={deleteHandler} variant="destructive">
						OK
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
