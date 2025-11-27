import React, { useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Share,
  Alert,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!permission) return <SafeAreaView style={styles.container} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a0033" />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Permiso Requerido</Text>
          <Text style={styles.permissionText}>Necesitas permitir acceso a la cámara</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Dar Permiso</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const takePhoto = async () => {
    try {
      if (cameraRef.current) {
        const result = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        setPhoto(result.uri);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const handleShare = async () => {
    try {
      if (photo) {
        await Share.share({
          url: photo,
          message: '¡Mira mi foto capturada con FotoApp! 📸',
          title: 'Compartir foto',
        });
      }
    } catch (error) {
      Alert.alert('Éxito', 'Foto compartida correctamente');
    }
  };

  const handleLogin = () => {
    if (username === 'admin' && password === '1234') {
      setIsLoggedIn(true);
      Alert.alert('Bienvenido', '¡Acceso permitido!');
    } else {
      Alert.alert('Error', 'Usuario o contraseña incorrectos');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a0033" />
        <ScrollView contentContainerStyle={styles.loginContainer}>
          <View style={styles.titleBox}>
            <Text style={styles.cyberTitle}>INICIO DE SESIÓN</Text>
            <View style={styles.cyberLine} />
          </View>

          <View style={styles.loginForm}>
            <Text style={styles.inputLabel}>USUARIO:</Text>
            <TextInput
              style={styles.input}
              placeholder="admin"
              placeholderTextColor="#00ff88"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>CONTRASEÑA:</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#00ff88"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>[ INGRESAR ]</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a0033" />
      <ScrollView contentContainerStyle={styles.mainContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.cyberTitle}>INICIO DE SESIÓN</Text>
        </View>

        {/* Camera / Photo Section */}
        <View style={styles.cameraSection}>
          {!photo ? (
            <View style={styles.cameraWrapper}>
              <CameraView ref={cameraRef} style={styles.camera} />
              <View style={styles.cameraOverlay}>
                <Text style={styles.cameraText}>CAPTURA TU MOMENTO</Text>
              </View>
            </View>
          ) : (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photo }} style={styles.photo} />
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {!photo ? (
            <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
              <Text style={styles.actionButtonText}>TOMAR FOTO</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Text style={styles.actionButtonText}>COMPARTIR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => setPhoto(null)}>
                <Text style={styles.actionButtonText}>TOMAR OTRA</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Login Form */}
        <View style={styles.bottomForm}>
          <View style={styles.formBox}>
            <Text style={styles.formTitle}>USUARIO ACTIVO:</Text>
            <View style={styles.userDisplay}>
              <Text style={styles.userText}>▸ {username}</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>[ CERRAR SESIÓN ]</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0a2e',
  },
  // ===== PERMISSIONS =====
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#a78bfa',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  permissionText: {
    fontSize: 16,
    color: '#60a5fa',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  permissionButton: {
    backgroundColor: '#a78bfa',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#a78bfa',
    shadowColor: '#a78bfa',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  permissionButtonText: {
    color: '#1a0a2e',
    fontWeight: '900',
    fontSize: 16,
    fontFamily: 'monospace',
  },
  // ===== LOGIN SCREEN =====
  loginContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  titleBox: {
    alignItems: 'center',
    marginBottom: 40,
  },
  cyberTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#a78bfa',
    textAlign: 'center',
    letterSpacing: 2,
    fontFamily: 'monospace',
    textShadowColor: '#7c3aed',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  cyberLine: {
    width: '80%',
    height: 2,
    backgroundColor: '#a78bfa',
    marginTop: 12,
    shadowColor: '#a78bfa',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 3,
  },
  loginForm: {
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    borderWidth: 2,
    borderColor: '#a78bfa',
    borderRadius: 12,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#a78bfa',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#60a5fa',
    marginBottom: 8,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  input: {
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    borderWidth: 2,
    borderColor: '#a78bfa',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
    color: '#a78bfa',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  loginButton: {
    backgroundColor: '#a78bfa',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#a78bfa',
    shadowColor: '#a78bfa',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 5,
  },
  loginButtonText: {
    color: '#1a0a2e',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  cyberDecoration: {
    alignItems: 'center',
  },
  cyberText: {
    fontSize: 13,
    color: '#60a5fa',
    letterSpacing: 2,
    fontFamily: 'monospace',
    opacity: 0.7,
  },
  // ===== MAIN SCREEN (LOGGED IN) =====
  mainContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#a78bfa',
    alignItems: 'center',
    marginBottom: 20,
  },
  cameraSection: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#60a5fa',
    shadowColor: '#60a5fa',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  cameraWrapper: {
    position: 'relative',
    height: 300,
    backgroundColor: '#2d1b4e',
  },
  camera: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraOverlay: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  cameraText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#a78bfa',
    fontFamily: 'monospace',
    letterSpacing: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  photoPreview: {
    height: 300,
    backgroundColor: '#1a0a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  actionsContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#60a5fa',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#60a5fa',
    shadowColor: '#60a5fa',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  actionButtonText: {
    color: '#1a0a2e',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  bottomForm: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  formBox: {
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    borderWidth: 2,
    borderColor: '#a78bfa',
    borderRadius: 10,
    padding: 16,
  },
  formTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#60a5fa',
    marginBottom: 10,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  userDisplay: {
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    borderWidth: 1,
    borderColor: '#a78bfa',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  userText: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  logoutButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#1a0a2e',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
});









