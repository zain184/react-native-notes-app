import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  Dimensions,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";

const NoteForm = ({
  title,
  content,
  onTitleChange,
  onContentChange,
  autoSaveEnabled = true,
  autoSaveDelay = 2000,
  showWordCount = true,
  maxLength = null,
  onAutoSave = null,
}) => {
  const contentInputRef = React.useRef(null);
  const scrollViewRef = React.useRef(null);
  const autoSaveTimeoutRef = React.useRef(null);
  const scrollTimeoutRef = React.useRef(null);

  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [currentSelection, setCurrentSelection] = React.useState({
    start: 0,
    end: 0,
  });
  const [undoStack, setUndoStack] = React.useState([]);
  const [redoStack, setRedoStack] = React.useState([]);
  const [isAutoSaving, setIsAutoSaving] = React.useState(false);
  const [lastSavedContent, setLastSavedContent] = React.useState({
    title: "",
    content: "",
  });

  // Debounced scroll function (No changes needed here)
  const debouncedScrollToCursor = React.useCallback(
    (selection) => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        try {
          if (!scrollViewRef.current || !content || !selection) return;
          const lineHeight = 24;
          const textBeforeCursor = content.slice(0, selection.start);
          const numberOfLines = textBeforeCursor.split("\n").length;
          const cursorY = numberOfLines * lineHeight + 100;
          const screenDimensions = Dimensions.get("window");
          if (!screenDimensions) return;
          const screenHeight = screenDimensions.height;
          const availableHeight = screenHeight - keyboardHeight - 100;

          if (cursorY > availableHeight) {
            const scrollToY = cursorY - availableHeight * 0.7;
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, scrollToY),
              animated: true,
            });
          }
        } catch (error) {
          console.warn("Error in scroll calculation:", error);
        }
      }, 100);
    },
    [content, keyboardHeight]
  );

  // Auto-save functionality (No changes needed here)
  const triggerAutoSave = React.useCallback(() => {
    if (!autoSaveEnabled || !onAutoSave) return;
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const currentData = { title, content };
        if (
          currentData.title !== lastSavedContent.title ||
          currentData.content !== lastSavedContent.content
        ) {
          setIsAutoSaving(true);
          await onAutoSave(currentData);
          setLastSavedContent(currentData);
        }
      } catch (error) {
        console.warn("Auto-save failed:", error);
      } finally {
        setIsAutoSaving(false);
      }
    }, autoSaveDelay);
  }, [
    title,
    content,
    autoSaveEnabled,
    onAutoSave,
    autoSaveDelay,
    lastSavedContent,
  ]);

  // Undo/Redo functionality (No changes needed here)
  const saveToUndoStack = React.useCallback(
    (newTitle, newContent) => {
      setUndoStack((prev) => {
        const newStack = [...prev, { title, content }];
        return newStack.length > 50 ? newStack.slice(1) : newStack;
      });
      setRedoStack([]);
    },
    [title, content]
  );
  const handleUndo = React.useCallback(() => {
    if (undoStack.length === 0) return;
    const lastState = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, { title, content }]);
    setUndoStack((prev) => prev.slice(0, -1));
    onTitleChange(lastState.title);
    onContentChange(lastState.content);
  }, [undoStack, title, content, onTitleChange, onContentChange]);
  const handleRedo = React.useCallback(() => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, { title, content }]);
    setRedoStack((prev) => prev.slice(0, -1));
    onTitleChange(nextState.title);
    onContentChange(nextState.content);
  }, [redoStack, title, content, onTitleChange, onContentChange]);
  const handleTitleChange = React.useCallback(
    (newTitle) => {
      saveToUndoStack(newTitle, content);
      onTitleChange(newTitle);
      triggerAutoSave();
    },
    [onTitleChange, content, saveToUndoStack, triggerAutoSave]
  );
  const handleContentChange = React.useCallback(
    (newContent) => {
      if (maxLength && newContent.length > maxLength) {
        Alert.alert("Limit Reached", `Maximum ${maxLength} characters.`);
        return;
      }
      saveToUndoStack(title, newContent);
      onContentChange(newContent);
      triggerAutoSave();
    },
    [onContentChange, title, maxLength, saveToUndoStack, triggerAutoSave]
  );
  const handleSelectionChange = React.useCallback(
    ({ nativeEvent: { selection } }) => {
      try {
        setCurrentSelection(selection);
        if (keyboardHeight > 0) {
          debouncedScrollToCursor(selection);
        }
      } catch (error) {
        console.warn("Error in selection change:", error);
      }
    },
    [keyboardHeight, debouncedScrollToCursor]
  );
  const handleFocus = React.useCallback(() => {
    setTimeout(() => debouncedScrollToCursor(currentSelection), 300);
  }, [currentSelection, debouncedScrollToCursor]);

  // Word/character count (No changes needed here)
  const getWordCount = React.useCallback((text) => {
    if (!text || typeof text !== "string") return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, []);
  const wordCount = React.useMemo(
    () => getWordCount(content),
    [content, getWordCount]
  );
  const characterCount = React.useMemo(() => (content || "").length, [content]);

  // Keyboard listeners (No changes needed here)
  React.useEffect(() => {
    const show = (e) => setKeyboardHeight(e.endCoordinates?.height || 0);
    const hide = () => setKeyboardHeight(0);
    const subShow = Keyboard.addListener("keyboardDidShow", show);
    const subHide = Keyboard.addListener("keyboardDidHide", hide);
    return () => {
      subShow?.remove();
      subHide?.remove();
    };
  }, []);

  // Cleanup timeouts (No changes needed here)
  React.useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  return (
    // ===== FIX 2: Removed `accessibilityRole="form"` =====
    // This role is not valid on a KeyboardAvoidingView in native Android.
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      accessibilityLabel="Note editing form"
    >
      <View style={styles.actionBar}>
        <View style={styles.actionGroup}>
          <TouchableOpacity
            onPress={handleUndo}
            disabled={undoStack.length === 0}
            style={[
              styles.actionButton,
              undoStack.length === 0 && styles.disabledButton,
            ]}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.actionText,
                undoStack.length === 0 && styles.disabledText,
              ]}
            >
              Undo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleRedo}
            disabled={redoStack.length === 0}
            style={[
              styles.actionButton,
              redoStack.length === 0 && styles.disabledButton,
            ]}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.actionText,
                redoStack.length === 0 && styles.disabledText,
              ]}
            >
              Redo
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statusGroup}>
          {isAutoSaving && (
            <View style={styles.autoSaveIndicator}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.autoSaveText}>Saving...</Text>
            </View>
          )}
          {showWordCount && (
            <View style={styles.countContainer}>
              <Text style={styles.countText}>
                {wordCount} words • {characterCount} chars
                {maxLength && ` / ${maxLength}`}
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: keyboardHeight > 0 ? 20 : 50 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={handleTitleChange}
          style={styles.titleInput}
          returnKeyType="next"
          onSubmitEditing={() => contentInputRef.current?.focus()}
          accessibilityRole="header"
          accessibilityLabel="Note title"
          accessibilityHint="Enter a title for your note"
          maxLength={maxLength ? Math.min(maxLength, 200) : 200}
        />
        <TextInput
          ref={contentInputRef}
          placeholder="Start writing your note..."
          value={content}
          onChangeText={handleContentChange}
          style={styles.contentInput}
          multiline
          textAlignVertical="top"
          onSelectionChange={handleSelectionChange}
          onFocus={handleFocus}
          scrollEnabled={false}
          returnKeyType="default"
          // ===== FIX 1: Removed `accessibilityRole="textbox"` =====
          // This value is not valid in native Android and was causing the crash.
          accessibilityLabel="Note content"
          accessibilityHint="Enter the main content of your note"
          accessibilityMultiline={true}
          maxLength={maxLength}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// --- Your styles remain unchanged as they are excellent ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f9f9f9",
  },
  actionGroup: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#007AFF",
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  actionText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  disabledText: {
    color: "#888888",
  },
  statusGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  autoSaveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  autoSaveText: {
    fontSize: 12,
    color: "#007AFF",
    fontStyle: "italic",
  },
  countContainer: {
    alignItems: "flex-end",
  },
  countText: {
    fontSize: 12,
    color: "#666666",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  titleInput: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 18,
    borderRadius: 8,
    marginBottom: 16,
    fontWeight: "500",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contentInput: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingVertical: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    borderRadius: 8,
    minHeight: 400,
    textAlignVertical: "top",
    lineHeight: 24,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default NoteForm;
