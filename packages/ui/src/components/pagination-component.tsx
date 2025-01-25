"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Pagination as MainPagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLast,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
	PaginationTop,
} from "@workspace/ui/components/pagination";

interface PaginationProps {
	totalPages: number;
	siblingsCount?: number;
}

export function Pagination({ totalPages, siblingsCount = 1 }: PaginationProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const currentPage = Number(searchParams.get("page")) || 1;

	const createQueryString = useCallback(
		(name: string, value: string) => {
			const params = new URLSearchParams(searchParams);
			params.set(name, value);
			return params.toString();
		},
		[searchParams],
	);

	const updatePage = (page: number) => {
		router.push(
			`${window.location.pathname}?${createQueryString("page", page.toString())}`,
		);
	};

	const generatePaginationItems = () => {
		const items = [];
		const leftSiblingIndex = Math.max(currentPage - siblingsCount, 1);
		const rightSiblingIndex = Math.min(currentPage + siblingsCount, totalPages);

		const shouldShowLeftDots = leftSiblingIndex >= 2;
		const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

		if (shouldShowLeftDots) {
			items.push(
				<PaginationItem key="leftDots">
					<PaginationEllipsis />
				</PaginationItem>,
			);
		}

		for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
			items.push(
				<PaginationItem key={i}>
					<PaginationLink
						href="#"
						isActive={currentPage === i}
						onClick={(e) => {
							e.preventDefault();
							updatePage(i);
						}}
					>
						{i}
					</PaginationLink>
				</PaginationItem>,
			);
		}

		if (shouldShowRightDots) {
			items.push(
				<PaginationItem key="rightDots">
					<PaginationEllipsis />
				</PaginationItem>,
			);
		}

		return items;
	};

	return (
		<MainPagination>
			<PaginationContent>
				<PaginationItem>
					<PaginationTop
						href="#"
						onClick={(e) => {
							e.preventDefault();
							if (currentPage > 1) updatePage(1);
						}}
					/>
				</PaginationItem>
				<PaginationItem>
					<PaginationPrevious
						href="#"
						onClick={(e) => {
							e.preventDefault();
							if (currentPage > 1) updatePage(currentPage - 1);
						}}
					/>
				</PaginationItem>
				{generatePaginationItems()}
				<PaginationItem>
					<PaginationNext
						href="#"
						onClick={(e) => {
							e.preventDefault();
							if (currentPage < totalPages) updatePage(currentPage + 1);
						}}
					/>
				</PaginationItem>
				<PaginationItem>
					<PaginationLast
						href="#"
						onClick={(e) => {
							e.preventDefault();
							if (currentPage < totalPages) updatePage(totalPages);
						}}
					/>
				</PaginationItem>
			</PaginationContent>
		</MainPagination>
	);
}
