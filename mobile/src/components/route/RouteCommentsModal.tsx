import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MOCK_USER_PROFILE } from '@/data/mockData';

export interface CommentUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isVerified?: boolean;
  isCurrentUser?: boolean;
}

export interface CommentItem {
  id: string;
  user: CommentUser;
  text: string;
  timeAgo: string;
  likesCount: number;
  isLiked?: boolean;
  replies?: CommentItem[];
}

interface RouteCommentsModalProps {
  visible: boolean;
  routeTitle: string;
  initialCommentsCount?: number;
  onClose: () => void;
  onCommentsCountChange?: (newCount: number) => void;
}

// Seed Comments about Munnar Peak Trail Route
const INITIAL_ROUTE_COMMENTS: CommentItem[] = [
  {
    id: 'c-1',
    user: {
      id: 'u-sara',
      name: 'Sara Thomas',
      username: 'sara.travels',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
    },
    text: 'This route looks amazing! 😍 Adding this to my list for next month.',
    timeAgo: '2 days ago',
    likesCount: 12,
    isLiked: false,
    replies: [],
  },
  {
    id: 'c-2',
    user: {
      id: 'u-rahul',
      name: 'Rahul Nair',
      username: 'rahul.explores',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      isVerified: false,
    },
    text: 'How long did this route take you? Planning to do it next weekend.',
    timeAgo: '3 days ago',
    likesCount: 5,
    isLiked: false,
    replies: [
      {
        id: 'c-2-r1',
        user: {
          id: 'u-ahmad',
          name: 'Ahmad Faiz',
          username: 'ahmad.faiz',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          isVerified: false,
        },
        text: 'It took around 5–6 hours with photo stops. Totally worth starting early morning for sunrise!',
        timeAgo: '2 days ago',
        likesCount: 8,
        isLiked: true,
      },
    ],
  },
  {
    id: 'c-3',
    user: {
      id: 'u-meera',
      name: 'Meera Krishnan',
      username: 'meera.travel',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
    },
    text: 'The tea gardens are absolutely beautiful 🌿 The third viewpoint was my favorite spot!',
    timeAgo: '4 days ago',
    likesCount: 7,
    isLiked: false,
    replies: [],
  },
  {
    id: 'c-4',
    user: {
      id: 'u-vipin',
      name: 'Vipin Kumar',
      username: 'vipin.outdoors',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      isVerified: false,
    },
    text: 'Are the trails suitable for beginners or is the terrain steep?',
    timeAgo: '5 days ago',
    likesCount: 3,
    isLiked: false,
    replies: [
      {
        id: 'c-4-r1',
        user: {
          id: 'user-2',
          name: 'Arjun Nair',
          username: 'arjun.travels',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
          isVerified: true,
        },
        text: 'It is moderate! The first 2 km near Kolukkumalai have a mild incline, but overall very manageable.',
        timeAgo: '4 days ago',
        likesCount: 15,
        isLiked: true,
      },
    ],
  },
];

