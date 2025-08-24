import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import { v4 as uuid } from "uuid";

export interface Comment {
  id: string;
  postId: number;
  user: string;
  content: string;
  image?: string; // Base64 encoded image or image URI
  createdAt: number;
  likes: number;
  replies: Reply[];
}

export interface Reply {
  id: string;
  commentId: string;
  user: string;
  content: string;
  image?: string; // Base64 encoded image or image URI
  createdAt: number;
  likes: number;
}

export interface PostLike {
  postId: number;
  userId: string;
  createdAt: number;
}

export interface CommentLike {
  commentId: string;
  userId: string;
  createdAt: number;
}

export interface ReplyLike {
  replyId: string;
  userId: string;
  createdAt: number;
}

const COMMENTS_KEY = "comments:items";
const POST_LIKES_KEY = "likes:posts";
const COMMENT_LIKES_KEY = "likes:comments";
const REPLY_LIKES_KEY = "likes:replies";

// Generate a unique user ID for this device
const getUserId = async (): Promise<string> => {
  const userIdKey = "user:deviceId";
  let userId = await AsyncStorage.getItem(userIdKey);

  if (!userId) {
    userId = uuid();
    await AsyncStorage.setItem(userIdKey, userId);
  }

  return userId;
};

// Get a persistent device ID that doesn't change on logout/login
const getDeviceId = async (): Promise<string> => {
  const deviceIdKey = "device:persistentId";
  let deviceId = await AsyncStorage.getItem(deviceIdKey);

  if (!deviceId) {
    deviceId = uuid();
    await AsyncStorage.setItem(deviceIdKey, deviceId);
  }

  return deviceId;
};

/**
 * Save a new comment
 */
export const saveComment = async (
  postId: number,
  content: string,
  user: string = "You",
  image?: string
): Promise<Comment> => {
  try {
    console.log("saveComment called with:", { postId, content, user, image });

    const comment: Comment = {
      id: uuid(),
      postId,
      user,
      content: content.trim(),
      image,
      createdAt: Date.now(),
      likes: 0,
      replies: [],
    };

    console.log("Comment object created:", comment);
    console.log("Comment has image:", !!comment.image);
    console.log("Image value:", comment.image);

    const existingComments = await getComments();
    const updatedComments = [...existingComments, comment];

    await AsyncStorage.setItem(COMMENTS_KEY, JSON.stringify(updatedComments));
    console.log("Comment saved successfully:", comment);
    console.log("Saved comment has image:", !!comment.image);
    return comment;
  } catch (error) {
    console.error("Error saving comment:", error);
    throw new Error("Failed to save comment");
  }
};

/**
 * Save a new reply to a comment
 */
export const saveReply = async (
  commentId: string,
  content: string,
  user: string = "You",
  image?: string
): Promise<Reply> => {
  try {
    const reply: Reply = {
      id: uuid(),
      commentId,
      user,
      content: content.trim(),
      image,
      createdAt: Date.now(),
      likes: 0,
    };

    const existingComments = await getComments();
    const commentIndex = existingComments.findIndex((c) => c.id === commentId);

    if (commentIndex === -1) {
      throw new Error("Comment not found");
    }

    existingComments[commentIndex].replies.push(reply);
    await AsyncStorage.setItem(COMMENTS_KEY, JSON.stringify(existingComments));

    console.log("Reply saved successfully:", reply);
    return reply;
  } catch (error) {
    console.error("Error saving reply:", error);
    throw new Error("Failed to save reply");
  }
};

/**
 * Get all comments for a specific post
 */
export const getCommentsForPost = async (
  postId: number
): Promise<Comment[]> => {
  try {
    const allComments = await getComments();
    return allComments
      .filter((comment) => comment.postId === postId)
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Error getting comments for post:", error);
    return [];
  }
};

/**
 * Get all comments
 */
