"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Send, Sparkles, User, Bot, CameraOff } from "lucide-react";
import { aiTutor, type AITutorInput } from "@/ai/flows/ai-tutor-flow";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  message: z.string().min(1, {
    message: "Message cannot be empty.",
  }),
});

type Message = {
  role: "user" | "model";
  content: string;
};

export function AITutorChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
         setHasCameraPermission(false);
         return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description:
            "Please enable camera permissions in your browser settings.",
        });
      }
    };

    getCameraPermission();

    // Start conversation
    const startConversation = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await aiTutor({ history: [] });
        setMessages([{ role: "model", content: result }]);
      } catch (e) {
        setError("An error occurred. Please try again.");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    startConversation();

  }, [toast]);
  
  useEffect(() => {
    // Auto-scroll to bottom of chat
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const userInput: Message = { role: "user", content: values.message };
    const newMessages = [...messages, userInput];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);
    form.reset();

    try {
      const result = await aiTutor({ history: newMessages });
      setMessages([...newMessages, { role: "model", content: result }]);
    } catch (e) {
      setError("An error occurred while fetching the response. Please try again.");
      console.error(e);
      setMessages(newMessages); // Keep user message on error
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      <div className="md:col-span-1 flex flex-col gap-4">
         <Card>
           <CardHeader>
             <CardTitle>Your Video</CardTitle>
           </CardHeader>
           <CardContent>
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
                {!hasCameraPermission && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4">
                    <CameraOff className="h-12 w-12 mb-2" />
                    <p className="text-center">Camera access is required. Please enable it in your browser settings.</p>
                  </div>
                )}
            </div>
           </CardContent>
         </Card>
      </div>
      <div className="md:col-span-2">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Chat with R.E.C</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
             <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${
                      message.role === "user" ? "justify-end" : ""
                    }`}
                  >
                    {message.role === "model" && (
                      <Avatar>
                        <AvatarFallback>REC</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg p-3 max-w-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                     {message.role === "user" && (
                      <Avatar>
                        <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                 {isLoading && messages.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>REC</AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 bg-muted">
                       <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full items-start space-x-2"
              >
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <Input
                          placeholder="Type your message..."
                          className="flex-1"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Send />
                  )}
                </Button>
              </form>
            </Form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