export const RouteCommentsModal: React.FC<RouteCommentsModalProps> = ({
  visible,
  routeTitle,
  initialCommentsCount = 36,
  onClose,
  onCommentsCountChange,
}) => {
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Comments State
  const [comments, setComments] = useState<CommentItem[]>(INITIAL_ROUTE_COMMENTS);
  const [isLoading, setIsLoading] = useState(true);

  // Input & Context State
  const [inputText, setInputText] = useState('');
  const [replyingToComment, setReplyingToComment] = useState<{ id: string; user: CommentUser } | null>(null);
  const [editingComment, setEditingComment] = useState<{ id: string; parentId?: string; text: string } | null>(null);

  // More Options Menu Popover Modal
  const [selectedCommentForMenu, setSelectedCommentForMenu] = useState<{
    comment: CommentItem;
    parentId?: string;
  } | null>(null);

  // Report Toast Notice
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Pagination state
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset and simulate loading state on open
  useEffect(() => {
    if (visible) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Total comment count calculation (main comments + replies)
  const totalCommentsCount = useMemo(() => {
    return comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0) + 30; // + offset to match 36
  }, [comments]);

  useEffect(() => {
    if (onCommentsCountChange) {
      onCommentsCountChange(totalCommentsCount);
    }
  }, [totalCommentsCount]);

  // Toggle Like on main comment or reply
  const handleToggleLike = (commentId: string, parentId?: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (parentId && c.id === parentId) {
          // Reply inside parent comment
          return {
            ...c,
            replies: (c.replies || []).map((r) => {
              if (r.id === commentId) {
                return {
                  ...r,
                  isLiked: !r.isLiked,
                  likesCount: r.isLiked ? r.likesCount - 1 : r.likesCount + 1,
                };
              }
              return r;
            }),
          };
        } else if (c.id === commentId) {
          // Main comment
          return {
            ...c,
            isLiked: !c.isLiked,
            likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1,
          };
        }
        return c;
      })
    );
  };

  // Trigger Reply Context
  const handleInitiateReply = (comment: CommentItem) => {
    setReplyingToComment({ id: comment.id, user: comment.user });
    setEditingComment(null);
    setInputText('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Trigger Edit Context
  const handleInitiateEdit = (comment: CommentItem, parentId?: string) => {
    setEditingComment({ id: comment.id, parentId, text: comment.text });
    setReplyingToComment(null);
    setInputText(comment.text);
    setSelectedCommentForMenu(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Delete Comment Action
  const handleDeleteComment = (commentId: string, parentId?: string) => {
    setComments((prev) => {
      if (parentId) {
        return prev.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: (c.replies || []).filter((r) => r.id !== commentId),
            };
          }
          return c;
        });
      } else {
        return prev.filter((c) => c.id !== commentId);
      }
    });
    setSelectedCommentForMenu(null);
  };

  // Submit Comment / Reply / Edit
  const handleSubmitText = () => {
    if (!inputText.trim()) return;

    const trimmed = inputText.trim();

    if (editingComment) {
      // Handle Edit Comment
      setComments((prev) =>
        prev.map((c) => {
          if (editingComment.parentId && c.id === editingComment.parentId) {
            return {
              ...c,
              replies: (c.replies || []).map((r) =>
                r.id === editingComment.id ? { ...r, text: trimmed } : r
              ),
            };
          } else if (c.id === editingComment.id) {
            return { ...c, text: trimmed };
          }
          return c;
        })
      );
      setEditingComment(null);
    } else if (replyingToComment) {
      // Handle Reply to Comment
      const newReply: CommentItem = {
        id: `reply-${Date.now()}`,
        user: {
          id: MOCK_USER_PROFILE.id,
          name: MOCK_USER_PROFILE.name,
          username: MOCK_USER_PROFILE.username,
          avatar: MOCK_USER_PROFILE.avatar,
          isCurrentUser: true,
        },
        text: trimmed,
        timeAgo: 'Just now',
        likesCount: 0,
        isLiked: false,
      };

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === replyingToComment.id) {
            return {
              ...c,
              replies: [...(c.replies || []), newReply],
            };
          }
          return c;
        })
      );
      setReplyingToComment(null);
    } else {
      // Handle New Main Comment
      const newComment: CommentItem = {
        id: `comment-${Date.now()}`,
        user: {
          id: MOCK_USER_PROFILE.id,
          name: MOCK_USER_PROFILE.name,
          username: MOCK_USER_PROFILE.username,
          avatar: MOCK_USER_PROFILE.avatar,
          isCurrentUser: true,
        },
        text: trimmed,
        timeAgo: 'Just now',
        likesCount: 0,
        isLiked: false,
        replies: [],
      };

      setComments((prev) => [newComment, ...prev]);
    }

    setInputText('');
  };

  // Load More Pagination Handler
  const handleLoadMore = () => {
    if (isLoadingMore || !hasMoreComments) return;
    setIsLoadingMore(true);

    setTimeout(() => {
      const olderComments: CommentItem[] = [
        {
          id: `c-old-1`,
          user: {
            id: 'u-dev',
            name: 'Devika Pillai',
            username: 'devika.walks',
            avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
          },
          text: 'Great trail map! Waterfalls were cascading nicely last week.',
          timeAgo: '1 week ago',
          likesCount: 9,
          isLiked: false,
          replies: [],
        },
      ];
      setComments((prev) => [...prev, ...olderComments]);
      setIsLoadingMore(false);
      setHasMoreComments(false);
    }, 800);
  };

  const cancelInputContext = () => {
    setReplyingToComment(null);
    setEditingComment(null);
    setInputText('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdropOverlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheetContainerWrapper}
        >
          <Pressable style={styles.sheetContentContainer} onPress={(e) => e.stopPropagation()}>
            {/* Top Drag Indicator */}
            <View style={styles.dragHandle} />

            {/* Header Row */}
            <View style={styles.sheetHeader}>
              <View style={styles.titleColumn}>
                <Text style={styles.headerTitle}>Comments</Text>
                <Text style={styles.headerSubtitle}>{totalCommentsCount} comments</Text>
              </View>

              <TouchableOpacity style={styles.closeBtn} activeOpacity={0.8} onPress={onClose}>
                <Ionicons name="close" size={22} color="#8A8F9B" />
              </TouchableOpacity>
            </View>

            {/* Toast Banner Notice */}
            {toastNotice && (
              <View style={styles.toastNoticeBanner}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.toastNoticeText}>{toastNotice}</Text>
              </View>
            )}

            {/* Skeleton Loading State */}
            {isLoading ? (
              <View style={styles.skeletonContainer}>
                {[1, 2, 3].map((key) => (
                  <View key={key} style={styles.skeletonRow}>
                    <View style={styles.skeletonAvatar} />
                    <View style={{ flex: 1, gap: 8 }}>
                      <View style={styles.skeletonLineShort} />
                      <View style={styles.skeletonLineLong} />
                    </View>
                  </View>
                ))}
              </View>
            ) : comments.length === 0 ? (
              /* Empty State */
              <View style={styles.emptyCommentsBox}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="chatbubble-outline" size={32} color="#FF6B00" />
                </View>
                <Text style={styles.emptyTitle}>No comments yet</Text>
                <Text style={styles.emptySubtitle}>
                  Be the first to share your thoughts about this route.
                </Text>
              </View>
            ) : (
              /* Comment Scrollable List */
              <ScrollView
                ref={scrollViewRef}
                style={styles.commentsScrollView}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
              >
                {comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItemBlock}>
                    {/* Main Comment Row */}
                    <View style={styles.commentMainRow}>
                      {/* Avatar */}
                      <Image source={{ uri: comment.user.avatar }} style={styles.userAvatar} />

                      {/* Comment Details */}
                      <View style={styles.commentBody}>
                        {/* Name & Username */}
                        <View style={styles.userHeaderRow}>
                          <Text style={styles.displayName}>
                            {comment.user.isCurrentUser ? 'You' : comment.user.name}
                          </Text>
                          {comment.user.isVerified && (
                            <Ionicons name="checkmark-circle" size={13} color="#FF6B00" style={{ marginLeft: 3 }} />
                          )}
                          <Text style={styles.username}>@{comment.user.username}</Text>
                        </View>

                        {/* Text */}
                        <Text style={styles.commentText}>{comment.text}</Text>

                        {/* Action Bar (Like, Reply, TimeAgo, More) */}
                        <View style={styles.actionsRow}>
                          <TouchableOpacity
                            style={styles.likeBtn}
                            activeOpacity={0.7}
                            onPress={() => handleToggleLike(comment.id)}
                          >
                            <Ionicons
                              name={comment.isLiked ? 'heart' : 'heart-outline'}
                              size={15}
                              color={comment.isLiked ? '#FF6B00' : '#8A8F9B'}
                            />
                            <Text style={[styles.actionText, comment.isLiked && styles.actionTextLiked]}>
                              {comment.likesCount}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.replyBtn}
                            activeOpacity={0.7}
                            onPress={() => handleInitiateReply(comment)}
                          >
                            <Text style={styles.actionText}>Reply</Text>
                          </TouchableOpacity>

                          <Text style={styles.timeAgoText}>{comment.timeAgo}</Text>

                          {/* Ellipsis More Menu */}
                          <TouchableOpacity
                            style={styles.moreEllipsisBtn}
                            onPress={() => setSelectedCommentForMenu({ comment })}
                          >
                            <Ionicons name="ellipsis-horizontal" size={15} color="#8A8F9B" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    {/* Indented Replies Section */}
                    {comment.replies && comment.replies.length > 0 && (
                      <View style={styles.repliesListContainer}>
                        {comment.replies.map((reply) => (
                          <View key={reply.id} style={styles.replyRow}>
                            <View style={styles.replyConnectorLine} />

                            <Image source={{ uri: reply.user.avatar }} style={styles.replyUserAvatar} />

                            <View style={styles.replyBody}>
                              <View style={styles.userHeaderRow}>
                                <Text style={styles.replyDisplayName}>
                                  {reply.user.isCurrentUser ? 'You' : reply.user.name}
                                </Text>
                                {reply.user.isVerified && (
                                  <Ionicons name="checkmark-circle" size={12} color="#FF6B00" style={{ marginLeft: 3 }} />
                                )}
                                <Text style={styles.replyUsername}>@{reply.user.username}</Text>
                              </View>

                              <Text style={styles.replyText}>{reply.text}</Text>

                              <View style={styles.actionsRow}>
                                <TouchableOpacity
                                  style={styles.likeBtn}
                                  activeOpacity={0.7}
                                  onPress={() => handleToggleLike(reply.id, comment.id)}
                                >
                                  <Ionicons
                                    name={reply.isLiked ? 'heart' : 'heart-outline'}
                                    size={13}
                                    color={reply.isLiked ? '#FF6B00' : '#8A8F9B'}
                                  />
                                  <Text style={[styles.actionText, reply.isLiked && styles.actionTextLiked]}>
                                    {reply.likesCount}
                                  </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={styles.replyBtn}
                                  activeOpacity={0.7}
                                  onPress={() => handleInitiateReply(comment)}
                                >
                                  <Text style={styles.actionText}>Reply</Text>
                                </TouchableOpacity>

                                <Text style={styles.timeAgoText}>{reply.timeAgo}</Text>

                                <TouchableOpacity
                                  style={styles.moreEllipsisBtn}
                                  onPress={() =>
                                    setSelectedCommentForMenu({ comment: reply, parentId: comment.id })
                                  }
                                >
                                  <Ionicons name="ellipsis-horizontal" size={14} color="#8A8F9B" />
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}

                {/* Pagination Load More Button */}
                {hasMoreComments && (
                  <TouchableOpacity
                    style={styles.loadMoreBtn}
                    disabled={isLoadingMore}
                    onPress={handleLoadMore}
                  >
                    {isLoadingMore ? (
                      <ActivityIndicator size="small" color="#FF6B00" />
                    ) : (
                      <Text style={styles.loadMoreText}>Load more comments</Text>
                    )}
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}

            {/* Contextual Banner (Replying or Editing) */}
            {(replyingToComment || editingComment) && (
              <View style={styles.contextualBanner}>
                <Ionicons
                  name={editingComment ? 'create' : 'arrow-undo'}
                  size={14}
                  color="#FF6B00"
                />
                <Text style={styles.contextualBannerText}>
                  {editingComment
                    ? 'Editing comment...'
                    : `Replying to ${replyingToComment?.user.name}`}
                </Text>
                <TouchableOpacity onPress={cancelInputContext}>
                  <Ionicons name="close" size={16} color="#8A8F9B" />
                </TouchableOpacity>
              </View>
            )}

            {/* Fixed Comment Input Area */}
            <View style={styles.fixedInputContainer}>
              <Image source={{ uri: MOCK_USER_PROFILE.avatar }} style={styles.inputUserAvatar} />

              <TextInput
                ref={inputRef}
                style={styles.commentTextInput}
                placeholder={
                  replyingToComment
                    ? `Reply to @${replyingToComment.user.username}...`
                    : editingComment
                    ? 'Edit your comment...'
                    : 'Write a comment...'
                }
                placeholderTextColor="#6B7280"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSubmitText}
              />

              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  !inputText.trim() && styles.sendBtnDisabled,
                ]}
                disabled={!inputText.trim()}
                onPress={handleSubmitText}
              >
                <Ionicons name="send" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>

      {/* Popover Menu Modal for Edit / Delete / Report */}
      <Modal
        visible={selectedCommentForMenu !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCommentForMenu(null)}
      >
        <Pressable style={styles.popoverBackdrop} onPress={() => setSelectedCommentForMenu(null)}>
          <View style={styles.popoverMenuSheet}>
            {selectedCommentForMenu?.comment.user.isCurrentUser ? (
              <>
                <TouchableOpacity
                  style={styles.popoverOptionRow}
                  onPress={() =>
                    handleInitiateEdit(
                      selectedCommentForMenu.comment,
                      selectedCommentForMenu.parentId
                    )
                  }
                >
                  <Ionicons name="create-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.popoverOptionText}>Edit Comment</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.popoverOptionRow}
                  onPress={() =>
                    handleDeleteComment(
                      selectedCommentForMenu.comment.id,
                      selectedCommentForMenu.parentId
                    )
                  }
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  <Text style={[styles.popoverOptionText, { color: '#EF4444' }]}>
                    Delete Comment
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.popoverOptionRow}
                onPress={() => {
                  setSelectedCommentForMenu(null);
                  setToastNotice('Comment reported. Thank you for keeping DreamOut safe.');
                  setTimeout(() => setToastNotice(null), 2500);
                }}
              >
                <Ionicons name="flag-outline" size={20} color="#EF4444" />
                <Text style={[styles.popoverOptionText, { color: '#EF4444' }]}>
                  Report Comment
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.popoverCancelBtn}
              onPress={() => setSelectedCommentForMenu(null)}
            >
              <Text style={styles.popoverCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainerWrapper: {
    width: '100%',
    maxHeight: '88%',
  },
  sheetContentContainer: {
    backgroundColor: '#12141A',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    maxHeight: '100%',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },

  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  titleColumn: { flex: 1 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  headerSubtitle: { color: '#8A8F9B', fontSize: 12, marginTop: 2 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  toastNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  toastNoticeText: { color: '#10B981', fontSize: 12, fontWeight: '600' },

  commentsScrollView: { maxHeight: 380 },

  // COMMENT ITEM STYLING
  commentItemBlock: {
    marginBottom: 16,
  },
  commentMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentBody: {
    flex: 1,
  },
  userHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  displayName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  username: {
    color: '#8A8F9B',
    fontSize: 12,
  },
  commentText: {
    color: '#E5E7EB',
    fontSize: 13.5,
    lineHeight: 19,
    marginBottom: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#8A8F9B',
    fontSize: 12,
    fontWeight: '600',
  },
  actionTextLiked: {
    color: '#FF6B00',
    fontWeight: '700',
  },
  timeAgoText: {
    color: '#6B7280',
    fontSize: 11,
  },
  moreEllipsisBtn: {
    padding: 2,
    marginLeft: 'auto',
  },

  // INDENTED REPLIES STYLING
  repliesListContainer: {
    marginLeft: 26,
    marginTop: 10,
    borderLeftWidth: 1.5,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
    paddingLeft: 12,
    gap: 10,
  },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  replyConnectorLine: {
    position: 'absolute',
    left: -12,
    top: 14,
    width: 10,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  replyUserAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  replyBody: {
    flex: 1,
  },
  replyDisplayName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  replyUsername: {
    color: '#8A8F9B',
    fontSize: 11,
  },
  replyText: {
    color: '#D1D5DB',
    fontSize: 12.5,
    lineHeight: 17,
    marginBottom: 4,
  },

  // FIXED INPUT BAR
  fixedInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1D26',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  inputUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  commentTextInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    maxHeight: 80,
    paddingVertical: 8,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: 'rgba(255, 107, 0, 0.3)',
  },

  contextualBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 4,
  },
  contextualBannerText: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    marginLeft: 6,
  },

  // SKELETON & EMPTY
  skeletonContainer: { gap: 16, paddingVertical: 20 },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  skeletonAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)' },
  skeletonLineShort: { width: 100, height: 12, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)' },
  skeletonLineLong: { width: 220, height: 14, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.05)' },

  emptyCommentsBox: { alignItems: 'center', paddingVertical: 40 },
  emptyIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255, 107, 0, 0.12)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  emptyTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  emptySubtitle: { color: '#8A8F9B', fontSize: 12, textAlign: 'center', marginTop: 4 },

  loadMoreBtn: { alignItems: 'center', paddingVertical: 12 },
  loadMoreText: { color: '#FF6B00', fontSize: 13, fontWeight: '700' },

  // POPOVER MENU
  popoverBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.65)', justifyContent: 'flex-end' },
  popoverMenuSheet: { backgroundColor: '#161820', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  popoverOptionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  popoverOptionText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  popoverCancelBtn: { marginTop: 12, paddingVertical: 12, alignItems: 'center' },
  popoverCancelText: { color: '#8A8F9B', fontSize: 15, fontWeight: '600' },
});
