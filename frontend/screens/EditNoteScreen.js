// File: frontend/screens/EditNoteScreen.js

import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Alert,
} from "react-native";
import NoteForm from "../components/NoteForm";
import axios from "axios";

// Make sure this is your correct testing IP (PC or Emulator)
const API_URL = "http://192.168.100.7:3000";

export default function EditNoteScreen({ route, navigation }) {
  const { noteId } = route.params;

  // State for the note's content
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // Used for both manual and auto-save
  const [error, setError] = useState(null);

  // Fetch the initial note data when the screen loads
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await axios.get(`${API_URL}/notes/${noteId}`);
        setTitle(response.data.title);
        setContent(response.data.content);
      } catch (err) {
        setError("Could not load the note.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchNote();
  }, [noteId]);

  // ================================================================
  // NEW: Handler for the auto-save feature from NoteForm
  // ================================================================
  const handleAutoSave = useCallback(
    async (dataToSave) => {
      // The NoteForm passes an object { title, content }
      // We don't need a loading indicator here as it's a background task.
      try {
        await axios.put(`${API_URL}/notes/${noteId}`, dataToSave);
        console.log("Note auto-saved successfully!"); // For debugging
      } catch (err) {
        console.warn("Auto-save failed:", err);
        // In a real app, you might show a small, non-blocking toast message here.
      }
    },
    [noteId]
  );

  // Configure the header button.
  useLayoutEffect(() => {
    // This handler is for the manual "Update" button press.
    const handleManualUpdate = async () => {
      if (!title.trim()) {
        Alert.alert("Title Required", "Please enter a title for the note.");
        return;
      }
      setIsSaving(true);
      try {
        await axios.put(`${API_URL}/notes/${noteId}`, { title, content });
        navigation.goBack(); // Navigate back after a definitive save.
      } catch (err) {
        Alert.alert("Update Error", "The note could not be saved.");
      } finally {
        setIsSaving(false);
      }
    };

    navigation.setOptions({
      title: "Edit Note",
      headerRight: () => (
        <TouchableOpacity
          style={[
            styles.headerButton,
            (isSaving || isLoading) && styles.headerButtonDisabled,
          ]}
          onPress={handleManualUpdate}
          disabled={isSaving || isLoading}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.headerButtonText}>Update</Text>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, isLoading, isSaving, title, content, noteId]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Pass all required props to your powerful NoteForm component
  return (
    <NoteForm
      title={title}
      content={content}
      onTitleChange={setTitle}
      onContentChange={setContent}
      onAutoSave={handleAutoSave}
      autoSaveEnabled={true} // <-- We enable the auto-save feature here!
      showWordCount={true} // <-- We enable the word count here!
    />
  );
}

// Your professional styles are great.
const styles = StyleSheet.create({
  headerButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    minWidth: 80,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonDisabled: { backgroundColor: "#a0a0a0" },
  headerButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: { fontSize: 16, color: "#FF3B30" },
});
