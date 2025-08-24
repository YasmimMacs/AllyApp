import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/RootNavigator";
import StoryTray from "../components/StoryTray";
import StoryViewerModal from "../components/StoryViewerModal";
import FAB from "../components/FAB";
import CreatePostModal, {
  NewPost,
  PostType,
} from "../components/CreatePostModal";
import CommentModal from "../components/CommentModal";
import { useStories } from "../hooks/useStories";
import { useCommentsAndLikes } from "../hooks/useCommentsAndLikes";
import { Story } from "../storage/stories";
import { ActionSheetIOS } from "react-native";

type CommunityScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  keyof RootStackParamList
>;

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isTablet = screenWidth >= 768;

// Responsive scaling functions
const scale = (size: number): number => {
  const baseWidth = 375;
  const scaleFactor = screenWidth / baseWidth;
  return Math.round(size * scaleFactor);
};

const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

interface Post {
  id: number;
  user: string;
  time: string;
  content: string;
  type: "positive" | "warning" | "request";
  likes: number;
  comments: number;
}

export default function CommunityScreen() {
  const navigation = useNavigation<CommunityScreenNavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState("Stories");

  // Stories functionality
  const { stories, loading, createFromCamera, createFromLibrary } =
    useStories();
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);

  // Post creation functionality
  const [modalType, setModalType] = useState<PostType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [localPosts, setLocalPosts] = useState<Post[]>([]);

  const posts: Post[] = [
    {
      id: 1,
      user: "Anonymous",
      time: "2h ago",
      content:
        "Found a really safe café on 5th Street! Great lighting and friendly staff. Perfect for evening study sessions.",
      type: "positive",
      likes: 12,
      comments: 3,
    },
    {
      id: 2,
      user: "Community Tip",
      time: "4h ago",
      content:
        "Avoid Main Street after dark - poor lighting reported by multiple users.",
      type: "warning",
      likes: 8,
      comments: 5,
    },
    {
      id: 3,
      user: "Sarah M.",
      time: "6h ago",
      content:
        "Walking buddy needed for tomorrow evening commute from downtown. Anyone interested?",
      type: "request",
      likes: 15,
      comments: 7,
    },
  ];

  // Comment functionality
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);

  // Get all post IDs for the hook
  const allPosts = [...posts, ...localPosts];
  const postIds = useMemo(() => allPosts.map((post) => post.id), [allPosts]);

  // Comments and likes hook
  const {
    postLikes,
    commentCounts,
    likeCounts,
    toggleLike,
    addNewPost,
    refreshCommentCount,
  } = useCommentsAndLikes({ postIds });

  const filters = ["Stories", "Tips", "Incidents"];

  // Handle story viewer
  const handleStoryOpen = (story: Story) => {
    setCurrentStory(story);
    setStoryViewerOpen(true);
  };

  const handleStoryClose = () => {
    setStoryViewerOpen(false);
    setCurrentStory(null);
  };

  // Handle post creation
  const onCreatePost = (newPost: NewPost) => {
    const convertedPost: Post = {
      id: Number(newPost.id),
      user: "You",
      time: "Just now",
      content: newPost.title
        ? `${newPost.title}\n\n${newPost.text}`
        : newPost.text,
      type:
        newPost.type === "review"
          ? "positive"
          : newPost.type === "tip"
          ? "positive"
          : "warning",
      likes: 0,
      comments: 0,
    };
    setLocalPosts((prev) => [convertedPost, ...prev]);
    addNewPost(convertedPost.id);
    // TODO: if you have backend/API, call it here
  };

  // Handle comment functionality
  const handleToggleLike = async (postId: number) => {
    await toggleLike(postId);
  };

  const handleOpenComments = (postId: number) => {
    setSelectedPost(postId);
    setCommentModalOpen(true);
  };

  const handleCloseComments = () => {
    setCommentModalOpen(false);
    if (selectedPost) {
      refreshCommentCount(selectedPost);
    }
  };

  const handleDeletePost = (postId: number) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setLocalPosts((prev) => prev.filter((post) => post.id !== postId));
        },
      },
    ]);
  };

  const handlePostOptions = (postId: number) => {
    Alert.alert("Post Options", "Choose an action", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDeletePost(postId),
      },
    ]);
  };

  const openActions = () => {
    const onPick = (i: number) => {
      if (i === 1) {
        setModalType("review");
        setModalOpen(true);
      } else if (i === 2) {
        setModalType("tip");
        setModalOpen(true);
      } else if (i === 3) {
        setModalType("incident");
        setModalOpen(true);
      } else if (i === 4) {
        // Share a Story
        if (Platform.OS === "ios") {
          ActionSheetIOS.showActionSheetWithOptions(
            {
              options: ["Cancel", "Take Photo", "Choose from Library"],
              cancelButtonIndex: 0,
            },
            (j) => {
              if (j === 1) createFromCamera();
              else if (j === 2) createFromLibrary();
            }
          );
        } else {
          Alert.alert("Share a story", "Choose", [
            { text: "Camera", onPress: createFromCamera },
            { text: "Gallery", onPress: createFromLibrary },
            { text: "Cancel", style: "cancel" },
          ]);
        }
      }
    };

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            "Cancel",
            "Write a Review",
            "Share a Tip",
            "Report Incident",
            "Share a Story",
          ],
          cancelButtonIndex: 0,
        },
        onPick
      );
    } else {
      Alert.alert("Create", "Choose what to share", [
        { text: "Review", onPress: () => onPick(1) },
        { text: "Tip", onPress: () => onPick(2) },
        { text: "Incident", onPress: () => onPick(3) },
        { text: "Story", onPress: () => onPick(4) },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "positive":
        return "#10B981";
      case "warning":
        return "#F59E0B";
      case "request":
        return "#3B82F6";
      default:
        return "#6B7280";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "positive":
        return "checkmark-circle";
      case "warning":
        return "warning";
      case "request":
        return "people";
      default:
        return "help-circle";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ally Community</Text>
      </View>

      {/* Welcome Text */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome to the community!</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterBadge,
                selectedFilter === filter && styles.filterBadgeActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Story Tray */}
      <StoryTray stories={stories} onOpen={handleStoryOpen} />

      {/* Posts */}
      <ScrollView
        style={styles.postsContainer}
        showsVerticalScrollIndicator={false}
      >
        {[...localPosts, ...posts].map((post) => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{post.user[0]}</Text>
                </View>
                <View>
                  <Text style={styles.userName}>{post.user}</Text>
                  <Text style={styles.postTime}>{post.time}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.moreButton}
                onPress={() => handlePostOptions(post.id)}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={20}
                  color="#6426A9"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.postContent}>
              <View style={styles.typeIndicator}>
                <Ionicons
                  name={getTypeIcon(post.type) as any}
                  size={16}
                  color={getTypeColor(post.type)}
                />
                <Text
                  style={[styles.typeText, { color: getTypeColor(post.type) }]}
                >
                  {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                </Text>
              </View>
              <Text style={styles.postText}>{post.content}</Text>
            </View>

            <View style={styles.postActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleToggleLike(post.id)}
              >
                <Ionicons
                  name={postLikes[post.id] ? "heart" : "heart-outline"}
                  size={20}
                  color={postLikes[post.id] ? "#ff4757" : "#6426A9"}
                />
                <Text style={styles.actionText}>
                  {likeCounts[post.id] || 0}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleOpenComments(post.id)}
              >
                <Ionicons name="chatbubble-outline" size={20} color="#6426A9" />
                <Text style={styles.actionText}>
                  {commentCounts[post.id] || 0}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* FAB */}
      <FAB onPress={openActions} />

      {/* Story Viewer Modal */}
      <StoryViewerModal
        visible={storyViewerOpen}
        story={currentStory}
        onClose={handleStoryClose}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        visible={modalOpen}
        type={modalType ?? "tip"}
        onClose={() => setModalOpen(false)}
        onSubmit={onCreatePost}
      />

      {/* Comment Modal */}
      {selectedPost && (
        <CommentModal
          visible={commentModalOpen}
          onClose={handleCloseComments}
          postId={selectedPost}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 40, // Match Features page padding
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: "600",
    color: "#6426A9",
    marginLeft: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  welcomeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  welcomeText: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  filterBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterBadgeActive: {
    backgroundColor: "#6426A9",
    borderColor: "#6426A9",
  },
  filterText: {
    fontSize: moderateScale(14),
    color: "#6B7280",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  postsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#6426A9",
  },
  userName: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#1F2937",
  },
  postTime: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    marginBottom: 12,
  },
  typeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  typeText: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    marginLeft: 4,
  },
  postText: {
    fontSize: moderateScale(14),
    color: "#374151",
    lineHeight: 20,
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  actionText: {
    fontSize: moderateScale(12),
    color: "#6426A9",
    marginLeft: 4,
    fontWeight: "500",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6426A9",
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  shareButtonText: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
});
