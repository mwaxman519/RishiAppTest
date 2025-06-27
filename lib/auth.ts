
import { getServerSession } from "next-auth/next";
import { authOptions } from "../app/api/auth/[...nextauth]/route";

export const auth = {
  getSession: async () => {
    return await getServerSession(authOptions);
  },
  getUserId: async () => {
    const session = await getServerSession(authOptions);
    return session?.user?.email || null;
  }
};

/**
 * Get current user from session
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}
