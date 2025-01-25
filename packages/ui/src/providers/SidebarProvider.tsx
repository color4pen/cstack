"use client";
import {
	createContext,
	useState,
	useContext,
	type ReactNode,
	useEffect,
	useCallback,
} from "react";
import { usePathname } from "next/navigation";

const SidebarContext = createContext({
	isOpen: false,
	open: () => { },
	close: () => { },
});

type SidebarProviderProps = {
	children: ReactNode;
};

export function SidebarProvider({ children }: SidebarProviderProps) {
	const [isOpen, setOpen] = useState(false);
	const pathname = usePathname()

	const open = useCallback(() => setOpen(true), []);
	const close = useCallback(() => setOpen(false), []);

	useEffect(() => close(), [pathname]);

	return (
		<SidebarContext.Provider value={{ isOpen, open, close }}>
			{children}
		</SidebarContext.Provider>
	);
}

export const useSidebar = () => useContext(SidebarContext);
