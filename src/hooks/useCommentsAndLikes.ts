import { useState, useEffect } from "react";
import {
  getPostLikeCount,
  hasUserLikedPost,
  getCommentsForPost,
  togglePostLike,
} from "../storage/comments";

interface UseCommentsAndLikesProps {
  postIds: number[];
}

export const useCommentsAndLikes = ({ postIds }: UseCommentsAndLikesProps) => {
  const [postLikes, setPostLikes] = useState<{ [key: number]: boolean }>({});
  const [commentCounts, setCommentCounts] = useState<{ [key: number]: number }>(
    {}
  );
  const [likeCounts, setLikeCounts] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);

  const loadPostData = async () => {
    try {
      setLoading(true);
      const newPostLikes: { [key: number]: boolean } = {};
      const newCommentCounts: { [key: number]: number } = {};
      const newLikeCounts: { [key: number]: number } = {};

      for (const postId of postIds) {
        newPostLikes[postId] = await hasUserLikedPost(postId);
        const comments = await getCommentsForPost(postId);
        newCommentCounts[postId] = comments.length;
        newLikeCounts[postId] = await getPostLikeCount(postId);
      }

      setPostLikes(newPostLikes);
      setCommentCounts(newCommentCounts);
      setLikeCounts(newLikeCounts);
    } catch (error) {
      console.error("Error loading post data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: number) => {
    try {
      // Call the storage function to actually toggle the like
      const newLiked = await togglePostLike(postId);
      setPostLikes((prev) => ({ ...prev, [postId]: newLiked }));

      // Update the like count after toggling
      const newLikeCount = await getPostLikeCount(postId);
      setLikeCounts((prev) => ({ ...prev, [postId]: newLikeCount }));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const addNewPost = async (postId: number) => {
    setPostLikes((prev) => ({ ...prev, [postId]: false }));
    setCommentCounts((prev) => ({ ...prev, [postId]: 0 }));
    setLikeCounts((prev) => ({ ...prev, [postId]: 0 }));
  };

  const refreshCommentCount = async (postId: number) => {
    try {
      const comments = await getCommentsForPost(postId);
      setCommentCounts((prev) => ({ ...prev, [postId]: comments.length }));
    } catch (error) {
      console.error("Error refreshing comment count:", error);
    }
  };

  const reloadData = async () => {
    await loadPostData();
  };

  useEffect(() => {
    if (postIds.length > 0) {
      loadPostData();
    }
  }, [postIds.join(",")]);

  return {
    postLikes,
    commentCounts,
    likeCounts,
    loading,
    toggleLike,
    addNewPost,
    refreshCommentCount,
    reloadData,
  };
};
