import { useState } from "react";
import { UserRound } from "lucide-react";
import { UsersTable } from "@/features/users/components/UsersTable";
import { useUsers } from "@/features/users/hooks/useUsers";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageTransition } from "@/shared/ui/PageTransition";
import { PaginationControls } from "@/shared/ui/PaginationControls";

export function UsersPage() {
  const [page, setPage] = useState(0);
  const usersQuery = useUsers({ page, size: 10 });

  if (usersQuery.isLoading) {
    return <LoadingState />;
  }

  if (usersQuery.isError) {
    return <ErrorState message={usersQuery.error.message} onRetry={() => usersQuery.refetch()} />;
  }

  const users = usersQuery.data?.content ?? [];

  return (
    <PageTransition>
      <PageHeader
        title="Users"
        description="Browse the team directory and role distribution that powers access across AgileTrack."
      />

      {users.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title="No users found"
          description="Users synced from authentication will appear here as soon as the directory contains data."
        />
      ) : (
        <>
          <UsersTable users={users} />
          {usersQuery.data ? (
            <PaginationControls
              page={usersQuery.data.number}
              totalPages={usersQuery.data.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </PageTransition>
  );
}
