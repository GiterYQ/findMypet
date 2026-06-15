/**
 * Notice repository
 * 作用：封装 Prisma 对 notice 的持久化读写，隔离 service 层对 ORM 细节的依赖。
 * 联动：lib/db/prisma.ts、notice.service.ts、mapper 与 API routes。
 * 层级：repository
 */
import { prisma } from "@/lib/db/prisma";
import { type Prisma } from "@prisma/client";

export const noticeRepository = {
  create(data: Prisma.PetNoticeCreateInput) {
    return prisma.petNotice.create({ data });
  },
  findByShortId(shortId: string) {
    return prisma.petNotice.findUnique({ where: { shortId } });
  },
  findVisibleFreshList(regionCode?: string) {
    return prisma.petNotice.findMany({
      where: {
        moderationState: "VISIBLE",
        businessStatus: "ACTIVE",
        activityState: "FRESH",
        deletedAt: null,
        ...(regionCode ? { regionCode } : {})
      },
      orderBy: [{ priorityScore: "desc" }, { lastRefreshedAt: "desc" }],
      take: 100
    });
  },
  findActivityMaintenanceCandidates(staleBefore: Date) {
    return prisma.petNotice.findMany({
      where: {
        businessStatus: "ACTIVE",
        deletedAt: null,
        activityState: {
          in: ["FRESH", "STALE"]
        },
        lastRefreshedAt: {
          lt: staleBefore
        }
      },
      orderBy: {
        lastRefreshedAt: "asc"
      },
      take: 500
    });
  },
  updateByShortId(shortId: string, data: Prisma.PetNoticeUpdateInput) {
    return prisma.petNotice.update({
      where: { shortId },
      data
    });
  },
  createAudit(data: Prisma.NoticeStatusAuditCreateInput) {
    return prisma.noticeStatusAudit.create({ data });
  },
  createReport(data: Prisma.NoticeReportCreateInput) {
    return prisma.noticeReport.create({ data });
  },
  createEmailLog(data: Prisma.NoticeEmailLogCreateInput) {
    return prisma.noticeEmailLog.create({ data });
  }
};
