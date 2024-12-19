import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import LottieView from "lottie-react-native";

const Medarbejder = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserNumber, setNewUserNumber] = useState("");
  const [newUserRole, setNewUserRole] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isRoleDropdownVisible, setIsRoleDropdownVisible] = useState(false);
  const [roles] = useState(["CEO", "Byggeleder", "Tømrer", "Tømrerlærling", "Projektleder"]);

  const animation = useRef(null);
  const deleteAnimation = useRef(null);
  const editAnimation = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      } catch (error) {
        console.error("Fejl ved hentning af brugere:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!newUserName || !newUserEmail || !newUserNumber || !newUserRole) {
      Alert.alert("Fejl", "Alle felter skal udfyldes.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "users"), {
        name: newUserName,
        email: newUserEmail,
        number: newUserNumber,
        role: newUserRole,
      });

      setUsers([
        ...users,
        {
          id: docRef.id,
          name: newUserName,
          email: newUserEmail,
          number: newUserNumber,
          role: newUserRole,
        },
      ]);

      animation.current.play();

      setNewUserName("");
      setNewUserEmail("");
      setNewUserNumber("");
      setNewUserRole("");
      setShowAddUserModal(false);
    } catch (error) {
      console.error("Fejl ved tilføjelse af medarbejder:", error);
    }
  };

  const handleEditUser = async (id) => {
    if (!newUserName || !newUserEmail || !newUserNumber || !newUserRole) {
      Alert.alert("Fejl", "Alle felter skal udfyldes.");
      return;
    }

    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        name: newUserName,
        email: newUserEmail,
        number: newUserNumber,
        role: newUserRole,
      });

      const updatedUsers = users.map((user) =>
        user.id === id
          ? {
              ...user,
              name: newUserName,
              email: newUserEmail,
              number: newUserNumber,
              role: newUserRole,
            }
          : user
      );

      editAnimation.current.play();

      setUsers(updatedUsers);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserNumber("");
      setNewUserRole("");
      setShowEditModal(false);
    } catch (error) {
      console.error("Fejl ved opdatering af medarbejder:", error);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const userRef = doc(db, "users", id);
      setIsDeleting(true);
      deleteAnimation.current.play();

      await deleteDoc(userRef);

      setTimeout(() => {
        const filteredUsers = users.filter((user) => user.id !== id);
        setUsers(filteredUsers);
        setIsDeleting(false);
        setShowUserDetailsModal(false);
      }, 300);
    } catch (error) {
      console.error("Fejl ved sletning af medarbejder:", error);
      setIsDeleting(false);
    }
  };

  const renderRoleDropdown = () => (
    <View>
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setIsRoleDropdownVisible(!isRoleDropdownVisible)}>
        <Text style={styles.dropdownButtonText}>{newUserRole || "Vælg en rolle"}</Text>
      </TouchableOpacity>

      {isRoleDropdownVisible && (
        <View style={[styles.dropdown, { position: "relative" }]}>
          {roles.map((role, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownItem}
              onPress={() => {
                setNewUserRole(role);
                setIsRoleDropdownVisible(false);
              }}
            >
              <Text style={styles.dropdownButtonText}>{role}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedUser(item);
        setShowUserDetailsModal(true);
      }}
    >
      <View style={styles.userCard}>
        <Image
          source={{
            uri: item.photoURL || "https://i.ibb.co/QF0dv4P/Pngtree-avatar-icon-profile-icon-member-5247852.png",
          }}
          style={styles.userImage}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name || "Ingen navn"}</Text>
          <Text style={styles.userRole}>{item.role || "Rolle ikke angivet"}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Henter medarbejdere...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Medarbejdere</Text>

      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddUserModal(true)}>
        <Text style={styles.addButtonText}>+ Tilføj ny medarbejder</Text>
      </TouchableOpacity>

      {/* Animations */}
      <LottieView
        ref={animation}
        source={require("../assets/AddUserSuccesAnimation.json")}
        autoPlay={false}
        loop={false}
        style={styles.animationSize}
      />

      <LottieView
        ref={deleteAnimation}
        source={require("../assets/DeletedUserAnimation.json")}
        autoPlay={false}
        loop={false}
        style={styles.DeleteAnimationSize}
      />

      <LottieView
        ref={editAnimation}
        source={require("../assets/EditUserAnimation.json")}
        autoPlay={false}
        loop={false}
        style={styles.EditAnimationSize}
      />

      {/* Add user modal */}
      <Modal visible={showAddUserModal} animationType="slide" onRequestClose={() => setShowAddUserModal(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Opret ny medarbejder</Text>
          <TextInput style={styles.input} placeholder="Navn" placeholderTextColor="#888" value={newUserName} onChangeText={setNewUserName} />
          <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor="#888" value={newUserEmail} onChangeText={setNewUserEmail} />
          <TextInput style={styles.input} placeholder="Nummer" placeholderTextColor="#888" value={newUserNumber} onChangeText={setNewUserNumber} />

          {renderRoleDropdown()}

          <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
            <Text style={styles.addButtonText}>Tilføj medarbejder</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setShowAddUserModal(false);
              setIsRoleDropdownVisible(false);
            }}
          >
            <Text style={styles.closeButtonText}>Luk</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Edit user modal */}
      <Modal visible={showEditModal} animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Rediger medarbejder</Text>
          <TextInput style={styles.input} placeholder="Navn" placeholderTextColor="#888" value={newUserName} onChangeText={setNewUserName} />
          <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor="#888" value={newUserEmail} onChangeText={setNewUserEmail} />
          <TextInput style={styles.input} placeholder="Nummer" placeholderTextColor="#888" value={newUserNumber} onChangeText={setNewUserNumber} />

          {renderRoleDropdown()}

          <TouchableOpacity style={styles.addButton} onPress={() => handleEditUser(editingUserId)}>
            <Text style={styles.addButtonText}>Opdater medarbejder</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setShowEditModal(false);
              setIsRoleDropdownVisible(false);
            }}
          >
            <Text style={styles.closeButtonText}>Luk</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* User details modal */}
      <Modal visible={showUserDetailsModal} animationType="slide" onRequestClose={() => setShowUserDetailsModal(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Bruger detaljer</Text>
          <Text style={styles.modalText}>Navn: {selectedUser?.name}</Text>
          <Text style={styles.modalText}>Email: {selectedUser?.email}</Text>
          <Text style={styles.modalText}>Nummer: {selectedUser?.number}</Text>
          <Text style={styles.modalText}>Rolle: {selectedUser?.role}</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setNewUserName(selectedUser.name);
              setNewUserEmail(selectedUser.email);
              setNewUserNumber(selectedUser.number);
              setNewUserRole(selectedUser.role);
              setEditingUserId(selectedUser.id);
              setShowUserDetailsModal(false);
              setShowEditModal(true);
            }}
          >
            <Text style={styles.editButtonText}>Rediger</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteUser(selectedUser.id)} disabled={isDeleting}>
            <Text style={styles.deleteButtonText}>{isDeleting ? "Sletter..." : "Slet bruger"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={() => setShowUserDetailsModal(false)}>
            <Text style={styles.closeButtonText}>Luk</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <FlatList data={users} renderItem={renderItem} keyExtractor={(item) => item.id} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Clean white background
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333", // Dark text for header
  },
  userCard: {
    flexDirection: "row",
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9", // Light background on cards
    shadowColor: "#000", // Subtle shadow effect for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#FF5722", // Orange border around image
  },
  userInfo: {
    justifyContent: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333", // Dark text for name
  },
  userRole: {
    fontSize: 16,
    color: "#FF5722", // Orange color for role
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 20,
    color: "#FF5722", // Orange text during loading
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff", // White background in modals
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333", // Dark title color
  },
  input: {
    borderWidth: 1,
    borderColor: "#FF5722", // Orange border for input fields
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    color: "#333", // Dark text in input fields
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#FF5722", // Orange border around dropdown
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#FF5722", // Orange text inside dropdown
  },
  dropdown: {
    backgroundColor: "#fff", // White background in dropdown
    borderWidth: 1,
    borderColor: "#FF5722",
    borderRadius: 5,
    marginTop: 5,
    width: "100%",
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  addButton: {
    backgroundColor: "#FF5722", // Orange background for add button
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  addButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
  },
  editButton: {
    backgroundColor: "#FF9800", // Lighter orange for edit button
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  editButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
  },
  deleteButton: {
    backgroundColor: "#F44336", // Red background for delete button
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  deleteButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
  },
  closeButton: {
    backgroundColor: "#ddd", // Light grey background for close button
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  closeButtonText: {
    color: "#333", // Dark text on close button
    textAlign: "center",
    fontSize: 18,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 12,
    color: "#333", // Dark text inside modals
  },
  animationSize: {
    width: 120,
    height: 120,
    position: "absolute",
    top: 20,
    right: 20,
  },
  DeleteAnimationSize: {
    width: 120,
    height: 120,
    position: "absolute",
    top: 60,
    right: 20,
  },
  EditAnimationSize: {
    width: 120,
    height: 120,
    position: "absolute",
    top: 100,
    right: 20,
  },
});

export default Medarbejder;
