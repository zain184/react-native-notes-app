// File: frontend/screens/NotesListScreen.js

import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import axios from "axios";
import NoteCard from "../components/NoteCard";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = "http://192.168.100.7:3000";

export default function NotesListScreen({ navigation }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(new Set());
  const [error, setError] = useState("");

  const fetchNotes = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError("");
      const response = await axios.get(`${API_URL}/notes`);
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      setError("Failed to load notes. Make sure the server is running.");
    } finally {
      setLoading(false);
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotes(true);
  }, [fetchNotes]);

  const handleRetry = useCallback(() => {
    fetchNotes();
  }, [fetchNotes]);

  useFocusEffect(
    React.useCallback(() => {
      fetchNotes();
    }, [fetchNotes])
  );

  const handleDelete = useCallback(
    async (id) => {
      Alert.alert(
        "Delete Note",
        "Are you sure you want to delete this note? This action cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                setDeleting((prev) => new Set([...prev, id]));
                await axios.delete(`${API_URL}/notes/${id}`);
                // Optimistically update the UI
                setNotes((prevNotes) =>
                  prevNotes.filter((note) => note.id !== id)
                );
              } catch (error) {
                console.error("Error deleting note:", error);
                Alert.alert(
                  "Delete Failed",
                  "Failed to delete the note. Please try again."
                );
                // Refresh the list to ensure consistency
                fetchNotes();
              } finally {
                setDeleting((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(id);
                  return newSet;
                });
              }
            },
          },
        ]
      );
    },
    [fetchNotes]
  );

  const handleNotePress = useCallback(
    (noteId) => {
      navigation.navigate("NoteDetail", { noteId });
    },
    [navigation]
  );

  const handleAddNote = useCallback(() => {
    navigation.navigate("AddNote");
  }, [navigation]);

  const renderNoteItem = useCallback(
    ({ item }) => (
      <NoteCard
        note={item}
        onPress={() => handleNotePress(item.id)}
        onDelete={() => handleDelete(item.id)}
        isDeleting={deleting.has(item.id)}
      />
    ),
    [handleNotePress, handleDelete, deleting]
  );

  const renderEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Notes Yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the + button to create your first note
        </Text>
        <TouchableOpacity style={styles.emptyButton} onPress={handleAddNote}>
          <Text style={styles.emptyButtonText}>Create Note</Text>
        </TouchableOpacity>
      </View>
    ),
    [handleAddNote]
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading notes...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNoteItem}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={[
          styles.listContent,
          notes.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#007AFF"]}
            tintColor="#007AFF"
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddNote}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666666",
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: 10,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 2,
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { height: 2, width: 0 },
  },
  emptyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 30,
    backgroundColor: "#007AFF",
    borderRadius: 30,
    elevation: 8,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { height: 2, width: 0 },
  },
  fabIcon: {
    fontSize: 24,
    color: "white",
    fontWeight: "300",
  },
});
