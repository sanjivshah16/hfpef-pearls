export interface TweetMedia {
  type: 'photo' | 'video' | 'animated_gif';
  media_url: string;
  url: string;
  expanded_url: string;
  display_url: string;
  local_path?: string;
  video_url?: string;
}

export interface TweetUrl {
  url: string;
  expanded_url: string;
  display_url: string;
}

export interface BaseTweet {
  id: string;
  date: string;
  year: number;
  text: string;
  likes: number;
  retweets: number;
  replies: number;
  categories: string[];
  is_pearl: boolean;
  hashtags: string[];
  media: TweetMedia[];
  urls: TweetUrl[];
  tweet_url: string;
}

export interface SingleTweet extends BaseTweet {
  type: 'single';
}

export interface ThreadTweet {
  type: 'thread';
  id: string;
  date: string;
  year: number;
  title: string;
  tweets: BaseTweet[];
  tweet_count: number;
  is_pearl: boolean;
  categories: string[];
  hashtags: string[];
  media: TweetMedia[];
  total_likes: number;
  total_retweets: number;
  tweet_url: string;
}

export type TweetItem = SingleTweet | ThreadTweet;

export type CategoryType = 
  | 'All'
  | 'Pearl'
  | 'Image'
  | 'Video'
  | 'Echo'
  | 'Case Study'
  | 'Hemodynamics'
  | 'General';

export interface FilterState {
  category: CategoryType;
  year: number | null;
  searchQuery: string;
  showPearlsOnly: boolean;
}
