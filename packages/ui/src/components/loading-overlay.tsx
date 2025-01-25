import { Loader2 } from "lucide-react";

export function LoadingOverlay() {
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="flex items-center">
				<Loader2 className="animate-spin" size={100} />
			</div>
		</div>
	);
}
