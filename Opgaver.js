import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, Dimensions, FlatList, TouchableOpacity } from "react-native";
import { TextInput, Button } from "react-native-paper";
import LottieView from "lottie-react-native";

export const Opgaver = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opgaver</Text>
      <Text>Here you can see your tasks</Text>
      {/* Display tasks here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});

export default Opgaver;
