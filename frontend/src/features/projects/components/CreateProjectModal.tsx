import { useCreateProject } from "@/features/projects/hooks/useCreateProject";
import { Button } from "@/shared/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/Dialog";
import { Input } from "@/shared/ui/Input";
import { useState } from "react";

export function CreateProjectModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createProjectMutation = useCreateProject();

  const handleSubmit = () => {
    createProjectMutation.mutate(
      { name, description },
      {
        onSuccess: () => {
          setIsOpen(false);
          setName("");
          setDescription("");
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create Project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Project description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button onClick={handleSubmit} disabled={createProjectMutation.isLoading}>
            {createProjectMutation.isLoading ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
