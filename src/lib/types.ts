export type QuestionType = "choice" | "datetime";

export type QuestionInput = {
  step: number;
  type: QuestionType;
  prompt: string;
  options: string[];
};

export type InviteInput = {
  recipientName: string;
  senderName: string;
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
