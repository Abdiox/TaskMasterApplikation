import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Dimensions, FlatList, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
import LottieView from "lottie-react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { format } from "date-fns";
import { da } from "date-fns/locale";

const Opgaver = () => {
  const [taskAnimation, setTaskAnimation] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchAssignmentsWithUsers();
  }, []);

  const fetchAssignmentsWithUsers = async () => {
    try {
      // Hent alle assignments
      const assignmentsCollection = collection(db, "assignments");
      const assignmentsSnapshot = await getDocs(assignmentsCollection);
      const assignments = assignmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Hent alle users
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Match assignments med users
      const assignmentsWithUsers = assignments.map((assignment) => {
        const user = users.find((u) => u.id === assignment.userId);
        return {
          ...assignment,
          user: user || null,
        };
      });

      setTasks(assignmentsWithUsers); // Opdater state
      setLoading(false); // Stop loading
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false); // Stop loading, selv ved fejl
    }
  };

  const handleAnimationFinish = () => {
    setTaskAnimation(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return format(date, "dd/MM/yyyy", { locale: da });
  };

  const renderTask = ({ item }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => {
        setSelectedTask(item);
        setShowTaskDialog(true);
      }}
    >
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.userId}>Medarbejder: {item.user ? item.user.name : "Ingen tildelt"}</Text>
      <Text style={styles.taskDetails}>Skal være færdig: {formatDate(item.needsToBedoneBy)}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Indlæser opgaver...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {taskAnimation && (
        <LottieView
          source={require("../assets/TaskAnimation.json")}
          autoPlay
          loop={false}
          onAnimationFinish={handleAnimationFinish}
          style={styles.animationSize}
        />
      )}

      <Modal visible={showTaskDialog} animationType="slide" transparent={true} onRequestClose={() => setShowTaskDialog(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedTask && (
              <>
                <Text style={styles.modalTitle}>{selectedTask.title}</Text>
                <Text style={styles.userId}>Medarbejder: {selectedTask.user ? selectedTask.user.name : "Ingen tildelt"}</Text>
                <Text style={styles.modalDetails}>Beskrivelse: {selectedTask.description}</Text>
                <Text style={styles.modalDetails}>Skal være færdig: {formatDate(selectedTask.needsToBedoneBy)}</Text>
                <Text style={styles.modalDetails}>Status: {selectedTask.isDone ? "Færdig" : "I gang"}</Text>
                {selectedTask.location && (
                  <Text style={styles.modalDetails}>
                    Lokation: {selectedTask.location.latitude}, {selectedTask.location.longitude}
                  </Text>
                )}
              </>
            )}
            <TouchableOpacity onPress={() => setShowTaskDialog(false)}>
              <Text style={styles.closeButton}>Luk</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.title}>Opgaver</Text>
      <Text style={styles.subtitle}>Her er dagens arbejdsopgaver!</Text>

      <FlatList data={tasks} keyExtractor={(item) => item.id} renderItem={renderTask} style={styles.list} />

      <Text style={styles.footerText}>TaskMaster © 2024</Text>
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
  userId: {
    fontSize: 16,
    color: "#777",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  list: {
    width: "100%",
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    width: Dimensions.get("window").width * 0.9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    width: Dimensions.get("window").width * 0.9,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalDetails: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  closeButton: {
    fontSize: 16,
    color: "#007BFF",
    marginTop: 16,
    textAlign: "center",
  },
  footerText: {
    marginTop: 20,
    fontSize: 12,
    color: "#aaa",
  },
});

export default Opgaver;
