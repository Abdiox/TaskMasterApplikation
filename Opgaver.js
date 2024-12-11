import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, Dimensions, FlatList } from "react-native";
import LottieView from "lottie-react-native";

// Eksempel opgaver
const tasks = [
  {
    id: "1",
    task: "Opsætning af tagkonstruktion",
    assignedTo: "Henrik",
    dueDate: "15/12/2024",
  },
  {
    id: "2",
    task: "Montering af vinduer og døre",
    assignedTo: "Kasper",
    dueDate: "18/12/2024",
  },
  {
    id: "3",
    task: "Udskiftning af beskadiget træværk",
    assignedTo: "Martin",
    dueDate: "20/12/2024",
  },
  {
    id: "4",
    task: "Justering af døre og skabslåger",
    assignedTo: "Lars",
    dueDate: "22/12/2024",
  },
];

const Opgaver = () => {
  const [taskAnimation, setTaskAnimation] = useState(true);

  // Når animationen er færdig, stopper den med at køre, men bliver på skærmen
  const handleAnimationFinish = () => {
    setTaskAnimation(false); // Animationen stopper, men bliver på skærmen
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* Animationen vises hele tiden, men stopper med at køre når færdig */}
      <LottieView
        source={require("./assets/TaskAnimation.json")}
        autoPlay
        loop={false} // Animationen loops ikke
        onAnimationFinish={handleAnimationFinish} // Når animationen er færdig, stopper den og bliver på skærmen
        style={styles.animationSize}
      />

      {/* Opgaverne vises samtidigt med animationen */}
      <Text style={styles.title}>Opgaver</Text>
      <Text style={styles.subtitle}>Her er dagens arbejds opgaver!</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{item.task}</Text>
            <Text style={styles.taskDetails}>Tildelt til: {item.assignedTo}</Text>
            <Text style={styles.taskDetails}>Senest: {item.dueDate}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    width: Dimensions.get("window").width * 0.9, // Bredde af kortene
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5, // For at skabe en skyggeeffekt på Android
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  taskDetails: {
    fontSize: 14,
    color: "#777",
    marginBottom: 4,
  },
  animationSize: {
    width: Dimensions.get("window").width * 0.8,
    height: Dimensions.get("window").width * 0.8,
    marginBottom: 20,
  },
});

export default Opgaver;
