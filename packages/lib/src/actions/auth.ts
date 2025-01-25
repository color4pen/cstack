"use server";

import {
	CognitoIdentityProviderClient,
	InitiateAuthCommand,
	type InitiateAuthCommandInput,
	AdminCreateUserCommand,
	type AdminCreateUserCommandInput,
	AdminSetUserPasswordCommand,
	type AdminSetUserPasswordCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { cookies } from "next/headers";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { redirect } from "next/navigation";
import { prisma } from "@workspace/db";

// Cognitoの設定
const USER_POOL_ID = process.env.AWS_COGNITO_USER_POOL_ID;
const USER_POOL_CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID;
const USER_POOL_REGION = process.env.AWS_REGION;

const client = new CognitoIdentityProviderClient({ region: USER_POOL_REGION });

const ID_TOKEN_NAME = "idToken";
const ID_TOKEN_MAX_AGE = 3600;
const REFRESH_TOKEN_NAME = "refreshToken";
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60;

// 新規登録
export async function registerUser(formData: FormData) {
	const password = formData.get("password")?.toString();
	const email = formData.get("email")?.toString();
	if (!password || !email) {
		return { success: false, message: "フィードが不足しています。" };
	}

	const createUserParams: AdminCreateUserCommandInput = {
		UserPoolId: USER_POOL_ID,
		Username: email,
		TemporaryPassword: password,
		UserAttributes: [
			{
				Name: "email",
				Value: email,
			},
			{
				Name: "email_verified",
				Value: "true",
			},
		],
		MessageAction: "SUPPRESS", // ユーザー作成時にメッセージを送信しない
	};

	const setPasswordParams: AdminSetUserPasswordCommandInput = {
		UserPoolId: USER_POOL_ID,
		Username: email,
		Password: password,
		Permanent: true, // パスワードを永続的に設定,
	};

	try {
		const createUserCommand = new AdminCreateUserCommand(createUserParams);
		const res = await client.send(createUserCommand);
		const setPasswordCommand = new AdminSetUserPasswordCommand(
			setPasswordParams,
		);
		await client.send(setPasswordCommand);
		if (!res.User?.Username) {
			throw Error("ユーザー登録に失敗しました。");
		}
		await prisma.user.create({
			data: {
				id: res.User.Username,
				email: email,
			},
		});

		await prisma.profile.create({
			data: {
				userId: res.User.Username,
			},
		});
		return {
			success: true,
			message:
				"ユーザー登録が完了しました。確認コードをメールで確認してください。",
		};
	} catch (error) {
		console.error("Error registering user:", error);
		if (error instanceof Error) {
			return { success: false, message: error.message };
		}
		return { success: false, message: "ユーザー登録に失敗しました。" };
	}
}

// ログイン
export async function loginUser(formData: FormData) {
	const username = formData.get("email") as string;
	const password = formData.get("password") as string;

	if (!username || !password) {
		return {
			success: false,
			message: "メールアドレスとパスワードは必須です。",
		};
	}

	const params: InitiateAuthCommandInput = {
		AuthFlow: "USER_PASSWORD_AUTH",
		ClientId: USER_POOL_CLIENT_ID,
		AuthParameters: {
			USERNAME: username,
			PASSWORD: password,
		},
	};

	try {
		const command = new InitiateAuthCommand(params);
		const response = await client.send(command);

		// ログイン時にトークンを取得する
		if (
			response.AuthenticationResult?.IdToken &&
			response.AuthenticationResult?.RefreshToken
		) {
			cookies().set(ID_TOKEN_NAME, response.AuthenticationResult.IdToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: response.AuthenticationResult.ExpiresIn || ID_TOKEN_MAX_AGE,
			});

			cookies().set(
				REFRESH_TOKEN_NAME,
				response.AuthenticationResult.RefreshToken,
				{
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					sameSite: "strict",
					maxAge: REFRESH_TOKEN_MAX_AGE,
				},
			);

			return { success: true, message: "ログインに成功しました。" };
		}
		return {
			success: false,
			message: "トークン情報を取得できませんでした。",
		};
	} catch (error) {
		console.error("Error logging in user:", error);
		let message = "ログイン中にエラーが発生しました。";
		if (error instanceof Error) {
			message = error.message;
		}
		return { success: false, message };
	}
}

