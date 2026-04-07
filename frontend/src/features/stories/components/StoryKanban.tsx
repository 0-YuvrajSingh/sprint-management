import { useStories } from "@/features/stories/hooks/useStories";
import { useUpdateStory } from "@/features/stories/hooks/useUpdateStory";
import { Story, StoryStatus } from "@/features/stories/types";
import { Card } from "@/shared/ui/Card";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";

const statusMap: Record<StoryStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const statusOrder: StoryStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

export function StoryKanban() {
  const { data: stories, isLoading, error } = useStories({ page: 0, size: 100 });
  const updateStoryMutation = useUpdateStory();

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const story = stories?.content.find((s) => s.id === draggableId);
    if (story) {
      updateStoryMutation.mutate({ ...story, status: destination.droppableId as StoryStatus });
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;

  const columns = statusOrder.reduce(
    (acc, status) => {
      acc[status] = stories?.content.filter((story) => story.status === status) ?? [];
      return acc;
    },
    {} as Record<StoryStatus, Story[]>,
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-4 gap-4">
        {statusOrder.map((status) => (
          <Droppable droppableId={status} key={status}>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="rounded-lg bg-gray-100 p-4">
                <h3 className="font-bold">{statusMap[status]}</h3>
                {columns[status].map((story, index) => (
                  <Draggable key={story.id} draggableId={story.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="mt-4"
                      >
                        <Card>
                          <Card.Content className="p-4">
                            <p>{story.title}</p>
                          </Card.Content>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
