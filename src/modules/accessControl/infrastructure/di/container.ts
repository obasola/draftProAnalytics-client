import { PrismaAdminAccessRepository } from "@/modules/accessControl/infrastructure/persistence/prisma/PrismaAdminAccessRepository";

container.register("IAdminAccessRepository", { useClass: PrismaAdminAccessRepository });
