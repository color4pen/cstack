"use client";
import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Menu } from "lucide-react";
import { Fragment } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { UserInfo } from "@workspace/lib";
import { useSidebar } from "@workspace/ui/providers/SidebarProvider";

type HeaderProps = {
	userInfo?: UserInfo;
	login?: boolean
};

export default function Header(props: HeaderProps) {
	const sidebar = useSidebar();
	const { userInfo, login = false } = props;

	return (
		<header className="w-full backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<nav className="flex items-center space-x-6 font-medium h-14 w-full px-4 md:px-10">
				<div className="mr-4 flex">
					<a href="/" className="mr-6 flex items-center space-x-2">
						<span className="font-bold inline-block">
							{process.env.NEXT_PUBLIC_SITE_TITLE || "color4pen"}
						</span>
					</a>
				</div>
				<div className="grow" />
				{userInfo ? (
					<Fragment>
						<Avatar>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<AvatarFallback className="cursor-pointer">
										{userInfo.email ? userInfo.email[0] : "U"}
									</AvatarFallback>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuLabel className="select-none">{userInfo.email}</DropdownMenuLabel>
									{/* <DropdownMenuSeparator />
										<Link href="/user/edit">
											<DropdownMenuItem>
												プロフィールを編集する
											</DropdownMenuItem>
										</Link> */}
									<DropdownMenuSeparator />
									<a href="/auth/logout">
										<DropdownMenuItem>ログアウト</DropdownMenuItem>
									</a>
								</DropdownMenuContent>
							</DropdownMenu>
						</Avatar>
						<Button className="lg:hidden" variant="outline" size="icon" onClick={sidebar.open}>
							<Menu />
						</Button>
					</Fragment>
				) : (
					<Fragment>
						{login ?
							<a
								href="/auth/login"
								className={cn(
									"transition-colors hover:text-foreground/80 text-foreground/60",
								)}
							>
								Login
							</a>
							: <Fragment />
						}
					</Fragment>
				)}
			</nav>
		</header >
	);
}
