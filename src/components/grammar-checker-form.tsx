
"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  text: z.string().min(10, {
    message: "Please enter at least 10 characters to check.",
  }),
});

export function GrammarCheckerForm() {
  const [feedback, setFeedback] = useState<GrammarCheckFeedbackOutput | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setFeedback(null);
    setError(null);
    setOriginalText(values.text);
    try {
      const result = await grammarCheckFeedback({ text: values.text });
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

    // Sort corrections by start index to process them in order
    const sortedCorrections = [...corrections].sort(
      (a, b) => a.startIndex - b.startIndex
    );

    sortedCorrections.forEach((correction, index) => {
      // Add text before the current correction
      if (correction.startIndex > lastIndex) {
        parts.push(
          originalText.substring(lastIndex, correction.startIndex)
        );
      }

      // Add the highlighted correction
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

    // Add remaining text after the last correction
    if (lastIndex < originalText.length) {
      parts.push(originalText.substring(lastIndex));
    }

    return <p className="leading-relaxed">{parts}</p>;
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Your Text</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter the text you want to check here..."
                    className="min-h-[200px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Our AI will review your text for any grammatical errors.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Wand2 />
            )}
            Check Grammar
          </Button>
        </form>
      </Form>
      <div className="flex flex-col space-y-4">
        <h2 className="text-lg font-medium">AI Feedback</h2>
        <Card className="flex-grow">
          <CardContent className="p-6">
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
                      Your grammar feedback will appear here once you submit
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
