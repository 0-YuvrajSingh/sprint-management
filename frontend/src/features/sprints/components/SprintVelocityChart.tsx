import { useSprints } from "@/features/sprints/hooks/useSprints";
import { useStories } from "@/features/stories/hooks/useStories";
import { Card } from "@/shared/ui/Card";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function SprintVelocityChart() {
  const { data: sprints, isLoading: sprintsLoading, error: sprintsError } = useSprints({ page: 0, size: 10, status: "COMPLETED" });
  const { data: stories, isLoading: storiesLoading, error: storiesError } = useStories({ page: 0, size: 500 });

  const isLoading = sprintsLoading || storiesLoading;
  const error = sprintsError || storiesError;

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;

  const chartData = sprints?.content.map((sprint) => {
    const sprintStories = stories?.content.filter((story) => story.sprintId === sprint.id);
    const totalPoints = sprintStories?.reduce((acc, story) => acc + (story.points ?? 0), 0) ?? 0;
    return {
      name: sprint.name,
      velocity: totalPoints,
    };
  });

  return (
    <Card>
      <Card.Header>
        <Card.Title>Sprint Velocity</Card.Title>
        <Card.Description>Story points completed per sprint.</Card.Description>
      </Card.Header>
      <Card.Content>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="velocity" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Card.Content>
    </Card>
  );
}
