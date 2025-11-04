import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EditorFormProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { projectSchema, ProjectValues } from "@/lib/validation";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripHorizontal, Plus, X } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm, UseFormReturn } from "react-hook-form";

export default function ProjectsForm({
  resumeData,
  setResumeData,
}: EditorFormProps) {
  const form = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projects: resumeData.projects || [],
    },
  });

  useEffect(() => {
    const { unsubscribe } = form.watch(async (values) => {
      const isValid = await form.trigger();
      if (!isValid) return;
      setResumeData({
        ...resumeData,
        projects:
          values.projects
            ?.filter((project) => project !== undefined)
            .map((project) => ({
              ...project,
              technologies:
                project.technologies
                  ?.filter((tech) => tech !== undefined)
                  .map((tech) => tech.trim())
                  .filter((tech) => tech !== "") || [],
            })) || [],
      });
    });
    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "projects",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      move(oldIndex, newIndex);
      return arrayMove(fields, oldIndex, newIndex);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Projects</h2>
        <p className="text-sm text-muted-foreground">
          Add as many projects as you like. Include personal projects,
          open-source contributions, or academic projects.
        </p>
      </div>
      <Form {...form}>
        <form className="space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={fields}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field, index) => (
                <ProjectItem
                  id={field.id}
                  key={field.id}
                  index={index}
                  form={form}
                  remove={remove}
                />
              ))}
            </SortableContext>
          </DndContext>
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={() =>
                append({
                  name: "",
                  description: "",
                  url: "",
                  technologies: [],
                  startDate: "",
                  endDate: "",
                })
              }
            >
              Add project
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

interface ProjectItemProps {
  id: string;
  form: UseFormReturn<ProjectValues>;
  index: number;
  remove: (index: number) => void;
}

function ProjectItem({ id, form, index, remove }: ProjectItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const technologies = form.watch(`projects.${index}.technologies`) || [];

  return (
    <div
      className={cn(
        "space-y-3 rounded-md border bg-background p-3",
        isDragging && "relative z-50 cursor-grab shadow-xl",
      )}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className="flex justify-between gap-2">
        <span className="font-semibold">Project {index + 1}</span>
        <GripHorizontal
          className="size-5 cursor-grab text-muted-foreground focus:outline-none"
          {...attributes}
          {...listeners}
        />
      </div>

      <FormField
        control={form.control}
        name={`projects.${index}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project name</FormLabel>
            <FormControl>
              <Input
                {...field}
                autoFocus
                placeholder="e.g., E-commerce Platform"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`projects.${index}.url`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project URL</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="url"
                placeholder="https://example.com or https://github.com/user/repo"
              />
            </FormControl>
            <FormDescription>
              Link to your project (live demo, GitHub repository, etc.)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name={`projects.${index}.startDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start date</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  value={field.value?.slice(0, 10)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`projects.${index}.endDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>End date</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  value={field.value?.slice(0, 10)}
                />
              </FormControl>
              <FormDescription>
                Leave empty if the project is ongoing
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name={`projects.${index}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Describe the project, your role, key achievements, and technologies used..."
                rows={4}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <FormLabel>Technologies</FormLabel>
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech, techIndex) => (
            <div
              key={techIndex}
              className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm"
            >
              <span>{tech}</span>
              <button
                type="button"
                title="Remove technology"
                onClick={() => {
                  const current =
                    form.getValues(`projects.${index}.technologies`) || [];
                  form.setValue(
                    `projects.${index}.technologies`,
                    current.filter((_, i) => i !== techIndex),
                  );
                }}
                className="ml-1 rounded hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add technology (e.g., React, Node.js)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const input = e.currentTarget;
                const value = input.value.trim();
                if (value) {
                  const current =
                    form.getValues(`projects.${index}.technologies`) || [];
                  if (!current.includes(value)) {
                    form.setValue(`projects.${index}.technologies`, [
                      ...current,
                      value,
                    ]);
                  }
                  input.value = "";
                }
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            title="Add technology"
            onClick={(e) => {
              e.preventDefault();
              const input = e.currentTarget
                .previousElementSibling as HTMLInputElement;
              const value = input?.value.trim();
              if (value) {
                const current =
                  form.getValues(`projects.${index}.technologies`) || [];
                if (!current.includes(value)) {
                  form.setValue(`projects.${index}.technologies`, [
                    ...current,
                    value,
                  ]);
                }
                input.value = "";
              }
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button variant="destructive" type="button" onClick={() => remove(index)}>
        Remove
      </Button>
    </div>
  );
}
