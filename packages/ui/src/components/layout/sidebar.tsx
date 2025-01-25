"use client";

import { Fragment } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@workspace/ui/components/sheet";
import { Button } from "@workspace/ui/components/button";
import { Menu, Home, FolderOpen, FileText, User } from "lucide-react";
import { useSidebar } from "@workspace/ui/providers/SidebarProvider";
import { useAuth } from "@workspace/ui/providers/AuthProvider";

const Sidebar = () => {
	const sidebar = useSidebar();
	const { user } = useAuth()

	const menuItems = [
		{ name: "ホーム", href: "/", icon: Home },
		{ name: "プロフィール", href: `/user/${user?.sub}`, icon: User },
		{
			name: "グループ管理",
			href: "/user/fileGroups",
			icon: FolderOpen,
		},
		{ name: "ファイル管理", href: "/user/files", icon: FileText },
	];

	const SidebarContent = () => (
		<div className="flex flex-col h-full">
			<nav className="flex-grow">
				<div className="sticky top-5">
					{menuItems.map((item) => (
						<a
							key={item.name}
							href={item.href}
							className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
						>
							<item.icon className="h-5 w-5" />
							<span>{item.name}</span>
						</a>
					))}
				</div>
			</nav>
		</div>
	);

	return (
		<Fragment>
			<Sheet open={sidebar.isOpen} onOpenChange={sidebar.close}>
				<SheetTrigger asChild>
					<Button
						variant="outline"
						size="icon"
						className="fixed top-4 right-4 z-40 md:hidden"
					>
						<Menu className="h-6 w-6" />
					</Button>
				</SheetTrigger>
				<SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
					<SidebarContent />
				</SheetContent>
			</Sheet>

			<div className="hidden lg:block w-[240px] border-r border-slate-300 h-screen p-4">
				<SidebarContent />
			</div>
		</Fragment>
	);
};

export default Sidebar;
