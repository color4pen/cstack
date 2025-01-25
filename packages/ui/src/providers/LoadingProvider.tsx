"use client";
import { LoadingOverlay } from "@workspace/ui/components/loading-overlay";
import { createContext, useState, useContext, type ReactNode } from "react";

const LoadingContext = createContext({
	isLoading: false,
	showLoading: () => { },
	hideLoading: () => { },
});

type LoadingProviderProps = {
	children: ReactNode;
};

export function LoadingProvider({ children }: LoadingProviderProps) {
	const [isLoading, setIsLoading] = useState(false);

	const showLoading = () => setIsLoading(true);
	const hideLoading = () => setIsLoading(false);

	return (
		<LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
			{children}
			{isLoading && <LoadingOverlay />}
		</LoadingContext.Provider>
	);
}

export const useLoading = () => useContext(LoadingContext);
