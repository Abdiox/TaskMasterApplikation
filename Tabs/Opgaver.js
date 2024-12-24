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
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

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

  const getFilteredTasks = () => {
    switch (filterStatus) {
      case "active":
        return tasks.filter((task) => !task.isDone);
      case "completed":
        return tasks.filter((task) => task.isDone);
      default:
        return tasks;
    }
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
        if (assignmentData.latitude && assignmentData.longitude) {
          setLocation({
            latitude: parseFloat(assignmentData.latitude),
            longitude: parseFloat(assignmentData.longitude),
          });
          setShowMapModal(true);
        } else {
          alert("Ingen lokationsdata tilgængelig for denne opgave");
        }
      } else {
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
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Add error handling for blob
      if (!blob) {
        throw new Error("Failed to create blob from image");
      }

      // Use timestamp in filename to avoid conflicts
      const fileName = `${Date.now()}-${imageUri.split("/").pop()}`;
      const imageRef = ref(storage, `task-images/${fileName}`);

      // Add upload metadata
      const metadata = {
        contentType: "image/jpeg",
      };

      await uploadBytes(imageRef, blob, metadata);
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.error("Detailed upload error:", error);
      throw error;
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask || isAnimating) return;

    try {
      setIsAnimating(true);
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

      setShowTaskDialog(false);
      await fetchAssignmentsWithUsers();

      if (isTaskDone) {
        setAnimationKey((prev) => prev + 1);
        setShowSuccessAnimation(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setShowSuccessAnimation(false);
      }
    } catch (error) {
      console.error("Fejl ved opdatering af opgave:", error);
      alert("Noget gik galt under opdateringen.");
    } finally {
      setIsAnimating(false);
    }
  };

  const renderFilterButtons = () => {
    if (userData?.role === "CEO" || userData?.role === "Byggeleder") {
      return (
        <View style={styles.filterContainer}>
          <TouchableOpacity style={[styles.filterButton, filterStatus === "all" && styles.activeFilter]} onPress={() => setFilterStatus("all")}>
            <Text style={[styles.filterText, filterStatus === "all" && styles.activeFilterText]}>Alle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterButton, filterStatus === "active" && styles.activeFilter]} onPress={() => setFilterStatus("active")}>
            <Text style={[styles.filterText, filterStatus === "active" && styles.activeFilterText]}>Aktive</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === "completed" && styles.activeFilter]}
            onPress={() => setFilterStatus("completed")}
          >
            <Text style={[styles.filterText, filterStatus === "completed" && styles.activeFilterText]}>Færdige</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
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

      {showSuccessAnimation && (
        <View style={styles.animationOverlay}>
          <LottieView key={animationKey} source={require("../assets/JobSuccess.json")} autoPlay loop={false} style={styles.JobDoneAnimation} />
        </View>
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
                  <Button style={styles.addPicture} title="Tilføj billede" onPress={handlePickImage} />
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

      {renderFilterButtons()}

      <FlatList
        data={getFilteredTasks()}
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
    width: Dimensions.get("window").width * 0.4,
    height: Dimensions.get("window").width * 0.4,
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
    backgroundColor: "#FF8C00",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  footerText: {
    marginTop: 20,
    fontSize: 12,
    color: "#aaa",
  },
  addPicture: {
    fontSize: 16,
    color: "#FF8C00",
    textAlign: "center",
    marginVertical: 10,
  },
  imagePickerContainer: {
    marginVertical: 10,
    alignItems: "center",
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
    color: "#FF8C00",
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: "#FF8C00",
  },
  updateButton: {
    backgroundColor: "#FF8C00",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
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
    backgroundColor: "#FF8C00",
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
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    width: "100%",
    padding: 5,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  activeFilter: {
    backgroundColor: "#FF8C00",
    borderColor: "#333",
  },
  filterText: {
    color: "#666",
    fontWeight: "600",
  },
  activeFilterText: {
    color: "#fff",
  },
  animationOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  JobDoneAnimation: {
    width: 200,
    height: 200,
    zIndex: 1001,
  },
});

export default Opgaver;
