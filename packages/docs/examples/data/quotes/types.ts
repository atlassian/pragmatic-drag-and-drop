export type Position = {
  x: number;
  y: number;
};

export type Author = {
  id: string;
  name: string;
  avatarUrl: string;
  url: string;
  colors: {
    soft: string;
    hard: string;
  };
};

export type Quote = {
  id: string;
  content: string;
  author: Author;
};

export type AuthorQuoteMap = {
  [key: string]: Quote[];
};
