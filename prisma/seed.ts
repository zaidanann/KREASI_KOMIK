import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database JOTENG...");

  // Super Admin
  const hashedPassword = await bcrypt.hash("SuperAdmin123!", 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@joteng.com" },
    update: {},
    create: {
      name: "Super Admin",
      username: "superadmin",
      email: "superadmin@joteng.com",
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      emailVerified: new Date(),
      profile: {
        create: {
          bio: "Super Administrator JOTENG",
        },
      },
    },
  });

  // Admin
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@joteng.com" },
    update: {},
    create: {
      name: "Admin JOTENG",
      username: "adminjoteng",
      email: "admin@joteng.com",
      password: adminPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
      profile: {
        create: {
          bio: "Administrator JOTENG",
        },
      },
    },
  });

  // Demo User
  const userPassword = await bcrypt.hash("User123!", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@joteng.com" },
    update: {},
    create: {
      name: "Demo User",
      username: "demouser",
      email: "demo@joteng.com",
      password: userPassword,
      role: Role.USER,
      emailVerified: new Date(),
      profile: {
        create: {
          bio: "Halo! Saya pengguna demo JOTENG 👋",
        },
      },
    },
  });

  console.log("✅ Seed selesai!");
  console.log("-----------------------------------");
  console.log("👑 Super Admin : superadmin@joteng.com / SuperAdmin123!");
  console.log("🛡️  Admin       : admin@joteng.com / Admin123!");
  console.log("👤 Demo User   : demo@joteng.com / User123!");
  console.log("-----------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
