import { api } from '@/lib/axios';
import type {
  ForumsResponse,
  ForumResponse,
  ForumStatsResponse,
  CreateForumRequest,
  UpdateForumRequest,
  CategoriesResponse,
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ThreadsResponse,
  ThreadResponse,
  CreateThreadRequest,
  UpdateThreadRequest,
  ThreadFilters,
  PostsResponse,
  PostResponse,
  CreatePostRequest,
  UpdatePostRequest,
  PostFilters,
  ReactionsResponse,
  DeleteResponse,
  ReactionType,
} from '@/types/forum.types';

export const forumService = {
  // ============= FORUMS =============

  /**
   * Get all accessible forums
   */
  getForums: async (): Promise<ForumsResponse> => {
    const { data } = await api.get<ForumsResponse>('/forums');
    return data;
  },

  /**
   * Get forum by ID
   */
  getForumById: async (forumId: number): Promise<ForumResponse> => {
    const { data } = await api.get<ForumResponse>(`/forums/${forumId}`);
    return data;
  },

  /**
   * Create a new forum
   */
  createForum: async (forumData: CreateForumRequest): Promise<ForumResponse> => {
    const { data } = await api.post<ForumResponse>('/forums', forumData);
    return data;
  },

  /**
   * Update forum
   */
  updateForum: async (forumId: number, updates: UpdateForumRequest): Promise<ForumResponse> => {
    const { data } = await api.put<ForumResponse>(`/forums/${forumId}`, updates);
    return data;
  },

  /**
   * Delete forum
   */
  deleteForum: async (forumId: number): Promise<DeleteResponse> => {
    const { data } = await api.delete<DeleteResponse>(`/forums/${forumId}`);
    return data;
  },

  /**
   * Get forum statistics
   */
  getForumStats: async (forumId: number): Promise<ForumStatsResponse> => {
    const { data } = await api.get<ForumStatsResponse>(`/forums/${forumId}/stats`);
    return data;
  },

  // ============= CATEGORIES =============

  /**
   * Get all categories for a forum
   */
  getCategories: async (forumId: number): Promise<CategoriesResponse> => {
    const { data } = await api.get<CategoriesResponse>(`/forums/${forumId}/categories`);
    return data;
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (forumId: number, categoryId: number): Promise<CategoryResponse> => {
    const { data } = await api.get<CategoryResponse>(`/forums/${forumId}/categories/${categoryId}`);
    return data;
  },

  /**
   * Create a new category
   */
  createCategory: async (forumId: number, categoryData: CreateCategoryRequest): Promise<CategoryResponse> => {
    const { data } = await api.post<CategoryResponse>(`/forums/${forumId}/categories`, categoryData);
    return data;
  },

  /**
   * Update category
   */
  updateCategory: async (forumId: number, categoryId: number, updates: UpdateCategoryRequest): Promise<CategoryResponse> => {
    const { data } = await api.put<CategoryResponse>(`/forums/${forumId}/categories/${categoryId}`, updates);
    return data;
  },

  /**
   * Delete category
   */
  deleteCategory: async (forumId: number, categoryId: number): Promise<DeleteResponse> => {
    const { data } = await api.delete<DeleteResponse>(`/forums/${forumId}/categories/${categoryId}`);
    return data;
  },

  // ============= THREADS =============

  /**
   * Get all threads for a forum
   */
  getThreads: async (forumId: number, filters?: ThreadFilters): Promise<ThreadsResponse> => {
    const { data } = await api.get<ThreadsResponse>(`/forums/${forumId}/threads`, {
      params: filters,
    });
    return data;
  },

  /**
   * Get thread by ID
   */
  getThreadById: async (forumId: number, threadId: string): Promise<ThreadResponse> => {
    const { data } = await api.get<ThreadResponse>(`/forums/${forumId}/threads/${threadId}`);
    return data;
  },

  /**
   * Create a new thread
   */
  createThread: async (forumId: number, threadData: CreateThreadRequest): Promise<ThreadResponse> => {
    const { data } = await api.post<ThreadResponse>(`/forums/${forumId}/threads`, threadData);
    return data;
  },

  /**
   * Update thread
   */
  updateThread: async (forumId: number, threadId: string, updates: UpdateThreadRequest): Promise<ThreadResponse> => {
    const { data } = await api.put<ThreadResponse>(`/forums/${forumId}/threads/${threadId}`, updates);
    return data;
  },

  /**
   * Delete thread
   */
  deleteThread: async (forumId: number, threadId: string): Promise<DeleteResponse> => {
    const { data } = await api.delete<DeleteResponse>(`/forums/${forumId}/threads/${threadId}`);
    return data;
  },

  // ============= POSTS =============

  /**
   * Get all posts for a thread
   */
  getPosts: async (forumId: number, threadId: string, filters?: PostFilters): Promise<PostsResponse> => {
    const { data } = await api.get<PostsResponse>(`/forums/${forumId}/threads/${threadId}/posts`, {
      params: filters,
    });
    return data;
  },

  /**
   * Get post by ID
   */
  getPostById: async (forumId: number, threadId: string, postId: string): Promise<PostResponse> => {
    const { data } = await api.get<PostResponse>(`/forums/${forumId}/threads/${threadId}/posts/${postId}`);
    return data;
  },

  /**
   * Create a new post (reply)
   */
  createPost: async (forumId: number, threadId: string, postData: CreatePostRequest): Promise<PostResponse> => {
    const { data } = await api.post<PostResponse>(`/forums/${forumId}/threads/${threadId}/posts`, postData);
    return data;
  },

  /**
   * Update post
   */
  updatePost: async (forumId: number, threadId: string, postId: string, updates: UpdatePostRequest): Promise<PostResponse> => {
    const { data } = await api.put<PostResponse>(`/forums/${forumId}/threads/${threadId}/posts/${postId}`, updates);
    return data;
  },

  /**
   * Delete post
   */
  deletePost: async (forumId: number, threadId: string, postId: string): Promise<DeleteResponse> => {
    const { data } = await api.delete<DeleteResponse>(`/forums/${forumId}/threads/${threadId}/posts/${postId}`);
    return data;
  },

  // ============= REACTIONS =============

  /**
   * Get all reactions for a post
   */
  getReactions: async (forumId: number, threadId: string, postId: string): Promise<ReactionsResponse> => {
    const { data } = await api.get<ReactionsResponse>(`/forums/${forumId}/threads/${threadId}/posts/${postId}/reactions`);
    return data;
  },

  /**
   * Add a reaction to a post
   */
  addReaction: async (forumId: number, threadId: string, postId: string, reactionType: ReactionType): Promise<PostResponse> => {
    const { data } = await api.post<PostResponse>(`/forums/${forumId}/threads/${threadId}/posts/${postId}/reactions`, {
      reactionType,
    });
    return data;
  },

  /**
   * Remove a reaction from a post
   */
  removeReaction: async (forumId: number, threadId: string, postId: string, reactionType: ReactionType): Promise<DeleteResponse> => {
    const { data } = await api.delete<DeleteResponse>(`/forums/${forumId}/threads/${threadId}/posts/${postId}/reactions/${reactionType}`);
    return data;
  },
};
