import { prisma } from "@workspace/db";
import { FileGroupList } from "@workspace/ui/components/file-group-list";

export default async function Home() {
  const publicFileGroupList = await prisma.fileGroup.findMany({
    where: {
      deletedAt: null,
      publicRange: "public",
    },
    include: {
      files: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return <FileGroupList fileGroupList={publicFileGroupList} linkPrefix="/" />;
}
