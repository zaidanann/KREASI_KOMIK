export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "BANNED";
export type MediaType = "IMAGE" | "VIDEO";
export type NotificationType = "LIKE" | "COMMENT" | "REPLY" | "FOLLOW" | "MESSAGE";
export type ReportStatus = "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED";
export type ReportReason =
  | "SPAM"
  | "HARASSMENT"
  | "HATE_SPEECH"
  | "VIOLENCE"
  | "NUDITY"
  | "MISINFORMATION"
  | "OTHER";

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  profile?: {
    bio?: string | null;
    avatar?: string | null;
    cover?: string | null;
    website?: string | null;
    location?: string | null;
  } | null;
  _count?: {
    posts: number;
    followers: number;
    following: number;
  };
}

export interface PostWithDetails {
  id: string;
  caption?: string | null;
  isSensored: boolean;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    username: string;
    profile?: { avatar?: string | null } | null;
  };
  media: Array<{
    id: string;
    url: string;
    type: MediaType;
    width?: number | null;
    height?: number | null;
    duration?: number | null;
    order: number;
  }>;
  _count: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface CommentWithUser {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    username: string;
    profile?: { avatar?: string | null } | null;
  };
  replies?: ReplyWithUser[];
  _count?: { replies: number };
}

export interface ReplyWithUser {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    username: string;
    profile?: { avatar?: string | null } | null;
  };
}

export interface ChatMessage {
  id: string;
  content?: string | null;
  mediaUrl?: string | null;
  mediaType?: MediaType | null;
  isRead: boolean;
  createdAt: Date;
  sender: {
    id: string;
    name: string;
    username: string;
    profile?: { avatar?: string | null } | null;
  };
}
