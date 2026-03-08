export type Entry = {
  id: string;
  userId: string;
  audioPath: string;
  audioUrl?: string;
  duration: number;
  createdAt: number;
  synced: boolean;
};
