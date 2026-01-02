import { AITutorChat } from "@/components/ai-tutor-chat";

export default function AITutorPage() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          AI English Tutor
        </h1>
        <p className="text-muted-foreground">
          Practice your English conversation skills with R.E.C, your AI tutor.
        </p>
      </div>
      <AITutorChat />
    </div>
  );
}
