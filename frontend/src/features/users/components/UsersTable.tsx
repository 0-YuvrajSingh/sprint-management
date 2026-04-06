import type { User } from "@/features/users/types";
import { formatDateTime } from "@/shared/lib/format";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { TableContainer, Table, TD, TH } from "@/shared/ui/Table";

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  return (
    <TableContainer>
      <Table>
        <thead className="bg-slate-50/70">
          <tr>
            <TH>Name</TH>
            <TH>Email</TH>
            <TH>Role</TH>
            <TH>Created</TH>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => (
            <tr key={user.id} className="transition hover:bg-slate-50/60">
              <TD className="font-semibold text-ink">{user.name}</TD>
              <TD>{user.email}</TD>
              <TD>
                <StatusBadge value={user.role} />
              </TD>
              <TD>{formatDateTime(user.createdDate)}</TD>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
}
