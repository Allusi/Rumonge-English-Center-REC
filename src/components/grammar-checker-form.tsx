"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Sparkles, Wand2 } from "lucide-react";

import { grammarCheckFeedback } from "@/ai/flows/grammar-check-feedback";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  text: z.string().min(10, {
    message: "Please enter at least 10 characters to check.",
  }),
});

export function GrammarCheckerForm() {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    try {
      const result = await grammarCheckFeedback({ text: values.text });
      setFeedback(result.feedback);
    } catch (e) {
      setError("An error occurred while checking grammar. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

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
                    className="min-h-[300px] resize-y"
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
              <div className="prose prose-sm max-w-none text-foreground">
                {feedback ? (
                  <p>{feedback}</p>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                    <Sparkles className="mb-4 h-12 w-12" />
                    <p>
                      Your grammar feedback will appear here once you submit your text.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
