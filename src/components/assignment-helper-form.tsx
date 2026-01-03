
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Sparkles, Wand2, CheckCircle, XCircle } from "lucide-react";

import {
  grammarCheckFeedback,
  type GrammarCheckFeedbackOutput,
} from "@/ai/flows/grammar-check-feedback";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const formSchema = z.object({
  topic: z.string().min(3, {
    message: "Please enter a topic for your assignment.",
  }),
  instructions: z.string().optional(),
  text: z.string().min(10, {
    message: "Please enter at least 10 characters to check.",
  }),
});

export function AssignmentHelperForm() {
  const [feedback, setFeedback] = useState<GrammarCheckFeedbackOutput | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      instructions: "",
      text: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setFeedback(null);
    setError(null);
    setOriginalText(values.text);
    try {
      const result = await grammarCheckFeedback({
        text: values.text,
        topic: values.topic,
        instructions: values.instructions,
       });
      setFeedback(result);
    } catch (e) {
      setError("An error occurred while checking grammar. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const renderHighlightedText = () => {
    if (!feedback || !feedback.hasErrors) {
      return <p>{originalText}</p>;
    }

    const { corrections } = feedback;
    let lastIndex = 0;
    const parts: React.ReactNode[] = [];

    const sortedCorrections = [...corrections].sort(
      (a, b) => a.startIndex - b.startIndex
    );

    sortedCorrections.forEach((correction, index) => {
      if (correction.startIndex > lastIndex) {
        parts.push(
          originalText.substring(lastIndex, correction.startIndex)
        );
      }

      parts.push(
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <mark className="cursor-pointer rounded-md bg-destructive/20 px-1 py-0.5 text-destructive">
                {correction.original}
              </mark>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-semibold">Correction:</p>
              <p className="mb-2">
                <span className="text-muted-foreground line-through">
                  {correction.original}
                </span>{" "}
                <span className="text-green-600">{correction.corrected}</span>
              </p>
              <p className="font-semibold">Explanation:</p>
              <p>{correction.explanation}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      lastIndex = correction.endIndex;
    });

    if (lastIndex < originalText.length) {
      parts.push(originalText.substring(lastIndex));
    }

    return <p className="leading-relaxed">{parts}</p>;
  };
  
  if (!isClient) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
          <CardDescription>
            Provide your assignment details and text below for the AI to review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignment Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'My Summer Vacation'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'Write a three-paragraph essay...'"
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                     <FormDescription>
                      Include any specific instructions from your teacher.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your assignment text here..."
                        className="min-h-[250px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Get Feedback
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="flex flex-col space-y-4">
        <h2 className="text-lg font-medium">AI Feedback</h2>
        <Card className="flex-grow">
          <CardContent className="p-6 h-full">
            {isLoading && (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                <p>Checking your text...</p>
              </div>
            )}
            {error && (
              <div className="flex h-full items-center justify-center text-destructive">
                <p>{error}</p>
              </div>
            )}
            {!isLoading && !error && (
              <>
                {feedback ? (
                  <div className="space-y-6">
                    <div>
                      {feedback.hasErrors ? (
                        <div className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-destructive" />
                          <p>
                            We found {feedback.corrections.length} potential
                            issue
                            {feedback.corrections.length > 1 ? "s" : ""}. Hover
                            over the highlights for details.
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <p>Looks good! No grammatical errors found.</p>
                        </div>
                      )}
                    </div>
                    <div className="prose prose-sm max-w-none rounded-md border bg-muted/30 p-4 text-foreground">
                      {renderHighlightedText()}
                    </div>
                     {feedback.hasErrors && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-xl">Corrected Text</CardTitle>
                          <CardDescription>This is the fully corrected version of your text.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="leading-relaxed">{feedback.correctedText}</p>
                        </CardContent>
                      </Card>
                     )}
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                    <Sparkles className="mb-4 h-12 w-12" />
                    <p>
                      Your assignment feedback will appear here once you submit
                      your text.
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
