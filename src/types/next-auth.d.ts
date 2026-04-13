import { Role } from "@/lib/permissions";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      driverId: string | null;
    };
  }

  interface User {
    role: Role;
    driverId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    driverId: string | null;
  }
}
