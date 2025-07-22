// File: frontend/screens/AddNoteScreen.js

import React, { useState, useLayoutEffect, useCallback } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import NoteForm from "../components/NoteForm";
import axios from "axios";

// Make sure this is the correct IP for your testing setup
const API_URL = "http://192.168.100.7:3000";

export default function AddNoteScreen({ navigation }) {
  // State for the note's content
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // State to manage the UI while saving
  const [isSaving, setIsSaving] = useState(false);

  // This is the function passed to NoteForm for its auto-save feature.
  // We make this an empty function because we only want a definitive manual save here.
  // For a "Create" screen, auto-saving can be confusing.
  const handleAutoSave = useCallback(async (data) => {
    // In a real app, you might save this as a "draft" locally.
    // For this project, we do nothing to keep it simple.
    console.log(
      "Auto-save triggered, but not saving a new note automatically.",
      data
    );
  }, []);

  // This is the main function for the manual "Save" button in the header.
  useLayoutEffect(() => {
    // We define the handler function INSIDE useLayoutEffect.
    // This gives it access to the latest title/content without needing
    // complex dependencies, fixing the old performance bug.
    const handleManualSave = async () => {
      if (!title.trim()) {
        Alert.alert("Title Required", "Please enter a title for your note.");
        return;
      }

      setIsSaving(true);
      try {
        await axios.post(`${API_URL}/notes`, { title, content });
        navigation.goBack(); // Go back to the list after a successful save
      } catch (error) {
        Alert.alert(
          "Save Failed",
          "The note could not be saved. Please try again."
        );
      } finally {
        setIsSaving(false);
      }
    };

    navigation.setOptions({
      title: "Add Note",
      headerRight: () => (
        <TouchableOpacity
          style={[styles.headerButton, isSaving && styles.headerButtonDisabled]}
          onPress={handleManualSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.headerButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      ),
    });
    // The effect correctly depends on all variables used to render the button.
    // This will NOT cause a re-render on every keystroke.
  }, [navigation, isSaving, title, content]);

  return (
    <NoteForm
      title={title}
      content={content}
      onTitleChange={setTitle}
      onContentChange={setContent}
      onAutoSave={handleAutoSave}
      autoSaveEnabled={false} // We explicitly disable auto-saving for new notes
    />
  );
}

// Consistent, professional styles matching your other screens.
const styles = StyleSheet.create({
  headerButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    minWidth: 70,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonDisabled: {
    backgroundColor: "#a0a0a0",
  },
  headerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
