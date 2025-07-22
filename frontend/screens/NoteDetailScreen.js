import React, { useState, useLayoutEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = "http://192.168.100.7:3000"; // Ensure your IP is correct

export default function NoteDetailScreen({ route, navigation }) {
  const { noteId } = route.params;
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNote = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/notes/${noteId}`);
      setNote(response.data);
    } catch (error) {
      console.error("Error fetching note:", error);
      setError("Could not load note details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  const handleRetry = useCallback(() => {
    fetchNote();
  }, [fetchNote]);

  const handleEdit = useCallback(() => {
    if (note) {
      navigation.navigate("EditNote", { noteId: note.id });
    }
  }, [navigation, note]);

  useFocusEffect(
    React.useCallback(() => {
      fetchNote();
    }, [fetchNote])
  );

  // This hook sets up our header button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={[
            styles.headerButton,
            (!note || loading) && styles.headerButtonDisabled,
          ]}
          onPress={handleEdit}
          disabled={!note || loading}
        >
          <Text style={styles.headerButtonText}>Edit</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, note, loading, handleEdit]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading note...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Note not found.</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.noteContainer}>
        <Text style={styles.title}>{note.title}</Text>
        <Text style={styles.content}>
          {note.content || "No content available."}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  noteContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    lineHeight: 32,
  },
  content: {
    fontSize: 18,
    lineHeight: 28,
    color: "#555",
    textAlign: "left",
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
  headerButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    minWidth: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonDisabled: {
    backgroundColor: "#999999",
    opacity: 0.6,
  },
  headerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
