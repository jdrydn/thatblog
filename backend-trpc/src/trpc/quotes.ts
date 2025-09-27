import { randomInt } from 'crypto';
import { procedure } from '@/backend-trpc/src/trpc/core';

const quotes = [
  /* eslint-disable max-len */

  // The Matrix
  'You take the blue pill - the story ends, you wake up in your bed and believe whatever you want to believe. You take the red pill - you stay in Wonderland and I show you how deep the rabbit hole goes.',
  "Do not try and bend the spoon. That's impossible. Instead, only try to realize the truth. There is no spoon. Then you'll see, that it is not the spoon that bends, it is only yourself.",
  "Sooner or later you're going to realize just as I did that there's a difference between knowing the path and walking the path.",
  "What is real? How do you define 'real'? If you're talking about what you can feel, what you can smell, what you can taste and see, then 'real' is simply electrical signals interpreted by your brain.",
  'Unfortunately, no one can be told what the Matrix is. You have to see it for yourself.',

  // The Lord of the Rings & The Hobbit
  'A day may come when the courage of men fails, when we forsake our friends and break all bonds of fellowship, but it is not this day.',
  'Not all those who wander are lost.',
  'Even the smallest person can change the course of the future.',
  'You step into the road, and if you don’t keep your feet, there is no knowing where you might be swept off to.',
  'The Quest stands upon the edge of a knife. Stray but a little, and it will fail, to the ruin of all. Yet hope remains while the Company is true.',
  'Do you wish me a good morning? Or mean that it is a good morning whether I want it or not? Or that you feel good this morning? Or that it is a morning to be good on?',

  // Mr Robot
  'The world is a dangerous place, Elliot, not because of those who do evil, but because of those who look on and do nothing.',
  "Hello friend. *Hello friend*? That's lame. Maybe I should give you a name. But that's a slippery slope, you're only in my head, we have to remember that.",
  'I never want to be right about my hacks, but people always find a way to disappoint.',
  "You're never sure about anything unless there's something to be sure about.",
  "People are all just people, right? When it gets down to it, everyone's the same. They love something. They want something. They fear something. Specifics help, but specifics don't change the way that everyone is vulnerable. It just changes the way that we access those vulnerabilities.",
  'Mr. Robot? His flaw is he\'s absolutely insane. We\'re talking clinical. When they say "if your friends jump off a bridge, would you?" -- he would. Without hesitation, just to prove something.',
  "What I'm about to tell you is top secret. There's a powerful group of people out there that are secretly running the world. I'm talking about the guys, no one knows about the guys who are invisible. The top 1% of the top 1%. The guys that play God without permission. And now I think they're following me.",

  // Portal 2
  'Hello! This is the part where I kill you!',
  "How are you holding up? Because I'm a potato.",
  "All right, I've been thinking, when life gives you lemons, don't make lemonade! Make life take the lemons back!",
  "So much space. Need to see it all. I'm in space. SPAAAAACE!",
  'Prometheus was punished by the gods for giving the gift of knowledge to man. He was cast to the bowels of the Earth and pecked by birds',

  /* eslint-enable max-len */
];

export const quotesQuery = procedure.query(() => quotes[Math.floor(randomInt(0, quotes.length))]);
