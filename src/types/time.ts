export type TimeRecord = {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  categoryId: string;
  note: string;
  isRunning: boolean;
};

export type Category = {
  id: string;
  name: string;
  emoji: string;
  color: string;
};
