import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  Comment,
  Reply,
  saveComment,
  saveReply,
  getCommentsForPost,
  deleteComment,
  deleteReply,
  toggleCommentLike,
  toggleReplyLike,
  hasUserLikedComment,
  hasUserLikedReply,
  getActualCommentLikeCount,
  getActualReplyLikeCount,
  debugStorage,
  resetAllLikes,
  createTestCommentWithImage,
} from "../storage/comments";

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  postId: number;
}

const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  onClose,
  postId,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [commentLikes, setCommentLikes] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [replyLikes, setReplyLikes] = useState<{ [key: string]: boolean }>({});
  const [commentLikeCounts, setCommentLikeCounts] = useState<{
    [key: string]: number;
  }>({});
  const [replyLikeCounts, setReplyLikeCounts] = useState<{
    [key: string]: number;
  }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [commentImage, setCommentImage] = useState<string | null>(null);
  const [replyImage, setReplyImage] = useState<string | null>(null);

  const loadComments = async () => {
    try {
      setLoading(true);
      const fetchedComments = await getCommentsForPost(postId);
      console.log(
        "Loaded comments:",
        fetchedComments.map((c) => ({
          id: c.id,
          hasImage: !!c.image,
          image: c.image,
        }))
      );
      setComments(fetchedComments);

      // Load like status and counts for all comments
      const newCommentLikes: { [key: string]: boolean } = {};
      const newCommentLikeCounts: { [key: string]: number } = {};
      const newReplyLikes: { [key: string]: boolean } = {};
      const newReplyLikeCounts: { [key: string]: number } = {};

      for (const comment of fetchedComments) {
        newCommentLikes[comment.id] = await hasUserLikedComment(comment.id);
        newCommentLikeCounts[comment.id] = await getActualCommentLikeCount(
          comment.id
        );

        // Load like status and counts for replies
        if (comment.replies && Array.isArray(comment.replies)) {
          for (const reply of comment.replies) {
            newReplyLikes[reply.id] = await hasUserLikedReply(reply.id);
            newReplyLikeCounts[reply.id] = await getActualReplyLikeCount(
              reply.id
            );
          }
        }
      }

      setCommentLikes(newCommentLikes);
      setCommentLikeCounts(newCommentLikeCounts);
      setReplyLikes(newReplyLikes);
      setReplyLikeCounts(newReplyLikeCounts);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadComments();
    }
  }, [visible, postId]);

  const handleAddComment = async () => {
    if (!newComment.trim() && !commentImage) return;

    try {
      console.log("Adding comment with image:", commentImage);
      const comment = await saveComment(
        postId,
        newComment,
        "You",
        commentImage || undefined
      );
      console.log("Comment saved with image:", comment.image);
      setComments((prev) => [comment, ...prev]);
      setNewComment("");
      setCommentImage(null);
      setCommentLikes((prev) => ({ ...prev, [comment.id]: false }));
      setCommentLikeCounts((prev) => ({ ...prev, [comment.id]: 0 }));
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment");
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!replyText.trim() && !replyImage) return;

    try {
      const reply = await saveReply(
        commentId,
        replyText,
        "You",
        replyImage || undefined
      );
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: [...(comment.replies || []), reply] }
            : comment
        )
      );
      setReplyText("");
      setReplyImage(null);
      setReplyingTo(null);
      setReplyLikes((prev) => ({ ...prev, [reply.id]: false }));
      setReplyLikeCounts((prev) => ({ ...prev, [reply.id]: 0 }));
    } catch (error) {
      console.error("Error adding reply:", error);
      Alert.alert("Error", "Failed to add reply");
    }
  };

  const handleSubmitComment = () => {
    handleAddComment();
  };

  const handleSubmitReply = () => {
    if (replyingTo) {
      handleAddReply(replyingTo);
    }
  };

  const pickImage = async (isReply: boolean = false) => {
    try {
      console.log("Picking image for:", isReply ? "reply" : "comment");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log("Image picker result:", result);
      if (!result.canceled && result.assets[0]) {
        console.log("Selected image URI:", result.assets[0].uri);
        if (isReply) {
          setReplyImage(result.assets[0].uri);
          console.log("Set reply image to:", result.assets[0].uri);
        } else {
          setCommentImage(result.assets[0].uri);
          console.log("Set comment image to:", result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const removeImage = (isReply: boolean = false) => {
    if (isReply) {
      setReplyImage(null);
    } else {
      setCommentImage(null);
    }
  };

  const refreshLikeCounts = async () => {
    const newCommentLikeCounts: { [key: string]: number } = {};
    const newReplyLikeCounts: { [key: string]: number } = {};

    for (const comment of comments) {
      newCommentLikeCounts[comment.id] = await getActualCommentLikeCount(
        comment.id
      );

      if (comment.replies && Array.isArray(comment.replies)) {
        for (const reply of comment.replies) {
          newReplyLikeCounts[reply.id] = await getActualReplyLikeCount(
            reply.id
          );
        }
      }
    }

    setCommentLikeCounts(newCommentLikeCounts);
    setReplyLikeCounts(newReplyLikeCounts);
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteComment(commentId);
              setComments((prev) =>
                prev.filter((comment) => comment.id !== commentId)
              );
            } catch (error) {
              console.error("Error deleting comment:", error);
              Alert.alert("Error", "Failed to delete comment");
            }
          },
        },
      ]
    );
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    Alert.alert("Delete Reply", "Are you sure you want to delete this reply?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReply(commentId, replyId);
            setComments((prev) =>
              prev.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      replies: (comment.replies || []).filter(
                        (reply) => reply.id !== replyId
                      ),
                    }
                  : comment
              )
            );
          } catch (error) {
            console.error("Error deleting reply:", error);
            Alert.alert("Error", "Failed to delete reply");
          }
        },
      },
    ]);
  };

  const handleToggleCommentLike = async (commentId: string) => {
    try {
      await toggleCommentLike(commentId);
      setCommentLikes((prev) => ({ ...prev, [commentId]: !prev[commentId] }));

      // Refresh like count after a short delay to ensure accuracy
      setTimeout(() => {
        refreshLikeCounts();
      }, 100);
    } catch (error) {
      console.error("Error toggling comment like:", error);
    }
  };

  const handleToggleReplyLike = async (replyId: string) => {
    try {
      await toggleReplyLike(replyId);
      setReplyLikes((prev) => ({ ...prev, [replyId]: !prev[replyId] }));

      // Refresh like count after a short delay to ensure accuracy
      setTimeout(() => {
        refreshLikeCounts();
      }, 100);
    } catch (error) {
      console.error("Error toggling reply like:", error);
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const renderReply = ({ item: reply }: { item: Reply }) => (
    <View style={styles.replyContainer}>
      <View style={styles.replyHeader}>
        <Text style={styles.replyUser}>{reply.user}</Text>
        <Text style={styles.replyTime}>{formatTime(reply.createdAt)}</Text>
      </View>
      {reply.content && (
        <Text style={styles.replyContent}>{reply.content}</Text>
      )}
      {reply.image && (
        <View style={styles.imageContainer}>
          <Text style={{ fontSize: 10, color: "red", marginBottom: 4 }}>
            Debug: Reply Image URL = {reply.image}
          </Text>
          <Image
            source={{ uri: reply.image }}
            style={styles.replyImage}
            onError={(error) => {
              console.log("Reply image load error:", error.nativeEvent);
              console.log("Failed reply image URL:", reply.image);
            }}
            onLoad={() => {
              console.log("Reply image loaded successfully:", reply.image);
            }}
            resizeMode="cover"
          />
        </View>
      )}
      <View style={styles.replyActions}>
        <TouchableOpacity
          onPress={() => handleToggleReplyLike(reply.id)}
          style={styles.replyActionButton}
        >
          <Ionicons
            name={replyLikes[reply.id] ? "heart" : "heart-outline"}
            size={16}
            color={replyLikes[reply.id] ? "#ff4757" : "#666"}
          />
          <Text style={styles.replyActionText}>
            {replyLikeCounts[reply.id] || 0}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderComment = ({ item: comment }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentUser}>{comment.user}</Text>
        <Text style={styles.commentTime}>{formatTime(comment.createdAt)}</Text>
      </View>
      {comment.content && (
        <Text style={styles.commentContent}>{comment.content}</Text>
      )}
      {comment.image && (
        <View style={styles.imageContainer}>
          <Text style={{ fontSize: 12, color: "red", marginBottom: 4 }}>
            Debug: Image URL = {comment.image}
          </Text>
          <Image
            source={{ uri: comment.image }}
            style={styles.commentImage}
            onError={(error) => {
              console.log("Image load error:", error.nativeEvent);
              console.log("Failed image URL:", comment.image);
            }}
            onLoad={() => {
              console.log("Image loaded successfully:", comment.image);
            }}
            resizeMode="cover"
          />
        </View>
      )}
      <View style={styles.commentActions}>
        <TouchableOpacity
          onPress={() => handleToggleCommentLike(comment.id)}
          style={styles.commentActionButton}
        >
          <Ionicons
            name={commentLikes[comment.id] ? "heart" : "heart-outline"}
            size={16}
            color={commentLikes[comment.id] ? "#ff4757" : "#666"}
          />
          <Text style={styles.commentActionText}>
            {commentLikeCounts[comment.id] || 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setReplyingTo(comment.id)}
          style={styles.commentActionButton}
        >
          <Ionicons name="chatbubble-outline" size={16} color="#666" />
          <Text style={styles.commentActionText}>Reply</Text>
        </TouchableOpacity>
      </View>

      {/* Reply input */}
      {replyingTo === comment.id && (
        <View style={styles.replyInputContainer}>
          {replyImage && (
            <View style={styles.selectedImageContainer}>
              <Image
                source={{ uri: replyImage }}
                style={styles.selectedImage}
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(true)}
              >
                <Ionicons name="close-circle" size={24} color="#ff4757" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.replyInputRow}>
            <TextInput
              style={styles.replyInput}
              placeholder="Write a reply..."
              value={replyText}
              onChangeText={setReplyText}
              onSubmitEditing={handleSubmitReply}
              blurOnSubmit={false}
              returnKeyType="send"
              multiline
            />
            <TouchableOpacity
              onPress={() => pickImage(true)}
              style={styles.imageButton}
            >
              <Ionicons name="image" size={16} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmitReply}
              style={styles.replySendButton}
              disabled={!replyText.trim() && !replyImage}
            >
              <Ionicons
                name="send"
                size={16}
                color={replyText.trim() || replyImage ? "#007AFF" : "#ccc"}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Replies */}
      {comment.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          <FlatList
            data={comment.replies}
            renderItem={renderReply}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Comments</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={debugStorage} style={styles.debugButton}>
              <Ionicons name="bug" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={refreshLikeCounts}
              style={styles.debugButton}
            >
              <Ionicons name="refresh" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={resetAllLikes}
              style={styles.debugButton}
            >
              <Ionicons name="trash" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                console.log("Testing image comment...");
                setCommentImage("https://picsum.photos/400/300");
              }}
              style={styles.debugButton}
            >
              <Ionicons name="image" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                console.log("Testing local image...");
                // Test with a simple local image URL
                setCommentImage(
                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                );
              }}
              style={styles.debugButton}
            >
              <Ionicons name="camera" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                try {
                  console.log("Creating test comment with image...");
                  const testComment = await createTestCommentWithImage(postId);
                  console.log("Test comment created:", testComment);
                  await loadComments(); // Reload comments to show the new one
                } catch (error) {
                  console.error("Error creating test comment:", error);
                  Alert.alert("Error", "Failed to create test comment");
                }
              }}
              style={styles.debugButton}
            >
              <Ionicons name="add-circle" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          style={styles.commentsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No comments yet</Text>
              <Text style={styles.emptySubtext}>Be the first to comment!</Text>
            </View>
          }
        />

        <View style={styles.inputContainer}>
          {commentImage && (
            <View style={styles.selectedImageContainer}>
              <Image
                source={{ uri: commentImage }}
                style={styles.selectedImage}
                onError={(error) =>
                  console.log("Preview image error:", error.nativeEvent)
                }
                onLoad={() =>
                  console.log("Preview image loaded:", commentImage)
                }
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(false)}
              >
                <Ionicons name="close-circle" size={24} color="#ff4757" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Write a comment..."
              value={newComment}
              onChangeText={setNewComment}
              onSubmitEditing={handleSubmitComment}
              blurOnSubmit={false}
              returnKeyType="send"
              multiline
            />
            <TouchableOpacity
              onPress={() => pickImage(false)}
              style={styles.imageButton}
            >
              <Ionicons name="image" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmitComment}
              style={styles.sendButton}
              disabled={!newComment.trim() && !commentImage}
            >
              <Ionicons
                name="send"
                size={20}
                color={newComment.trim() || commentImage ? "#007AFF" : "#ccc"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  debugButton: {
    padding: 8,
    marginRight: 8,
  },

  closeButton: {
    padding: 8,
  },
  commentsList: {
    flex: 1,
  },
  commentContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  commentUser: {
    fontWeight: "600",
    marginRight: 8,
  },
  commentTime: {
    color: "#666",
    fontSize: 12,
    flex: 1,
  },
  commentContent: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentActionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    paddingVertical: 4,
  },
  commentActionText: {
    marginLeft: 4,
    color: "#666",
    fontSize: 14,
  },
  replyInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 20,
    marginHorizontal: -16,
  },
  replyInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    maxHeight: 100,
  },
  replySendButton: {
    padding: 8,
    marginRight: 4,
  },
  repliesContainer: {
    marginTop: 12,
    marginLeft: 16,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: "#e0e0e0",
  },
  replyContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginBottom: 8,
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  replyUser: {
    fontWeight: "600",
    fontSize: 14,
    marginRight: 8,
  },
  replyTime: {
    color: "#666",
    fontSize: 11,
    flex: 1,
  },
  replyContent: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  replyActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  replyActionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  replyActionText: {
    marginLeft: 4,
    color: "#666",
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
  },
  imageContainer: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  commentImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  replyImage: {
    width: "100%",
    height: 150,
    borderRadius: 6,
  },
  selectedImageContainer: {
    position: "relative",
    marginBottom: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  selectedImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "white",
    borderRadius: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  replyInputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  imageButton: {
    padding: 8,
    marginLeft: 4,
  },
});

export default CommentModal;
