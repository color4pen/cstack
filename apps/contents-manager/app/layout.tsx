import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@workspace/ui/globals.css"
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import { getUserInfo, getUserInfoByRefreshToken } from "@workspace/lib";
import { LoadingProvider } from "@workspace/ui/providers/LoadingProvider";
import { SidebarProvider } from "@workspace/ui/providers/SidebarProvider";
import { AlertProvider } from "@workspace/ui/providers/AlertModalProvider";
import { AuthProvider } from "@workspace/ui/providers/AuthProvider";
import Header from "@workspace/ui/components/layout/Header";
import Sidebar from "@workspace/ui/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: process.env.NEXT_PUBLIC_SITE_TITLE || "color4pen",
	description: process.env.NEXT_PUBLIC_SITE_TITLE || "俺のメディア",
};

export default async function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	let userInfo = null;
	userInfo = (await getUserInfo()) || (await getUserInfoByRefreshToken());

	return (
		<html lang="ja">
			<body className={cn(inter.className, "min-h-[100vh] flex flex-col")}>
				<AuthProvider>
					<SidebarProvider >
						<LoadingProvider>
							<AlertProvider>
								<Header userInfo={userInfo} login />
								<Separator />
								<div className="flex gap-4">
									<div className="col-span-2 hidden md:block">
										<Sidebar />
									</div>
									<div className="md:container md:mx-auto md:col-span-10 col-span-12 mt-1 flex flex-col grow">
										{children}
									</div>
								</div>
							</AlertProvider>
						</LoadingProvider>
					</SidebarProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
