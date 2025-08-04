import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { AuthProvider } from "@/utils/authContext";
import React from "react";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen
          name="(protected)"
          options={{
            headerShown: false,
            animation: "none",
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            animation: "none",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            animation: "none",
            headerShown: false,
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