export const getComments = async (): Promise<Comment[]> => {
  try {
    const raw = await AsyncStorage.getItem(COMMENTS_KEY);
    const comments = raw ? (JSON.parse(raw) as Comment[]) : [];

    console.log("Raw comments from storage:", comments);
    console.log(
      "Comments with images:",
      comments.filter((c) => c.image).map((c) => ({ id: c.id, image: c.image }))
    );

    // Ensure all comments have the replies property
    const migratedComments = comments.map((comment) => ({
      ...comment,
      replies: comment.replies || [],
    }));

    // Save migrated comments back to storage if any were missing replies
    if (
      comments.length !== migratedComments.length ||
      comments.some((c) => !c.replies) !==
        migratedComments.some((c) => !c.replies)
    ) {
      await AsyncStorage.setItem(
        COMMENTS_KEY,
        JSON.stringify(migratedComments)
      );
    }

    console.log("Returning migrated comments:", migratedComments.length);
    return migratedComments;
  } catch (error) {
    console.error("Error getting comments:", error);
    return [];
  }
};

/**
 * Delete a comment
 */
export const deleteComment = async (commentId: string): Promise<void> => {
  try {
    // Delete the comment
    const existingComments = await getComments();
    const updatedComments = existingComments.filter(
      (comment) => comment.id !== commentId
    );
    await AsyncStorage.setItem(COMMENTS_KEY, JSON.stringify(updatedComments));

    // Also delete all likes for this comment
    const existingLikes = await getCommentLikes();
    const updatedLikes = existingLikes.filter(
      (like) => like.commentId !== commentId
    );
    await AsyncStorage.setItem(COMMENT_LIKES_KEY, JSON.stringify(updatedLikes));

    console.log(
      `Deleted comment ${commentId} and its ${
        existingLikes.length - updatedLikes.length
      } likes`
    );
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw new Error("Failed to delete comment");
  }
};

/**
 * Delete a reply
 */
export const deleteReply = async (
  commentId: string,
  replyId: string
): Promise<void> => {
  try {
    const existingComments = await getComments();
    const commentIndex = existingComments.findIndex((c) => c.id === commentId);

    if (commentIndex === -1) {
      throw new Error("Comment not found");
    }

    // Remove the reply from the comment
    existingComments[commentIndex].replies = existingComments[
      commentIndex
    ].replies.filter((reply) => reply.id !== replyId);

    await AsyncStorage.setItem(COMMENTS_KEY, JSON.stringify(existingComments));

    // Also delete all likes for this reply
    const existingLikes = await getReplyLikes();
    const updatedLikes = existingLikes.filter(
      (like) => like.replyId !== replyId
    );
    await AsyncStorage.setItem(REPLY_LIKES_KEY, JSON.stringify(updatedLikes));

    console.log(`Deleted reply ${replyId} from comment ${commentId}`);
  } catch (error) {
    console.error("Error deleting reply:", error);
    throw new Error("Failed to delete reply");
  }
};

/**
 * Toggle like on a post
 */
export const togglePostLike = async (postId: number): Promise<boolean> => {
  try {
    const userId = await getUserId();
    const existingLikes = await getPostLikes();

    const existingLikeIndex = existingLikes.findIndex(
      (like) => like.postId === postId && like.userId === userId
    );

    if (existingLikeIndex >= 0) {
      // Remove like
      existingLikes.splice(existingLikeIndex, 1);
      await AsyncStorage.setItem(POST_LIKES_KEY, JSON.stringify(existingLikes));
      return false;
    } else {
      // Add like
      const newLike: PostLike = {
        postId,
        userId,
        createdAt: Date.now(),
      };
      existingLikes.push(newLike);
      await AsyncStorage.setItem(POST_LIKES_KEY, JSON.stringify(existingLikes));
      return true;
    }
  } catch (error) {
    console.error("Error toggling post like:", error);
    throw new Error("Failed to toggle post like");
  }
};

/**
 * Check if current user has liked a post
 */
export const hasUserLikedPost = async (postId: number): Promise<boolean> => {
  try {
    const userId = await getUserId();
    const existingLikes = await getPostLikes();
    return existingLikes.some(
      (like) => like.postId === postId && like.userId === userId
    );
  } catch (error) {
    console.error("Error checking post like status:", error);
    return false;
  }
};

/**
 * Get like count for a post
 */
export const getPostLikeCount = async (postId: number): Promise<number> => {
  try {
    const existingLikes = await getPostLikes();
    return existingLikes.filter((like) => like.postId === postId).length;
  } catch (error) {
    console.error("Error getting post like count:", error);
    return 0;
  }
};

/**
 * Get all post likes
 */
export const getPostLikes = async (): Promise<PostLike[]> => {
  try {
    const raw = await AsyncStorage.getItem(POST_LIKES_KEY);
    return raw ? (JSON.parse(raw) as PostLike[]) : [];
  } catch (error) {
    console.error("Error getting post likes:", error);
    return [];
  }
};

