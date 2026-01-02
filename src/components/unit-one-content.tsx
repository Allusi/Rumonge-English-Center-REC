
"use client";

import { useState, useEffect } from "react";
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const playLetter = async (letter: string) => {
    if (loadingLetter) return;
    setLoadingLetter(letter);
    try {
      const { media } = await textToSpeech(`The letter ${letter}`);
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

  if (!isClient) {
    return null;
  }

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
          <AccordionContent className="p-4 pt-0 space-y-4">
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
            <div>
              <h4 className="font-semibold text-lg mb-2">Dialogue Practice</h4>
              <div className="p-4 border rounded-lg bg-muted/50 space-y-1 text-sm">
                <p><strong>Anna:</strong> Good morning, Juma!</p>
                <p><strong>Juma:</strong> Good morning, Anna!</p>
                <p><strong>Anna:</strong> how are you ?</p>
                <p><strong>Juma:</strong> I am fine thank you and you?</p>
                <p><strong>Anna:</strong> fine too, I am happy to meet you, Juma.</p>
                <p><strong>Juma:</strong> I am happy to meet you too, Anna, where were you nowadays?</p>
                <p><strong>Anna:</strong> I was at kasulu to learn English language.</p>
                <p><strong>Juma:</strong> what did you learn?</p>
                <p><strong>Anna:</strong> we learnt English alphabet.</p>
                <p><strong>Juma:</strong> how many English letters do we have?</p>
                <p><strong>Anna:</strong> we have 26 English letters,divided into two classes namely vowels and consonants.</p>
                <p><strong>Juma:</strong> it means that there are thirteen vowels and thirteen consonants?</p>
                <p><strong>Anna:</strong> no, there are five vowels and twenty-one consonants.</p>
                <p><strong>Juma:</strong> can you please teach me those letters?</p>
                <p><strong>Anna:</strong> yes, let me teach you how to sing them.</p>
                <p><strong>Juma:</strong> I shall be thankful to you.</p>
                <p><strong>Anna:</strong> let me sing alone after we will sing together.</p>
                <p><strong>Juma:</strong> no matter what.</p>
                <p><strong>Anna:</strong> [ A,B,C,D........Z]</p>
                <p><strong>Juma:</strong> it is a difficult song.</p>
                <p><strong>Anna:</strong> no, you are going to find it easy.</p>
                <p><strong>Juma:</strong> let me wait ,I shall see.</p>
                <p><strong>Anna:</strong> so , be all ears and repeat after me [A,B,C....]</p>
                <p><strong>Juma:</strong> okay ,thank you very much for teaching me how to sing English alphabet ,tomorrow I shall go to join unit one at I.E.T.S.</p>
                <p><strong>Anna:</strong> it is your choice because English is very important nowadays.</p>
                <p><strong>Juma:</strong> Yeah, see you next week.</p>
                <p><strong>Anna:</strong> we shall meet if God wishes.</p>
              </div>
            </div>
             <div>
                <h4 className="font-semibold text-lg mb-2">Expressions</h4>
                 <div className="p-4 border rounded-lg bg-muted/20 space-y-2 text-sm">
                    <p><strong>1. To be as easy as ABC:</strong> to be very easy ( simple ).<br/><em>E.g: That song is as easy as ABC.</em></p>
                    <p><strong>2. From A to B:</strong> from one place to another, from one's starting-point to one's destination.<br/><em>E.g: I used only 20 minutes to go from A to B.</em></p>
                    <p><strong>3. From A to Z:</strong> all details.<br/><em>E.g: I can tell you what you taught us from A to Z. / I know him from A to Z.</em></p>
                    <p><strong>4. To be all ears:</strong> to be attentive.<br/><em>E.g: I am all ears for what you are going to tell us.</em></p>
                 </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="greetings" className="border rounded-lg">
          <AccordionTrigger className="p-4 text-lg font-semibold">
            Section 2: Greetings, Introduction and Request
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0 space-y-4">
              <p className="text-muted-foreground">In English language, we have many greetings. Many learners to whom English is not their native language (mother tongue) find it difficult to greet people especially those ones who s/he wants to greet has a certain title or other official positions. The way which people are addressed obviously differs from one culture to another. It is important that we keep these differences separately and that we do not confuse them. We are going to learn two kinds of greetings: Greetings used when greeting respectable people and greetings used when greeting friends.</p>
            
               <Card>
                <CardHeader>
                  <CardTitle>Primary Greetings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">1. Friendly Greetings Expressions</h4>
                    <ul className="list-disc pl-6 text-muted-foreground">
                      <li>Hi!</li>
                      <li>Hello!, Hallo!</li>
                      <li>How do you do?</li>
                      <li>How are things?</li>
                      <li>How are you doing?</li>
                      <li>How is it going? Etc..</li>
                    </ul>
                    <div className="mt-2 p-4 border rounded-lg bg-muted/50 space-y-1 text-sm">
                      <p className="font-semibold">Practice: John and Paul meet at the railway station.</p>
                      <p><strong>John:</strong> Hi, Paul! <span className="text-muted-foreground">/ How do you do? / Hello, Paul!</span></p>
                      <p><strong>Paul:</strong> Hi, John! <span className="text-muted-foreground">/ How do you do? / Hello, John!</span></p>
                      <p><strong>John:</strong> How are things, Paul? <span className="text-muted-foreground">/ How are you doing, Paul?</span></p>
                      <p><strong>Paul:</strong> Quite well and you? <span className="text-muted-foreground">/ Pretty fine and you?</span></p>
                      <p><strong>John:</strong> Fine. <span className="text-muted-foreground">/ Very well, thank you.</span></p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg mb-2">2. Respectable Greetings</h4>
                    <p className="text-muted-foreground mb-2">The respectable greetings are also called the main greetings in English.</p>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                      <li>In the morning time we greet someone by saying: <strong>Good morning!</strong> And the answer to that greeting is the same as "Good morning".</li>
                      <li>In the afternoon time we greet someone by saying: <strong>Good afternoon!</strong> And the answer to that greeting is the same as "Good afternoon".</li>
                      <li>In the evening time we greet someone by saying: <strong>Good evening!</strong> And the answer to that greeting is also the same as "Good evening".</li>
                      <li>In the night we say <strong>Goodnight</strong> as the way of wishing someone to have a goodnight. It means that this is not considered to be a special greeting.</li>
                    </ul>
                     <div className="mt-2 p-4 border rounded-lg bg-muted/50 space-y-4 text-sm">
                      <div>
                        <p className="font-semibold">A. Anna and John Talking</p>
                        <p><strong>Anna:</strong> Good morning Mr John!</p>
                        <p><strong>John:</strong> Good morning Anna.</p>
                        <p><strong>Anna:</strong> How are you?</p>
                        <p><strong>John:</strong> I am fine thank you and you?</p>
                        <p><strong>Anna:</strong> Fine too.</p>
                      </div>
                      <div>
                        <p className="font-semibold">B. Ezra and Esther Talking</p>
                        <p><strong>Esther:</strong> Good afternoon, Ezra!</p>
                        <p><strong>Ezra:</strong> Good afternoon, Esther!</p>
                        <p><strong>Esther:</strong> How are you?</p>
                        <p><strong>Ezra:</strong> I am very well and you?</p>
                        <p><strong>Esther:</strong> I am very well too.</p>
                        <p><strong>Ezra:</strong> Good bye.</p>
                        <p><strong>Esther:</strong> Good bye</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Secondary Greetings: Questions and Answers</CardTitle>
                  <CardDescription>
                    Here are different ways to ask "how are you?" and how to answer.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">A. Questions</h4>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                      <li>How are you?</li>
                      <li>How is it?</li>
                      <li>How are you keeping?</li>
                      <li>How does it keep?</li>
                      <li>How are you getting on?</li>
                      <li>How are you going on?</li>
                      <li>How are you doing?</li>
                      <li>How is it going?</li>
                      <li>What's news?</li>
                      <li>How do you get along?</li>
                      <li>How spend with you?</li>
                      <li>Longtime no see, no news?</li>
                      <li>Longtime no see, what's news?</li>
                      <li>How is home?</li>
                      <li>How do you feel?</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">B. Answers</h4>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                      <li>I am fine, thank you.</li>
                      <li>I am fine, thanks.</li>
                      <li>I am okay.</li>
                      <li>I am soso.</li>
                      <li>I am just well.</li>
                      <li>I am fine too.</li>
                      <li>I am quite well.</li>
                      <li>I am Great.</li>
                      <li>So well.</li>
                      <li>Little fine.</li>
                      <li>Nothing complicated.</li>
                      <li>Well.</li>
                      <li>I can't complain.</li>
                      <li>Alright.</li>
                      <li>All are well.</li>
                      <li>No probs/no problem.</li>
                    </ul>
                    <div className="mt-4">
                      <h5 className="font-semibold mb-2">Answers for "How do you feel?"</h5>
                       <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                          <li>I feel okay.</li>
                          <li>I feel Ill.</li>
                          <li>I am Ill.</li>
                          <li>I feel hungry.</li>
                          <li>I am hungry.</li>
                          <li>I feel thirsty.</li>
                          <li>I am thirsty.</li>
                          <li>I feel cold.</li>
                          <li>I am tired.</li>
                          <li>I feel hot.</li>
                          <li>I am worn out.</li>
                          <li>I feel bad.</li>
                          <li>I feel worn out.</li>
                          <li>I feel tired.</li>
                       </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Spoken Expressions After Greetings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-6 text-muted-foreground">
                    <li>Nice to meet you.</li>
                    <li>Good to meet you.</li>
                    <li>It is a pleasure to meet you.</li>
                    <li>I am pleased to meet you.</li>
                    <li>I am happy to meet you.</li>
                    <li>I am happy to see you again.</li>
                    <li>I miss you.</li>
                    <li>I am lucky to meet you.</li>
                    <li>I am glad to see you again.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Expressions for Saying "Good Bye"</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-6 text-muted-foreground columns-2 md:columns-3">
                    <li>Bye.</li>
                    <li>so long.</li>
                    <li>see you the following day.</li>
                    <li>ciao</li>
                    <li>Bye bye.</li>
                    <li>cheerio.</li>
                    <li>see you after time.</li>
                    <li>tata</li>
                    <li>Soon.</li>
                    <li>see you around.</li>
                    <li>we shall see tomorrow.</li>
                    <li>tatty bye</li>
                    <li>later.</li>
                    <li>being seen around</li>
                    <li>we shall meet tomorrow</li>
                    <li>see you</li>
                    <li>see you soon.</li>
                    <li>be seeing around.</li>
                    <li>see you next day.</li>
                    <li>catch you later</li>
                    <li>see you later</li>
                    <li>see you tomorrow.</li>
                    <li>see you Monday.</li>
                    <li>peace out</li>
                    <li>buh-bye.</li>
                    <li>good day.</li>
                    <li>hasta la vista.</li>
                    <li>cheery-bye</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4"><strong>NB:</strong> We can add the words "If God wishes" to each one of the above expressions. E.g: see you later if God wishes.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dialogue Practice: A Neighbour</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p><strong>A:</strong> Hi, there. nice to meet you.</p>
                  <p><strong>B:</strong> Hi, nice to meet you too. I am Stany</p>
                  <p><strong>A:</strong> I'm Godelive, how long have you been living here?</p>
                  <p><strong>B:</strong> seven years.</p>
                  <p><strong>A:</strong> do you know many people around here?</p>
                  <p><strong>B:</strong> yes, I know almost everyone in the neighbourhood.</p>
                  <p><strong>A:</strong> then do you know where Angeline lives?</p>
                  <p><strong>B:</strong> Angeline? Oh yes. She lives at number 7.</p>
                  <p><strong>A:</strong> is this the house with the red door?</p>
                  <p><strong>B:</strong> that's it.</p>
                </CardContent>
              </Card>

              <div className="space-y-2 pt-4">
                <h4 className="font-semibold text-xl mb-2 mt-4">B. Introductions</h4>
                <p className="text-muted-foreground">In this part we are going to see three kinds of introductions.</p>
                <p className="text-muted-foreground">These are: 1) SELF INTRODUCTION, 2) INTRODUCTION BY QUESTIONS, 3) INTRODUCING OTHERS</p>
              </div>
              <Card>
                  <CardHeader>
                      <CardTitle>1. Self Introduction</CardTitle>
                      <CardDescription>This introduction is done only by one person when s/he is introducing her/himself in front of others. See the following example:</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <ul className="list-disc pl-6 text-muted-foreground space-y-1 text-sm columns-2">
                          <li>My name is Betty.</li>
                          <li>My first name is Betty</li>
                          <li>My middle name is Bruce</li>
                          <li>My last name is William</li>
                          <li>My nickname is Chinga</li>
                          <li>I am called Betty</li>
                          <li>The people call me Betty Bruce</li>
                          <li>My full name is Betty Bruce William Chinga</li>
                          <li>I am well known by the name Chinga</li>
                          <li>My father is John</li>
                          <li>My father's name is John</li>
                          <li>My father is called John</li>
                          <li>My father's middle name is William</li>
                          <li>My father is well known by the name Magambo</li>
                          <li>My mother is Catherine</li>
                          <li>My mother's name is Catherine</li>
                          <li>My mother is called Catherine</li>
                          <li>My mother's middle name is Bruce</li>
                          <li>My mother is well known by the name Change</li>
                          <li>My brother is Jonathan</li>
                          <li>My elder brother is Jonas</li>
                          <li>My younger brother is Jonathan</li>
                          <li>My sister is Agnes</li>
                          <li>My elder sister is Quesia</li>
                          <li>I have two biological brothers and sisters</li>
                          <li>I come from Makamba, Nyanza-Lac</li>
                          <li>I am a Burundian</li>
                          <li>I live at Muyange</li>
                          <li>I dwell at Muyange</li>
                          <li>I abide at Muyange</li>
                          <li>I am married</li>
                          <li>I am twenty-five (25) years old</li>
                          <li>I study at UBUMWE secondary school</li>
                          <li>I am in form four</li>
                          <li>I am in standard six</li>
                          <li>I am studies prefect</li>
                          <li>I am a bachelor</li>
                          <li>I am a bachelorette</li>
                          <li>My spouse is Angel</li>
                          <li>My wife is Angel</li>
                          <li>My husband is Augustin</li>
                          <li>My son is Bruce</li>
                          <li>My first born is Grace</li>
                          <li>My second child is Bruce</li>
                          <li>My daughter is Osiane</li>
                          <li>I have one wife and three children</li>
                          <li>My favourite job is teaching</li>
                          <li>My hobby is Reading, studying and writing Books</li>
                          <li>I love most my wife and children</li>
                          <li>I hate most Liars</li>
                          <li>My best drink is water. Etc...</li>
                      </ul>
                  </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle>2. Introduction by Questions</CardTitle>
                    <CardDescription>This introduction is done by more than one person. Here are questions that correspond to the self-introduction examples.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-1 text-sm columns-2">
                        <li>What is your name?</li>
                        <li>What is your first name?</li>
                        <li>What is your middle name?</li>
                        <li>What is your last name?</li>
                        <li>What is your nick name?</li>
                        <li>How are you called?</li>
                        <li>How do the people call you?</li>
                        <li>What is your full name?</li>
                        <li>How are you well known?</li>
                        <li>Who is your father?</li>
                        <li>What is your father's name?</li>
                        <li>What is your father's middle name?</li>
                        <li>How is your father well known?</li>
                        <li>What is your father?</li>
                        <li>Who is your mother?</li>
                        <li>What is your mother's name?</li>
                        <li>How is your mother called?</li>
                        <li>What is your mother's middle name?</li>
                        <li>How is your mother well known?</li>
                        <li>What is your mother?</li>
                        <li>How old are you?</li>
                        <li>What is your age?</li>
                        <li>What is your daily life?</li>
                        <li>Who is your brother?</li>
                        <li>Who is your elder brother?</li>
                        <li>Who is your younger brother?</li>
                        <li>Who is your sister?</li>
                        <li>Who is your younger sister?</li>
                        <li>Who is your elder sister?</li>
                        <li>What is the name of your sister?</li>
                        <li>Are you married?</li>
                        <li>What is your marital status?</li>
                        <li>Are you a bachelor?</li>
                        <li>Are you a bachelorette?</li>
                        <li>Who is your spouse?</li>
                        <li>Who is your wife?</li>
                        <li>What is your wife's name?</li>
                        <li>How is your wife called?</li>
                        <li>Who is your husband?</li>
                        <li>Who is your son?</li>
                        <li>How is your son called?</li>
                        <li>Who is your first born?</li>
                        <li>Who is your second child?</li>
                        <li>Who is your daughter?</li>
                        <li>How many children do you have?</li>
                        <li>How many biological brothers and sisters do you have?</li>
                        <li>Where do you come from?</li>
                        <li>Where do you live?</li>
                        <li>Where do you abide?</li>
                        <li>Where do you dwell?</li>
                        <li>What is your favourite job?</li>
                        <li>What is your favourite teacher?</li>
                        <li>What is your favourite course?</li>
                        <li>Whom do you love most?</li>
                        <li>Who is your girlfriend?</li>
                        <li>Who is your boyfriend?</li>
                        <li>Who is your Darling?</li>
                        <li>What is your best friend?</li>
                        <li>What is your best drink?</li>
                        <li>What do you do in your daily life?</li>
                    </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle>3. Introducing Others</CardTitle>
                    <CardDescription>This introduction is done by more than two persons for introducing each others one to someone else to make friendship. See the following example given in the conversation between MINANI, ANNA AND JOSEPH.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p><strong>MINANI:</strong> Hello, Joseph!</p>
                  <p><strong>JOSEPH:</strong> Hello, MINANI!</p>
                  <p><strong>MINANI:</strong> How is it?</p>
                  <p><strong>JOSEPH:</strong> Pretty fine, and you?</p>
                  <p><strong>MINANI:</strong> So well, where to?</p>
                  <p><strong>JOSEPH:</strong> To the market, and you?</p>
                  <p><strong>MINANI:</strong> To the church.</p>
                  <p><strong>ANNA:</strong> I am sorry MINANI, who is this?</p>
                  <p><strong>MINANI:</strong> This is my friend, his name is Joseph.</p>
                  <p><strong>ANNA:</strong> Where does he come from?</p>
                  <p><strong>MINANI:</strong> He comes from Rutana.</p>
                  <p><strong>ANNA:</strong> Where does he dwell?</p>
                  <p><strong>MINANI:</strong> He dwells at Kabonga.</p>
                  <p><strong>ANNA:</strong> Is he married?</p>
                  <p><strong>MINANI:</strong> No, he is still bachelor.</p>
                  <p><strong>ANNA:</strong> What is his tribe?</p>
                  <p><strong>MINANI:</strong> His tribe is Tutsi.</p>
                  <p><strong>ANNA:</strong> What is his clan?</p>
                  <p><strong>MINANI:</strong> His clan is Muhima.</p>
                  <p><strong>ANNA:</strong> Where does he study nowadays?</p>
                  <p><strong>MINANI:</strong> He has completed Basic English at F.A.S.C, and he is waiting to join high level at I.E.T.S the following month.</p>
                  <p><strong>ANNA:</strong> Thank you very much MINANI.</p>
                  <p><strong>MINANI:</strong> You are welcome.</p>
                  <p><strong>JOSEPH:</strong> I am sorry MINANI, who is this?</p>
                  <p><strong>MINANI:</strong> This is my wife, Anna.</p>
                  <p><strong>JOSEPH:</strong> When have you married to her?</p>
                  <p><strong>MINANI:</strong> There is three years ago.</p>
                  <p><strong>JOSEPH:</strong> Has she studied?</p>
                  <p><strong>MINANI:</strong> Yes, she's completed English advanced level, there is four Years.</p>
                  <p><strong>JOSEPH:</strong> Oh, good! How many children have got?</p>
                  <p><strong>MINANI:</strong> Only one.</p>
                  <p><strong>JOSEPH:</strong> Is he a boy?</p>
                  <p><strong>MINANI:</strong> No, she is a girl.</p>
                  <p><strong>JOSEPH:</strong> What is her tribe?</p>
                  <p><strong>MINANI:</strong> Her tribe is Hutu.</p>
                  <p><strong>JOSEPH:</strong> What is yours?</p>
                  <p><strong>MINANI:</strong> My tribe is Tutsi</p>
                  <p><strong>JOSEPH :</strong> That is okay, Thank you very much MINANI.</p>
                  <p><strong>MINANI:</strong> Not at all.</p>
                  <p><strong>JOSEPH:</strong> I am happy to meet you Mrs MINANI.</p>
                  <p><strong>ANNA:</strong> I am happy to meet you too, Joseph</p>
                  <p><strong>JOSEPH:</strong> See you soon.</p>
                  <p><strong>ANNA:</strong> Okay, See you soon if God wishes.</p>
                </CardContent>
              </Card>

              <div className="space-y-2 pt-4">
                <h4 className="font-semibold text-xl mb-2 mt-4">C. Request</h4>
                <p className="text-muted-foreground">A request or making request is a way of asking someone to let you do or use something. To ask permission or authorisation of doing something. See the following expressions used when making request:</p>
                <ul className="list-disc pl-6 text-muted-foreground">
                    <li>Can I ....................................?</li>
                    <li>May I...................................?</li>
                    <li>Is it alright if you / I.............?</li>
                    <li>Is it bad if I / you....................?</li>
                    <li>Do you mind if I / you / he...?</li>
                    <li>Don't you mind if Anna............?</li>
                </ul>
              </div>

              <Card>
                <CardHeader>
                    <CardTitle>Examples in a Sentence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div>
                        <p><strong>- Can I go out for having a wee?</strong></p>
                        <p className="text-muted-foreground">{'->'} Yes, you can / Yes, go / No, you can't</p>
                    </div>
                    <div>
                        <p><strong>- May I get in please?</strong></p>
                        <p className="text-muted-foreground">{'->'} Yes, you may / Why not! / Sure / No, you may not / With pleasure get in</p>
                    </div>
                    <div>
                        <p><strong>- Is it alright if you clean the blackboard?</strong></p>
                        <p className="text-muted-foreground">{'->'} Yes, it is / No, I am busy now.</p>
                    </div>
                    <div>
                        <p><strong>- Is it bad if I use the red pen?</strong></p>
                        <p className="text-muted-foreground">{'->'} Yes, it is / No, it is not / No problem</p>
                    </div>
                    <div>
                        <p><strong>- Do you mind if I speak Swahili?</strong></p>
                        <p className="text-muted-foreground">{'->'} Yes I do mind. / No, I don't mind</p>
                    </div>
                     <div>
                        <p><strong>- Don't you mind if Amina pays?</strong></p>
                        <p className="text-muted-foreground">{'->'} Oh! I don't mind / With pleasure, she may. / It is okay, she may. / No, it is bad</p>
                    </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle>Dialogue Practice: Making a Request</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                    <p><strong>John:</strong> good afternoon, James!</p>
                    <p><strong>James:</strong> good afternoon, John!</p>
                    <p><strong>John:</strong> how are you?</p>
                    <p><strong>James:</strong> I am fine thank you and you ?</p>
                    <p><strong>John:</strong> fine too,what about your family?</p>
                    <p><strong>James:</strong> my family is getting well,what about yours?</p>
                    <p><strong>John:</strong> they are okay,what news?</p>
                    <p><strong>James:</strong> news is that, my brother-in-law Julius is very sick.</p>
                    <p><strong>John:</strong> I feel sorry!</p>
                    <p><strong>James:</strong> can you please help me to get a stretcher? we want to take him to hospital.</p>
                    <p><strong>John:</strong> yes, I can, in our zone we have two stretchers.</p>
                    <p><strong>James:</strong> can we go now to take it?</p>
                    <p><strong>John:</strong> yes, we can.</p>
                    <p><strong>James:</strong> hello guy! Come here!</p>
                    <p><strong>Johnson:</strong> yes, here I am.</p>
                    <p><strong>James:</strong> how are you?</p>
                    <p><strong>Johnson:</strong> fine!</p>
                    <p><strong>James:</strong> by the way, my name is James Nkurunziza, I live in zone ten, I am 23 years old, I am a Burundian. So as you see us here, this is my friend, his name is John he lives in zone eight. Hello, John, this is my friend his name is Johnson, he lives in zone nine.</p>
                    <p><strong>Johnson:</strong> I am happy to meet you, John.</p>
                    <p><strong>John:</strong> I am happy to meet you too, Johnson.</p>
                    <p><strong>James:</strong> Johnson, may we have your help?</p>
                    <p><strong>Johnson:</strong> what can I do for you?</p>
                    <p><strong>James:</strong> to take my brother-in-law to hospital, he is very sick.</p>
                    <p><strong>Johnson:</strong> I am sorry, I may not. Because I am attending the wedding ceremony this evening.</p>
                    <p><strong>James:</strong> no problem, see you around!</p>
                    <p><strong>Johnson:</strong> see you around, and say sorry to him, and don't forget to send my best wishes to your family.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle>Expressions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p><strong>1. How do you do?</strong> {'->'} this is a greeting, its answer is how do you do?</p>
                    <p><strong>2. What's up?</strong> {'->'} even this is a greeting, we can answer by saying it is okay or nothing goes on ( ntakigenda).</p>
                    <p><strong>3. That will do</strong> {'->'} to mean that: that is enough. E.g: Don't add much salt, one spoon will do.</p>
                    <p><strong>4. No thanks to</strong> {'->'} means not because of.</p>
                    <p><strong>5. Say hello to....:</strong> Greet someone for me. E.g : say hello to your whole family.</p>
                </CardContent>
              </Card>

          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="vocabulary" className="border rounded-lg">
          <AccordionTrigger className="p-4 text-lg font-semibold">
            Section 3: People, Things and Places
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0">
            <p className="text-muted-foreground mb-4">This section covers common vocabulary.</p>
             <Accordion type="multiple" className="w-full space-y-2">
                 <AccordionItem value="places">
                    <AccordionTrigger>A. Places</AccordionTrigger>
                    <AccordionContent>
                        <p className="text-muted-foreground mb-2">What is a place? A place is everywhere we can find people or animals.</p>
                        <ul className="list-disc pl-6 text-muted-foreground columns-2">
                            <li>Town: agasagara</li>
                            <li>Bank: ibanki</li>
                            <li>Forest: ishamba</li>
                            <li>At the station: kugituro</li>
                            <li>Village: ikigwati</li>
                            <li>In the court: aho bacira imanza</li>
                            <li>Zoo: aho batungira ibikoko mwipori</li>
                            <li>At the airport: kukibuga cindege</li>
                            <li>City: igisagara</li>
                            <li>Market: akaguriro</li>
                            <li>public Secretariat: aho bandikira</li>
                            <li>Shop: ibutike</li>
                            <li>Church: urushengero</li>
                            <li>Dispensary: ivuriro</li>
                            <li>School: ishure</li>
                            <li>Mosque: umusigiti</li>
                            <li>Play-ground: ikibuga</li>
                            <li>Hospital: ibitaro</li>
                            <li>University: kaminuza</li>
                            <li>Bus-stand: igituro cibasi</li>
                        </ul>
                         <div className="mt-6 space-y-4">
                            <h4 className="font-semibold text-lg">Examples in a Sentence</h4>
                            <div className="p-4 border rounded-lg bg-muted/20 space-y-3 text-sm">
                                <div>
                                    <p><strong>Things we find in the town:</strong> cars, lorries, houses, bus, electricity, bicycles, etc...</p>
                                    <ul className="list-disc pl-6 text-muted-foreground">
                                        <li>In the town, we find many houses that have electricity which is one of the sign of development in a country.</li>
                                        <li>I am going to town to buy bicycle and other many things for my house.</li>
                                    </ul>
                                </div>
                                <div>
                                    <p><strong>Things we find in the city:</strong> train, plane, luxurious bus, electricity, etc......</p>
                                    <ul className="list-disc pl-6 text-muted-foreground">
                                        <li>People in the city has luxurious life.</li>
                                        <li>There are many skyscrapers(majengo marefu) in the city.</li>
                                        <li>We bought our T.V from city center</li>
                                    </ul>
                                </div>
                                <div>
                                    <p><strong>Things we find in the village:</strong> Hoe, panga, brooms, lantern, mat, etc...</p>
                                    <ul className="list-disc pl-6 text-muted-foreground">
                                        <li>Nyabigina is my home village.</li>
                                        <li>We use lanterns in our village because there is no electricity.</li>
                                     </ul>
                               </div>
                               <div>
                                    <p><strong>Things we find at the church:</strong> drums, pews, Bibles, altar, rosary, etc..</p>
                                     <ul className="list-disc pl-6 text-muted-foreground">
                                        <li>Every Sunday, I go to church.</li>
                                        <li>This church has been destroyed by the pagans, its pews and altar have been ruined too.</li>
                                     </ul>
                               </div>
                               <div>
                                    <p><strong>Things we find at the hospital:</strong> patients, pills, tablets, beds, etc.....</p>
                                     <ul className="list-disc pl-6 text-muted-foreground">
                                        <li>The patient has been taken to the hospital.</li>
                                        <li>The injured woman was hospitalised at NYARUGUSU hospital.</li>
                                     </ul>
                               </div>
                               <div>
                                    <p><strong>Things we find at school:</strong> pens, books, copybooks, desk, chair, bench, brooms, blackboard, chalks, files, folders, papers, paperclips, correction fluid, tables, etc...</p>
                                     <ul className="list-disc pl-6 text-muted-foreground">
                                        <li>To day is a distribution of copybooks at our school.</li>
                                     </ul>
                               </div>
                               <div>
                                    <p><strong>Things or people we find at the playground:</strong> players, balls, nets, goals, referee, etc...</p>
                                     <ul className="list-disc pl-6 text-muted-foreground">
                                        <li>The playground was slippery (hanyerera) after it had rained a lot.</li>
                                     </ul>
                               </div>
                               <div>
                                   <h5 className="font-semibold">See more examples of other places.</h5>
                                   <ol className="list-decimal pl-6 text-muted-foreground">
                                        <li>Joseph was at the station.</li>
                                        <li>I met him at the bus stand.</li>
                                        <li>His parent will go to hunt in Kigwena forest</li>
                                        <li>Your mother will wait you at the railway station.</li>
                                        <li>400 Christians decided to be Moslems and change their church to a mosque in Burundi.</li>
                                        <li>I have many files in my office.</li>
                                        <li>In Tanzania, there are many zoos.</li>
                                        <li>I will go to see my grandfather who lives in a small house at the village.</li>
                                   </ol>
                               </div>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="things">
                    <AccordionTrigger>B. Things</AccordionTrigger>
                    <AccordionContent>
                        <p className="text-muted-foreground mb-2">In the above examples, we see the place village which has houses, so let us see the things we find in a house.</p>
                        <Card>
                            <CardHeader>
                                <CardTitle>Things We Find in the House/or at Home</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-6 text-muted-foreground columns-2 md:columns-3 space-y-1 text-sm">
                                    <li>casserole: isafuriya</li>
                                    <li>knife: imbugita</li>
                                    <li>metal stove: imbabura</li>
                                    <li>three Stones: amashiga</li>
                                    <li>cooking stones: amashiga</li>
                                    <li>sickle: agakero</li>
                                    <li>saw: umusumeno</li>
                                    <li>mat: ikirago</li>
                                    <li>watering can: irozwari</li>
                                    <li>toolcan: ikidumu</li>
                                    <li>kettle: ibirika</li>
                                    <li>mirror: ikiyo</li>
                                    <li>glasses: ibirahuri/amarori</li>
                                    <li>needle: urushinge</li>
                                    <li>sword: inkota</li>
                                    <li>soap: isabuni</li>
                                    <li>fire: umuriro</li>
                                    <li>scissors: umukasi</li>
                                    <li>mortar: isekuro</li>
                                    <li>pestle: umuhini</li>
                                    <li>comb: igisokozo</li>
                                    <li>sieve: akayungiro</li>
                                    <li>can: ikigopo</li>
                                    <li>tin: umugereni</li>
                                    <li>lid: umufuniko</li>
                                    <li>sachet: isashe</li>
                                    <li>spade: igipawa</li>
                                    <li>tool: igikoresho</li>
                                    <li>Broom: umukubuzo</li>
                                    <li>key lock: igufuri</li>
                                    <li>padlock: igufuri</li>
                                    <li>gallon: akadumu</li>
                                    <li>bag: ibegi</li>
                                    <li>basin: ibase</li>
                                    <li>wheelbarrow: inkorofani</li>
                                    <li>stretcher: inderuzo</li>
                                    <li>nails: imisumari</li>
                                    <li>hammer: inyundo</li>
                                    <li>door: umuryango</li>
                                    <li>window: idirisha</li>
                                    <li>honey-comb: ikimamara cinzuki</li>
                                    <li>mallet: ubuhiri</li>
                                    <li>iron sheet: amabati</li>
                                    <li>safety-pin: igikwashu</li>
                                    <li>razor: urwembe</li>
                                    <li>brush: uburoso</li>
                                    <li>funnel: umubirikira</li>
                                    <li>dropper: umwino</li>
                                    <li>shoes: ibirato</li>
                                    <li>watch: isaha</li>
                                    <li>axe: ishoka</li>
                                    <li>bricks: amatofari</li>
                                    <li>tablecloth: Igitambara cokumeza</li>
                                    <li>lamp: itara</li>
                                    <li>hotpot: isahan zigumya ubushuh</li>
                                    <li>cork: akarumyo</li>
                                    <li>pillars: inkingi</li>
                                    <li>steel wire: utwobogesha ivyombo</li>
                                    <li>coffin: isandugu</li>
                                    <li>partition plate: isahani</li>
                                    <li>bathroom: ubwogero</li>
                                    <li>roof: toit/igisenge</li>
                                    <li>floor: hasi munzu</li>
                                    <li>stool: intebe yistuli</li>
                                    <li>spear: icumu</li>
                                    <li>arrows: imyampi</li>
                                    <li>mattress: imatera</li>
                                    <li>ladder: ingazi</li>
                                    <li>rope: umugozi</li>
                                    <li>jerrycan: akadumu</li>
                                    <li>tile: amategura</li>
                                    <li>mosquito net: umusegetera</li>
                                    <li>Thread: urunyuzi</li>
                                    <li>Clothline: umugozi wimpuzu</li>
                                    <li>washing net: ikiwavu c ivyombo</li>
                                    <li>stopper: ikizibo</li>
                                    <li>Sauce spoon: ikimamiyo</li>
                                    <li>wire cloth: clothline</li>
                                    <li>cradle: isimbizo</li>
                                    <li>Air-conditioning: climatiseur</li>
                                    <li>pickaxe: isipiri</li>
                                    <li>Bath tab: aho kwogera</li>
                                    <li>rake: irato</li>
                                    <li>closet: porte manteau</li>
                                    <li>jar: umubindi</li>
                                    <li>clothes dryer: imashine yumutsa impuzu</li>
                                    <li>pitcher: umubindi</li>
                                    <li>computer: tarakilishi</li>
                                    <li>kitchen: igikoni</li>
                                    <li>pillow: umusego</li>
                                    <li>panga</li>
                                    <li>curtains: irido</li>
                                    <li>blanket: uburengeti</li>
                                    <li>sewing machine: imashine ishona</li>
                                    <li>bedsheets: amashuka</li>
                                    <li>telephone: isimu</li>
                                    <li>teaspoon: akayiko gato</li>
                                    <li>television: imboneshakure</li>
                                    <li>slicespoon: ikiyiko kitobaguye</li>
                                    <li>washing machine: imashin imesa</li>
                                    <li>billhook: umuhoro (serpette)</li>
                                    <li>sofa: ifoteye</li>
                                    <li>cupboard: akabati</li>
                                    <li>stairs: escaliers/ingazi</li>
                                    <li>pail: indobo yicuma</li>
                                    <li>tap: ibomba</li>
                                    <li>bucket: indobo</li>
                                    <li>palm oil: amavuta yibigazi</li>
                                    <li>basket: igiseke</li>
                                    <li>dishes: ivyombo</li>
                                    <li>matchbox: ikibiriti cubwampi</li>
                                    <li>bowl: isorori/ibakuri</li>
                                    <li>matchsticks: ubwampi</li>
                                    <li>fridge: ifirigo</li>
                                    <li>firewood: inkwi</li>
                                    <li>thermos: iteremosi</li>
                                    <li>vaccum flask: thermos</li>
                                    <li>Vaccum bottle: thermos</li>
                                    <li>flashlight: itoroshe</li>
                                    <li>Food ingrendients: ibirungo</li>
                                    <li>mixer: kavanga ibirungo</li>
                                    <li>iron-press: ipasi</li>
                                    <li>grill: igikarango</li>
                                    <li>harcoals: amakara</li>
                                    <li>electrical stove: iziko ryubumeme</li>
                                    <li>fork: ifurusheti</li>
                                    <li>Improved stove: igishiga</li>
                                    <li>hoe: isuka</li>
                                    <li>plate: isahani</li>
                                    <li>plastic sheet: ihema</li>
                                    <li>pot: inkono</li>
                                    <li>carpet: itapi</li>
                                    <li>cup: igikombe</li>
                                    <li>crochet hook: ikoroshi</li>
                                    <li>spoon: ikiyiko</li>
                                    <li>millstone: urusyo</li>
                                    <li>woodenspoon: umudahara</li>
                                    <li>box: ikarato</li>
                                    <li>chair: chaise</li>
                                    <li>tray: isiniya</li>
                                    <li>radio: iradiyo</li>
                                    <li>Chamberpot: Icombo basobamwo</li>
                                    <li>pan: isafuriya</li>
                                    <li>baby potty: Ipo yumwana</li>
                                    <li>steamer: isafuriya igumya ubushuhe</li>
                                    <li>mousetrap: akamashu</li>
                                    <li>bed: igitanda</li>
                                    <li>fryingpan: agasafuriya bakarangamwo</li>
                                    <li>toilet paper: impapuro zokwiwese</li>
                                    <li>suitcase: ivarise</li>
                                    <li>rucksack: akabagi kokurutugu</li>
                                    <li>rubbish bin: inyabarega</li>
                                    <li>plastic chair: iyeboyebo</li>
                                    <li>Bingo mug: igikombe</li>
                                    <li>machete: igipanga</li>
                                    <li>dishtowel: akoguhanagura ivyombo</li>
                                    <li>dish cloth: ikiwavu civyombo</li>
                                    <li>string: imirya</li>
                                    <li>shelf: akagege</li>
                                    <li>stake: imambo , ikirembezo canke urwego</li>
                                </ul>
                                <div className="mt-4 space-y-2 text-sm">
                                    <h5 className="font-semibold">Examples in a Sentence</h5>
                                    <p>1. Where is the spoon?</p>
                                    <p>2. Look under the table in the box.</p>
                                    <p>3. Lend me your broom! please, here it is take it.</p>
                                    <p>4. Bring me a cup of water!</p>
                                    <p>5. I am listening to the radio.</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>Things We Find at School</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-6 text-muted-foreground columns-2 md:columns-3 space-y-1 text-sm">
                                    <li>Blackboard: Ikibaho</li>
                                    <li>Chalkboard: ikibaho</li>
                                    <li>Bench: intebe ndende</li>
                                    <li>Chalk: ingwa</li>
                                    <li>Duster: igifutisho</li>
                                    <li>Table: imeza</li>
                                    <li>Books: ibitabo</li>
                                    <li>Padbook: agakaye gatoya</li>
                                    <li>Cutter paper: agakata impapuro</li>
                                    <li>Pen: ikaramu</li>
                                    <li>Pencil: ikaramu ryigiti</li>
                                    <li>Ruler: agacamurongo</li>
                                    <li>Exercise book: ikaye yimyimenyerezo</li>
                                    <li>Chair: inyegamo</li>
                                    <li>Desk: ipipitre</li>
                                    <li>School bag: agashakoshi kokwishure</li>
                                    <li>Notebook: agakaye gatoya</li>
                                    <li>Pencil sharpener: agasongozo</li>
                                    <li>Compass: ikompa</li>
                                    <li>Computer: inyabwonko</li>
                                    <li>Rubber: igome</li>
                                    <li>Map: ikarata</li>
                                    <li>Worldmap: ikarata yisi</li>
                                    <li>Country map: ikarata yigihugu</li>
                                    <li>Markerpen: imarikere</li>
                                    <li>Counter book: igikaye kinini</li>
                                    <li>Stamp or seal: ikidodo</li>
                                    <li>Redpen: ikaramu ritukura</li>
                                    <li>Bluepen: ikaramu ryubururu</li>
                                    <li>Blackpen: ikaramu ryirabura</li>
                                    <li>Files: amadokima</li>
                                    <li>Folders: ububiko bwamadokima</li>
                                    <li>Office supplies: ibikoresho vyomubiro</li>
                                    <li>Stapler: agrafeze</li>
                                    <li>Pins: utwumwa</li>
                                    <li>Inkpad: ako bashiramwo irangi ryikidodo</li>
                                    <li>Fluid ink: irangi ryikidodo</li>
                                    <li>Staples: utwuma</li>
                                </ul>
                            </CardContent>
                        </Card>
                         <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>The Earth and The Sky</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">In the sky,there are: stars,moon,clouds and the sun.The sun shines during the day.The moon and the stars shine at the night.the sky is above the mountains and hills.I can see the river flowing into the lake. In the lake there are two men in the boat.They are fishing.I can also see some trees,grasses a nd animals, together are called the bush.</p>
                            </CardContent>
                        </Card>
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>Things that we find on the Earth</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-6 text-muted-foreground columns-2 md:columns-3 space-y-1 text-sm">
                                  <li>Grass: ivyatsi</li>
                                  <li>Grasses: ubwoko bwivyatsi</li>
                                  <li>Trees: ibiti</li>
                                  <li>Animals: ibikoko</li>
                                  <li>House: inzu</li>
                                  <li>Plants: ibiterwa</li>
                                  <li>Rivers: inzuzi</li>
                                  <li>Hills: udusozi</li>
                                  <li>Hillocks: udusozi duto duto</li>
                                  <li>Lakes: ibiyaga</li>
                                  <li>Oceans: inyanja</li>
                                  <li>Great lakes: ibiyaga bigari</li>
                                  <li>Mount: umusozi</li>
                                  <li>Seas: ikiyaga</li>
                                  <li>Mountains: imisozi myishi</li>
                                  <li>Stones: amabuye</li>
                                  <li>Sand: umucanga</li>
                                  <li>Rocks: ibitandara vyamabuye</li>
                                  <li>Bush: ishamba</li>
                                  <li>Forest: ikibira</li>
                                  <li>Seedlings: ingemwe</li>
                                  <li>Gardens: utwibare</li>
                                  <li>Farms: imirima</li>
                                </ul>
                            </CardContent>
                        </Card>
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>Wild Animals</CardTitle>
                                <CardDescription>In the forest we find animals we call them "wild animals"</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-6 text-muted-foreground columns-2 md:columns-3 space-y-1 text-sm">
                                    <li>Buffalo: imbogo</li>
                                    <li>Elephants: inzovu</li>
                                    <li>Lion: intambwe</li>
                                    <li>Zebra: imparage</li>
                                    <li>Monkey: inkende</li>
                                    <li>Leopard: ingwe</li>
                                    <li>Snake: inzoka</li>
                                    <li>Giraffe: umusumbarembo</li>
                                    <li>Bear: idubu</li>
                                    <li>Wildpig: ingurube yipori</li>
                                    <li>Hippopotamus: imvubu</li>
                                    <li>Rhinoceros: ingiri</li>
                                    <li>Cobra: ikobogo</li>
                                    <li>Chimpanzee: imamfu</li>
                                    <li>Gazelle: ingeregere</li>
                                    <li>Cheetah: guepard</li>
                                    <li>Panther: a large leopard</li>
                                    <li>Kangaroo: agakoko gafise agasah</li>
                                    <li>Wildcat: akagomba</li>
                                    <li>Gorilla: inkoto</li>
                                    <li>Fish: ifi</li>
                                    <li>Crabs: inkara</li>
                                    <li>Birds: inyoni</li>
                                    <li>Fox: imbwebwe</li>
                                    <li>Wolf: ibingira</li>
                                    <li>Lioness: intambwekazi</li>
                                    <li>Lioncub/ cub: icanacintambwe</li>
                                    <li>Rabbit: agakwavu</li>
                                    <li>Ape: inguge</li>
                                    <li>Antelope: impongo</li>
                                    <li>Deer: gifis amahembe nkamasham</li>
                                    <li>Ostrich: ikinyoni kinini cane</li>
                                    <li>Crocodile: ingona</li>
                                    <li>Chameleon: uruvuruvu</li>
                                    <li>Bat: agahungarema</li>
                                    <li>Grassskin: incarwatsi</li>
                                    <li>Birdie: icana cinyoni</li>
                                    <li>Squirrel: agaherere</li>
                                    <li>Beaver: agakara komumazi</li>
                                    <li>Otter: akazivyi</li>
                                    <li>Ibex: inzobe</li>
                                    <li>Hedgehog: ikinyogoto</li>
                                    <li>Jackal: ikinyamwoma</li>
                                    <li>Iguana: ikivumbura</li>
                                    <li>Lemur: agasimbiriki</li>
                                    <li>Skunk: umusakanyika( polecat )</li>
                                    <li>Salamander: imburu</li>
                                    <li>Toad: igikere camiravyo</li>
                                    <li>Raccoon: umurindima kiba amerika</li>
                                    <li>Warthog: wildpig</li>
                                    <li>Turtle: ikinyamasyo</li>
                                    <li>Tortoise: ikinyamasyo</li>
                                    <li>Bold locust: inzige</li>
                                    <li>Monitor lizard: imburu</li>
                                    <li>Gecko: icugu</li>
                                    <li>Rabbit : hare : agakwavu</li>
                                    <li>Mole: ifuku</li>
                                </ul>
                            </CardContent>
                        </Card>
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>Kind of Snakes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-6 text-muted-foreground columns-2 space-y-1 text-sm">
                                    <li>Python: isato</li>
                                    <li>Grass snake: incagwatsi</li>
                                    <li>Snake: inzoka</li>
                                    <li>Anaconda: ubwoko bwisato</li>
                                    <li>Viper: incira</li>
                                    <li>Mamba: imamba</li>
                                    <li>Cobra: inkoma</li>
                                    <li>Boa: ibowa (ikiyoka kiba amerika)</li>
                                </ul>
                            </CardContent>
                        </Card>
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>Domestic Animals</CardTitle>
                                <CardDescription>At home we find those animals that we call "domestic animals"</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Animal</TableHead>
                                            <TableHead>Male</TableHead>
                                            <TableHead>Female</TableHead>
                                            <TableHead>Young</TableHead>
                                            <TableHead>Meaning</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow><TableCell>Cow</TableCell><TableCell>Bull</TableCell><TableCell>Cow</TableCell><TableCell>Calf (m&f) / Heifer (f)</TableCell><TableCell>Inka</TableCell></TableRow>
                                        <TableRow><TableCell>Goat</TableCell><TableCell>Billy goat</TableCell><TableCell>Nany goat</TableCell><TableCell>Kid</TableCell><TableCell>Impene</TableCell></TableRow>
                                        <TableRow><TableCell>Sheep</TableCell><TableCell>Ram</TableCell><TableCell>Ewe</TableCell><TableCell>Lamb</TableCell><TableCell>Intama</TableCell></TableRow>
                                        <TableRow><TableCell>Hen</TableCell><TableCell>Cock</TableCell><TableCell>Hen</TableCell><TableCell>Chicken</TableCell><TableCell>Inkoko</TableCell></TableRow>
                                        <TableRow><TableCell>Duck</TableCell><TableCell>Droke</TableCell><TableCell>Duck</TableCell><TableCell>Duckling</TableCell><TableCell>Imbata</TableCell></TableRow>
                                        <TableRow><TableCell>Pig</TableCell><TableCell>Pig</TableCell><TableCell>Sow</TableCell><TableCell>Piglet</TableCell><TableCell>Ingurube</TableCell></TableRow>
                                        <TableRow><TableCell>Cat</TableCell><TableCell>Tom cat</TableCell><TableCell>Tabby</TableCell><TableCell>Kitten</TableCell><TableCell>Akayabu</TableCell></TableRow>
                                        <TableRow><TableCell>Dog</TableCell><TableCell>Dog</TableCell><TableCell>Bitch</TableCell><TableCell>Puppy/pup</TableCell><TableCell>Imbwa</TableCell></TableRow>
                                        <TableRow><TableCell>Hare</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell>Urukwavu</TableCell></TableRow>
                                        <TableRow><TableCell>Donkey</TableCell><TableCell>Stallion</TableCell><TableCell>Mare</TableCell><TableCell>Foal</TableCell><TableCell>Indogoba</TableCell></TableRow>
                                        <TableRow><TableCell>Horse</TableCell><TableCell>Stallion</TableCell><TableCell>Mare</TableCell><TableCell>Foal/Colt(m) filly(f)</TableCell><TableCell>Ifarasi</TableCell></TableRow>
                                        <TableRow><TableCell>Hamster</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell>Ipanya</TableCell></TableRow>
                                        <TableRow><TableCell>Camel</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell>Ingamiya</TableCell></TableRow>
                                        <TableRow><TableCell>Pigeon</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell>Injiwa</TableCell></TableRow>
                                        <TableRow><TableCell>Guineafowl</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell>Inkanga</TableCell></TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        <Card className="mt-4">
                            <CardHeader><CardTitle>Insects</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-6 text-muted-foreground columns-2 md:columns-3 space-y-1 text-sm">
                                    <li>Flea: imbaragasa</li>
                                    <li>Louse: inda</li>
                                    <li>Bee: uruyuki</li>
                                    <li>Bee carpenter: ifunderi</li>
                                    <li>Small centipede: inyongori</li>
                                    <li>Bedbug: igihere</li>
                                    <li>Cockroach: inyenzi</li>
                                    <li>Tse tse fly: ikibugu</li>
                                    <li>Gnat: agatuku</li>
                                    <li>Mosquito: umubu</li>
                                    <li>Wasp: ivubi</li>
                                    <li>Butterflies: ibinyugunyugu</li>
                                    <li>Moth: agataranyama</li>
                                    <li>Jigger: imvunja</li>
                                    <li>Biting ant / pincher ant: intozi</li>
                                    <li>Flying ant: inswa</li>
                                    <li>Cricket: igihori</li>
                                    <li>Grasshoppers: ibihori</li>
                                    <li>Fly: insazi</li>
                                    <li>White Ant: umuswa</li>
                                    <li>Small /tiny ants: ubunyegeri</li>
                                    <li>Mantis: intengasi</li>
                                    <li>Scorpion: akaminimini</li>
                                    <li>Cicada: cigale(French)</li>
                                    <li>Dragon fly: libellule (French)</li>
                                    <li>Spider: igitangurirwa</li>
                                    <li>Beetle: agakombamavyi</li>
                                    <li>Nematode: impongwa</li>
                                    <li>Soldier ant: ibirima</li>
                                    <li>Sugar ant: ikinyabuki</li>
                                    <li>Tick: inyondwe</li>
                                    <li>Cattle tick: inguha</li>
                                    <li>Grub: ikikogoshi</li>
                                    <li>Nits: imigi</li>
                                </ul>
                            </CardContent>
                        </Card>
                        <Card className="mt-4">
                             <CardHeader><CardTitle>Animals We Find in the Water</CardTitle></CardHeader>
                             <CardContent>
                                <ul className="list-disc pl-6 text-muted-foreground columns-2 space-y-1 text-sm">
                                    <li>Devil fish: umuneke</li>
                                    <li>Carp: injombo</li>
                                    <li>Catfish: ikambari</li>
                                    <li>Sheat (sheatfish): ikambari</li>
                                    <li>Mudfish: ubwoko bwikambari</li>
                                    <li>Sardine: isaradine</li>
                                    <li>Herring: ubwoko bwisaradine</li>
                                    <li>Eel: umurombo</li>
                                    <li>Dolphin: idofe</li>
                                    <li>Whale: ikimizi</li>
                                    <li>White bait: indagara (small fish)</li>
                                    <li>Flatfish: ubwoko bwingege (dab)</li>
                                    <li>Smelt: umuneke</li>
                                    <li>Jackfish: amarenda (amasembe)</li>
                                </ul>
                             </CardContent>
                        </Card>
                    </AccordionContent>
                </AccordionItem>
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
                <AccordionItem value="home-things">
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
