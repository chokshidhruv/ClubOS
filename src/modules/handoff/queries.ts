import { db } from "@/lib/db"

export async function getHandoffPackagesByWorkspace(workspaceId: string) {
  return db.handoffPackage.findMany({
    where: { workspaceId },
    orderBy: { academicYear: "desc" },
    include: {
      sections: { orderBy: { orderIdx: "asc" } },
    },
  })
}

export async function getHandoffPackageById(packageId: string) {
  return db.handoffPackage.findUnique({
    where: { id: packageId },
    include: {
      sections: { orderBy: { orderIdx: "asc" } },
    },
  })
}
