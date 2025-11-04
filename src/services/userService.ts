import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";


const prisma = new PrismaClient();


interface UserInput {
  name: string;
  email: string;
  password: string;
}

export const createUser = async (data: UserInput) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);

  return await prisma.user.create({
    data: { ...data, password: hashedPassword },
  });
};

export const getUserById = async (id: number) => {
  if (!id || isNaN(id)) {
    console.error("[userService] getUserById: Invalid ID provided:", id);
    throw new Error("Invalid user ID");
  }
  return await prisma.user.findUnique({ where: { id } });
};

export const getAllUsers = async () => {
  return await prisma.user.findMany();
};

export const updateUser = async (id: number, data: Partial<UserInput>) => {
  if (!id || isNaN(id)) {
    console.error("[userService] updateUser: Invalid ID provided:", id);
    throw new Error("Invalid user ID");
  }
  // If password is being updated, hash it
  if (data.password) {
    const saltRounds = 10;
    data.password = await bcrypt.hash(data.password, saltRounds);
  }
  return await prisma.user.update({ where: { id }, data });
};

export const deleteUser = async (id: number) => {
  if (!id || isNaN(id)) {
    console.error("[userService] deleteUser: Invalid ID provided:", id);
    throw new Error("Invalid user ID");
  }
  return await prisma.user.delete({ where: { id } });
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;

  return user;
};