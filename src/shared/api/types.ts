export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ImageObject {
  id: number;
  image: string;
}

export interface FutureEvent {
  id: number;
  name: string;
  description: string;
  images: ImageObject[];
  place: string;
  date_range?: string;
  start_datetime: string;
  end_datetime?: string | null;
  registration_link?: string | null;
  color?: string;
  precision?: string;
}

export interface PastEvent {
  id: number;
  name: string;
  description: string;
  images: ImageObject[];
  start_datetime: string;
  place: string;
  end_datetime?: string | null;
  album_link?: string | null;
  report_link?: string | null;
  color: string;
  precision?: string;
}

export interface News {
  id: number;
  title: string;
  description: string;
  cover_url: string;
  created_at: string;
}

export interface Partner {
  id: number;
  name: string;
  url: string;
  image: string;
}

export interface ContactMember {
  id: number;
  name: string;
  role: string;
  avatar_url: string;
}
