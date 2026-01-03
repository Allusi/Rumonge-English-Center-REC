
import { AssignmentHelperForm } from "@/components/assignment-helper-form";

export default function AssignmentHelperPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          AI Assignment Helper
        </h1>
        <p className="text-muted-foreground">
          Get instant feedback on your writing assignments.
        </p>
      </div>
      <AssignmentHelperForm />
    </div>
  );
}
