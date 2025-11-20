import { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export default function App() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [mensaje, setMensaje] = useState("");

  const registrar = () => {
    createUserWithEmailAndPassword(auth, email, pass)
      .then(() => setMensaje("Usuario creado"))
      .catch((e) => setMensaje(e.message));
  };

  const login = () => {
    signInWithEmailAndPassword(auth, email, pass)
      .then(() => setMensaje("Login exitoso"))
      .catch((e) => setMensaje(e.message));
  };

  return (
    <View style={{ marginTop: 100, padding: 20 }}>
      <TextInput
        placeholder="Email"
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        onChangeText={setPass}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      <Button title="Registrar" onPress={registrar} />
      <Button title="Login" onPress={login} />

      <Text style={{ marginTop: 20 }}>{mensaje}</Text>
    </View>
  );
}