/**
 * Toggle like on a comment
 */
export const toggleCommentLike = async (
  commentId: string
): Promise<boolean> => {
  try {
    const userId = await getUserId();
    const existingLikes = await getCommentLikes();

    console.log(`Toggling like for comment ${commentId} by user ${userId}`);
    console.log("Existing likes before toggle:", existingLikes);

    const existingLikeIndex = existingLikes.findIndex(
      (like) => like.commentId === commentId && like.userId === userId
    );

    if (existingLikeIndex >= 0) {
      // Remove like
      console.log("Removing like - user already liked this comment");
      existingLikes.splice(existingLikeIndex, 1);
      await AsyncStorage.setItem(
        COMMENT_LIKES_KEY,
        JSON.stringify(existingLikes)
      );
      console.log("Likes after removal:", existingLikes);
      return false;
    } else {
      // Add like
      console.log("Adding like - user hasn't liked this comment yet");
      const newLike: CommentLike = {
        commentId,
        userId,
        createdAt: Date.now(),
      };
      existingLikes.push(newLike);
      await AsyncStorage.setItem(
        COMMENT_LIKES_KEY,
        JSON.stringify(existingLikes)
      );
      console.log("Likes after addition:", existingLikes);
      return true;
    }
  } catch (error) {
    console.error("Error toggling comment like:", error);
    throw new Error("Failed to toggle comment like");
  }
};

/**
 * Toggle like on a reply
 */
export const toggleReplyLike = async (replyId: string): Promise<boolean> => {
  try {
    const userId = await getUserId();
    const existingLikes = await getReplyLikes();

    console.log(`Toggling like for reply ${replyId} by user ${userId}`);

    const existingLikeIndex = existingLikes.findIndex(
      (like) => like.replyId === replyId && like.userId === userId
    );

    if (existingLikeIndex >= 0) {
      // Remove like
      existingLikes.splice(existingLikeIndex, 1);
      await AsyncStorage.setItem(
        REPLY_LIKES_KEY,
        JSON.stringify(existingLikes)
      );
      return false;
    } else {
      // Add like
      const newLike: ReplyLike = {
        replyId,
        userId,
        createdAt: Date.now(),
      };
      existingLikes.push(newLike);
      await AsyncStorage.setItem(
        REPLY_LIKES_KEY,
        JSON.stringify(existingLikes)
      );
      return true;
    }
  } catch (error) {
    console.error("Error toggling reply like:", error);
    throw new Error("Failed to toggle reply like");
  }
};

/**
 * Get the actual current like count for a comment (for debugging)
 */
export const getActualCommentLikeCount = async (
  commentId: string
): Promise<number> => {
  try {
    const existingLikes = await getCommentLikes();
    const count = existingLikes.filter(
      (like) => like.commentId === commentId
    ).length;
    console.log(`Actual like count for comment ${commentId}:`, count);
    return count;
  } catch (error) {
    console.error("Error getting actual comment like count:", error);
    return 0;
  }
};

/**
 * Get the actual current like count for a reply
 */
export const getActualReplyLikeCount = async (
  replyId: string
): Promise<number> => {
  try {
    const existingLikes = await getReplyLikes();
    const count = existingLikes.filter(
      (like) => like.replyId === replyId
    ).length;
    console.log(`Actual like count for reply ${replyId}:`, count);
    return count;
  } catch (error) {
    console.error("Error getting actual reply like count:", error);
    return 0;
  }
};

/**
 * Check if current user has liked a comment
 */
export const hasUserLikedComment = async (
  commentId: string
): Promise<boolean> => {
  try {
    const userId = await getUserId();
    const existingLikes = await getCommentLikes();
    return existingLikes.some(
      (like) => like.commentId === commentId && like.userId === userId
    );
  } catch (error) {
    console.error("Error checking comment like status:", error);
    return false;
  }
};

/**
 * Check if current user has liked a reply
 */
export const hasUserLikedReply = async (replyId: string): Promise<boolean> => {
  try {
    const userId = await getUserId();
    const existingLikes = await getReplyLikes();
    return existingLikes.some(
      (like) => like.replyId === replyId && like.userId === userId
    );
  } catch (error) {
    console.error("Error checking reply like status:", error);
    return false;
  }
};

