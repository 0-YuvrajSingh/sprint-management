import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Project, ProjectInsight } from "@/features/projects/types";
import { formatDateTime } from "@/shared/lib/format";
import { TableContainer, Table, TD, TH } from "@/shared/ui/Table";
import { StatusBadge } from "@/shared/ui/StatusBadge";

interface ProjectsTableProps {
  rows: Array<Project & ProjectInsight>;
}

export function ProjectsTable({ rows }: ProjectsTableProps) {
  return (
    <TableContainer>
      <Table>
        <thead className="bg-slate-50/70">
          <tr>
            <TH>Name</TH>
            <TH>Status</TH>
            <TH>Owner</TH>
            <TH>Created</TH>
            <TH className="text-right">Open</TH>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.id} className="transition hover:bg-slate-50/60">
              <TD className="whitespace-normal">
                <div className="space-y-1">
                  <p className="font-semibold text-ink">{row.name}</p>
                  <p className="max-w-xl text-xs text-slate-500">{row.description || "No description provided yet."}</p>
                </div>
              </TD>
              <TD>
                <StatusBadge value={row.health} />
              </TD>
              <TD>{row.ownerLabel}</TD>
              <TD>{formatDateTime(row.createdAt)}</TD>
              <TD className="text-right">
                <Link
                  to={`/projects/${row.id}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-900"
                >
                  View
                  <ArrowUpRight className="size-4" />
                </Link>
              </TD>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
}
