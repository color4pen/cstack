"use server";

import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3クライアントの設定
const s3Client = new S3Client({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
});

// 署名付きURLを生成する関数
export async function generateUploadURL(
	key: string,
	expiresIn: number = 3600,
): Promise<string> {
	const command = new PutObjectCommand({
		Bucket: process.env.AWS_S3_MAIN_BUCKET,
		Key: key,
	});
	return await getSignedUrl(s3Client, command, { expiresIn });
}

export async function generateDeleteURL(
	key: string,
	expiresIn: number = 3600,
): Promise<string> {
	const command = new DeleteObjectCommand({
		Bucket: process.env.AWS_S3_MAIN_BUCKET,
		Key: key,
	});
	return await getSignedUrl(s3Client, command, { expiresIn });
}
