"use client";

import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { Fragment, useState } from "react";
import { Plus } from "lucide-react";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { addFileGroup } from "@workspace/lib";

export function AddFileGroup() {
	const [isOpen, setOpen] = useState(false);

	return (
		<Fragment>
			<Button
				onClick={() => setOpen(true)}
				className="items-center"
			>
				<Plus className="mr-2" />
				<div>ファイルグループ追加</div>
			</Button>
			<Dialog open={isOpen} onOpenChange={() => setOpen(false)}>
				<DialogContent className="sm:max-w-[425px]">
					<form action={addFileGroup}>
						<DialogHeader>
							<DialogTitle>ファイルグループの追加</DialogTitle>
							<DialogDescription>
								<div>
									<Label>グループ名</Label>
									<Input name="name" />
								</div>
								<div>
									<Label>概要</Label>
									<Textarea name="description" />
								</div>
							</DialogDescription>
						</DialogHeader>
						<div className="mt-4 flex justify-end">
							<Button onClick={() => setOpen(false)}>OK</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</Fragment>
	);
}
