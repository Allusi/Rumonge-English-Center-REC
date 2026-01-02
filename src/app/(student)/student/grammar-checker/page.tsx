import { GrammarCheckerForm } from "@/components/grammar-checker-form";

export default function GrammarCheckerPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          AI Grammar Checker
        </h1>
        <p className="text-muted-foreground">
          Improve your writing by getting instant feedback on your grammar.
        </p>
      </div>
      <GrammarCheckerForm />
    </div>
  );
}
