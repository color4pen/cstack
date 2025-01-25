import { Separator } from "@workspace/ui/components/separator";
import { GridImage } from "./GridImage";
import Link from "next/link";
import { FileGroupWithFiles } from "@workspace/db";

interface FileGroupListProps {
	fileGroupList: FileGroupWithFiles[];
}

export function FileGroupList({ fileGroupList }: FileGroupListProps) {
	return (
		<div className="container mx-auto p-4 space-y-6">
			{fileGroupList.map((fileGroup, index) => (
				<Link href={`/group/${fileGroup.id}`} key={fileGroup.id}>
					<div key={fileGroup.id}>
						<div className="flex flex-col lg:flex-row gap-4">
							<div className="lg:w-1/3">
								{fileGroup.files.length > 0 && (
									<div className="relative aspect-video">
										<GridImage
											filePath={
												fileGroup.thumbnailImagePath || fileGroup.files[0]!.path
											}
											alter={fileGroup.name}
											size={300}
											aspect="aspect-video"
										/>
									</div>
								)}
							</div>
							<div className="lg:w-2/3 space-y-2">
								<h2 className="text-2xl font-bold">{fileGroup.name}</h2>
								<p className="text-sm text-gray-500">
									{fileGroup.createdAt.toLocaleString()}
								</p>
								<p className="text-gray-700">{fileGroup.description}</p>
							</div>
						</div>
						{index < fileGroupList.length - 1 && <Separator className="my-6" />}
					</div>
				</Link>
			))}
		</div>
	);
}
