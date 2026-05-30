import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  return !!session;
}
