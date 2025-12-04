import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Share,
  ScrollView,
  Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.centeredContainer}>
        <Text>Necesitas permitir acceso a la cámara</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.btnText}>Dar permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Función para verificar si una cadena es una URL válida
  const esURLValida = (texto) => {
    try {
      // Patrones comunes de URLs
      const patronesURL = [
        /^https?:\/\//i,
        /^www\./i,
        /\.(com|org|net|edu|gov|io|co|info|app|dev)$/i,
      ];
      
      // Verificar si parece una URL
      const pareceURL = patronesURL.some(patron => patron.test(texto));
      
      if (pareceURL) {
        // Si no tiene http:// o https://, agregarlo
        let url = texto;
        if (!/^https?:\/\//i.test(texto)) {
          url = 'https://' + texto;
        }
        
        // Intentar crear un objeto URL
        new URL(url);
        return url;
      }
      
      return false;
    } catch {
      return false;
    }
  };

  const handleQRScan = ({ data, type }: BarcodeScanningResult) => {
    if (data) {
      setScannedData(data);
      const newScan = {
        id: Date.now().toString(),
        data: data,
        type: type,
        timestamp: new Date().toLocaleString(),
        esURL: esURLValida(data) !== false,
      };
      setScanHistory(prev => [newScan, ...prev.slice(0, 9)]);
      
      // Verificar si es una URL
      const url = esURLValida(data);
      
      if (url) {
        Alert.alert(
          'Enlace Detectado',
          `Se encontró un enlace:\n${data}\n\n¿Quieres abrirlo?`,
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => setShowQRScanner(false),
            },
            {
              text: 'Abrir enlace',
              onPress: () => {
                setShowQRScanner(false);
                abrirEnlace(url);
              },
            },
            {
              text: 'Solo guardar',
              onPress: () => setShowQRScanner(false),
            },
          ]
        );
      } else {
        Alert.alert(
          'QR Escaneado',
          `Contenido: ${data}\nTipo: ${type}`,
          [
            {
              text: 'OK',
              onPress: () => setShowQRScanner(false),
            },
            {
              text: 'Escanear otro',
              onPress: () => setScannedData(null),
            },
          ]
        );
      }
    }
  };

  // Función para abrir enlaces
  const abrirEnlace = async (url) => {
    try {
      // Verificar si se puede abrir con Linking
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        // Intentar abrir en el navegador del dispositivo
        await Linking.openURL(url);
      } else {
        // Si Linking no funciona, usar WebBrowser
        await WebBrowser.openBrowserAsync(url);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el enlace: ' + error.message);
    }
  };

  // Función para abrir un enlace desde el historial
  const abrirEnlaceDesdeHistorial = (data) => {
    const url = esURLValida(data);
    if (url) {
      Alert.alert(
        'Abrir enlace',
        `¿Quieres abrir este enlace?\n${data}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir', onPress: () => abrirEnlace(url) },
        ]
      );
    } else {
      Alert.alert('No es un enlace', 'Este contenido no parece ser un enlace web válido.');
    }
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      const result = await cameraRef.current.takePictureAsync();
      setPhoto(result.uri);
      setImageUri(result.uri);
      setShowCamera(false);
    }
  };

  const validarLogin = () => {
    const validUser = 'admin';
    const validPass = '1234';
    if (user === validUser && pass === validPass) {
      Alert.alert('Correcto', 'Inicio de sesión exitoso');
      setLoggedIn(true);
    } else {
      Alert.alert('Error', 'Usuario o contraseña incorrectos');
    }
  };

  const cambiarImagen = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita acceso a las imágenes');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const abrirCamara = () => {
    setShowCamera(true);
    setPhoto(null);
  };

  const abrirQRScanner = () => {
    setShowQRScanner(true);
    setScannedData(null);
  };

  const compartir = async () => {
    try {
      if (imageUri) {
        const available = await Sharing.isAvailableAsync();
        if (available) {
          await Sharing.shareAsync(imageUri);
        } else {
          await Share.share({
            message: `Mira mi foto de perfil (${user})`,
            url: imageUri,
          });
        }
      } else {
        await Share.share({
          message: `Hola, soy ${user}. ¡He iniciado sesión en la app!`,
        });
      }
    } catch (error) {
      Alert.alert('Error al compartir', error.message || String(error));
    }
  };

  const compartirQRResultado = async () => {
    if (scannedData) {
      try {
        await Share.share({
          message: `QR Escaneado: ${scannedData}`,
        });
      } catch (error) {
        Alert.alert('Error', 'No se pudo compartir el resultado');
      }
    }
  };

  const limpiarHistorial = () => {
    Alert.alert(
      'Limpiar historial',
      '¿Estás seguro de que quieres borrar el historial de escaneos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpiar', onPress: () => setScanHistory([]) },
      ]
    );
  };

  const cerrarSesion = () => {
    setUser('');
    setPass('');
    setImageUri(null);
    setLoggedIn(false);
    setShowCamera(false);
    setShowQRScanner(false);
    setPhoto(null);
    setScannedData(null);
  };

  if (showCamera) {
    return (
      <View style={styles.centeredContainer}>
        {!photo ? (
          <>
            <CameraView ref={cameraRef} style={styles.camera} />
            <View style={styles.cameraButtons}>
              <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
                <Text style={styles.btnText}>Tomar Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cameraButton, styles.cancelButton]} onPress={() => setShowCamera(false)}>
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Image source={{ uri: photo }} style={styles.camera} />
            <View style={styles.cameraButtons}>
              <TouchableOpacity style={styles.cameraButton} onPress={() => setShowCamera(false)}>
                <Text style={styles.btnText}>Usar esta foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cameraButton, styles.cancelButton]} onPress={() => setPhoto(null)}>
                <Text style={styles.btnText}>Tomar otra</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  }

  if (showQRScanner) {
    return (
      <View style={styles.fullScreen}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417', 'ean13', 'code128'],
          }}
          onBarcodeScanned={scannedData ? undefined : handleQRScan}
        />
        
        <View style={styles.qrOverlay}>
          <View style={styles.qrFrame} />
          <Text style={styles.qrInstruction}>Enfoca un código QR</Text>
        </View>

        <View style={styles.qrButtons}>
          <TouchableOpacity style={[styles.qrButton, styles.cancelButton]} onPress={() => setShowQRScanner(false)}>
            <Text style={styles.btnText}>Cerrar</Text>
          </TouchableOpacity>
          
          {scannedData && (
            <>
              <TouchableOpacity style={[styles.qrButton, styles.shareButton]} onPress={compartirQRResultado}>
                <Text style={styles.btnText}>Compartir</Text>
              </TouchableOpacity>
              
              {esURLValida(scannedData) && (
                <TouchableOpacity style={[styles.qrButton, styles.linkButton]} onPress={() => abrirEnlace(esURLValida(scannedData))}>
                  <Text style={styles.btnText}>Abrir Link</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.centeredContainer}>
      {!loggedIn ? (
        <View style={styles.loginBox}>
          <Text style={styles.title}>Inicio de Sesion</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre de usuario:</Text>
            <TextInput
              placeholder="Nombre"
              style={styles.input}
              value={user}
              onChangeText={setUser}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña:</Text>
            <TextInput
              placeholder="Contraseña"
              style={styles.input}
              value={pass}
              onChangeText={setPass}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.mainButton} onPress={validarLogin}>
            <Text style={styles.btnText}>ACEPTAR</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
          <View style={styles.profileBox}>
            <Text style={styles.welcomeTitle}>Bienvenido {user}</Text>
            
            <TouchableOpacity onPress={cambiarImagen} activeOpacity={0.8}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.profileImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Image
                    source={{
                      uri: 'https://static.vecteezy.com/system/resources/previews/005/005/840/non_2x/user-icon-in-trendy-flat-style-isolated-on-grey-background-user-symbol-for-your-web-site-design-logo-app-ui-illustration-eps10-free-vector.jpg',
                    }}
                    style={styles.defaultImage}
                  />
                </View>
              )}
            </TouchableOpacity>

            {/* Botón para escanear QR */}
            <TouchableOpacity style={[styles.actionButton, styles.qrButton]} onPress={abrirQRScanner}>
              <Text style={styles.actionButtonText}>ESCANEAR QR</Text>
            </TouchableOpacity>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.actionButton, styles.shareButton]} onPress={compartir}>
                <Text style={styles.actionButtonText}>COMPARTIR</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButton, styles.photoButton]} onPress={abrirCamara}>
                <Text style={styles.actionButtonText}>TOMAR FOTO</Text>
              </TouchableOpacity>
            </View>

            {/* Mostrar último QR escaneado */}
            {scannedData && (
              <View style={styles.qrResultContainer}>
                <Text style={styles.sectionTitle}>Último QR Escaneado</Text>
                <View style={styles.qrResultBox}>
                  <Text style={styles.qrData} numberOfLines={3}>{scannedData}</Text>
                  {esURLValida(scannedData) && (
                    <TouchableOpacity 
                      style={styles.openLinkButton}
                      onPress={() => abrirEnlace(esURLValida(scannedData))}
                    >
                      <Text style={styles.openLinkText}>🔗 Abrir Enlace</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Historial de escaneos */}
            {scanHistory.length > 0 && (
              <View style={styles.historyContainer}>
                <View style={styles.historyHeader}>
                  <Text style={styles.sectionTitle}>Historial de Escaneos</Text>
                  <TouchableOpacity onPress={limpiarHistorial}>
                    <Text style={styles.clearText}>Limpiar</Text>
                  </TouchableOpacity>
                </View>
                {scanHistory.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.historyItem,
                      item.esURL && styles.historyItemLink
                    ]}
                    onPress={() => item.esURL && abrirEnlaceDesdeHistorial(item.data)}
                    activeOpacity={item.esURL ? 0.7 : 1}
                  >
                    <View style={styles.historyContent}>
                      <Text style={styles.historyData} numberOfLines={1}>
                        {item.esURL ? '🔗 ' : '📄 '}{item.data}
                      </Text>
                      <Text style={styles.historyTime}>{item.timestamp}</Text>
                    </View>
                    {item.esURL && (
                      <Text style={styles.linkIndicator}>→</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.logoutButton} onPress={cerrarSesion}>
              <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  fullScreen: {
    flex: 1,
  },
  loginBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  profileBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  mainButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
    marginBottom: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    marginVertical: 5,
  },
  shareButton: {
    backgroundColor: '#28a745',
  },
  photoButton: {
    backgroundColor: '#17a2b8',
  },
  qrButton: {
    backgroundColor: '#6f42c1',
    width: '100%',
    marginVertical: 10,
  },
  linkButton: {
    backgroundColor: '#ff6b35',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dc3545',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#dc3545',
    fontWeight: '600',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginVertical: 20,
  },
  defaultImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  camera: {
    width: '100%',
    height: '80%',
    borderRadius: 10,
  },
  cameraButtons: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 20,
  },
  cameraButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  qrOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  qrInstruction: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  qrButtons: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 10,
  },
  qrResultContainer: {
    width: '100%',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  qrResultBox: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  qrData: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  openLinkButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  openLinkText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  historyContainer: {
    width: '100%',
    marginTop: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clearText: {
    color: '#dc3545',
    fontWeight: '600',
  },
  historyItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6f42c1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyItemLink: {
    borderLeftColor: '#007bff',
    backgroundColor: '#e7f1ff',
  },
  historyContent: {
    flex: 1,
  },
  historyData: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  linkIndicator: {
    fontSize: 18,
    color: '#007bff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});