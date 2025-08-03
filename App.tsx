// import "react-native-url-polyfill/auto";
// import "react-native-get-random-values";

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import RootNavigator from "./src/navigation/RootNavigator";

/* Amplify config - Temporarily disabled until proper AWS credentials are configured */
// import { Amplify } from "aws-amplify";
// import awsconfig from "./aws-exports";

// Amplify.configure(awsconfig);

export default function App() {
  return (
    <NavigationContainer>
      <RootNavigator />
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
