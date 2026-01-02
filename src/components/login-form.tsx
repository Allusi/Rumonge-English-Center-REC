
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useEffect, useState }from "react";
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";


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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

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
       if (!data.key || !z.string().email().safeParse(data.key).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["key"],
          message: "Please enter a valid email address to register.",
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
  const auth = useAuth();
  const firestore = useFirestore();
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth || !firestore) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Firebase is not configured. Please try again later.",
      });
      return;
    }

    try {
      if (values.role === "admin") {
        const email = values.email!;
        const password = values.password!;
        try {
          // Try to sign in first
          await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
          // If the user does not exist, create a new account
          if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await updateProfile(user, { displayName: 'Admin' });

            const userProfile = {
              name: 'Admin',
              email: user.email,
              role: 'admin',
            };
            const userDocRef = doc(firestore, "users", user.uid);
            setDoc(userDocRef, userProfile).catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                  path: userDocRef.path,
                  operation: 'create',
                  requestResourceData: userProfile,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
            await sendEmailVerification(user);
            toast({
              title: "Admin Account Created",
              description: `A verification email has been sent to ${email}.`,
              duration: 9000,
            });
          } else {
            // Re-throw other errors (like wrong password)
            throw error;
          }
        }
        toast({
          title: "Login Successful",
          description: "Welcome, Admin! Redirecting to your dashboard...",
        });
        router.push("/admin/dashboard");
      } else {
        // Student registration logic
        const studentEmail = values.key!; 
        const studentPassword = Math.random().toString(36).slice(-8); 

        const userCredential = await createUserWithEmailAndPassword(auth, studentEmail, studentPassword);
        const user = userCredential.user;
        
        await updateProfile(user, {
          displayName: values.fullName,
        });

        const userProfile = {
            name: values.fullName,
            email: user.email,
            role: 'student',
        };

        const userDocRef = doc(firestore, "users", user.uid);
        
        setDoc(userDocRef, userProfile).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'create',
              requestResourceData: userProfile,
            });
            errorEmitter.emit('permission-error', permissionError);
        });


        await sendEmailVerification(user);
        
        toast({
          title: "Registration Successful!",
          description: `Welcome, ${values.fullName}! A verification email has been sent to ${studentEmail}. Your temporary password is: ${studentPassword}`,
          duration: 9000,
        });
        router.push("/student/dashboard");
      }
    } catch (error: any) {
      console.error("Firebase Auth Error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "An unexpected error occurred.",
      });
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
                    <FormLabel className="font-normal">Student (Register)</FormLabel>
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
                  <FormLabel>Your Email</FormLabel>
                   <FormControl>
                    <Input placeholder="Enter your email to register" {...field} />
                  </FormControl>
                   <FormDescription>
                    A temporary password will be created for you.
                  </FormDescription>
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
          {form.formState.isSubmitting ? "Please wait..." : <>Sign In / Register <LogIn /></>}
        </Button>
      </form>
    </Form>
  );
}

    