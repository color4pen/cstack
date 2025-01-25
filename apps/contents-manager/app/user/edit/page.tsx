"use server";

import { prisma } from "@workspace/db";
import { Textarea } from "@workspace/ui/components/textarea";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { getUserInfo, upsertProfile } from "@workspace/lib";

// プロフィール編集画面
export default async function GroupPage() {
	const userInfo = await getUserInfo();
	if (!userInfo) {
		return "再度ログインして下さい。";
	}

	const user = await prisma.user.findFirst({
		where: {
			id: userInfo.sub,
		},
		include: {
			profile: true,
		},
	});
	if (!user) return "ユーザーが見つかりませんでした。";

	return (
		<div className="container mx-auto p-4">
			<form action={upsertProfile}>
				<input name="userId" value={userInfo.sub} className="hidden" readOnly />
				<input
					name="userEmail"
					value={userInfo.email}
					className="hidden"
					readOnly
				/>
				<div className="flex items-center">
					<div className="font-bold text-2xl">プロフィール編集</div>
					<div className="grow" />
					<Button type="submit">保存</Button>
				</div>
				<div className="mt-1">
					<Label className="m-2 text-lg">メールアドレス</Label>
					<Input name="userEmail" defaultValue={user.email} readOnly disabled />
				</div>
				<div className="mt-1">
					<Label className="m-2 text-lg">ユーザー名</Label>
					<Input name="name" defaultValue={user.name || ""} />
				</div>
				<div className="mt-1">
					<Label className="m-2 text-lg">自己紹介</Label>
					<Textarea
						name="bio"
						className="min-h-[300px]"
						defaultValue={user.profile?.bio || ""}
					/>
				</div>
			</form>
		</div>
	);
}
