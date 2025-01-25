"use client";
import React, { createContext, useState, useContext, type ReactNode } from "react";
import { LoadingOverlay } from "@/components/LoadingOverlay";

const LoadingContext = createContext({
	isLoading: false,
	showLoading: () => {},
	hideLoading: () => {},
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
