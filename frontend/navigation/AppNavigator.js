// File: frontend/navigation/AppNavigator.js

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { Platform } from "react-native";
import NotesListScreen from "../screens/NotesListScreen";
import NoteDetailScreen from "../screens/NoteDetailScreen";
import AddNoteScreen from "../screens/AddNoteScreen";
import EditNoteScreen from "../screens/EditNoteScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const screenOptions = {
    headerStyle: {
      backgroundColor: "#007AFF",
      elevation: 4, // Android shadow
      shadowOpacity: 0.3, // iOS shadow
      shadowRadius: 4,
      shadowOffset: { height: 2, width: 0 },
    },
    headerTintColor: "white",
    headerTitleStyle: {
      fontWeight: "bold",
      fontSize: 18,
    },
    headerBackTitleVisible: false, // iOS: Hide back button text
    cardStyle: {
      backgroundColor: "white",
    },
    // Modern stack animation options
    cardStyleInterpolator:
      Platform.OS === "ios"
        ? undefined // Use default iOS animation
        : ({ current, layouts }) => ({
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          }),
  };

  return (
    <Stack.Navigator initialRouteName="NotesList" screenOptions={screenOptions}>
      <Stack.Screen
        name="NotesList"
        component={NotesListScreen}
        options={{
          title: "My Notes",
          headerLargeTitle: true, // iOS large title style
        }}
      />

      <Stack.Screen
        name="NoteDetail"
        component={NoteDetailScreen}
        options={({ route }) => ({
          title: "Note",
          // Dynamic title could be implemented here if needed
          // title: route.params?.noteTitle || "Note",
        })}
      />

      <Stack.Screen
        name="AddNote"
        component={AddNoteScreen}
        options={{
          title: "New Note",
          presentation: Platform.OS === "ios" ? "modal" : "card",
        }}
      />

      <Stack.Screen
        name="EditNote"
        component={EditNoteScreen}
        options={{
          title: "Edit Note",
          presentation: Platform.OS === "ios" ? "modal" : "card",
        }}
      />
    </Stack.Navigator>
  );
}
