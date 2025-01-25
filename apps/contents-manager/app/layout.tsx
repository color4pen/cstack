import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@workspace/ui/globals.css"
import { LoadingProvider } from "@/providers/LoadingProvider";
import { AlertProvider } from "@/providers/AlertModalProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import Sidebar from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/providers/SidebarProvider";
import Header from "@/components/layout/Header";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import { getUserInfo, getUserInfoByRefreshToken } from "@workspace/lib";

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
					<SidebarProvider>
						<LoadingProvider>
							<AlertProvider>
								<Header userInfo={userInfo} />
								<Separator />
								{userInfo ? (
									<div className="flex gap-4 md:container md:mx-auto">
										<div className="col-span-2 hidden md:block">
											<Sidebar />
										</div>
										<div className="md:container md:mx-auto md:col-span-10 col-span-12 mt-1 flex flex-col grow">
											{children}
										</div>
									</div>
								) : (
									<div className="container mx-auto md:w-[60%] px-4">
										{children}
									</div>
								)}
							</AlertProvider>
						</LoadingProvider>
					</SidebarProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
