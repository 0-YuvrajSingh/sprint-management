export type UserRole = "ADMIN" | "MANAGER" | "DEVELOPER" | "VIEWER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdDate: string;
}