/**
 * Get like count for a comment
 */
export const getCommentLikeCount = async (
  commentId: string
): Promise<number> => {
  try {
    const existingLikes = await getCommentLikes();
    const count = existingLikes.filter(
      (like) => like.commentId === commentId
    ).length;
    console.log(`Comment ${commentId} like count:`, count);
    return count;
  } catch (error) {
    console.error("Error getting comment like count:", error);
    return 0;
  }
};

/**
 * Get like count for a reply
 */
export const getReplyLikeCount = async (replyId: string): Promise<number> => {
  try {
    const existingLikes = await getReplyLikes();
    const count = existingLikes.filter(
      (like) => like.replyId === replyId
    ).length;
    console.log(`Reply ${replyId} like count:`, count);
    return count;
  } catch (error) {
    console.error("Error getting reply like count:", error);
    return 0;
  }
};

/**
 * Get all comment likes
 */
export const getCommentLikes = async (): Promise<CommentLike[]> => {
  try {
    const raw = await AsyncStorage.getItem(COMMENT_LIKES_KEY);
    return raw ? (JSON.parse(raw) as CommentLike[]) : [];
  } catch (error) {
    console.error("Error getting comment likes:", error);
    return [];
  }
};

/**
 * Get all reply likes
 */
export const getReplyLikes = async (): Promise<ReplyLike[]> => {
  try {
    const raw = await AsyncStorage.getItem(REPLY_LIKES_KEY);
    return raw ? (JSON.parse(raw) as ReplyLike[]) : [];
  } catch (error) {
    console.error("Error getting reply likes:", error);
    return [];
  }
};

/**
 * Clear all comments and likes (for testing or logout)
 */
export const clearAllCommentsAndLikes = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      COMMENTS_KEY,
      POST_LIKES_KEY,
      COMMENT_LIKES_KEY,
      REPLY_LIKES_KEY,
    ]);
  } catch (error) {
    console.error("Error clearing comments and likes:", error);
    throw new Error("Failed to clear comments and likes");
  }
};

/**
 * Clear only user-specific data (likes) but keep comments persistent
 */
export const clearUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      POST_LIKES_KEY,
      COMMENT_LIKES_KEY,
      REPLY_LIKES_KEY,
    ]);
    console.log("User data cleared (likes only), comments preserved");
  } catch (error) {
    console.error("Error clearing user data:", error);
    throw new Error("Failed to clear user data");
  }
};

/**
 * Debug function to check storage state
 */
export const debugStorage = async (): Promise<void> => {
  try {
    const comments = await getComments();
    const postLikes = await getPostLikes();
    const commentLikes = await getCommentLikes();
    const replyLikes = await getReplyLikes();
    const userId = await getUserId();

    console.log("=== Storage Debug Info ===");
    console.log("User ID:", userId);
    console.log("Total Comments:", comments.length);
    console.log("Total Post Likes:", postLikes.length);
    console.log("Total Comment Likes:", commentLikes.length);
    console.log("Total Reply Likes:", replyLikes.length);
    console.log("Comments:", comments);
    console.log("Post Likes:", postLikes);
    console.log("Comment Likes:", commentLikes);
    console.log("Reply Likes:", replyLikes);
    console.log("==========================");
  } catch (error) {
    console.error("Error debugging storage:", error);
  }
};

/**
 * Reset all like data (for debugging)
 */
export const resetAllLikes = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      POST_LIKES_KEY,
      COMMENT_LIKES_KEY,
      REPLY_LIKES_KEY,
    ]);
    console.log("All like data reset successfully");
  } catch (error) {
    console.error("Error resetting like data:", error);
    throw new Error("Failed to reset like data");
  }
};

/**
 * Test function to create a comment with image (for debugging)
 */
export const createTestCommentWithImage = async (
  postId: number
): Promise<Comment> => {
  try {
    const testImageUrl = "https://picsum.photos/400/300";
    console.log("Creating test comment with image:", testImageUrl);

    const comment = await saveComment(
      postId,
      "This is a test comment with an image!",
      "TestUser",
      testImageUrl
    );

    console.log("Test comment created:", comment);
    return comment;
  } catch (error) {
    console.error("Error creating test comment:", error);
    throw new Error("Failed to create test comment");
  }
};
