// File: frontend/components/NoteCard.js

import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

const NoteCard = memo(({ note, onPress, onDelete, isDeleting = false }) => (
  <TouchableOpacity
    style={[styles.card, isDeleting && styles.cardDeleting]}
    onPress={onPress}
    disabled={isDeleting}
    activeOpacity={0.7}
  >
    <View style={styles.cardContent}>
      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
        {note.title}
      </Text>

      {note.content ? (
        <Text style={styles.content} numberOfLines={2} ellipsizeMode="tail">
          {note.content}
        </Text>
      ) : (
        <Text style={styles.emptyContent}>No content</Text>
      )}

      {note.createdAt && (
        <Text style={styles.date}>{formatDate(note.createdAt)}</Text>
      )}
    </View>

    <TouchableOpacity
      onPress={onDelete}
      style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
      disabled={isDeleting}
      activeOpacity={0.7}
    >
      {isDeleting ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text style={styles.deleteButtonText}>×</Text>
      )}
    </TouchableOpacity>
  </TouchableOpacity>
));

// Helper function to format dates
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    return "Just now";
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInHours < 168) {
    // 7 days
    const days = Math.floor(diffInHours / 24);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardDeleting: {
    opacity: 0.6,
    transform: [{ scale: 0.98 }],
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 6,
    lineHeight: 24,
  },
  content: {
    fontSize: 15,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 8,
  },
  emptyContent: {
    fontSize: 15,
    color: "#999999",
    fontStyle: "italic",
    lineHeight: 20,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: "#999999",
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  deleteButtonDisabled: {
    backgroundColor: "#999999",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "300",
    lineHeight: 20,
  },
});

export default NoteCard;
