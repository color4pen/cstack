import * as cdk from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { aws_cognito as cognito } from "aws-cdk-lib";
import { aws_cloudfront as cloudfront } from "aws-cdk-lib";
import { aws_cloudfront_origins as cloudfrontOrigins } from "aws-cdk-lib";
import { Construct } from "constructs";

interface CdkStackProps extends cdk.StackProps {
	envName: string;
}

export class CdkStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: CdkStackProps) {
		super(scope, id, props);
		const { envName } = props;

		const mediaBucket = new s3.Bucket(this, "MediaBucket", {
			blockPublicAccess: new s3.BlockPublicAccess({
				blockPublicAcls: true,
				blockPublicPolicy: false,
				ignorePublicAcls: true,
				restrictPublicBuckets: false,
			}),
			cors: [
				{
					allowedHeaders: ["*"],
					allowedMethods: [
						s3.HttpMethods.GET,
						s3.HttpMethods.POST,
						s3.HttpMethods.PUT,
						s3.HttpMethods.DELETE,
					],
					allowedOrigins: [
						"https://media.color4pen.com",
						"https://odekeke.yurinasu.com",
						"https://localhost:3000",
					],
					maxAge: 3000,
				},
			],
		});

		// バケット名をCDK Outputとしてエクスポート
		new cdk.CfnOutput(this, "AWS_S3_MAIN_BUCKET", {
			value: mediaBucket.bucketName,
		});

		// CloudFront OAIの作成
		const originAccessIdentity = new cloudfront.OriginAccessIdentity(
			this,
			"OAI",
		);

		// S3バケットポリシーの更新
		mediaBucket.addToResourcePolicy(
			new iam.PolicyStatement({
				actions: ["s3:GetObject"],
				resources: [mediaBucket.arnForObjects("*")],
				principals: [originAccessIdentity.grantPrincipal],
			}),
		);

		// CloudFrontディストリビューションの作成
		const distribution = new cloudfront.Distribution(
			this,
			"MediaDistribution",
			{
				defaultBehavior: {
					origin: new cloudfrontOrigins.S3Origin(mediaBucket, {
						originAccessIdentity: originAccessIdentity,
					}),
					allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
					viewerProtocolPolicy:
						cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				},
			},
		);

		// CloudFrontディストリビューションのURLを出力
		new cdk.CfnOutput(this, "NEXT_PUBLIC_DISTRIBUTION_DOMAIN_URL", {
			value: distribution.distributionDomainName,
		});

		// IAMユーザーの作成
		const appUser = new iam.User(this, "MyAppUser");
		const mediaBucketPolicy = new s3.BucketPolicy(this, "BucketPolicy", {
			bucket: mediaBucket,
		});

		mediaBucketPolicy.document.addStatements(
			new iam.PolicyStatement({
				actions: ["s3:GetObject"],
				resources: [mediaBucket.arnForObjects("*")],
				principals: [originAccessIdentity.grantPrincipal],
				effect: iam.Effect.ALLOW,
			}),
			new iam.PolicyStatement({
				actions: ["s3:*"],
				resources: [mediaBucket.bucketArn + "/*"],
				principals: [appUser.grantPrincipal],
				effect: iam.Effect.ALLOW,
			}),
			new iam.PolicyStatement({
				actions: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
				resources: [mediaBucket.arnForObjects("*")],
				principals: [new iam.AnyPrincipal()],
				effect: iam.Effect.ALLOW,
				conditions: {
					StringEquals: {
						"s3:signatureversion": "v4",
					},
				},
			}),
		);

		// セキュアな方法で認証情報を管理
		const appAccessKey = new iam.CfnAccessKey(this, "MyAccessKey", {
			userName: appUser.userName,
		});
		new cdk.CfnOutput(this, "AWS_ACCESS_KEY_ID", { value: appAccessKey.ref });
		new cdk.CfnOutput(this, "AWS_SECRET_ACCESS_KEY", {
			value: appAccessKey.attrSecretAccessKey,
		});

		mediaBucketPolicy.document.addStatements(
			new iam.PolicyStatement({
				actions: ["s3:*"],
				resources: [mediaBucket.bucketArn + "/*"],
				principals: [appUser.grantPrincipal],
				effect: iam.Effect.ALLOW,
			}),
		);

		const userPool = new cognito.UserPool(this, "UserPool", {
			selfSignUpEnabled: true,
			signInAliases: {
				email: true,
			},
			autoVerify: {
				email: false,
			},
			standardAttributes: {
				email: {
					required: true,
					mutable: true,
				},
			},
			passwordPolicy: {
				minLength: 8,
				requireLowercase: true,
				requireUppercase: false,
				requireDigits: true,
				requireSymbols: false,
			},
		});

		const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
			userPool,
			generateSecret: false,
			authFlows: {
				adminUserPassword: true,
				userPassword: true,
				userSrp: true,
			},
		});

		const policy = new iam.PolicyStatement({
			actions: [
				"s3:*",
				"cognito-idp:AdminCreateUser",
				"cognito-idp:AdminSetUserPassword",
				"s3:PutObject",
				"s3:GetObject",
				"s3:DeleteObject",
				"s3:ListBucket",
			],
			resources: [
				mediaBucket.bucketArn,
				mediaBucket.arnForObjects("*"),
				userPool.userPoolArn,
			],
		});
		appUser.addToPolicy(policy);

		new cdk.CfnOutput(this, "UserPoolId", {
			value: userPool.userPoolId,
		});

		new cdk.CfnOutput(this, "UserPoolClientId", {
			value: userPoolClient.userPoolClientId,
		});
	}
}
