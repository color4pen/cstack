import { File } from "@prisma/client";
import { useState } from "react";

export function useFileSelect() {
	const [selectFiles, setSelectFiles] = useState<File[]>([]);
	const selectFileIds = selectFiles.map((file) => file.id);

	function clickFile(file: File) {
		if (selectFiles.map((f) => f.id).indexOf(file.id) === -1) {
			setSelectFiles([...selectFiles, file]);
		} else {
			setSelectFiles(selectFiles.filter((f) => f.id !== file.id));
		}
	}

	function clearFileSelect() {
		setSelectFiles([]);
	}

	return { selectFiles, clickFile, clearFileSelect, selectFileIds };
}