export async function logout() {
	cookies().delete(ID_TOKEN_NAME);
	cookies().delete(REFRESH_TOKEN_NAME);
	redirect("/auth/login");
}

export type UserInfo = {
	sub: string;
	email: string;
	name: string | undefined;
} | null;

export async function getUserInfo() {
	return await (await getUserInfoByCookie()) || (await getUserInfoByRefreshToken());
}

// ユーザー情報を取得する
export async function getUserInfoByCookie() {
	try {
		const idToken = cookies().get(ID_TOKEN_NAME)?.value;

		if (!idToken) {
			return null;
		}

		const userInfo = await verifyIdToken(idToken);

		return userInfo;
	} catch (error) {
		console.error("Token verification failed:", error);
		return null;
	}
}

export async function getUserInfoByRefreshToken(isServerAction?: boolean) {
	const refreshToken = cookies().get(REFRESH_TOKEN_NAME)?.value;
	if (!refreshToken) {
		return null;
	}

	const command = new InitiateAuthCommand({
		AuthFlow: "REFRESH_TOKEN_AUTH",
		ClientId: USER_POOL_CLIENT_ID,
		AuthParameters: {
			REFRESH_TOKEN: refreshToken,
		},
	});
	try {
		const response = await client.send(command);
		const newIdToken = response.AuthenticationResult?.IdToken;

		if (!newIdToken) {
			return null;
		}

		if (isServerAction) {
			cookies().set("idToken", newIdToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: ID_TOKEN_MAX_AGE,
			});
		}

		const userInfo = await verifyIdToken(newIdToken);

		return userInfo;
	} catch {
		return null;
	}
}

// リフレッシュトークンを検証してidTokenを更新する
export async function refreshIdToken() {
	const refreshToken = cookies().get(REFRESH_TOKEN_NAME)?.value;
	if (!refreshToken) {
		return false;
	}
	try {
		const command = new InitiateAuthCommand({
			AuthFlow: "REFRESH_TOKEN_AUTH",
			ClientId: USER_POOL_CLIENT_ID,
			AuthParameters: {
				REFRESH_TOKEN: refreshToken,
			},
		});

		const response = await client.send(command);
		const newIdToken = response.AuthenticationResult?.IdToken;

		if (!newIdToken) {
			return false;
		}

		// 新しいidTokenをcookieに設定
		cookies().set("idToken", newIdToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: ID_TOKEN_MAX_AGE,
		});
		return true;
	} catch (error) {
		return false;
	}
}

type VerifyAdminPasswordState = {
	show: boolean;
	message?: string;
};

// 管理形画面のパスワード検証
export async function verifyAdminPassword(
	_previousState: VerifyAdminPasswordState,
	formData: FormData,
) {
	const password = formData.get("password")?.toString();
	if (password === process.env.ADMIN_PW) {
		return {
			show: true,
		};
	}
	return {
		show: false,
		message: "パスワードが違います。",
	};
}

export async function verifyIdToken(idToken: string) {
	const verifier = CognitoJwtVerifier.create({
		userPoolId: USER_POOL_ID || "",
		tokenUse: "id",
		clientId: USER_POOL_CLIENT_ID,
	});

	const payload = await verifier.verify(idToken, {
		clientId: USER_POOL_CLIENT_ID || "",
	});

	if (!payload.email) {
		return null;
	}

	const userInfo = {
		sub: payload.sub,
		email: payload.email?.toString(),
		name: payload.name?.toString(),
	};

	return userInfo;
}
