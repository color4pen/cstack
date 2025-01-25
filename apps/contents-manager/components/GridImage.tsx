"use client";

import type { File } from "@prisma/client";
import { Fragment, useState } from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";
import Image from "next/image";

type GridImageProps = {
	filePath: File["path"];
	alter: string;
	preview?: boolean;
	size: number;
	aspect?: "aspect-square" | "aspect-video" | "aspect-auto";
};

export function GridImage(props: GridImageProps) {
	const { filePath, alter, preview, size, aspect = "aspect-square" } = props;
	const [isOpen, setIsOpen] = useState(false);
	const src = `${process.env.NEXT_PUBLIC_DISTRIBUTION_DOMAIN_URL}/${filePath}`;

	const toggleOpen = (event: React.MouseEvent<HTMLDivElement>) => {
		if (preview) {
			event.stopPropagation();
			setIsOpen(!isOpen);
		}
	};

	return (
		<Fragment>
			<div
				className={`${aspect} select-none relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer`}
				onMouseDown={toggleOpen}
			>
				{src ? (
					<Image
						src={src}
						alt={alter}
						width={size}
						height={size}
						className="hover:scale-105 transition-transform duration-300 object-cover w-full h-full"
					/>
				) : (
					<Skeleton />
				)}
			</div>

			{isOpen && src && (
				<div
					className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
					onMouseDown={toggleOpen}
				>
					<div className="max-w-[90vw] max-h-[95vh]">
						<img
							src={src}
							alt={alter}
							className="select-none max-w-full max-h-[95vh] object-contain"
						/>
					</div>
				</div>
			)}
		</Fragment>
	);
}
