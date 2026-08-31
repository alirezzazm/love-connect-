export type QuestionType = "choice" | "datetime";

/** زبان صفحهٔ دعوت. برای هر دعوت جدا در پنل ادمین انتخاب می‌شود. */
export type Locale = "fa" | "en";

export type QuestionInput = {
  step: number;
  type: QuestionType;
  prompt: string;
  options: string[];
};

export type InviteInput = {
  recipientName: string;
  senderName: string;
  locale: Locale;
  /** شناسهٔ تم ظاهری؛ مقادیر مجاز در lib/themes.ts */
  theme: string;
  headline: string;
  closingNote: string;
  active: boolean;
  questions: QuestionInput[];
};

/** یک جوابِ ثبت‌شده برای یک سؤال */
export type AnswerRecord = {
  step: number;
  prompt: string;
  answer: string;
};
