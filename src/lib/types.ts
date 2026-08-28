export type Gender = "female" | "male";

export type Profile = {
  id: string;
  name: string;
  age: number;
  city: string;
  gender: Gender;
  job: string;
  bio: string;
  interests: string[];
  /** دو رنگ برای گرادیانِ کارت — به‌جای عکس واقعی، تا پروژه به فایل خارجی وابسته نباشد */
  colors: [string, string];
  /** آیا این پروفایل هم ما را لایک کرده؟ تعیین می‌کند لایک ما به مچ تبدیل شود یا نه */
  likesYouBack: boolean;
};

export type Message = {
  id: string;
  matchId: string;
  from: "me" | "them";
  text: string;
  at: number;
};

export type Decision = "like" | "pass";
