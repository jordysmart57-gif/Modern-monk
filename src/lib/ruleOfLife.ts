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

export const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
] as const;

export type WeekDay = (typeof weekDays)[number];
export type RuleFrequency = "daily" | "weekly" | "monthly" | "seasonal";

export type RuleOfLifePractice = {
  discipline: string;
  frequency: RuleFrequency;
  days: WeekDay[];
  intention: string;
};

export const frequencyLabels: Record<RuleFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  seasonal: "Seasonal"
};

export const frequencyDescriptions: Record<RuleFrequency, string> = {
  daily: "A small anchor for ordinary days.",
  weekly: "A rhythm that needs a little more room.",
  monthly: "A slower practice for remembering and returning.",
  seasonal: "A practice for this season, held lightly."
};

export const defaultRuleOfLifePractices: RuleOfLifePractice[] = [
  {
    discipline: "Prayer",
    frequency: "daily",
    days: [],
    intention: "Begin and end the day with God."
  },
  {
    discipline: "Scripture",
    frequency: "daily",
    days: [],
    intention: "Read slowly enough to listen."
  },
  {
    discipline: "Silence",
    frequency: "daily",
    days: [],
    intention: "Make a few quiet minutes before God."
  },
  {
    discipline: "Fasting",
    frequency: "weekly",
    days: ["Wednesday"],
    intention: "Fast from food gently and pray when hunger rises."
  },
  {
    discipline: "Sabbath",
    frequency: "weekly",
    days: ["Sunday"],
    intention: "Stop producing and receive the day."
  }
];

export type DisciplineGuidance = {
  description: string;
  practice: string;
};

export const disciplineGuidance: Record<string, DisciplineGuidance> = {
  Prayer: {
    description: "Prayer is honest attention to God. It can include thanks, confession, requests, silence, and listening.",
    practice: "Set a timer for 5 to 10 minutes. Speak plainly to God, then leave a minute at the end to be quiet."
  },
  Scripture: {
    description: "Scripture is slow listening to God through the Bible, not rushing to finish a chapter.",
    practice: "Read the suggested passage slowly. Notice one word, phrase, or invitation that stands out."
  },
  Silence: {
    description: "Silence is making room for God beneath the noise, hurry, and constant input of the day.",
    practice: "Sit still, breathe slowly, and gently return to God whenever your mind wanders."
  },
  Solitude: {
    description: "Solitude is stepping away from performance and noise so you can be with God as you are.",
    practice: "Take a short walk or sit alone without your phone. Let the quiet reveal what is happening inside."
  },
  Fasting: {
    description: "Fasting is setting aside a good thing for a time to remember that God is your deepest need.",
    practice: "Choose a gentle fast that fits your health and season: a meal, a snack, social media, or a purchase."
  },
  Sabbath: {
    description: "Sabbath is a rhythm of rest, worship, and delight that reminds you life is held by God.",
    practice: "Choose one block of time to stop producing. Do something restful that helps you receive the day."
  },
  Gratitude: {
    description: "Gratitude is noticing and naming gifts from God, especially ordinary ones you might rush past.",
    practice: "Write down three specific gifts from today and thank God for each one."
  },
  Simplicity: {
    description: "Simplicity is choosing enough instead of excess so your attention and desires can become freer.",
    practice: "Release one unnecessary input, purchase, task, or possession for today."
  },
  Service: {
    description: "Service is love made practical. It is choosing to bless someone without needing attention for it.",
    practice: "Do one quiet act of care: send encouragement, help with a task, give generously, or pray for someone."
  }
};

export const scriptureStudySuggestions = [
  {
    passage: "Psalm 23",
    focus: "Notice how God cares, leads, restores, and stays near."
  },
  {
    passage: "Matthew 5:1-12",
    focus: "Read the Beatitudes slowly and ask what kind of life Jesus is forming."
  },
  {
    passage: "John 15:1-11",
    focus: "Look for the invitation to abide rather than strive."
  },
  {
    passage: "Romans 8:31-39",
    focus: "Sit with the promise that nothing can separate you from God's love."
  },
  {
    passage: "Psalm 1",
    focus: "Compare the hurried life with the rooted life."
  },
  {
    passage: "Colossians 3:1-17",
    focus: "Notice what Paul says to put off, put on, and let rule your heart."
  },
  {
    passage: "Philippians 4:4-9",
    focus: "Pay attention to the link between prayer, peace, and practiced thoughts."
  },
  {
    passage: "Isaiah 40:28-31",
    focus: "Read for what God gives to the weary."
  },
  {
    passage: "Luke 10:38-42",
    focus: "Watch Jesus gently name the one necessary thing."
  },
  {
    passage: "1 Corinthians 13",
    focus: "Let love become the measure of maturity and practice."
  },
  {
    passage: "James 1:19-27",
    focus: "Notice how listening to the word becomes lived obedience."
  },
  {
    passage: "Ephesians 3:14-21",
    focus: "Pray Paul's words slowly for yourself."
  }
];

export function createPracticeFromDiscipline(discipline: string): RuleOfLifePractice {
  if (discipline === "Fasting") {
    return {
      discipline,
      frequency: "weekly",
      days: ["Wednesday"],
      intention: "Fast from food gently and pray when hunger rises."
    };
  }

  if (discipline === "Sabbath") {
    return {
      discipline,
      frequency: "weekly",
      days: ["Sunday"],
      intention: "Stop producing and receive the day."
    };
  }

  if (discipline === "Solitude" || discipline === "Service") {
    return {
      discipline,
      frequency: "weekly",
      days: ["Friday"],
      intention: "Make space for this practice without hurry."
    };
  }

  return {
    discipline,
    frequency: "daily",
    days: [],
    intention: "Practice this gently in ordinary life."
  };
}

export function normalizeRuleOfLifePractices(
  practices?: RuleOfLifePractice[] | null,
  oldDisciplines?: string[] | null
) {
  if (Array.isArray(practices) && practices.length > 0) {
    return practices;
  }

  if (Array.isArray(oldDisciplines) && oldDisciplines.length > 0) {
    return oldDisciplines.map((discipline) => createPracticeFromDiscipline(discipline));
  }

  return defaultRuleOfLifePractices;
}

export function getTodayWeekDay(date = new Date()): WeekDay {
  return weekDays[date.getDay()];
}

export function practiceBelongsToday(practice: RuleOfLifePractice, date = new Date()) {
  const today = getTodayWeekDay(date);

  if (practice.frequency === "daily") {
    return true;
  }

  if (practice.frequency === "weekly") {
    return practice.days.includes(today);
  }

  if (practice.frequency === "monthly") {
    return date.getDate() <= 7 && practice.days.includes(today);
  }

  return false;
}

export function getTodaysRulePractices(practices: RuleOfLifePractice[], date = new Date()) {
  return practices.filter((practice) => practiceBelongsToday(practice, date));
}

export function getUpcomingRulePractices(practices: RuleOfLifePractice[], date = new Date()) {
  const today = getTodayWeekDay(date);

  return practices.filter((practice) => {
    if (practice.frequency === "daily") {
      return false;
    }

    if (practice.frequency === "seasonal") {
      return true;
    }

    return !practice.days.includes(today);
  });
}
