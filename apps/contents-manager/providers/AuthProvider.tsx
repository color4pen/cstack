"use client";
import { getUserInfo } from "@workspace/lib";
import React, {
	createContext,
	useState,
	useContext,
	type ReactNode,
	useEffect,
} from "react";

type UserInfo = {
	sub: string;
	email: string | undefined;
	name: string | undefined;
};

type AuthContextType = {
	user: UserInfo | null;
	authState: AuthState;
};

export const AuthContext = createContext<AuthContextType>({
	user: null,
	authState: "loading",
});

type AuthProviderProps = {
	children: ReactNode;
};

type AuthState = "authenticated" | "loading" | "unauthenticated";

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<UserInfo | null>(null);
	const [authState, setAuthState] = useState<AuthState>("loading");

	useEffect(() => {
		async function refreshUserIndo() {
			const userInfo = await getUserInfo()
			if (userInfo) {
				setUser(userInfo);
				setAuthState("authenticated");
			} else {
				setUser(null);
				setAuthState("unauthenticated");
			}
			setAuthState("unauthenticated");
		}
		refreshUserIndo();
	}, []);

	return (
		<AuthContext.Provider value={{ user, authState }}>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => useContext(AuthContext);
