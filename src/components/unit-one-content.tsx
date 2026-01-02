"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Loader2, Volume2 } from "lucide-react";
import { textToSpeech } from "@/ai/flows/tts-flow";


export function UnitOneContent() {
  const [playingLetter, setPlayingLetter] = useState<string | null>(null);
  const [loadingLetter, setLoadingLetter] = useState<string | null>(null);

  const playLetter = async (letter: string) => {
    if (loadingLetter) return;
    setLoadingLetter(letter);
    try {
      const { media } = await textToSpeech(letter);
      const audio = new Audio(media);
      setPlayingLetter(letter);
      audio.play();
      audio.onended = () => setPlayingLetter(null);
    } catch (error) {
      console.error("Error playing audio:", error);
    } finally {
      setLoadingLetter(null);
    }
  };

  const alphabet = "A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z".split(',');
  const vowels = ["A", "E", "I", "O", "U"];
  const consonants = "B, C, D, F, G, H, J, K, L, M, N, P, Q, R, S, T, V, W, X, Y, Z".split(', ');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Introduction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This unit has been prepared and developed to provide you with basic essential vocabulary knowledge. It is intended for students of unit one. We hope that more advanced learners and teachers will also find it useful. Let us consider a basic fact of life: all people, old and young, rich and poor, need to get knowledge.
          </p>
        </CardContent>
      </Card>

      <Accordion type="multiple" className="w-full space-y-4">
        <AccordionItem value="alphabet" className="border rounded-lg">
          <AccordionTrigger className="p-4 text-lg font-semibold">
            Section 1: English Alphabet
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0">
            <p className="mb-4 text-muted-foreground">
              In English, we have twenty-six (26) English letters. These are divided into two categories: consonants and vowels. We have twenty-one (21) consonants and five (5) vowels.
            </p>
             <div className="mb-4 space-y-2">
                <p className="font-semibold">Full Alphabet:</p>
                <div className="flex flex-wrap gap-2">
                  {alphabet.map(l => (
                    <Button variant="outline" key={l} onClick={() => playLetter(l)} disabled={!!loadingLetter} className="w-12 h-12 text-lg">
                       {loadingLetter === l ? <Loader2 className="animate-spin"/> : l}
                       {playingLetter === l && <Volume2 className="ml-2 h-4 w-4 text-primary animate-pulse" />}
                    </Button>
                  ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-lg mb-2">Vowels (5)</h4>
                <div className="flex flex-wrap gap-2">
                  {vowels.map(l => (
                     <Button variant="secondary" key={l} onClick={() => playLetter(l)} disabled={!!loadingLetter} className="w-12 h-12 text-lg">
                       {loadingLetter === l ? <Loader2 className="animate-spin"/> : l}
                       {playingLetter === l && <Volume2 className="ml-2 h-4 w-4 text-primary animate-pulse" />}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Consonants (21)</h4>
                 <div className="flex flex-wrap gap-1 text-muted-foreground">
                  {consonants.map((c, i) => <span key={c}>{c}{i < consonants.length - 1 ? ', ' : ''}</span>)}
                </div>
              </div>
            </div>
             <div className="mt-4 p-4 border rounded-md bg-muted/20">
                <h4 className="font-semibold mb-2">Note:</h4>
                <p className="text-sm text-muted-foreground">When writing, the letters can be written in two ways:</p>
                <ol className="list-decimal pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
                    <li><strong>In upper case letters (Capital letters):</strong><br/> {alphabet.join(', ')}</li>
                    <li><strong>In lower case letters (Small letters):</strong><br/> {alphabet.map(l => l.toLowerCase()).join(', ')}</li>
                </ol>
                <p className="mt-2 text-sm text-muted-foreground">When we speak we use sound and when we write we use letters.</p>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Dialogue Practice</h4>
              <div className="p-4 border rounded-lg bg-muted/50">
                <p><strong>Anna:</strong> Good morning, Juma!</p>
                <p><strong>Juma:</strong> Good morning, Anna!</p>
                <p><strong>Anna:</strong> how are you ?</p>
                <p><strong>Juma:</strong> I am fine thank you and you?</p>
                <p><strong>Anna:</strong> fine too, I am happy to meet you, Juma.</p>
                <p><strong>Juma:</strong> how many English letters do we have?</p>
                <p><strong>Anna:</strong> we have 26 English letters,divided into two classes namely vowels and consonants.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="greetings" className="border rounded-lg">
          <AccordionTrigger className="p-4 text-lg font-semibold">
            Section 2: Greetings, Introduction and Request
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0">
            <h4 className="font-semibold text-lg mb-2">Greetings</h4>
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Expression</TableHead>
                    <TableHead>Response</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Friendly</TableCell>
                    <TableCell>Hi! / Hello!</TableCell>
                    <TableCell>Hi! / Hello!</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Respectable</TableCell>
                    <TableCell>Good morning!</TableCell>
                    <TableCell>Good morning!</TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell className="font-medium">Respectable</TableCell>
                    <TableCell>Good afternoon!</TableCell>
                    <TableCell>Good afternoon!</TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell className="font-medium">Respectable</TableCell>
                    <TableCell>Good evening!</TableCell>
                    <TableCell>Good evening!</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
               <h4 className="font-semibold text-lg mb-2 mt-4">Introductions</h4>
               <p className="text-muted-foreground mb-2">You can introduce yourself by saying: "My name is [Your Name]".</p>
               <p className="text-muted-foreground">To ask someone's name, you can say: "What is your name?".</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="vocabulary" className="border rounded-lg">
          <AccordionTrigger className="p-4 text-lg font-semibold">
            Section 3: People, Things and Places
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0">
            <p className="text-muted-foreground mb-4">This section covers common vocabulary.</p>
             <Accordion type="multiple" className="w-full space-y-2">
                <AccordionItem value="family">
                    <AccordionTrigger>Family Members</AccordionTrigger>
                    <AccordionContent>
                        <ul className="list-disc pl-6 text-muted-foreground columns-2">
                            <li>Mother / Father</li>
                            <li>Brother / Sister</li>
                            <li>Grandmother / Grandfather</li>
                            <li>Aunt / Uncle / Cousin</li>
                            <li>Son / Daughter</li>
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="body">
                    <AccordionTrigger>Parts of the Body</AccordionTrigger>
                    <AccordionContent>
                        <ul className="list-disc pl-6 text-muted-foreground columns-2">
                            <li>Head, Hair, Eyes, Nose, Mouth</li>
                            <li>Arm, Hand, Fingers</li>
                            <li>Leg, Foot, Toes</li>
                            <li>Stomach, Back, Chest</li>
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="home">
                    <AccordionTrigger>Things at Home</AccordionTrigger>
                    <AccordionContent>
                        <ul className="list-disc pl-6 text-muted-foreground columns-2">
                            <li>Table, Chair, Bed</li>
                            <li>Plate, Cup, Spoon</li>
                            <li>Door, Window</li>
                            <li>Kitchen, Bathroom</li>
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="places">
                    <AccordionTrigger>Places</AccordionTrigger>
                    <AccordionContent>
                        <ul className="list-disc pl-6 text-muted-foreground columns-2">
                            <li>Town: agasagara</li>
                            <li>Bank: ibanki</li>
                            <li>Forest: ishamba</li>
                            <li>Village: ikigwati</li>
                            <li>School: ishure</li>
                            <li>Hospital: ibitaro</li>
                            <li>Market: isoko</li>
                        </ul>
                    </AccordionContent>
                </AccordionItem>
             </Accordion>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="actions" className="border rounded-lg">
          <AccordionTrigger className="p-4 text-lg font-semibold">
            Section 4: Actions
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0">
            <p className="text-muted-foreground mb-2">Action words (verbs) tell us what is happening.</p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>A boy is <strong>eating</strong> a banana.</li>
              <li>A girl is <strong>going</strong>.</li>
              <li>Martha is <strong>washing</strong> her clothes.</li>
              <li>We are <strong>studying</strong> English.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="describing" className="border rounded-lg">
          <AccordionTrigger className="p-4 text-lg font-semibold">
            Section 5: Talking about People, Things and Places
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0">
            <p className="text-muted-foreground mb-2">We use describing words (adjectives) to tell more about people, things, and places.</p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>This is a <strong>tall</strong> boy. This is a <strong>short</strong> boy.</li>
              <li>Anna is a <strong>fat</strong> girl. Christina is a <strong>thin</strong> girl.</li>
              <li>This is a <strong>small</strong> house. That is a <strong>big</strong> house.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="position" className="border rounded-lg">
          <AccordionTrigger className="p-4 text-lg font-semibold">
            Section 6: Words for Position and Direction
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0">
             <p className="text-muted-foreground mb-2">These words (prepositions) show us where things are.</p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>The ball is <strong>on</strong> the table.</li>
              <li>The bottle is <strong>under</strong> the table.</li>
              <li>The boy is <strong>behind</strong> the car.</li>
              <li>The girl is <strong>in front of</strong> the car.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="dialogues" className="border rounded-lg">
          <AccordionTrigger className="p-4 text-lg font-semibold">
            Section 7: Dialogue Practices
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0">
             <Card>
                <CardHeader>
                    <CardTitle>At the Party</CardTitle>
                </CardHeader>
                <CardContent>
                    <p><strong>A:</strong> Hello, Andy, how is your party?</p>
                    <p><strong>B:</strong> Very crowded, look there are many people here.</p>
                    <p><strong>A:</strong> Do you enjoy it?</p>
                    <p><strong>B:</strong> Yes, very much.</p>
                </CardContent>
             </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="exercises" className="border rounded-lg">
          <AccordionTrigger className="p-4 text-lg font-semibold">
            Section 8: Exercise Application
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0">
            <Card>
                <CardHeader>
                    <CardTitle>Exercise 1</CardTitle>
                </CardHeader>
                <CardContent>
                    <ol className="list-decimal pl-6 space-y-2">
                        <li>Write down three things found at the hospital.</li>
                        <li>Write down all sections of unit one from section one to the last.</li>
                        <li>Answer the following questions:
                            <ul className="list-alpha pl-6">
                                <li>How do you call a man who missed his wife in war or death?</li>
                                <li>How do you call someone whose nationality is Tanzania?</li>
                            </ul>
                        </li>
                    </ol>
                </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
}
