
'use client';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SubmissionsPage() {
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
         <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" passHref>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-headline text-3xl font-bold tracking-tight">
                Assignment Submissions
              </h1>
              <p className="text-muted-foreground">
                Review and grade student assignment submissions.
              </p>
            </div>
        </div>
      </div>
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>This feature is coming soon! You'll be able to see all student submissions here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
