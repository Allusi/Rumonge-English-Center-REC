import { courses } from "@/lib/data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { notFound } from "next/navigation";
import { UnitOneContent } from "@/components/unit-one-content";

export default function CourseDetailsPage({
  params,
}: {
  params: { courseId: string };
}) {
  const course = courses.find((c) => c.id === params.courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {course.name}
        </h1>
        <p className="text-muted-foreground">{course.description}</p>
      </div>

      {course.id === 'C001' ? (
        <UnitOneContent />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Course Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Course content for "{course.name}" is not yet available. Please check back later.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
