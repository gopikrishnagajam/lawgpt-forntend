// Forum Types

export type ForumType = 'organizational' | 'lawyer_advice';
export type ReactionType = 'like' | 'helpful' | 'insightful';

// User info in forum responses
export interface ForumUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

// Organization info in forum responses
export interface ForumOrganization {
  id: number;
  name: string;
}

// Forum
export interface Forum {
  id: number;
  name: string;
  description?: string;
  type: ForumType;
  organizationId?: number;
  createdByUserId: number;
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  organization?: ForumOrganization;
  creator?: ForumUser;
}

export interface CreateForumRequest {
  name: string;
  description?: string;
  type: ForumType;
}

export interface UpdateForumRequest {
  name?: string;
  description?: string;
  settings?: Record<string, unknown>;
}

export interface ForumStats {
  forumId: number;
  categoryCount: number;
  threadCount: number;
}

// Forum Category
export interface ForumCategory {
  id: number;
  forumId: number;
  name: string;
  description?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  displayOrder?: number;
}

// Forum Thread
export interface ForumThread {
  id: string;
  forumId: number;
  categoryId?: number;
  userId: number;
  title: string;
  content: string;
  isPinned: boolean;
  isClosed: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  user?: ForumUser;
  category?: ForumCategory;
  forum?: Forum;
}

export interface CreateThreadRequest {
  categoryId?: number;
  title: string;
  content: string;
}

export interface UpdateThreadRequest {
  title?: string;
  content?: string;
  isPinned?: boolean;
  isClosed?: boolean;
}

export interface ThreadFilters {
  categoryId?: number;
  search?: string;
  isPinned?: boolean;
  limit?: number;
  offset?: number;
}

// Forum Post
export interface ForumPost {
  id: string;
  threadId: string;
  userId: number;
  content: string;
  parentPostId?: string;
  createdAt: string;
  updatedAt: string;
  user?: ForumUser;
  parentPost?: {
    id: string;
    content: string;
    userId: number;
    user?: {
      id: number;
      firstName: string;
      lastName: string;
    };
  };
  replies?: { id: string }[];
  reactions?: ForumPostReaction[];
  reactionCounts?: {
    like?: number;
    helpful?: number;
    insightful?: number;
  };
  userReactions?: ReactionType[];
  replyCount?: number;
}

export interface CreatePostRequest {
  content: string;
  parentPostId?: string;
}

export interface UpdatePostRequest {
  content: string;
}

export interface PostFilters {
  limit?: number;
  offset?: number;
}

// Forum Post Reaction
export interface ForumPostReaction {
  id: string;
  postId: string;
  userId: number;
  reactionType: ReactionType;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ForumsResponse {
  success: boolean;
  data: Forum[];
}

export interface ForumResponse {
  success: boolean;
  data: Forum;
}

export interface ForumStatsResponse {
  success: boolean;
  data: ForumStats;
}

export interface CategoriesResponse {
  success: boolean;
  data: ForumCategory[];
}

export interface CategoryResponse {
  success: boolean;
  data: ForumCategory;
}

export interface ThreadsResponse {
  success: boolean;
  data: ForumThread[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ThreadResponse {
  success: boolean;
  data: ForumThread;
}

export interface PostsResponse {
  success: boolean;
  data: ForumPost[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface PostResponse {
  success: boolean;
  data: ForumPost;
}

export interface ReactionsResponse {
  success: boolean;
  data: ForumPostReaction[];
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}
