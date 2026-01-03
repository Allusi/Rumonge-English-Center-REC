
"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useAudioCache } from "@/context/audio-cache-context";

export function UnitOneContent() {
  const [playingLetter, setPlayingLetter] = useState<string | null>(null);
  const [loadingLetter, setLoadingLetter] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { getAudioForText } = useAudioCache();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const playAudio = useCallback((audioUrl: string, letter: string) => {
    const audio = new Audio(audioUrl);
    setPlayingLetter(letter);
    audio.play();
    audio.onended = () => setPlayingLetter(null);
    audio.onerror = (e) => {
        console.error("Error playing audio from cache:", e);
        setPlayingLetter(null);
    }
  }, []);


  const playLetter = useCallback(async (letter: string) => {
    if (loadingLetter) return;

    const textToSay = `The letter ${letter}`;
    setLoadingLetter(letter);

    try {
      const audioUrl = await getAudioForText(textToSay);
      playAudio(audioUrl, letter);
    } catch (error) {
      console.error("Error getting audio for letter:", error);
    } finally {
      setLoadingLetter(null);
    }
  }, [loadingLetter, playAudio, getAudioForText]);

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
                    <li>being seen around.</li>
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
                    <li>Can I ...................................?</li>
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
                                        <li>In Tanzania,there are many zoos.</li>
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
                                    <li>Pike: ingege</li>
                                    <li>Haddock: isangaraka</li>
                                    <li>Hake: ubwoko bwinonzi</li>
                                    <li>Mackerel: ubwoko bwisaradine</li>
                                    <li>Nailperch: isangaraka</li>
                                    <li>Pilchard: amarumpu</li>
                                    <li>Porpoise: ubwoko bwikimizi bumeze nkingurube</li>
                                    <li>Burbot: injombo</li>
                                </ul>
                             </CardContent>
                        </Card>
                         <Card className="mt-4">
                            <CardHeader><CardTitle>Things that we find in the sky</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-6 text-muted-foreground columns-2 md:columns-3 space-y-1 text-sm">
                                    <li>Stars: inyenyeri</li>
                                    <li>Moon: ukwezi</li>
                                    <li>Sun: izuba</li>
                                    <li>Clouds: ibicu</li>
                                    <li>Heaven: ijuru</li>
                                    <li>Air: umuyaga</li>
                                    <li>Thunder: inkuba</li>
                                    <li>Lightening: umuravyo</li>
                                    <li>Rainbows: umunwamazi</li>
                                    <li>Sky: ikirere</li>
                                    <li>Birds: inyoni</li>
                                    <li>Storm: igihuhusi</li>
                                    <li>Hurricane: akavumbuzi</li>
                                    <li>Foggy: igipfungu kiboneka</li>
                                    <li>Mist: igipfungu kitaboneka</li>
                                    <li>Airplane: indege</li>
                                    <li>Sunlights: imishwarara yizuba</li>
                                    <li>Dust: ivumbi</li>
                                    <li>Above: hejuru</li>
                                    <li>Planet: umubumbe</li>
                                </ul>
                            </CardContent>
                        </Card>
                         <Card className="mt-4">
                            <CardHeader><CardTitle>Kind of Birds</CardTitle></CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground mb-2">In the sky we find birds, so let us see some birds.</p>
                                <ul className="list-disc pl-6 text-muted-foreground columns-2 md:columns-3 space-y-1 text-sm">
                                    <li>Parrot: kasuku</li>
                                    <li>Hummingbird: umununi</li>
                                    <li>Sunbird: umununi</li>
                                    <li>Swan: imbata yomumazi</li>
                                    <li>Goose: inkukuma</li>
                                    <li>Eagle owl: inziya</li>
                                    <li>Weaverbird: iseke</li>
                                    <li>Owl: igihuna</li>
                                    <li>Laughingbird: igihugugu</li>
                                    <li>Crowned crane: umusambi</li>
                                    <li>Guineafowl: inkanga</li>
                                    <li>Eagle: inkona /eaglet</li>
                                    <li>Crown hawk: inkona</li>
                                    <li>Sparrowhawk: ubujeje</li>
                                    <li>Swallow: intamba</li>
                                    <li>Lovebird: kasuku mapenzi</li>
                                    <li>Little stint: inyamanza</li>
                                    <li>Kingfisher: murovyi</li>
                                    <li>Kite: agaca</li>
                                    <li>Egret: inyange</li>
                                    <li>Duck: imbata/duckling</li>
                                </ul>
                            </CardContent>
                        </Card>
                        <Card className="mt-4">
                            <CardHeader><CardTitle>Kind of Trees</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-6 text-muted-foreground columns-2 md:columns-3 space-y-1 text-sm">
                                    <li>Acacia albida: ikasiya</li>
                                    <li>Syzygium cumini: umuzambarawu</li>
                                    <li>Terminal catapa: umukurungu</li>
                                    <li>Casuarina: akajwari</li>
                                    <li>Eucalyptus: inkaratusi</li>
                                    <li>Apple ring: amahebera</li>
                                    <li>Winter thorn: umukome wamahwa</li>
                                    <li>Australia black wood: umupingu</li>
                                    <li>Umbrella thorn: umugunga</li>
                                    <li>Israel babool: umusongati (umuturigwa)</li>
                                    <li>Shingle tree: isederi</li>
                                    <li>Siris tree: umuremera</li>
                                    <li>Woman tongue: umuremera</li>
                                    <li>Amaniensis: umushayishayi</li>
                                    <li>Cashewnut: umunazi</li>
                                    <li>Custard apple: umutobetobe</li>
                                    <li>Annosquamosa: umukanda</li>
                                    <li>Jak /jackfruit: umurwankore</li>
                                    <li>Artocarpus heterophyllus: umuhongoro</li>
                                    <li>Pawpaw (papaya): igipapayi</li>
                                    <li>Iron wood(yellow cassia): umujohoro</li>
                                    <li>Greek oak (river she oak): pinusi</li>
                                    <li>Chrorophora excelsa: inganzamarumpu</li>
                                    <li>Citrus: umucungwe</li>
                                    <li>Seville orange: indimu</li>
                                    <li>Pummelo: irimawu</li>
                                    <li>Sycamore: umusokomora</li>
                                    <li>Mimosa: umusebeyi</li>
                                    <li>Aloe vera: ingagari</li>
                                    <li>Ficus: umuhororo(umuvumuvumu)</li>
                                    <li>Etamine: umweza</li>
                                    <li>Datura: umunyare</li>
                                    <li>Cactus: igihahe</li>
                                    <li>Castol tree: ikibonobono</li>
                                    <li>Whistling pines : umurinzi</li>
                                    <li>Gmelina arborea : umukambati</li>
                                    <li>Jacaranda acutifolia : umurama</li>
                                    <li>Ledger’s quinine : umubirizi</li>
                                    <li>Yellow bark quinine : umu arubayine</li>
                                    <li>Eloquant : umushindwi</li>
                                    <li>Capensis : umuvyiru</li>
                                    <li>Hawthorn : umurarangwe</li>
                                    <li>Rust weed : urubobi</li>
                                    <li>Grevillea robusta : igereveriyo</li>
                                    <li>Magroove : umunyegenyege</li>
                                    <li>Cedar : isederi</li>
                                    <li>Jambolan : umuzambarawu</li>
                                    <li>Pepper tree : igiti cipiripiri</li>
                                    <li>Avocado pear : ivoka</li>
                                    <li>Thron bush : umugenge</li>
                                    <li>Mangifora indica (mango tree): umwembe</li>
                                    <li>Maesopsis emini : umuninga</li>
                                    <li>Leucaena leucocephala : umusange</li>
                                    <li>Silky oak/silver oak : igereveriyo</li>
                                    <li>Carol tree : umukoyoyo</li>
                                    <li>Lucky bean tree : umufumbere</li>
                                    <li>Eriobotry japonica (the Roquat): umurembera</li>
                                    <li>Coconut /cocos nucifera: igiti cinazi</li>
                                    <li>Tangerine : itangawizi</li>
                                    <li>Grape tree : igiti cumuzabibu</li>
                                    <li>Guave tree: ipera</li>
                                </ul>
                            </CardContent>
                        </Card>
                         <Card className="mt-4">
                            <CardHeader><CardTitle>Things We Find at the Market & Shop</CardTitle><CardDescription>Food & Clothings</CardDescription></CardHeader>
                            <CardContent>
                                <h4 className="font-semibold text-lg mb-2">A. Food</h4>
                                <p className="text-sm mb-2">Paul is eating a banana. What is Paul eating? He is eating banana.</p>
                                <p className="text-sm mb-2">We eat: bread: umutsima/ umukate, Egg: irigi, Cake: gateau, Meat: inyama etc.....</p>
                                <p className="text-sm mb-4">We lick: sugar: isukari, Honey: ubuki etc......</p>
                                
                                <h5 className="font-semibold mb-2">See More Examples</h5>
                                <ul className="list-disc pl-6 text-muted-foreground columns-2 md:columns-3 space-y-1 text-sm">
                                    <li>Aubergine: intore</li>
                                    <li>Maize: ibisoya</li>
                                    <li>Eulesine: uburo</li>
                                    <li>Sorghum: amasaka</li>
                                    <li>Yams: ibisunzu</li>
                                    <li>Lettuce: isarade</li>
                                    <li>Okra: umurenda</li>
                                    <li>Garlic: igitunguru sumu</li>
                                    <li>Cassava leaves: isombe</li>
                                    <li>Beans leaves: umukubi</li>
                                    <li>Pumpukin leaves: umusoma</li>
                                    <li>Spinach: ipinari</li>
                                    <li>Ginger: itangawizi</li>
                                    <li>Peanut / groundnuts: ibiyoba</li>
                                    <li>Banana: igitoke</li>
                                    <li>Yellow banana: umuhwi</li>
                                    <li>Colocasia: amateke</li>
                                    <li>Lima/fava bean: ibiharo</li>
                                    <li>Fish: ifi</li>
                                    <li>Rice: umuceri</li>
                                    <li>Cassava: imyumbati</li>
                                    <li>Pineapple: inanasi</li>
                                    <li>Beans: ibiharage</li>
                                    <li>Haricots: ibiharage</li>
                                    <li>Cabbage: ishu</li>
                                    <li>Potatoes: ibiraya</li>
                                    <li>Carrot: ikaroti</li>
                                    <li>Onion: igitunguru</li>
                                    <li>Leek: poivreau( igitunguru)</li>
                                    <li>Pumpkin: umwungu</li>
                                    <li>Courgette: umwungu</li>
                                    <li>Zucchini: umwungu</li>
                                    <li>Tomatoes: itomate</li>
                                    <li>Greenbeans: ibiharage bibisi</li>
                                    <li>Peppers: ipiripiri ya mbuzi</li>
                                    <li>Chillies: ipiripiri ya bushara</li>
                                    <li>Peas: ubushaza</li>
                                    <li>Split peas: ubushaza bukoboye</li>
                                    <li>Paw cassava / cassava flour: ifu yimyumbati</li>
                                    <li>Paw maize / maize flour: ifu yibigori</li>
                                    <li>Sweet potato: ikijumbu</li>
                                    <li>Meat: inyama</li>
                                    <li>Roasted meat: inyama zokeje</li>
                                    <li>Ugali: ubugali</li>
                                    <li>Passion fruit: amabungo</li>
                                    <li>Maize bread: ubugari bwibigori</li>
                                    <li>Cassava bread: ubugari bwimyumbati</li>
                                    <li>Mushrooms: ubwoba</li>
                                    <li>Small mushrooms: ubumegeri</li>
                                    <li>Snuff: ubugoro</li>
                                    <li>Germinated millet: ubumera</li>
                                </ul>
                                <div className="mt-4">
                                  <h5 className="font-semibold text-md mb-2">Kinds of Banana</h5>
                                  <ol className="list-decimal pl-6 text-muted-foreground text-sm space-y-1">
                                    <li>Gold finger banana: akamaramasenge</li>
                                    <li>Cavendish banana: igisahira</li>
                                    <li>Latundan banana: ikigomozi</li>
                                    <li>Pisang awak banana: ikinyota</li>
                                    <li>Blue java banana: gwintama</li>
                                    <li>Dwarf Cavendish banana: ikingurube</li>
                                    <li>Red banana: igisukari</li>
                                  </ol>
                                </div>
                                <div className="mt-4">
                                  <h5 className="font-semibold text-md mb-2">Fruits in Detail</h5>
                                  <ul className="list-disc pl-6 text-muted-foreground columns-2 text-sm space-y-1">
                                    <li>Strawberry: inkere</li>
                                    <li>Apple: pomme</li>
                                    <li>Ripe/ yellow banana: umuhwi</li>
                                    <li>Orange: umucungwe</li>
                                    <li>Mango: umwembe</li>
                                    <li>Young/ unripe mango: igiturumbwe</li>
                                    <li>Ripe mango: umwembe uhiye</li>
                                    <li>Pineapple: inanasi</li>
                                    <li>Avocado: ivoka</li>
                                    <li>Bilberry: umuzabibu</li>
                                    <li>Coconut: inazi</li>
                                    <li>Lemon: indimu nini</li>
                                    <li>Tomato: itomate</li>
                                    <li>Watermelon: tikitimaji</li>
                                    <li>Pawpaw/ papaya: ipapaye</li>
                                    <li>Lime: indimu ntoya</li>
                                    <li>Mandarins: amacenca</li>
                                    <li>Guave: ipera</li>
                                  </ul>
                                </div>
                                <div className="mt-4">
                                  <h5 className="font-semibold text-md mb-2">Drinks</h5>
                                  <p className="text-sm mb-2 text-muted-foreground">We drink:</p>
                                   <ul className="list-disc pl-6 text-muted-foreground columns-2 text-sm space-y-1">
                                      <li>milk: amata.</li>
                                      <li>water : amazi</li>
                                      <li>Coffee: akahawa.</li>
                                      <li>soda: isoda</li>
                                      <li>Tea: icayi.</li>
                                      <li>beer: ibiya.</li>
                                      <li>Juice: ijuwisi.</li>
                                      <li>orange juice: ijuwisi yumucungwa</li>
                                      <li>Wine: umuvinyu.</li>
                                      <li>pineapple juice: ijuwisi yinanasi.</li>
                                      <li>Local alcohol: ugwagwa</li>
                                      <li>Banana wine: umutobe</li>
                                      <li>Millet wine: ugwagwa.</li>
                                      <li>maize wine: umugorigori</li>
                                      <li>Pure alcohol: Padbook</li>
                                   </ul>
                                </div>

                                <h4 className="font-semibold text-lg mb-2 mt-6">B. Clothings</h4>
                                <p className="text-sm mb-2 text-muted-foreground">What does the girl wear? What does the boy wear? In this part we are going to try to answer to the above questions.</p>
                                <p className="text-sm mb-2 font-semibold">WE WEAR:</p>
                                <ul className="list-disc pl-6 text-muted-foreground columns-2 md:columns-3 space-y-1 text-sm">
                                    <li>Jacket: ijaketi</li>
                                    <li>Shoes: ibirato</li>
                                    <li>Skirt: ijipo</li>
                                    <li>Dress: ikanzu</li>
                                    <li>Socks: amashesheti</li>
                                    <li>Sweater: igipita cimbeho</li>
                                    <li>Coat: ikoti</li>
                                    <li>Raincoat: ikoti yimvura</li>
                                    <li>Belt: umusipi</li>
                                    <li>Rain boot: ibotine</li>
                                    <li>Boots : ibuti</li>
                                    <li>Bracelet: ibikomo ,imiringa</li>
                                    <li>Earrings: amahereni</li>
                                    <li>Wedding flower: </li>
                                    <li>Overcoat : agakoti kohejuru</li>
                                    <li>Handkerchief : umuswaro</li>
                                    <li>Glasses: amarori</li>
                                    <li>Gloves: amaga</li>
                                    <li>Hat: inkofera yumuzingi</li>
                                    <li>Helmet: ikaske</li>
                                    <li>Necklace: ishenete</li>
                                    <li>pants: ipantalo</li>
                                    <li>Pocket: umufuko</li>
                                    <li>Ring: impeta</li>
                                    <li>Scarf: igitambara/ ifurare</li>
                                    <li>Slippers: ikandambili</li>
                                    <li>Flip- flop: ikandambili</li>
                                    <li>Sneakers:ibirato vya sport</li>
                                    <li>Sunglass: amarori yizuba</li>
                                    <li>Tie: ikaruvate</li>
                                    <li>Vest: ijire</li>
                                    <li>Watch: isaha</li>
                                    <li>Bowtie:agakaruvate</li>
                                    <li>Jeans : ijinzi</li>
                                    <li>Necktie : ikaruvate</li>
                                    <li>Zipper/ zip: imashine yimpuzu</li>
                                    <li>T-shirt: umupira</li>
                                    <li>Shorts:ikabutura</li>
                                    <li>Baby shawl: igikoyi</li>
                                    <li>Sleeves: amaboko yimpuzu</li>
                                    <li>Underwear: icupi</li>
                                    <li>Panties: icupi</li>
                                    <li>underskirt: isurujipe</li>
                                    <li>Brassiere; isutiya</li>
                                    <li>Bra: isutiya</li>
                                    <li>Blouse: iburuzi</li>
                                    <li>Cap: ishapo yururimi</li>
                                    <li>Bikini: isiripe ifatanye nisutiya</li>
                                    <li>Nightgown: impuzu bararana</li>
                                    <li>Hoody: umupira winkofera</li>
                                    <li>Loincloth: igikwembe</li>
                                    <li>Slit: ipasura</li>
                                    <li>Weddingdress: urushungi</li>
                                </ul>

                                <h5 className="font-semibold text-md mb-2 mt-6">DIALOGUE PRACTICE NO 1 ABOUT CLOTHING.</h5>
                                <h6 className="font-semibold text-sm mb-2">WEARING SUITS AND TIES.</h6>
                                <div className="p-4 border rounded-lg bg-muted/50 space-y-1 text-sm">
                                    <p><strong>A :</strong> It is not easy wearing this necktie.I feel like I'm strangling myself.</p>
                                    <p><strong>B :</strong> ha ha ha!! You're tying a fast knot that's why.</p>
                                    <p><strong>A :</strong> I don't like wearing suits and ties.I want to wear something more comfortable like jeans and T-shirt?</p>
                                    <p><strong>B :</strong> No way,it's christina's wedding to day.you can't show up there looking like a bum.</p>
                                    <p><strong>A :</strong> I hate attending weddings. Everything is so formal.I can't be myself.</p>
                                    <p><strong>B :</strong> come on ,you need to be prepared for your wedding also.you can't wear a T-shirt and jeans at your wedding, right?</p>
                                    <p><strong>A :</strong> I'll be the first groom to do that.</p>
                                    <p><strong>B :</strong> Ha hah!!, I can't wait to see that day.</p>
                                </div>

                                <h5 className="font-semibold text-md mb-2 mt-6">DIALOGUE PRACTICE NO 2 ABOUT CLOTHING.</h5>
                                 <h6 className="font-semibold text-sm mb-2">A NEW DRESS</h6>
                                <div className="p-4 border rounded-lg bg-muted/50 space-y-1 text-sm">
                                    <p><strong>A :</strong> Wow,Leslie. You look fabulous.</p>
                                    <p><strong>B :</strong> Really? Thanks.</p>
                                    <p><strong>A :</strong> Is that your new dress?</p>
                                    <p><strong>B :</strong> it is.I bought it yesterday.</p>
                                    <p><strong>A :</strong> is it expensive?</p>
                                    <p><strong>B :</strong> not at all.how much do you think it is?</p>
                                    <p><strong>A :</strong> 6500tsh.</p>
                                    <p><strong>B :</strong> no,just 4500 TSH.</p>
                                    <p><strong>A :</strong> great.where did you buy it?</p>
                                    <p><strong>B :</strong> at a shop near my house.</p>
                                    <p><strong>A :</strong> what's its name?</p>
                                    <p><strong>B :</strong> VAYURA shop. I'll take you there if you want.</p>
                                    <p><strong>A :</strong> Ha ha ha!!No,thanks.</p>
                                </div>

                                <h5 className="font-semibold text-md mb-2 mt-6">DIALOGUE PRACTICE NO 3 ABOUT CLOTHING</h5>
                                 <h6 className="font-semibold text-sm mb-2">BUYING A NEW SHIRT.</h6>
                                <div className="p-4 border rounded-lg bg-muted/50 space-y-1 text-sm">
                                  <p><strong>A :</strong> Good morning ,ma'am. May I help you?</p>
                                  <p><strong>B :</strong> yes,I would like to buy a shirt.</p>
                                  <p><strong>A :</strong> which color and would you like a long-sleeved or a short-sleeved shirt?</p>
                                  <p><strong>B :</strong> I will be needing a white long- sleeved shirt.</p>
                                  <p><strong>A :</strong> have a look at this one.this one is wrinkle resistant, it resists liquid spills and food stains.</p>
                                  <p><strong>B :</strong> would you have it in a medium size?</p>
                                  <p><strong>A :</strong> that is exactly what I am holding up to show you.</p>
                                  <p><strong>B :</strong> May I try it on?</p>
                                  <p><strong>A :</strong> yes,of course,here it is.</p>
                                  <p><strong>B :</strong> how much is it by the way?</p>
                                  <p><strong>A :</strong> 5000tsh.</p>
                                </div>

                                <div className="mt-4">
                                  <h5 className="font-semibold text-md mb-2">REMEMBER THAT: FRUITS, FOODS AND CLOTHES ,THEY ARE OF DIFFERENT COLOURS.SO LET US STUDY THE FOLLOWING COLOURS:</h5>
                                   <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1">
                                      <li>White : ibara ryera.</li>
                                      <li>Green: ibara ryakatsi.</li>
                                      <li>Black: ibara ryirabura.</li>
                                      <li>Brown: ibara rya cokora.</li>
                                      <li>Red: ibara ritukura.</li>
                                      <li>Blue: ibara ryubururu.</li>
                                      <li>orange: ibara ryumucungwe.</li>
                                      <li>Yellow: ibara ryumuhondo.</li>
                                      <li>Grey: ibara ryumunyota.</li>
                                   </ul>
                                   <p className="text-sm mt-2">Eg: what colour is your house</p>
                                </div>
                            </CardContent>
                        </Card>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="people">
                    <AccordionTrigger>C. People</AccordionTrigger>
                    <AccordionContent>
                        <p className="text-muted-foreground mb-2">In this part we will learn how to call each others in our family,how to name a member of someone's family.</p>
                        <p className="font-semibold text-sm mb-2">Def: family: -is a group of people in one house.</p>
                        <p className="font-semibold text-sm mb-4">- mother,father and children ,they make a family.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p>This is a man.</p>
                                <p>His name is John.</p>
                                <p>He comes from Kigoma.</p>
                                <p>His son is MINANI.</p>
                                <p>His daughter is Catherine.</p>
                                <p>His wife is Grace.</p>
                            </div>
                             <div>
                                <p>This is a woman.</p>
                                <p>Her name is Grace.</p>
                                <p>She comes from Kigoma</p>
                                <p>Her son is MINANI</p>
                                <p>Her daughter is Catherine</p>
                                <p>Her husband is John</p>
                            </div>
                             <div>
                                <p>This is a boy.</p>
                                <p>His name is MINANI.</p>
                                <p>His father is John.</p>
                                <p>His sister is Catherine</p>
                                <p>His mother is Grace.</p>
                            </div>
                              <div>
                                <p>This is a girl</p>
                                <p>Her name is Catherine</p>
                                <p>Her father is John</p>
                                <p>Her mother is Grace.</p>
                                <p>Her brother is Minani</p>
                            </div>
                        </div>
                        <div className="mt-4">
                           <p>Is this a man? <span className="text-muted-foreground">Yes,this is the man.</span></p>
                           <p>Is this a boy ? <span className="text-muted-foreground">No, this is not a boy, this is a girl</span></p>
                           <p>Is this a woman? <span className="text-muted-foreground">No, this is not a woman,this is a man</span></p>
                        </div>
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>More Members in Our Family</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-6 text-muted-foreground columns-2 md:columns-4 space-y-1 text-sm">
                                    <li>Mother</li>
                                    <li>Mum</li>
                                    <li>Father</li>
                                    <li>Daddy</li>
                                    <li>Dad</li>
                                    <li>Younger brother</li>
                                    <li>Elder brother</li>
                                    <li>Younger sister</li>
                                    <li>Elder sister</li>
                                    <li>Firstborn</li>
                                    <li>Second child</li>
                                    <li>Kid</li>
                                    <li>Child</li>
                                    <li>Children</li>
                                    <li>Baby</li>
                                    <li>Infant</li>
                                    <li>Niece</li>
                                    <li>Nephew</li>
                                    <li>Half brother</li>
                                    <li>Half sister</li>
                                    <li>Great grandchild</li>
                                    <li>Co-aunt</li>
                                    <li>Great grand parents</li>
                                    <li>Co-uncle</li>
                                    <li>Cousin</li>
                                    <li>Son in law</li>
                                    <li>Daughter in law</li>
                                    <li>Grandson</li>
                                    <li>Grandfather</li>
                                    <li>Granddaughter</li>
                                    <li>Newborn</li>
                                    <li>Twins</li>
                                    <li>Triplets</li>
                                    <li>Quadruplets</li>
                                    <li>Quintuplets</li>
                                    <li>Sextuplets</li>
                                    <li>Septuplets</li>
                                    <li>Octuplets</li>
                                    <li>Grandmother</li>
                                    <li>Bastard child</li>
                                    <li>Godfather</li>
                                    <li>Godmother</li>
                                    <li>Godson</li>
                                    <li>Goddaughter</li>
                                    <li>Godchild</li>
                                    <li>Godchildren</li>
                                    <li>Stepdaughter</li>
                                    <li>Great great grandchild</li>
                                    <li>Stepson</li>
                                    <li>Stepsister</li>
                                    <li>Stepbrother</li>
                                    <li>Stepfather</li>
                                    <li>Stepmother</li>
                                    <li>Stepchildren</li>
                                    <li>Stepchild</li>
                                    <li>Mother in law</li>
                                    <li>Father in law</li>
                                    <li>In-laws</li>
                                    <li>Uncle</li>
                                    <li>Aunt</li>
                                    <li>Great uncle</li>
                                    <li>Great aunt</li>
                                    <li>Co-brother in law</li>
                                    <li>Co-sister in law</li>
                                    <li>Co-parent</li>
                                    <li>Great grandchildren</li>
                                    <li>Great grandson</li>
                                    <li>Great granddaughter</li>
                                    <li>Barren</li>
                                    <li>Childless</li>
                                    <li>Co-father in law</li>
                                    <li>Co-mother in law</li>
                                    <li>Co-wife</li>
                                    <li>Ex-wife</li>
                                    <li>Great niece</li>
                                    <li>Great nephew</li>
                                    <li>Cousin brother</li>
                                    <li>Cousin sister</li>
                                    <li>Foster father</li>
                                    <li>Foster mother</li>
                                    <li>Bachelor</li>
                                    <li>Spinster</li>
                                    <li>Orphan</li>
                                    <li>Fatherless</li>
                                    <li>Motherless</li>
                                    <li>Parentless</li>
                                    <li>Fosterson</li>
                                    <li>Fosterdaughter</li>
                                    <li>Adopted child</li>
                                    <li>Grand parents</li>
                                    <li>Great grandfather</li>
                                    <li>Great grandmother</li>
                                    <li>Infertile woman</li>
                                    <li>Great great grandson</li>
                                </ul>
                            </CardContent>
                        </Card>
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Practice: How Do You Call Someone's...</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-lg p-4 bg-muted/20">
                                    <h5 className="font-semibold mb-4">Family Tree</h5>
                                    <div className="text-sm text-center font-mono">
                                        <p>Thomas + Mary</p>
                                        <p className="pl-4">|</p>
                                        <div className="flex justify-center gap-8">
                                            <p>Egide + Martha</p>
                                            <p>Paul + Virginia</p>
                                            <p>Andrew + Solange</p>
                                        </div>
                                        <div className="flex justify-around">
                                           <div className="flex justify-center gap-4">
                                               <p className="pl-4">|</p>
                                           </div>
                                            <div className="flex justify-center gap-4">
                                               <p className="pl-4">|</p>
                                           </div>
                                            <div className="flex justify-center gap-4">
                                               <p className="pl-4">|</p>
                                           </div>
                                        </div>
                                        <div className="flex justify-around">
                                            <div className="flex justify-center gap-8">
                                               <p>Gaston</p>
                                               <p>Viola</p>
                                               <p>Albin</p>
                                            </div>
                                             <div className="flex justify-center gap-8">
                                               <p>Fides</p>
                                               <p>Louis + Nadia</p>
                                             </div>
                                              <div className="flex justify-center gap-8">
                                               <p>Caline</p>
                                               <p>John</p>
                                             </div>
                                        </div>
                                         <div className="flex justify-around">
                                           <div/>
                                            <div className="flex justify-center gap-4 pr-12">
                                               <p className="pl-4">|</p>
                                           </div>
                                           <div/>
                                        </div>
                                         <div className="flex justify-around">
                                           <div/>
                                            <div className="flex justify-center gap-8 pr-12">
                                               <p>Lola</p>
                                               <p>Jimmy</p>
                                               <p>Joella</p>
                                               <p>Gretta</p>
                                            </div>
                                           <div/>
                                        </div>

                                    </div>
                                </div>
                                <div className="mt-4 space-y-2 text-sm">
                                    <p><strong>Paul calls Thomas:</strong> {'->'} father</p>
                                    <p><strong>Paul calls Mary:</strong> {'->'} mother</p>
                                    <p><strong>Paul calls T&M:</strong> {'->'} parents</p>
                                    <p><strong>Gaston calls Thomas:</strong> {'->'} grandfather</p>
                                    <p><strong>Gaston calls Mary:</strong> {'->'} grandmother</p>
                                    <p><strong>Gaston calls T&M:</strong> {'->'} grandparents</p>
                                    <p><strong>Gaston calls Viola:</strong> {'->'} sister</p>
                                    <p><strong>Gaston calls Albin:</strong> {'->'} brother</p>
                                    <p><strong>Gaston calls Lola:</strong> {'->'} nephew</p>
                                    <p><strong>Gaston calls Jimmy:</strong> {'->'} nephew</p>
                                    <p><strong>Gaston calls Joella:</strong> {'->'} niece</p>
                                    <p><strong>Gaston calls Louis:</strong> {'->'} brother in law</p>
                                    <p><strong>Gaston calls Nadia:</strong> {'->'} sister in law</p>
                                    <p><strong>Gaston calls John:</strong> {'->'} brother-in-law</p>
                                    <p><strong>Fides calls Louis:</strong> {'->'} husband</p>
                                    <p><strong>Fides calls Lola:</strong> {'->'} son</p>
                                    <p><strong>Fides calls Joella:</strong> {'->'} daughter</p>
                                    <p><strong>Fides calls Nadia:</strong> {'->'} sister-in-law</p>
                                    <p><strong>Fides calls John:</strong> {'->'} brother-in-law</p>
                                    <p><strong>Fides calls Andrew:</strong> {'->'} father-in-law</p>
                                    <p><strong>Fides calls Solange:</strong> {'->'} mother-in-law</p>
                                    <p><strong>Andrew calls Fides:</strong> {'->'} daughter-in-law</p>
                                    <p><strong>Paul calls Louis:</strong> {'->'} son-in-law</p>
                                    <p><strong>Joella calls Jimmy:</strong> {'->'} brother</p>
                                    <p><strong>Joella calls Egide:</strong> {'->'} great grandfather</p>
                                    <p><strong>Joella calls T&M:</strong> {'->'} great grandparents</p>
                                    <p><strong>Joella calls Nadia:</strong> {'->'} Aunt</p>
                                    <p><strong>Joella calls John:</strong> {'->'} uncle</p>
                                    <p><strong>Joella calls Gaston:</strong> {'->'} uncle</p>
                                    <p><strong>Louis calls Fides:</strong> {'->'} wife</p>
                                    <p><strong>John calls Jimmy:</strong> {'->'} nephew</p>
                                    <p><strong>John calls Joella:</strong> {'->'} niece</p>
                                </div>
                                <div className="mt-4 text-sm space-y-2">
                                   <p className="font-semibold">You can also know that:</p>
                                   <ul className="list-disc pl-6 text-muted-foreground">
                                       <li><strong>Flower-boys:</strong> ni bahungu bafata amashurwe kubugeni, bagira imbere yumugeni</li>
                                       <li><strong>Flower-girls:</strong> ni abakobwa bafata amashure kubugeni, bagira imbere yumugeni</li>
                                       <li><strong>Best man:</strong> ni umuhagarikizi wumugabo kubugeni</li>
                                       <li><strong>Best lady:</strong> ni umuhagarikizi wumugore kubugeni</li>
                                       <li><strong>Bond woman:</strong> mke mwenza</li>
                                       <li><strong>Concubine:</strong> umuhabara</li>
                                   </ul>
                                </div>
                            </CardContent>
                        </Card>
                         <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Parts of the Body</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-6 text-muted-foreground columns-2 md:columns-3 space-y-1 text-sm">
                                    <li>Hair: umushatsi</li>
                                    <li>Eyes: amaso</li>
                                    <li>Eyelashes: ingohe</li>
                                    <li>Eyebrows: ibigohegohe</li>
                                    <li>Nose: izuru</li>
                                    <li>Nostrils: imyenge yizuru</li>
                                    <li>Mouth: umunwa</li>
                                    <li>Dent: iryinyo</li>
                                    <li>Tooth: iryinyo</li>
                                    <li>Teeth: amenyo</li>
                                    <li>Gum; ikinyigishi</li>
                                    <li>Tongue: ururimi</li>
                                    <li>Enamel: amarakaraka</li>
                                    <li>Beards: ubwanwa</li>
                                    <li>Moustache: ubwanwa</li>
                                    <li>Chin: agasakanwa</li>
                                    <li>Forehead: uruhanga</li>
                                    <li>Neck: izosi</li>
                                    <li>Cheek: itama</li>
                                    <li>Jaw: umubangabanga</li>
                                    <li>Dimples: ubudimpo</li>
                                    <li>Ear : ugutwi</li>
                                    <li>Earlobe: ibibabi bwugutwi</li>
                                    <li>Earwax: ubukurugutwi</li>
                                    <li>Lips: iminwa</li>
                                    <li>Lower lip: umunwa wepfo</li>
                                    <li>Upper lip: umunwa waruguru</li>
                                    <li>Arm: ukuboko</li>
                                    <li>Hand : igikonjo</li>
                                    <li>Upper arm:ukuboko kwaruguru</li>
                                    <li>Lower arm : ukuboko kwepfo</li>
                                    <li>Palm: ikiganja</li>
                                    <li>Wrist: mungingo yikiganja</li>
                                    <li>Joint: mungingo</li>
                                    <li>Nails: inzara</li>
                                    <li>Shoulders: ibitugu</li>
                                    <li>Armpit: mukwaha</li>
                                    <li>Leg: ukuguru</li>
                                    <li>Thigh: itako</li>
                                    <li>Shin: umurundi</li>
                                    <li>Ankle: ijisho ryikirenge</li>
                                    <li>Sole: mukirenge</li>
                                    <li>Toe: ino</li>
                                    <li>Big toe: ino rikuru</li>
                                    <li>Toenail: urwara rwino</li>
                                    <li>Finger: urutoke</li>
                                    <li>Fingernail: urwara rwokurotoke</li>
                                    <li>Instep: hejuru kukirenge</li>
                                    <li>Buttock: igisusu</li>
                                    <li>Male organ: igitsina Gabo</li>
                                    <li>Female organ: igitsina gore</li>
                                    <li>Testicles: amatengatwa</li>
                                    <li>Knee: ivi</li>
                                    <li>Hamstring: muntege</li>
                                    <li>Calf: ipfundo</li>
                                    <li>Heel: agatsintsiri</li>
                                    <li>Index: urutoke rwakabiri</li>
                                    <li>Thumb: urukumu</li>
                                    <li>Middle finger: urutoke mukuru</li>
                                    <li>Ring finger: urutoke rwurupete</li>
                                    <li>Little finger: agahererezi</li>
                                    <li>Chest: igikiriza</li>
                                    <li>Gardenlove:umugara wokugikiriza</li>
                                    <li>Nipple: imoko</li>
                                    <li>Breast: ibere</li>
                                    <li>Stomach: inda</li>
                                    <li>Belly: inda</li>
                                    <li>Navel: umukondo</li>
                                    <li>Back: umugongo</li>
                                    <li>Rib: urubavu</li>
                                    <li>Pupil: imbonero( part black)</li>
                                    <li>Muscles: imitsi</li>
                                    <li>Skin: urukoba</li>
                                    <li>Appendix: agatorero</li>
                                    <li>Esophagus : igihogohogo</li>
                                    <li>Liver: igitigu</li>
                                    <li>Heart: umutima</li>
                                    <li>Lungs: Amahaha</li>
                                    <li>Bones: amagufa</li>
                                    <li>Fontanelle : uruhorihori</li>
                                </ul>
                                <p className="text-sm font-semibold mt-4">NB: TO TICKLE : KUDIGADIGA</p>
                            </CardContent>
                        </Card>
                         <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Numbers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <h4 className="font-semibold text-lg mb-2">A. Cardinal Numbers</h4>
                                <p className="text-sm text-muted-foreground mb-4">Cardinal numbers are the numbers that we use when counting people, things etc... See the following list of them.</p>
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p>1. One</p>
                                        <p>2. Two</p>
                                        <p>3. Three</p>
                                        <p>4. Four</p>
                                        <p>5. Five</p>
                                        <p>6. Six</p>
                                        <p>7. Seven</p>
                                        <p>8. Eight</p>
                                        <p>9. Nine</p>
                                        <p>10. Ten</p>
                                    </div>
                                    <div>
                                        <p>11. Eleven</p>
                                        <p>12. Twelve</p>
                                        <p>13. Thirteen</p>
                                        <p>14. Fourteen</p>
                                        <p>15. Fifteen</p>
                                        <p>16. Sixteen</p>
                                        <p>17. Seventeen</p>
                                        <p>18. Eighteen</p>
                                        <p>19. Nineteen</p>
                                        <p>20. Twenty</p>
                                    </div>
                                    <div>
                                        <p>21. Twenty-one</p>
                                        <p>22. Twenty-two</p>
                                        <p>23. Twenty-three</p>
                                        <p>24. Twenty-four</p>
                                        <p>25. Twenty-five</p>
                                        <p>26. Twenty-six</p>
                                        <p>27. Twenty-seven</p>
                                        <p>28. Twenty-eight</p>
                                        <p>29. Twenty-nine</p>
                                        <p>30. Thirty</p>
                                    </div>
                                     <div>
                                        <p>40. Forty</p>
                                        <p>50. Fifty</p>
                                        <p>60. Sixty</p>
                                        <p>70. Seventy</p>
                                        <p>80. Eighty</p>
                                        <p>90. Ninety</p>
                                        <p>100. One hundred/a hundred</p>
                                    </div>
                                </div>
                                <div className="mt-4 text-sm space-y-2">
                                    <p><strong>Remember:</strong> we have , odd number : 1,3,5,7,9,11,13 etc..</p>
                                    <p>Even number : 2, 4, 6 ,8 ,10 ,12 ,14 etc....</p>
                                    <p><strong>Eg:</strong> -Two dogs,five hens,twenty girls,one stick and eighteen students.</p>
                                    <p>-That girl{'--->'}<wbr/>Those four girls,This boy{'----------->'}<wbr/>These two boys.</p>
                                    <p><strong>NB:</strong>Every day when counting the cardinal numbers between hundreds and dizen,there is the word"" and ""</p>
                                    <p>E.g: 101: one hundred and one</p>
                                    <p>254: two hundred and fifty- four</p>
                                    <p>998: nine hundred and ninety- eight</p>
                                    <p>Also remember that we put ( - ) a hyphen between dizens and the units numbers. In writing them in words.</p>
                                    <p>E.G: 88: eighty- eight</p>
                                    <p>900: nine hundred</p>
                                    <p>1,000: one thousand</p>
                                    <p>2,000:two thousand</p>
                                    <p>1100 :one thousand one hundred</p>
                                    <p>2500 :two thousand five hundred</p>
                                    <p>10,000:ten thousand</p>
                                    <p>200,000:two hundred thousand</p>
                                    <p>1,000,000:one million</p>
                                </div>

                                <h4 className="font-semibold text-lg mb-2 mt-6">FRACTIONS</h4>
                                <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1">
                                    <li>½ :a/one half</li>
                                    <li>1/3 a/one third</li>
                                    <li>¼: a /one quarter or a/one fourth</li>
                                    <li>1/12:one twelfth</li>
                                    <li>1/16:one sixteenth</li>
                                    <li>2/3:two thirds</li>
                                    <li>¾: three quarters/three fourths</li>
                                    <li>9/10 :nine tenths</li>
                                    <li>19/56 : nineteen over fifty–six</li>
                                    <li>31/144 : thirty–one over one four four</li>
                                    <li>2 ½:two and a half</li>
                                    <li>5 ⅔:five and two thirds</li>
                                </ul>

                                <h4 className="font-semibold text-lg mb-2 mt-6">DECIMALS</h4>
                                <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1">
                                    <li>79.3 : seventy-nine point three</li>
                                    <li>3.142:three point one four two</li>
                                    <li>0.67 :(zero)point six seven</li>
                                    <li>(Bre also ) nought point six seven</li>
                                </ul>
                                <p className="text-sm text-muted-foreground mt-2">NB: write and say with a point (.)( not a comma )<br/>Say each figure after the point separately</p>
                                
                                <h4 className="font-semibold text-lg mb-2 mt-6">MATHEMATICAL EXPRESSIONS</h4>
                                <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1">
                                    <li>X : times /multiplied by</li>
                                    <li>+: plus</li>
                                    <li>-: minus</li>
                                    <li>: divided by</li>
                                    <li>= equals /is</li>
                                    <li>% percent</li>
                                    <li>3² three squared</li>
                                    <li>5³ five cubed</li>
                                    <li>6¹⁰ six to the power of ten</li>
                                </ul>

                                <h4 className="font-semibold text-lg mb-2 mt-6">B. Ordinal Numbers</h4>
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p>1st :first.</p>
                                        <p>2nd : second.</p>
                                        <p>3rd : third.</p>
                                        <p>4th : fourth.</p>
                                        <p>5th : fifth.</p>
                                        <p>6th. : sixth.</p>
                                        <p>7th. : seventh.</p>
                                        <p>8th. : eighth.</p>
                                        <p>9th : ninth.</p>
                                        <p>10th : tenth.</p>
                                    </div>
                                    <div>
                                        <p>11th. :eleventh.</p>
                                        <p>12th. : twelfth.</p>
                                        <p>13th : thirteenth.</p>
                                        <p>14th : fourteenth.</p>
                                        <p>15th : fifteenth.</p>
                                        <p>16th. :sixteenth.</p>
                                        <p>17th :seventeenth.</p>
                                        <p>18th : eighteenth.</p>
                                        <p>19th :nineteenth.</p>
                                        <p>20th: twentieth.</p>
                                    </div>
                                    <div>
                                        <p>21st : twenty- first.</p>
                                        <p>22nd : twenty- second.</p>
                                        <p>23rd: twenty- third.</p>
                                        <p>24th: twenty- fourth.</p>
                                        <p>25th : twenty- fifth.</p>
                                        <p>26th : twenty- sixth.</p>
                                        <p>27th :twenty- seventh</p>
                                        <p>28th. :twenty- eighth</p>
                                        <p>29th. :twenty- ninth</p>
                                        <p>30th :thirtieth</p>
                                    </div>
                                    <div>
                                        <p>40th: fortieth</p>
                                        <p>50th. : fiftieth</p>
                                        <p>60th : sixtieth</p>
                                        <p>70th : seventieth</p>
                                        <p>80th : eightieth</p>
                                        <p>90th :ninetieth</p>
                                        <p>100th : the one hundredth</p>
                                    </div>
                                </div>
                                <h4 className="font-semibold text-lg mb-2 mt-6">PERIOD OF THE YEAR</h4>
                                <ul className="text-sm space-y-1 text-muted-foreground">
                                    <li> Year: is a period of twelve months</li>
                                    <li> Month : is a period of 28,29,30 and 31 days</li>
                                    <li> Month : is also a period of four weeks</li>
                                    <li> Week :is a period of seven days.</li>
                                    <li> Day : is a period of twenty- four hours</li>
                                    <li> Hour : is a period of 60 minutes.</li>
                                </ul>
                                <h4 className="font-semibold text-lg mb-2 mt-6">TELLING TIME</h4>
                                <div className="text-sm space-y-2 text-muted-foreground">
                                    <p>How many days are there in December?</p>
                                    <ol className="list-decimal pl-6">
                                        <li>A day has daytime and nighttime</li>
                                        <li>A daytime has twelve hours and twelve hours for nighttime.</li>
                                        <li>In a day we have morning, afternoon and evening</li>
                                        <li>A day ends at midnight 12:00 p.m and a new day begins.</li>
                                        <li>In telling time,we also use a.m and p.m</li>
                                    </ol>
                                    <p>a.m{'-------->'}<wbr/>anti- meridiem,in the morning after midnight: this is morning time</p>
                                    <p>p.m{'-------->'}<wbr/>post- meridiem,in the afternoon, in the evening, at midnight, at noon and before midnight: this is afternoon and evening time</p>
                                    <p>When telling time,there are two questions you have to know,these are : what time is it? And what is the time? And the answers to these questions will start by saying :-It is....... / -The time is.........</p>
                                    
                                    <h5 className="font-semibold text-md pt-2">TELLING TIME IN SIMPLE WAY</h5>
                                    <p>This way is reading the time as it is shown by the watch{'---->'}<wbr/>this is common English ( both British and American use this way)</p>
                                    <p>E.g : 9:11 ---&gt;it is nine eleven</p>
                                    <p>12:35 ---&gt;the time is twelve thirty- five</p>
                                    <p>6:30 --&gt;it is six thirty</p>
                                    <p>2:15 --&gt;it is two fifteen</p>
                                    <p>1:10 --&gt;the time is one ten</p>
                                    <p>3:05 -&gt;three oh five/ three naught five</p>
                                    <p>13:52 -&gt;it is thirteen fifty- two ( 1:52 p.m )</p>
                                    <p>Say : " o'clock :-when an hour is top.</p>
                                    <p>-only for whole hours</p>
                                    <p>E.g : 9:00 {'---->'}<wbr/> it is nine o' clock.</p>
                                    <p>3:00 {'---->'}<wbr/> the time is three o' clock</p>
                                    <p>Please pay attention!!!!!{'---------&gt;'}<wbr/> Don't use a.m and p.m with whole hours</p>
                                    <p>{'---------&gt;'}<wbr/>Don't use o' clock with morning /afternoon</p>
                                    
                                    <h5 className="font-semibold text-md pt-2">OTHER WAY OF TELLING TIME</h5>
                                    <p>1......................15....................29.....30.....31.......................45.......................59</p>
                                    <p> &lt;----------past/after-------------&gt; Half. &lt;-------------To/of-------------------&gt;</p>
                                    <p>E.g: 7:08{'------&gt;'}<wbr/>it is eight minutes past/ after seven</p>
                                    <p>10:27-----&gt;it is twenty- seven minutes past/after ten</p>
                                    <p>11:15{'------&gt;'}<wbr/>it is quarter past/after eleven</p>
                                    <p>9:34-----&gt;it is twenty- six minutes to /of ten</p>
                                    <p>12:45----&gt;it is quarter to/ of one</p>
                                    <p>7:30-----&gt;it is a half past/after seven</p>
                                    <p>3:05-----&gt;it is five past /after three</p>
                                    <p>1:55-----&gt;it is five to / of two</p>
                                    <p>1:10-----&gt;it is ten past/after one</p>
                                    <p>NB: with 5/10/20/25 the word minutes is not necessary, but is used with other numbers.</p>
                                    <p>E.g: 10:25 a.m{'--------&gt;'}<wbr/> it is twenty- five past ten</p>
                                    <p>10:17 p.m-------&gt; it is seventeen minutes past ten.</p>
                                </div>
                                <h4 className="font-semibold text-lg mb-2 mt-6">TWENTY- FOUR HOURS</h4>
                                <div className="text-sm space-y-2 text-muted-foreground">
                                    <p>We use twenty-four hours clock for two purposes only:</p>
                                    <ul className="list-disc pl-6">
                                        <li>For military purposes</li>
                                        <li>For planned timetable</li>
                                    </ul>
                                    <p>E.g:13:45----&gt; the train will arrive at quarter to fourteen.</p>
                                    <p>19:00---&gt; the soldiers will attack enemies at nineteen o' clock.</p>
                                    <p>NB:Don't use a.m and p.m with twenty- four hours.</p>
                                </div>
                                <h4 className="font-semibold text-lg mb-2 mt-6">HUNDRED HOURS</h4>
                                 <div className="text-sm space-y-2 text-muted-foreground">
                                    <p>We use hundred hours for military purpose only.</p>
                                    <p>E.g:--&gt;the support army will land at nine hundred hours .(9:00).</p>
                                </div>
                                <h4 className="font-semibold text-lg mb-2 mt-6">DIALOGUE PRACTICE ABOUT TELLING TIME</h4>
                                <h5 className="font-semibold text-md mb-2">CHANGE APPOINTMENT</h5>
                                <div className="p-4 border rounded-lg bg-muted/50 space-y-1 text-sm">
                                    <p><strong>A :</strong> Good morning,what can I do for you?</p>
                                    <p><strong>B :</strong> Good morning, my name is Adele,yesterday I made an appointment with Dr.James,but I think I'll not be
able to make it.</p>
                                    <p><strong>A :</strong> when is your appointment?</p>
                                    <p><strong>B :</strong> it's on Wednesday the 25th,3 days from to day.</p>
                                    <p><strong>A :</strong> what time is the appointment?</p>
                                    <p><strong>B :</strong> if I remember correctly it is at three minutes to four.</p>
                                    <p><strong>A :</strong> ah! I see it in the system now.what day would you like to change it to?</p>
                                    <p><strong>B :</strong> it's Friday the 27th at quarter past four.OK?</p>
                                    <p><strong>A :</strong> yes,that will work just fine.</p>
                                    <p><strong>B :</strong> I'll come in at that time.</p>
                                </div>
                                <h4 className="font-semibold text-lg mb-2 mt-6">DIALOGUE PRACTICE OF THIS SECTION 3</h4>
                                <div className="p-4 border rounded-lg bg-muted/50 space-y-1 text-sm">
                                  <p><strong>Stella :</strong> Good evening, STANY</p>
                                    <p><strong>Stany :</strong> Good evening, Stella</p>
                                    <p><strong>Stella :</strong> longtime no see,where were you?</p>
                                    <p><strong>Stany :</strong> I was on Dar-es-salaam.</p>
                                    <p><strong>Stella :</strong> how is Dar-es-salaam?</p>
                                    <p><strong>Stany :</strong>It is a city in which we find many hospitals like Muhimbili and Aga khan,those are the main hospitals of Dar-es-salaam. Also we find many schools, supermarkets,shops, churches and Mosques without forgetting that it has many industries like MCL,GOLD STAR PAINTS,CELLO,ETC.....</p>
                                    <p><strong>Stella :</strong>what places did you visit?</p>
                                    <p><strong>Stany :</strong> I visited the places like stadium of Julius Nyerere and Julius Nyerere airport.</p>
                                    <p><strong>Stella :</strong> how are they?</p>
                                    <p><strong>Stany :</strong> They look amazing,have you never visited Dar-es-salaam?</p>
                                    <p><strong>Stella :</strong> Not yet,but I visited the zoo of SERENGETI where there are many animals like buffaloes, tigers, lions, gorillas, monkeys and wolves.</p>
                                    <p><strong>Stany :</strong> Dar-es-salaam is a good looking place.when you reach there,you'll enjoy your life .At kariakoo bazaar,you'll find people buying clothes like T-shirts, pants,under wears and others buying foods like cassava,tomato, sweet potatoes, aubergines and bananas.</p>
                                    <p><strong>Stella :</strong> it is my hope ,the people of Dar-es-salaam have a luxurious life.</p>
                                    <p><strong>Stany :</strong> Yes!and know that is a busy city with many people, houses,trains,buses,cars,lorries and aeroplanes.at the train station you will find many people waiting to travel.</p>
                                    <p><strong>Stella :</strong> do people of Dar-es-salaam breed cows?</p>
                                    <p><strong>Stany :</strong> No,because it is difficult to get grass to feed them.but neighbouring regions like PWANI AND MOROGORO breed rarely pigs,hens,ducks,goats and rabbits. In Dar-es-salaam you'll find fierce dogs to guard the houses.</p>
                                    <p><strong>Stella :</strong> you have had a wonderful journey, so when will you turn back there?</p>
                                    <p><strong>Stany :</strong> if God wishes in September on 26th.</p>
                                    <p><strong>Stella :</strong> Okay,thanks ----and I also,my uncle promised me to take me there one day to go to visit my cousins.</p>
                                    <p><strong>Stany :</strong> sounds good!</p>
                                    <p><strong>Stella :</strong> so ,we shall talk more in section 4.</p>
                                    <p><strong>Stany :</strong> okay thanks,we shall meet tomorrow at four o'clock.</p>
                                </div>
                                <h4 className="font-semibold text-lg my-4">EXPRESSIONS</h4>
                                <div className="text-sm space-y-2 text-muted-foreground">
                                    <p><strong>Day in,Day out:</strong> continuously or repeatedly over a long period of time.</p>
                                    <p><strong>And all that :</strong> or and that, and so on.</p>
                                    <p><strong>Long call :</strong> to pass waste,to defecate.</p>
                                    <p><strong>Small call :</strong> to pass urine,to urinate.</p>
                                </div>
                            </CardContent>
                        </Card>
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
             <p className="text-muted-foreground mb-2">In section three we learnt about people ,things and places.we hope that you now know many words.in this section, we will learn words which show actions.</p>
            <p className="text-muted-foreground mb-2">The action shows us what is happening.</p>
            <p className="text-muted-foreground mb-2">Here are some examples:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 text-sm">
                <li>A boy is <strong>eating</strong> a banana. {'->'} what is the boy doing? {'->'} he is eating a banana. {'->'} what is the boy eating? {'->'} he is eating the banana.</li>
                <li>A girl is going.</li>
                <li>A man is walking.</li>
                <li>MINANI is sitting on a chair.</li>
                <li>Martha is washing her clothes.</li>
                <li>We are studying English course.</li>
                <li>STANY is writing a letter.</li>
                <li>The students are learning.</li>
                <li>Grace is cooking food {'->'} what is Grace doing? {'->'} She is cooking food. {'->'} what is Grace cooking? {'->'} she is cooking food.</li>
                <li>A boy is listening to the radio.</li>
                <li>A man is speaking.</li>
                <li>Asha is drinking milk.</li>
                <li>My parents are farming.</li>
                <li>A dog is running away {'->'} what is the dog doing? {'->'} it is running away.</li>
                <li>Two boys are playing football. {'->'} what are they doing? {'->'} they are playing football.</li>
                <li>Catherine is sweeping.</li>
                <li>The baby is crying. {'->'} The baby is not crying.</li>
                <li>Albert is pushing a car {'->'} Albert is not pushing a car.</li>
                <li>A man is pulling a cart. {'->'} A man is not pulling a cart.</li>
                <li>A girl is holding a pen. {'->'} A girl is not holding a pen.</li>
                <li>Kulwa is riding a bicycle. {'->'} Kulwa is not riding a bicycle.</li>
                <li>I am driving a car. {'->'} what am I doing? {'->'} I am driving a car. {'->'} what am I driving? {'->'} I am driving a car.</li>
                <li>A bird is flying. {'->'} A bird is not flying.</li>
                <li>A boy is carrying a basket. {'->'} A boy is not carrying a basket.</li>
                <li>You are reading a book. {'->'} what are you doing? {'->'} I am reading a book. {'->'} what are you reading? {'->'} I am reading a book</li>
                <li>I am taking notes.{'->'}Am I taking notes?</li>
                <li>You are doing a homework.{'->'}Are you doing a homework?</li>
                <li>They are harvesting.{'->'}Are they harvesting?</li>
                <li>He is digging a hole.{'->'}Is he digging a hole?</li>
                <li>My father is building a house.{'->'}Is my father building a house?</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">NB: The words eating, sitting, washing, cooking, listening, walking, speaking, carrying, reading etc...they show "ACTIONS"</p>
             <h4 className="font-semibold text-lg my-4">DIALOGUE PRACTICE OF THIS SECTION</h4>
              <div className="p-4 border rounded-lg bg-muted/50 space-y-1 text-sm">
                <p><strong>Hassan :</strong> Hi !</p>
                <p><strong>Jackson :</strong> Hi !</p>
                <p><strong>Hassan :</strong> How are you keeping these days?</p>
                <p><strong>Jackson :</strong> I am keeping well.</p>
                <p><strong>Hassan :</strong> what are you doing here?</p>
                <p><strong>Jackson :</strong> I am waiting for my ex-friend,Jojo.</p>
                <p><strong>Hassan :</strong> what are your brother and sister doing home?</p>
                <p><strong>Jackson :</strong> my brother is repairing his bicycle and my sister is cooking food now.</p>
                <p><strong>Hassan :</strong> when are you going to return home to take lunch?</p>
                <p><strong>Jackson :</strong> we are taking lunch this mid day.</p>
                <p><strong>Hassan :</strong> OK,thanks,and I am going to play football match this afternoon.</p>
                <p><strong>Jackson :</strong> of course! I will come to assist your match after eating.</p>
                <p><strong>Hassan :</strong> so,may I wait for you?</p>
                <p><strong>Jackson :</strong> yes,you may.</p>
                <p><strong>Hassan :</strong> what are those women over there doing?</p>
                <p><strong>Jackson :</strong> they are swimming.</p>
                <p><strong>Hassan :</strong> and those men?</p>
                <p><strong>Jackson :</strong> those men! They are fishing</p>
                <p><strong>Hassan :</strong> who taught them how to fish?</p>
                <p><strong>Jackson :</strong> they teach each others among themselves.</p>
                <p><strong>Hassan :</strong> Good! We can't rely on begging. To have a skill is very essential.</p>
                <p><strong>Jackson :</strong> Yeah! By the way we say," don't give a man the fish,but teach him how to fish "</p>
                <p><strong>Hassan :</strong> let's go home now.</p>
                <p><strong>Jackson :</strong> yes,here we are,let's go.</p>
              </div>
              <h4 className="font-semibold text-lg my-4">EXPRESSIONS</h4>
               <div className="text-sm space-y-2 text-muted-foreground">
                <p><strong>1.Be so!---&gt;</strong> urahora utyo/ urama utyo</p>
                <p><strong>2.a mother to be----&gt;</strong>near to give birth.</p>
                <p><strong>3.in the family way----&gt;</strong>to be pregnant</p>
              </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="describing" className="border rounded-lg">
          <AccordionTrigger className="p-4 text-lg font-semibold">
            Section 5: Talking about People, Things and Places
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0">
             <p className="text-muted-foreground mb-2">In this part, we will see the words which we use when talking to people, things,animals and places.the words which tell us more about people, things ,animals and places.</p>
            <p className="text-muted-foreground mb-2">Look at the following examples :</p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>This is a <strong>tall</strong> boy. - This is a <strong>short</strong> boy.<br/><span className="text-xs">Tall and short tell more about the boys</span></li>
              <li>Anna is a <strong>fat</strong> girl. - Christina is a <strong>thin</strong> girl.<br/><span className="text-xs">Fat and thin tell more about the girls.</span></li>
              <li>Albert is sad. -Hamisi is happy.<br/><span className="text-xs">Sad and happy tell more about Albert and Hamisi</span></li>
              <li>Juma is an old man. -Peter is young man<br/>( Juma is 70 years old). ( Peter is 25 years old)<br/><span className="text-xs">Old and young tell more about Juma and Peter</span></li>
            </ul>
             <div className="p-4 border rounded-lg bg-muted/50 space-y-1 text-sm mt-4">
                <p><strong>Osiane :</strong> Good morning, Angel</p>
                <p><strong>Angel :</strong> Good morning, Osiane</p>
                <p><strong>Osiane :</strong> I am happy to see you again.</p>
                <p><strong>Angel :</strong> and I also, what are you doing with that beautiful basket?</p>
                <p><strong>Osiane :</strong> I am from the market.</p>
                <p><strong>Angel :</strong> what did you buy from there?</p>
                <p><strong>Osiane :</strong> I bought many things for my new house, like a small plastic table, a red cup, a white cup, a big pot and a sharp panga.</p>
                <p><strong>Angel :</strong> what about clothes?</p>
                <p><strong>Osiane :</strong> I bought a short blue skirt for my daughter, a long green dress for my mother,without forgetting that I like brown underwear and brassiere.</p>
                <p><strong>Osiane :</strong> you will inform me when you go there so as to escort you.</p>
                <p><strong>Angel :</strong> Don't worry for that but I don't know your new address where you have moved?</p>
                <p><strong>Osiane :</strong> I live beyond that hill,near NYARUGUSU Road ,where you will find two big houses and a kitchenette, beside there is a tall mango tree with unripe fruits.</p>
                <p><strong>Angel :</strong> I think that I shall not go astray, I shall ask.</p>
                <p><strong>Osiane :</strong> okay,you are welcome and you will find hot food ready .</p>
                <p><strong>Angel :</strong> what will you prepare for me?</p>
                <p><strong>Osiane :</strong> I shall prepare delicious meal like meat.Besides,beside the meal,there will be lemons as desserts.</p>
                <p><strong>Angel :</strong> I don't like lemons ,they are sour.</p>
                <p><strong>Osiane :</strong> and oranges?</p>
                <p><strong>Angel :</strong> Yes, I like oranges very much,they are as sweet as honey.</p>
                <p><strong>Osiane :</strong> I shall be happy to see you again.</p>
                <p><strong>Angel :</strong> and I also.</p>
                <p><strong>Osiane :</strong> let me leave you,it is late.</p>
                <p><strong>Angel :</strong> cheerio!</p>
                <p><strong>Osiane :</strong> cheerio!</p>
            </div>
            <h4 className="font-semibold text-lg my-4">EXPRESSIONS</h4>
            <div className="text-sm space-y-2 text-muted-foreground">
                <p><strong>1. The long and the short :</strong> in short,in one word.</p>
                <p><strong>2. Give my best regards :</strong> send my greetings/ love to....</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="position" className="border rounded-lg">
          <AccordionTrigger className="p-4 text-lg font-semibold">
            Section 6: Words for Position and Direction
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0">
             <p className="text-muted-foreground mb-2">These words (prepositions) show us where things , people ,animals and places are in relation to us. When you finish this section ,you will be able to tell where people ,things and places are. Where people are going to or coming from. Here are some words :</p>
            <ul className="list-disc pl-6 text-muted-foreground columns-2">
              <li>On : Ku</li>
              <li>At : a , Ku , I , mu</li>
              <li>Up : hejuru Ku ( iyo gifatanye Nico uvuga )</li>
              <li>Over : hejuru ( iyo kidafatanye nico uvuga )</li>
              <li>Down : nasi</li>
              <li>Below : musi yikintu ariko ntigikorako</li>
              <li>Under : musi</li>
              <li>In front of : imbere ya</li>
              <li>Close to : impande ya</li>
              <li>In : mu</li>
              <li>Inside : imbere mu</li>
              <li>Out : hanze</li>
              <li>Onto : gukorokera Ku</li>
              <li>Into : kwerekeza mu</li>
              <li>To : kwa , I , mu ,Ku</li>
              <li>Towards : werekeza imbere ya</li>
              <li>In sight of : mu maso ya</li>
              <li>Behind : inyuma ya</li>
              <li>Beyond : au dela</li>
              <li>From : kuva ,iyo kiva/ uva</li>
              <li>Along : kunkengera yibarabara canke yuruzi</li>
              <li>Beside : iruhande</li>
              <li>Across : ujabuka yibarabara canke uruzi</li>
              <li>Between : hagati yibintu bibiri</li>
              <li>Among : hagati yibintu birenze bibiri</li>
              <li>Through : uciye mu</li>
              <li>Throughout : hose</li>
              <li>Whole : vyose</li>
            </ul>
             <div className="mt-4">
                <h5 className="font-semibold text-md mb-2">Study the following examples:</h5>
                <p className="text-sm text-muted-foreground">Where is the ball?</p>
                <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1">
                    <li>The ball is on the table.</li>
                    <li>The bottle is under the table.</li>
                    <li>The boy is behind the car.</li>
                    <li>The girl is in front of the car.</li>
                    <li>The cup is inside the box.</li>
                    <li>The bottle is outside the house.</li>
                    <li>The water is inside the bottle.</li>
                    <li>This tree is near the house.</li>
                    <li>Those trees are far from the house</li>
                    <li>The boys are going up the hill.</li>
                    <li>The girl is going down the hill.</li>
                    <li>The girl is coming from the shop.</li>
                    <li>She is at school.</li>
                    <li>The student is going to school.</li>
                    <li>The rain is raining throughout the country.</li>
                    <li>The man is going into the house.</li>
                    <li>I am pouring water onto the table.</li>
                    <li>Don't pass in sight of him.</li>
                </ul>
                <p className="text-sm font-semibold mt-2">NB : WE ASK QUESTIONS BY BEGINNING BY : WHERE IS / ARE ....?</p>
            </div>
            <h4 className="font-semibold text-lg my-4">DIALOGUE PRACTICE OF THIS SECTION</h4>
            <div className="p-4 border rounded-lg bg-muted/50 space-y-1 text-sm">
                <p><strong>Osias :</strong> hello!</p>
                <p><strong>Osma :</strong> hello!</p>
                <p><strong>Osias :</strong> where do you come from?</p>
                <p><strong>Osma :</strong> I come from school and what is your direction?</p>
                <p><strong>Osias :</strong> I am going up the hill.</p>
                <p><strong>Osma :</strong> ooh,I am sorry, can you lend me your English exercise copybook?</p>
                <p><strong>Osias :</strong> you are sorry! Go home,you will find it inside the box,on the table in the dinning room.</p>
                <p><strong>Osma :</strong> and what about " Methodology homework ? "</p>
                <p><strong>Osias :</strong> I haven't yet done it,I shall do it by night.what I have already finished is the drawing a picture in
which a cat is running after the mouse,and the mouse in front of it.</p>
                <p><strong>Osma :</strong> okay ,let me hurry,I am going to meet my uncle beyond that hillock.</p>
                <p><strong>Osias :</strong> Ciao!</p>
                <p><strong>Osma :</strong> Ciao!</p>
            </div>
             <h4 className="font-semibold text-lg my-4">EXPRESSIONS</h4>
            <div className="text-sm space-y-2 text-muted-foreground">
                <p><strong>Man of means:</strong>someone who is very rich.</p>
                <p><strong>Man in the street :</strong> an ordinary person.</p>
                <p><strong>Devil day:</strong> unlucky day.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="dialogues" className="border rounded-lg">
          <AccordionTrigger className="p-4 text-lg font-semibold">
            Section 7: Dialogue Practices
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0">
             <Card>
                <CardHeader>
                    <CardTitle>DIALOGUE PRACTICE THAT COMBINES SECTION ONE TO SIX</CardTitle>
                    <CardDescription>JOHN MEETS HIS FRIENDS MARY AND ANTONY</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                    <p><strong>John :</strong> Good morning, Mary!</p>
                    <p><strong>Mary :</strong> Good morning, John!</p>
                    <p><strong>John :</strong> How are you?</p>
                    <p><strong>Mary :</strong> I am fine thank you and you?</p>
                    <p><strong>John :</strong> I am quite fine.</p>
                    <p><strong>Mary :</strong> Sorry,where do you come from?</p>
                    <p><strong>John :</strong> I come from zone nine to visit my parents.</p>
                    <p><strong>Mary :</strong> Do your parents live in zone nine?</p>
                    <p><strong>John :</strong> Yes ,they live there with my little brother.</p>
                    <p><strong>Mary :</strong> OK ,what is your brother's name and how old is he?</p>
                    <p><strong>John :</strong> His name Juma ,he has 22 years old and you,where do your parents live?</p>
                    <p><strong>Mary :</strong> My parents stayed in Burundi, they are there looking after my sisters who are at school and also looking after the castle because they are farmers, they breed cows,goats and pigs ,they dislike to breed hens and ducks.besides to those,there are two dogs to guard them.</p>
                    <p><strong>John :</strong> In which standard or form are they?</p>
                    <p><strong>Mary :</strong> My younger sister is in standard six and my elder one in form two.</p>
                    <p><strong>John :</strong> Do they know English well?</p>
                    <p><strong>Mary :</strong> Yes,they all know how to sing " A,B,C,D......"</p>
                    <p><strong>Antony :</strong> Good morning all of you?</p>
                    <p><strong>John and Mary :</strong> Good morning to you.</p>
                    <p><strong>John :</strong> What about your family?</p>
                    <p><strong>Antony :</strong> My family is getting well.</p>
                    <p><strong>John :</strong> -Hello ,Antony,this is my friend,her name is Mary.</p>
                    <p><strong>John :</strong> -Hello,Mary, this is my friend, his name is Antony.</p>
                    <p><strong>Mary :</strong> I am happy to meet you Antony.</p>
                    <p><strong>Antony :</strong> I am happy to meet you too Mary.</p>
                    <p><strong>Mary :</strong> Where do you live.</p>
                    <p><strong>Antony :</strong> I live in zone eight near the school.</p>
                    <p><strong>Mary :</strong> Do you have a wife ?</p>
                    <p><strong>Antony :</strong> Yes ,I am married with two children, one boy and one girl.my son is in standard two and my daughter is going to start school next year.</p>
                    <p><strong>Mary :</strong> What is your wife's name?</p>
                    <p><strong>Antony :</strong> My wife's name is Grace and I am very sorry it is going to rain.can you please help me your umbrella?</p>
                    <p><strong>Mary :</strong> Yes, here it is,take it.</p>
                    <p><strong>Antony :</strong> Thank you very much.</p>
                    <p><strong>Mary :</strong> It is pleasure and see you other day.</p>
                    <p><strong>Antony :</strong> see you!</p>
                    <p><strong>John :</strong> Please Antony, let us hurry up at home the rain is coming.</p>
                    <p><strong>Antony :</strong> Yes,let us go.I am very happy to day to meet a new friend, you have done a good thing to introduce me to Mary.Now we are friends.</p>
                    <p><strong>John :</strong> Yeah,we just arrive,my home is beside that tall tree,I have a big house,where you see the fat woman who is cooking food ,she is my wife. And other one sat in the plastic chair is my aunt,Huruma.</p>
                    <p><strong>John's wife :</strong> You are welcome.</p>
                    <p><strong>John and Antony :</strong> Thank you!</p>
                    <p><strong>John's wife :</strong> -Get in ,and have seat please!</p>
                    <p><strong>John's wife :</strong> -Anna? Anna?hurry up please, where is the dishpan,I want two plates, two spoons and one saucespoon.we have to serve our guest food.</p>
                    <p><strong>Anna :</strong> I am sorry Mum, I don't know where you have kept it and we do the mistake to keep the</p>
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
