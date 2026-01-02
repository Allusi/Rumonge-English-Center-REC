
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Send, Sparkles, User, Bot, CameraOff, Video, Mic, MessageSquare, MicOff, Play } from "lucide-react";
import { aiTutor } from "@/ai/flows/ai-tutor-flow";
import { textToSpeech } from "@/ai/flows/tts-flow";
import { type AITutorInput } from "@/ai/flows/ai-tutor-types";
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
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  message: z.string().min(1, {
    message: "Message cannot be empty.",
  }),
});

type Message = {
  role: "user" | "model";
  content: string;
  audioUrl?: string;
  isPlaying?: boolean;
};

type InteractionMode = "video" | "audio" | "text" | null;

export function AITutorChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any | null>(null); // Using 'any' for SpeechRecognition for broader browser support

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          form.setValue("message", transcript);
          form.handleSubmit(onSubmit)();
          setIsRecording(false);
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          toast({ variant: "destructive", title: "Voice Error", description: `Could not recognize speech: ${event.error}` });
          setIsRecording(false);
        };
        
        recognitionRef.current = recognition;
      } else {
        console.warn("Speech Recognition not supported in this browser.");
      }
    }
  }, [form, toast]);


  useEffect(() => {
    if (interactionMode === 'video') {
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
    }
  }, [interactionMode, toast]);

  useEffect(() => {
    // Auto-scroll to bottom of chat
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const playAudio = (audioUrl: string, messageIndex: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
  
    const newAudio = new Audio(audioUrl);
    audioRef.current = newAudio;
  
    newAudio.onplay = () => {
      setMessages(prev => prev.map((msg, idx) => ({ ...msg, isPlaying: idx === messageIndex })));
    };
  
    newAudio.onended = () => {
      setMessages(prev => prev.map((msg, idx) => (idx === messageIndex ? { ...msg, isPlaying: false } : msg)));
      audioRef.current = null;
    };
  
    newAudio.onerror = (e) => {
      console.error("Audio playback error:", e);
      setError("Could not play audio.");
      setMessages(prev => prev.map((msg, idx) => (idx === messageIndex ? { ...msg, isPlaying: false } : msg)));
      audioRef.current = null;
    };
  
    newAudio.play().catch(e => {
        console.error("Audio play promise rejected:", e);
        setError("Audio playback failed. Please try again.");
    });
  };

  const startConversation = async (mode: InteractionMode) => {
    setIsLoading(true);
    setError(null);
    
    const studentName = "Student"; // In a real app, this would come from user data
    let welcomeText = `Hi ${studentName}! I'm R.E.C, your personal English tutor. How can I help you practice today?`;
    if (mode === 'video') {
      welcomeText = `Hi ${studentName}, welcome to your video session! I'm R.E.C. Let's practice English. What's on your mind?`;
    } else if (mode === 'audio') {
      welcomeText = `Hi ${studentName}, welcome to your audio session! I'm R.E.C. Let's start talking. How are you today?`;
    }

    try {
      const ttsResult = await textToSpeech(welcomeText);

      const firstResponse: Message = {
        role: "model",
        content: welcomeText,
        audioUrl: ttsResult.media,
      };

      setMessages([firstResponse]);

      if (mode !== 'text') {
         playAudio(ttsResult.media, 0);
      }

    } catch (e) {
      setError("An error occurred. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const handleModeSelect = (mode: InteractionMode) => {
    setInteractionMode(mode);
    if (messages.length === 0) {
      startConversation(mode);
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch (err) {
          console.error("Speech recognition start error", err);
          toast({ variant: "destructive", title: "Voice Error", description: "Could not start voice recognition. Please check microphone permissions." });
        }
      } else {
        toast({ variant: "destructive", title: "Voice Error", description: "Voice recognition is not supported in your browser." });
      }
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const userInput: Message = { role: "user", content: values.message };
    const newMessages = [...messages, userInput];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);
    form.reset();

    try {
      const result = await aiTutor({ history: newMessages } as AITutorInput);
      const ttsResult = await textToSpeech(result);
      
      const modelResponse: Message = { role: "model", content: result, audioUrl: ttsResult.media };
      
      const finalMessages = [...newMessages, modelResponse];
      setMessages(finalMessages);

      if (interactionMode !== 'text') {
        playAudio(ttsResult.media, finalMessages.length - 1);
      }
    } catch (e) {
      setError("An error occurred while fetching the response. Please try again.");
      console.error(e);
      setMessages(newMessages); // Keep user message on error
    } finally {
      setIsLoading(false);
    }
  }

  if (!interactionMode) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center h-full">
         <Avatar className="h-20 w-20 mb-4">
            <AvatarFallback className="text-3xl">REC</AvatarFallback>
          </Avatar>
        <CardTitle className="text-2xl mb-2">Welcome to your AI Tutor Session!</CardTitle>
        <CardDescription className="mb-6 max-w-md">
          Hello! I&apos;m R.E.C, your personal English tutor. I&apos;m here to assist you on your journey of learning English at REC Online. How would you like to practice today?
        </CardDescription>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" onClick={() => handleModeSelect("video")}>
            <Video className="mr-2 h-5 w-5" />
            Video Chat
          </Button>
          <Button size="lg" variant="secondary" onClick={() => handleModeSelect("audio")}>
            <Mic className="mr-2 h-5 w-5" />
            Audio Only
          </Button>
          <Button size="lg" variant="secondary" onClick={() => handleModeSelect("text")}>
            <MessageSquare className="mr-2 h-5 w-5" />
            Text Message
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className={cn("grid grid-cols-1 gap-6 h-full", interactionMode !== 'text' && 'md:grid-cols-3')}>
      {interactionMode !== 'text' && (
        <div className="md:col-span-1 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{interactionMode === 'video' ? 'Your Video' : 'Audio Session'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
                {interactionMode === 'video' ? (
                  <>
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
                    {!hasCameraPermission && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4">
                        <CameraOff className="h-12 w-12 mb-2" />
                        <p className="text-center">Camera access is required. Please enable it in your browser settings.</p>
                      </div>
                    )}
                  </>
                ) : (
                   <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Mic className="h-16 w-16 mb-4"/>
                      <p>Audio chat is active</p>
                   </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <div className={cn("h-full", interactionMode !== 'text' ? "md:col-span-2" : 'col-span-1')}>
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Chat with R.E.C</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.length === 0 && isLoading && (
                   <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    <p>Starting conversation...</p>
                  </div>
                )}
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
                      className={`rounded-lg p-3 max-w-sm flex items-center gap-2 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.role === 'model' && message.audioUrl && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => playAudio(message.audioUrl!, index)}
                          disabled={message.isPlaying}
                          className="h-6 w-6 shrink-0"
                        >
                          {message.isPlaying ? (
                             <MicOff className="h-4 w-4 animate-pulse" />
                          ) : (
                             <Play className="h-4 w-4" />
                          )}
                        </Button>
                      )}
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
                 {error && (
                  <div className="text-destructive text-sm text-center p-4">{error}</div>
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
                          placeholder={isRecording ? "Listening..." : "Type or say something..."}
                          className="flex-1"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {(interactionMode === 'audio' || interactionMode === 'video') && (
                  <Button type="button" size="icon" onClick={toggleRecording} disabled={isLoading || !recognitionRef.current}>
                    {isRecording ? <MicOff className="text-destructive animate-pulse" /> : <Mic />}
                  </Button>
                )}
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

    