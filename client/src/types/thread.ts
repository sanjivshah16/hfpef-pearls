export interface Media {
  type: 'image' | 'video';
  path: string;
  remote?: boolean;
}

export interface Tweet {
  date: string;
  timestamp: number;
  text: string;
  media: Media[];
}

export interface Thread {
  id: string;
  type: 'thread' | 'single';
  date: string;
  year: number;
  tweet_count: number;
  is_pearl: boolean;
  categories: string[];
  media: Media[];
  tweets: Tweet[];
}

export type Category = 
  | 'Pearl'
  | 'Tweetorial'
  | 'Case Study'
  | 'Echo'
  | 'Hemodynamics'
  | 'Treatment'
  | 'Diagnosis'
  | 'Video'
  | 'Image'
  | 'General';
