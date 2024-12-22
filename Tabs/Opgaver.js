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
  Button,
  Image,
  RefreshControl,
} from "react-native";
import { CheckBox } from "react-native-elements";
import LottieView from "lottie-react-native";
import { collection, getDocs, query, where, getDoc, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { db } from "../firebase";
import { format } from "date-fns";
import { da } from "date-fns/locale";

import MapView, { Marker } from "react-native-maps";

const Opgaver = ({ navigation, route }) => {
  const { userData } = route.params || {};

  const [taskAnimation, setTaskAnimation] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDone, setIsTaskDone] = useState(false);
  const [taskImage, setTaskImage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (userData) {
      fetchAssignmentsWithUsers();
    } else {
      console.error("userData er ikke tilgængeligt i Opgaver.js");
    }
  }, [userData]);

  const fetchAssignmentsWithUsers = async () => {
    try {
      if (userData.role === "Byggeleder" || userData.role === "CEO") {
        const assignmentsRef = collection(db, "assignments");
        const querySnapshot = await getDocs(assignmentsRef);

        const assignments = [];
        querySnapshot.forEach((doc) => {
          assignments.push({ id: doc.id, ...doc.data() });
        });

        const assignmentsWithUsers = await Promise.all(
          assignments.map(async (assignment) => {
            try {
              const userDocRef = doc(db, "users", assignment.userId);
              const userDocSnap = await getDoc(userDocRef);

              if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                console.log("User found:", userData);
                return { ...assignment, user: { name: userData.name, email: userData.email } };
              } else {
                console.warn(`No user found for userId: ${assignment.userId}`);
                return { ...assignment, user: null };
              }
            } catch (error) {
              console.error("Error fetching user:", error);
              return { ...assignment, user: null };
            }
          })
        );
        setTasks(assignmentsWithUsers);
        setLoading(false);
      } else {
        setLoading(true);
        const userId = userData?.uid;
        console.log(userData);
        if (!userId) {
          console.error("Ingen bruger-id fundet.");
          return;
        }

        const assignmentsRef = collection(db, "assignments");
        const q = query(assignmentsRef, where("userId", "==", userId), where("isDone", "==", false));

        const querySnapshot = await getDocs(q);

        const userAssignments = [];
        querySnapshot.forEach((doc) => {
          userAssignments.push({ id: doc.id, ...doc.data(), user: userData });
        });

        setTasks(userAssignments);
        setLoading(false);
      }
      console.log("Opgaver hentet:", tasks);
    } catch (error) {
      console.error("Fejl ved hentning af opgaver:", error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAssignmentsWithUsers();
    setRefreshing(false);
  };

  const handleAnimationFinish = () => {
    setTaskAnimation(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return format(date, "dd/MM/yyyy", { locale: da });
  };

  const handleShowLocation = async (taskId) => {
    try {
      const assignmentDocRef = doc(db, "assignments", taskId);
      const assignmentDocSnap = await getDoc(assignmentDocRef);

      if (assignmentDocSnap.exists()) {
        const assignmentData = assignmentDocSnap.data();
        console.log("Raw assignment data:", assignmentData); // Debug log

        if (assignmentData.latitude && assignmentData.longtitude) {
          // Rettet fra longtitude
          console.log("Location data found:", {
            latitude: assignmentData.latitude,
            longtitude: assignmentData.longtitude, // Rettet fra longtitude
          });

          setLocation({
            latitude: parseFloat(assignmentData.latitude),
            longitude: parseFloat(assignmentData.longtitude), // Rettet fra longtitude
          });
          setShowMapModal(true);
        } else {
          console.log("No location data in assignment:", assignmentData);
          alert("Ingen lokationsdata tilgængelig for denne opgave");
        }
      } else {
        console.error("No assignment found for taskId: ", taskId);
        alert("Kunne ikke finde opgaven");
      }
    } catch (error) {
      console.error("Error fetching location data: ", error);
      alert("Der opstod en fejl ved hentning af lokation");
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setTaskImage(result.assets[0].uri);
    }
  };

  const uploadImageToFirebase = async (imageUri) => {
    try {
      const storage = getStorage();
      const fileName = imageUri.split("/").pop();
      const imageRef = ref(storage, `task-images/${fileName}`);

      const response = await fetch(imageUri);
      const blob = await response.blob();

      await uploadBytes(imageRef, blob);

      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error("Fejl ved upload af billede:", error);
      return null;
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;

    try {
      let imageUrl = null;

      if (taskImage) {
        imageUrl = await uploadImageToFirebase(taskImage);
      }

      const taskRef = doc(db, "assignments", selectedTask.id);
      await updateDoc(taskRef, {
        isDone: isTaskDone,
        image: imageUrl || selectedTask.image || null,
        dateOfFinished: isTaskDone ? new Date() : null,
      });

      alert("Opgaven er opdateret!");
      setShowTaskDialog(false);
      fetchAssignmentsWithUsers();
    } catch (error) {
      console.error("Fejl ved opdatering af opgave:", error);
      alert("Noget gik galt under opdateringen.");
    }
  };

  const renderTask = ({ item }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => {
        setSelectedTask(item);
        setIsTaskDone(item.isDone || false);
        setTaskImage(item.image || null);
        setShowTaskDialog(true);
      }}
    >
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.userId}>Medarbejder: {item.user ? item.user.name : "Ingen tildelt"}</Text>
      <Text style={styles.taskDetails}>Skal være færdig: {formatDate(item.needsToBedoneBy)}</Text>
      <Button
        title="Se Lokation"
        onPress={() => {
          handleShowLocation(item.id);
          setShowMapModal(true);
        }}
      />
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
                <Text style={styles.modalDetails}>Status: {isTaskDone ? "Færdig" : "I gang"}</Text>

                <View style={styles.imagePickerContainer}>
                  {taskImage && <Image source={{ uri: taskImage }} style={styles.image} />}
                  <Button title="Tilføj billede" onPress={handlePickImage} />
                </View>
                <View style={styles.checkboxContainer}>
                  <CheckBox
                    title="Opgaven er færdig"
                    checked={isTaskDone}
                    onPress={() => setIsTaskDone(!isTaskDone)}
                    containerStyle={styles.checkboxContainerStyle}
                    textStyle={styles.checkboxTextStyle}
                  />
                </View>
                <TouchableOpacity onPress={handleUpdateTask}>
                  <Text style={styles.updateButton}>Opdater Opg.</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowTaskDialog(false)}>
                  <Text style={styles.closeButton}>Luk</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showMapModal} animationType="slide" onRequestClose={() => setShowMapModal(false)}>
        <View style={styles.mapModalContainer}>
          <MapView
            style={styles.mapView}
            initialRegion={{
              latitude: location ? parseFloat(location.latitude) : 55.676098,
              longitude: location ? parseFloat(location.longitude) : 12.568337,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {location && (
              <Marker
                coordinate={{
                  latitude: parseFloat(location.latitude),
                  longitude: parseFloat(location.longitude),
                }}
                title="Opgave Lokation"
                description="Her er opgaven placeret"
              />
            )}
          </MapView>
          <TouchableOpacity style={styles.closeMapButton} onPress={() => setShowMapModal(false)}>
            <Text style={styles.closeMapButtonText}>Luk Kort</Text>
          </TouchableOpacity>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#007BFF"]} />}
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
  imagePickerContainer: {
    marginVertical: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  updateButton: {
    fontSize: 16,
    color: "green",
    textAlign: "center",
    marginVertical: 10,
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  mapContent: {
    flex: 1,
    position: "relative",
  },
  mapView: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  closeMapButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  closeMapButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxContainerStyle: {
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
    margin: 0,
  },
  checkboxTextStyle: {
    fontWeight: "normal",
    fontSize: 16,
    color: "#333",
  },
});

export default Opgaver;
