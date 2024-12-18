import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  FlatList,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import LottieView from "lottie-react-native";
import { collection, getDocs, query, where, getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { format } from "date-fns";
import { da } from "date-fns/locale";

const Opgaver = ({ navigation, route }) => {
  const { userData } = route.params || {};

  const [taskAnimation, setTaskAnimation] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (userData) {
      fetchAssignmentsWithUsers();
    } else {
      console.error("userData er ikke tilgængeligt i Opgaver.js");
    }
  }, [userData]); // Sørg for at køre funktionen, når userData ændres

  const fetchAssignmentsWithUsers = async () => {
    try {
      // Hvis brugeren er en byggeleder, hent alle opgaver
      if (userData.role === "Byggeleder") {
        const assignmentsRef = collection(db, "assignments");
        const querySnapshot = await getDocs(assignmentsRef);

        // Fetch all assignments
        const assignments = [];
        querySnapshot.forEach((doc) => {
          assignments.push({ id: doc.id, ...doc.data() });
        });

        const assignmentsWithUsers = await Promise.all(
          assignments.map(async (assignment) => {
            try {
              const userDocRef = doc(db, "users", assignment.userId); // Brug userId som dokumentets ID
              const userDocSnap = await getDoc(userDocRef);

              if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                console.log("User found:", userData);
                return {
                  ...assignment,
                  user: { name: userData.name, email: userData.email },
                };
              } else {
                console.warn(`No user found for userId: ${assignment.userId}`);
                return { ...assignment, user: null }; // Ingen bruger fundet
              }
            } catch (error) {
              console.error("Error fetching user:", error);
              return { ...assignment, user: null };
            }
          })
        );
        setTasks(assignmentsWithUsers);
        setLoading(false);
      } else {   // Hvis brugeren er en medarbejder, hent kun egne opgaver
        setLoading(true);

        // Hent brugerens userId fra route.params.userData
        const userId = userData?.uid;

        if (!userId) {
          console.error("Ingen bruger-id fundet.");
          return;
        }

        // Firestore-query: Hent kun assignments for den loggede bruger
        const assignmentsRef = collection(db, "assignments");
        const q = query(assignmentsRef, where("userId", "==", userId));

        const querySnapshot = await getDocs(q);

        // Gem opgaver i state
        const userAssignments = [];
        querySnapshot.forEach((doc) => {
          userAssignments.push({ id: doc.id, ...doc.data() });
        });

        setTasks(userAssignments); // Opdater state med opgaver
        setLoading(false);
      }

      console.log("Opgaver:", tasks);
    } catch (error) {
      console.error("Fejl ved hentning af opgaver:", error);
      setLoading(false);
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
      <Text style={styles.userId}>
        Medarbejder: {item.user ? item.user.name : "Ingen tildelt"}
      </Text>
      <Text style={styles.taskDetails}>
        Skal være færdig: {formatDate(item.needsToBedoneBy)}
      </Text>
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

      <Modal
        visible={showTaskDialog}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTaskDialog(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedTask && (
              <>
                <Text style={styles.modalTitle}>{selectedTask.title}</Text>
                <Text style={styles.userId}>
                  Medarbejder:{" "}
                  {selectedTask.user ? selectedTask.user.name : "Ingen tildelt"}
                </Text>
                <Text style={styles.modalDetails}>
                  Beskrivelse: {selectedTask.description}
                </Text>
                <Text style={styles.modalDetails}>
                  Skal være færdig: {formatDate(selectedTask.needsToBedoneBy)}
                </Text>
                <Text style={styles.modalDetails}>
                  Status: {selectedTask.isDone ? "Færdig" : "I gang"}
                </Text>
                {selectedTask.location && (
                  <Text style={styles.modalDetails}>
                    Lokation: {selectedTask.location.latitude},{" "}
                    {selectedTask.location.longitude}
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
      {tasks.length > 0 ? (
        <Text style={styles.subtitle}>Her er dagens arbejdsopgaver!</Text>
      ) : (
        <Text style={styles.subtitle}>Du har fuldført alle dine opgaver</Text>
      )}

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        style={styles.list}
      />

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
