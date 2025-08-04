import { AuthContext } from "@/utils/authContext";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext } from "react";
import "react-native-reanimated";

export const unstable_settings = {
  initialRouteName: "(tabs)", // anchor
};

export default function ProtectedLayout() {
  const authState = useContext(AuthContext);

  if (!authState.isReady)
    if (!authState.isLoggedIn) {
      return <Redirect href={"/login"} />;
    }

  return (
    <React.Fragment>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </React.Fragment>
  );
}
