// File: frontend/context/AppContext.js
import React from "react";

// Create the context object itself.
// This is what components will use with the useContext hook.
export const AppContext = React.createContext({});

// Create the provider component.
// This is what you will use in App.js to wrap your application.
export const AppProvider = ({ children }) => {
  // This is where you would put global application state logic in the future.
  // For example:
  // const [user, setUser] = React.useState(null);
  // const [isLoading, setIsLoading] = React.useState(true);

  // The 'value' object makes your state and functions available to the entire app.
  const value = {
    // user,
    // isLoading,
    // login: () => {},
    // logout: () => {},
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
