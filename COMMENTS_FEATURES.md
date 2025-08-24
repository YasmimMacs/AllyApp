# Comments and Replies Features

## Overview

The Community screen now includes a comprehensive comment and reply system with persistent storage, like functionality, and user-friendly interactions.

## Features

### 🗨️ **Comments**

- **Add Comments**: Tap the comment icon on any post to open the comments modal
- **Persistent Storage**: Comments are saved locally and persist between app sessions
- **Like Comments**: Tap the heart icon to like/unlike comments
- **Delete Comments**: Use the ellipses menu to delete your own comments
- **Real-time Updates**: Comment counts update immediately in the main feed

### 💬 **Replies**

- **Reply to Comments**: Tap the "Reply" button on any comment to add a reply
- **Nested Structure**: Replies are displayed under their parent comments with visual indentation
- **Like Replies**: Each reply can be liked independently
- **Delete Replies**: Use the ellipses menu to delete replies
- **Inline Reply Input**: Reply input appears directly under the comment being replied to

### ❤️ **Like System**

- **Post Likes**: Like/unlike main posts with heart icon
- **Comment Likes**: Like/unlike individual comments
- **Reply Likes**: Like/unlike individual replies
- **Accurate Counting**: Like counts start from the actual current number, not from 1
- **Visual Feedback**: Heart icons fill with red when liked

### 🗑️ **Delete Functionality**

- **Delete Posts**: Use ellipses menu on main posts to delete them
- **Delete Comments**: Use ellipses menu on comments to delete them
- **Delete Replies**: Use ellipses menu on replies to delete them
- **Confirmation Dialogs**: All delete actions require confirmation

### 🔧 **Debug Tools**

- **Debug Button**: Tap the bug icon to see storage state in console
- **Refresh Button**: Tap the refresh icon to manually update all like counts
- **Reset Button**: Tap the trash icon to clear all like data for testing

## Technical Implementation

### Storage System

- **AsyncStorage**: All data is stored locally using React Native's AsyncStorage
- **Persistent Device ID**: Comments persist across logout/login cycles
- **Separate Storage Keys**:
  - Comments: `comments:items`
  - Post Likes: `likes:posts`
  - Comment Likes: `likes:comments`
  - Reply Likes: `likes:replies`

### Data Structures

```typescript
interface Comment {
  id: string;
  postId: number;
  user: string;
  content: string;
  createdAt: number;
  likes: number;
  replies: Reply[];
}

interface Reply {
  id: string;
  commentId: string;
  user: string;
  content: string;
  createdAt: number;
  likes: number;
}
```

### Key Functions

- `saveComment()`: Save new comments
- `saveReply()`: Save new replies to comments
- `toggleCommentLike()`: Toggle like status for comments
- `toggleReplyLike()`: Toggle like status for replies
- `deleteComment()`: Delete comments and their replies
- `deleteReply()`: Delete individual replies
- `getActualCommentLikeCount()`: Get accurate like counts from storage
- `getActualReplyLikeCount()`: Get accurate reply like counts from storage

## User Experience

### Comment Modal

- **Slide-up Animation**: Modal slides up from bottom
- **Keyboard Handling**: Input adjusts for keyboard visibility
- **Send Button**: Tap send icon or press Enter to submit
- **Real-time Updates**: Comments appear immediately after posting
- **Empty State**: Shows helpful message when no comments exist

### Reply System

- **Inline Input**: Reply input appears under the comment
- **Visual Hierarchy**: Replies are indented and styled differently
- **Collapsible**: Reply input can be dismissed by tapping elsewhere
- **Send Button**: Dedicated send button for replies

### Like Interactions

- **Immediate Feedback**: Heart icons change instantly
- **Accurate Counts**: Like numbers reflect actual storage state
- **Persistent State**: Like status is remembered across app sessions
- **Visual Distinction**: Liked items show filled red hearts

## Usage Instructions

1. **View Comments**: Tap the comment icon on any post
2. **Add Comment**: Type in the input field and tap send
3. **Reply to Comment**: Tap "Reply" on any comment, type your reply, and send
4. **Like Content**: Tap heart icons to like posts, comments, or replies
5. **Delete Content**: Use ellipses menus to delete posts, comments, or replies
6. **Debug Issues**: Use debug buttons in the comment modal header

## Persistence

- Comments and replies persist across app restarts
- Like status is maintained between sessions
- User data (likes) can be cleared independently of comments
- Device-specific storage ensures data privacy


