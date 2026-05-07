export type TimeRecord = {
  id: string;
  categoryId: string;
  note: string;
  isRunning: boolean;
  startedAt: string;
  endedAt: string | null;
  // 兼容旧数据和轻量展示，核心计算以 startedAt / endedAt 为准。
  date: string;
  startTime: string;
  endTime: string | null;
};

export type Category = {
  id: string;
  name: string;
  emoji: string;
  color: string;
};

export type TimeRecordSegment = {
  record: TimeRecord;
  logicalDay: string;
  segmentStart: Date;
  segmentEnd: Date;
  minutes: number;
  isRunning: boolean;
};
