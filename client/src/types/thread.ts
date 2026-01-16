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

// Answer can contain text and/or media
export interface Answer {
  text?: string;
  media?: Media[];
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
  // Optional answer field - shown only when user clicks "Answer" button
  answer?: Answer;
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
