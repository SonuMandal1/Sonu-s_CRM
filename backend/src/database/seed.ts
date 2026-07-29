import * as bcrypt from "bcrypt";
import { db } from "./db";
import { users } from "./schema";

async function seed() {
  const password = await bcrypt.hash("Password123!", 12);

  await db.insert(users).values([
    {
      name: "Admin User",
      email: "admin@erp.test",
      passwordHash: password,
      role: "admin",
    },
    {
      name: "Sales User",
      email: "sales@erp.test",
      passwordHash: password,
      role: "sales",
    },
    {
      name: "Warehouse User",
      email: "warehouse@erp.test",
      passwordHash: password,
      role: "warehouse",
    },
    {
      name: "Accounts User",
      email: "accounts@erp.test",
      passwordHash: password,
      role: "accounts",
    },
  ]).onConflictDoNothing();

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch(console.error);