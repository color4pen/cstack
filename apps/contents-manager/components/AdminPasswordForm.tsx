import { Fragment, ReactNode, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { useFormState } from "react-dom";
import { verifyAdminPassword } from "@workspace/lib";

type AdminPasswordFormProps = {
	children: ReactNode;
};

export function AdminPasswordForm({ children }: AdminPasswordFormProps) {
	const [state, formAction] = useFormState(verifyAdminPassword, {
		show: false,
	});

	return (
		<div className="flex justify-center items-center grow">
			{state.show ? (
				<Fragment>{children}</Fragment>
			) : (
				<form className="space-y-2" action={formAction}>
					<label
						htmlFor="password"
						className="text-sm font-medium text-gray-700"
					>
						パスワード
					</label>
					<div className="flex gap-2 items-center">
						<Input name="password" type="password" size={50} />
						<Button type="submit">チェック</Button>
					</div>
					<div>{state?.message}</div>
				</form>
			)}
		</div>
	);
}
