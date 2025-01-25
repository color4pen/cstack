"use client";

import React, {
	createContext,
	useContext,
	useState,
	type ReactNode,
} from "react";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";

type ShowAlertType = {
	options?: AlertOptions | null;
};

interface AlertContextType {
	showAlert: (options?: AlertOptions | null) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function useAlert() {
	const context = useContext(AlertContext);
	if (context === undefined) {
		throw new Error("useAlert must be used within an AlertProvider");
	}
	return context;
}

interface AlertProviderProps {
	children: ReactNode;
}

interface AlertOptions {
	title?: string;
	message: string;
	onClose?: () => void;
	onYes?: () => void;
}

export function AlertProvider({ children }: AlertProviderProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [alertContent, setAlertContent] = useState<ShowAlertType>({
		options: null,
	});

	const showAlert = (options?: AlertOptions | null) => {
		setAlertContent({ options });
		setIsOpen(true);
	};

	const closeAlert = () => {
		setIsOpen(false);
		if (alertContent.options?.onClose) {
			alertContent.options.onClose();
		}
		setAlertContent({ options: null });
	};

	const yesAlert = () => {
		setIsOpen(false);
		if (alertContent.options?.onYes) {
			alertContent.options.onYes();
		}
		setAlertContent({ options: null });
	};

	return (
		<AlertContext.Provider value={{ showAlert }}>
			{children}
			<Dialog open={isOpen} onOpenChange={closeAlert}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{alertContent.options?.title || ""}</DialogTitle>
						<DialogDescription>
							{alertContent.options?.message}
						</DialogDescription>
					</DialogHeader>
					<div className="mt-4 flex justify-end gap-2">
						<Button onClick={closeAlert} variant="outline">
							閉じる
						</Button>
						{alertContent.options?.onYes && (
							<Button onClick={yesAlert}>確定</Button>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</AlertContext.Provider>
	);
}
