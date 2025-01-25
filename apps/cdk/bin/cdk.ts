#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkStack } from "../lib/cdk-stack";

const app = new cdk.App();
const envName = process.env.ENV_NAME || "dev";
new CdkStack(app, "CdkStack", { envName });
new CdkStack(app, "ProdStack", { envName });
new CdkStack(app, "TomokiStack", { envName });
