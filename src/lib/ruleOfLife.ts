export const ruleOfLifeDisciplines = [
  "Prayer",
  "Scripture",
  "Silence",
  "Solitude",
  "Fasting",
  "Sabbath",
  "Gratitude",
  "Simplicity",
  "Service"
];

export const defaultDailyRhythm = ["Prayer", "Scripture", "Silence", "Gratitude"];

export type DisciplineGuidance = {
  description: string;
  practice: string;
  scriptures: string[];
};

export const disciplineGuidance: Record<string, DisciplineGuidance> = {
  Prayer: {
    description: "Prayer is honest attention to God. It can include thanks, confession, requests, silence, and listening.",
    practice: "Set a timer for 5 to 10 minutes. Speak plainly to God, then leave a minute at the end to be quiet.",
    scriptures: ["Matthew 6:6", "Philippians 4:6-7", "1 Thessalonians 5:16-18"]
  },
  Scripture: {
    description: "Scripture is slow listening to God through the Bible, not rushing to finish a chapter.",
    practice: "Read a short passage twice. Notice one word, phrase, or invitation that stands out.",
    scriptures: ["Psalm 119:105", "2 Timothy 3:16-17", "Hebrews 4:12"]
  },
  Silence: {
    description: "Silence is making room for God beneath the noise, hurry, and constant input of the day.",
    practice: "Sit still, breathe slowly, and gently return to God whenever your mind wanders.",
    scriptures: ["Psalm 46:10", "Lamentations 3:25-26", "Mark 1:35"]
  },
  Solitude: {
    description: "Solitude is stepping away from performance and noise so you can be with God as you are.",
    practice: "Take a short walk or sit alone without your phone. Let the quiet reveal what is happening inside.",
    scriptures: ["Luke 5:16", "Matthew 14:23", "Hosea 2:14"]
  },
  Fasting: {
    description: "Fasting is setting aside a good thing for a time to remember that God is your deepest need.",
    practice: "Choose a gentle fast that fits your health and season: a meal, a snack, social media, or a purchase.",
    scriptures: ["Matthew 4:4", "Matthew 6:16-18", "Isaiah 58:6-9"]
  },
  Sabbath: {
    description: "Sabbath is a rhythm of rest, worship, and delight that reminds you life is held by God.",
    practice: "Choose one block of time to stop producing. Do something restful that helps you receive the day.",
    scriptures: ["Exodus 20:8-11", "Mark 2:27", "Hebrews 4:9-10"]
  },
  Gratitude: {
    description: "Gratitude is noticing and naming gifts from God, especially ordinary ones you might rush past.",
    practice: "Write down three specific gifts from today and thank God for each one.",
    scriptures: ["Psalm 103:1-5", "Colossians 3:15-17", "James 1:17"]
  },
  Simplicity: {
    description: "Simplicity is choosing enough instead of excess so your attention and desires can become freer.",
    practice: "Release one unnecessary input, purchase, task, or possession for today.",
    scriptures: ["Matthew 6:19-21", "Luke 12:15", "1 Timothy 6:6-8"]
  },
  Service: {
    description: "Service is love made practical. It is choosing to bless someone without needing attention for it.",
    practice: "Do one quiet act of care: send encouragement, help with a task, give generously, or pray for someone.",
    scriptures: ["Mark 10:45", "Galatians 5:13", "1 Peter 4:10"]
  }
};
