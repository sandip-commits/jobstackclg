// src/db.ts or wherever you're importing Prisma
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
