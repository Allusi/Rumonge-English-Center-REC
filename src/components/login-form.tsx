
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

const formSchema = z
  .object({
    role: z.enum(["student", "admin"], {
      required_error: "You need to select a role.",
    }),
    fullName: z.string().optional(),
    key: z.string().optional(),
    email: z.string().optional(),
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "student") {
      if (!data.fullName || data.fullName.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fullName"],
          message: "Please enter your full name.",
        });
      }
      if (!data.key || data.key.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["key"],
          message: "Key must be at least 6 characters.",
        });
      }
    } else if (data.role === "admin") {
      if (!data.email || !z.string().email().safeParse(data.email).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "Please enter a valid email address.",
        });
      }
      if (!data.password || data.password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Password must be at least 6 characters.",
        });
      }
    }
  });

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "student",
      fullName: "",
      key: "",
      email: "",
      password: "",
    },
  });

  const role = form.watch("role");

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, you'd handle authentication here.
    // For this demo, we'll just show a toast and redirect.
    toast({
      title: "Login Successful",
      description: `Welcome! Redirecting to ${values.role} dashboard...`,
    });
    
    if (values.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/student/dashboard");
    }
  }

  if (!isClient) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
         <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Sign in as</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="student" />
                    </FormControl>
                    <FormLabel className="font-normal">Student</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="admin" />
                    </FormControl>
                    <FormLabel className="font-normal">Administrator</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {role === 'student' && (
          <>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        {role === 'admin' && (
           <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Signing In..." : <>Sign In <LogIn /></>}
        </Button>
      </form>
    </Form>
  );
}
