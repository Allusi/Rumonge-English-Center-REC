import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export default function GuidelinesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          School Startup Document
        </h1>
        <p className="text-muted-foreground">
          Guidelines and requirements for classes at Rumonge English School.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Class Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <strong>Class Level:</strong> Beginner, Intermediate, Advanced
                (Optional)
              </li>
              <li>
                <strong>Age Group:</strong> 5–10 years, Teenagers, Adults
              </li>
              <li>
                <strong>Class Size:</strong> Recommended: 10 or more students
              </li>
              <li>
                <strong>Schedule:</strong> All days, 4:00 PM – 5:30 PM
              </li>
              <li>
                <strong>Class Format:</strong> In-person / Hybrid / Online
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Materials & Technology Required</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>For Students</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4">
                    <div>
                      <h4 className="font-semibold">Essential:</h4>
                      <ul className="ml-6 list-disc [&>li]:mt-2">
                        <li>Notebook & pen/pencil</li>
                        <li>Textbook/workbook (if applicable)</li>
                        <li>Folder for handouts</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold">Technology (if applicable):</h4>
                      <ul className="ml-6 list-disc [&>li]:mt-2">
                        <li>
                          Smartphone/Tablet: For language apps, quizzes, and
                          audio exercises.
                        </li>
                        <li>
                          Laptop/Computer: Required for online classes, typing
                          practice, and research tasks.
                        </li>
                        <li>Headphones/earbuds (for listening activities).</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>For Teacher/Classroom</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4">
                    <div>
                      <h4 className="font-semibold">Essential Teaching Aids:</h4>
                      <ul className="ml-6 list-disc [&>li]:mt-2">
                        <li>Whiteboard or blackboard & markers or chalks</li>
                        <li>Flashcards, printed visuals, posters</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold">Technology (if available):</h4>
                      <ul className="ml-6 list-disc [&>li]:mt-2">
                        <li>
                          Projector/Smartboard: For videos, slideshows, and
                          interactive lessons.
                        </li>
                        <li>
                          Computer/Laptop: For lesson presentations, audio/video
                          playback and system monitoring (recommended).
                        </li>
                        <li>
                          Speaker or Sound System: Clear audio for listening
                          exercises.
                        </li>
                        <li>
                          Stable internet connection (for online resources, optional
                          as downloaded lessons can be used).
                        </li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Basic Classroom Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-2 pl-6 text-sm text-muted-foreground">
              <li>Speak English as much as possible.</li>
              <li>Respect classmates and teacher—take turns to speak.</li>
              <li>
                Arrive on time and bring required materials (including charged
                devices if needed).
              </li>
              <li>
                Use smartphones/computers only for class activities unless
                permitted.
              </li>
              <li>Participate actively in all activities (both tech and non-tech).</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Objectives (Example for Unit One)</CardTitle>
            <CardDescription>
              By the end of the course, students will be able to:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="ml-6 list-disc space-y-2 text-sm text-muted-foreground">
              <li>Introduce themselves and ask simple questions.</li>
              <li>Use basic vocabulary (family, food, daily routines).</li>
              <li>Read and understand short sentences.</li>
              <li>Write simple sentences and short paragraphs.</li>
              <li>
                Use basic digital tools (like word processors, learning apps) in
                English.
              </li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              We have a total of 8 books for the basic level.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assessment & Participation</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="ml-6 list-disc space-y-2 text-sm text-muted-foreground">
              <li>Regular in-class activities, quizzes (both paper-based and digital).</li>
              <li>Homework (1–2 assignments per week – may include online tasks).</li>
              <li>
                Participation in tech-assisted activities (e.g., interactive polls,
                app-based exercises).
              </li>
              <li>
                Final test/project at end of term (could include a digital
                presentation).
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technology Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="ml-6 list-disc space-y-2 text-sm text-muted-foreground">
              <li>
                Devices should be used responsibly and only for learning during
                class.
              </li>
              <li>Make sure your device is charged before class if needed.</li>
              <li>
                Download required apps/software in advance (teacher will inform).
              </li>
              <li>
                Inform teacher if you do not have access to required technology –
                alternatives can be arranged.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teacher & School Support</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="ml-6 list-disc space-y-2 text-sm text-muted-foreground">
              <li>
                Teacher available for questions after class or via email/chat.
              </li>
              <li>
                School provides syllabus, key materials, and certificate of
                completion.
              </li>
              <li>
                Tech support available for classroom equipment (projector,
                computer, etc.).
              </li>
              <li>
                Parent/guardian meetings (for young learners) once per term.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes & Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="ml-6 list-disc space-y-2 text-sm text-muted-foreground">
                <li>Please inform teacher in advance about absences.</li>
                <li>Let teacher know if you have special learning needs or lack access to technology.</li>
                <li>Bring a positive attitude and willingness to learn, both with and without tech!</li>
            </ul>
            <div className="mt-4 border-t pt-4">
              <p className="text-sm">
                <strong>Contact:</strong> IRAMBONA Simeon
              </p>
              <p className="text-sm text-muted-foreground">
                allusimeon12@gmail.com | (RES) Rumonge English School
              </p>
               <p className="text-sm text-muted-foreground">
                WhatsApp: +25766332709
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
