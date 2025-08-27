import React, {useEffect, useState} from 'react';
import { SafeAreaView, View, Button, Text, StyleSheet, Alert } from 'react-native';
import { signIn, signOut } from './src/services/auth.service';
import * as Keychain from 'react-native-keychain';

// This component represents the screen shown when the user is not logged in.
const LoginScreen = ({ onLoginPress }: { onLoginPress: () => void }) => (
    <View style={styles.content}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Please log in to continue</Text>
      <Button title="Log In with Keycloak" onPress={onLoginPress} />
    </View>
);

// This component represents the screen shown after a successful login.
const WelcomeScreen = ({ onLogoutPress} :{onLogoutPress: () => void }) => (
    <View style={styles.content}>
      <Text style={styles.title}>Login Successful!</Text>
      <Text style={styles.subtitle}>You are now authenticated.</Text>
      <Button title="Log Out" onPress={onLogoutPress} color="#c93c3c" />
    </View>
);

const App = () => {
  // This is the core state of our app's UI.
  // It's a simple boolean to track if the user is authenticated.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect( () => {
    const checkLoginStatus = async () => {
      try {
        const credentials = await Keychain.getGenericPassword();

        if(credentials){
          console.log('Found the stored credentials, user is logged in.');
          setIsLoggedIn(true);
        } else {
          console.log('No Stored Credentials found.');
        }
      } catch (error){
        console.error("Could not load Credentials.", error);
      } finally {
        setIsLoading(false)
      }
    };
    checkLoginStatus();
  }, [])
  if(isLoading){
    return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}> Loading....</Text>
          </View>
        </SafeAreaView>
    )
  }

  const handleLogout = async () => {
    try{
      await signOut();
      setIsLoggedIn(false);
    }catch (error){
      Alert.alert('Loutout Failed, An error occurred. during logout');
    }
  }
  // This is the primary business logic function in our UI.
  // It calls our authentication service and handles the result.
  const handleLogin = async () => {
    try {
      // Call the signIn function from our service.
      // This will trigger the webview and the entire PKCE flow.
      const result = await signIn();

      // If signIn completes without throwing an error, the login was successful.
      // The `result` object contains the tokens, but for now, we only need to know
      // that the flow succeeded.
      if (result.accessToken) {
        const tokensToStore = JSON.stringify(result);

        await Keychain.setGenericPassword('userSession', tokensToStore);

        console.log('Tokens securely stored!');
        setIsLoggedIn(true);
      }
    } catch (error) {
      // If the user cancels the login from the webview, or if there's any other error,
      // it will be caught here.
      Alert.alert('Login failed', 'Could not complete the login process.');
      console.error(error);
    }
  };

  return (
      <SafeAreaView style={styles.container}>
        {/* Conditionally render the correct screen based on the isLoggedIn state */}
        {isLoggedIn ? <WelcomeScreen onLogoutPress={() => handleLogout()} /> : <LoginScreen onLoginPress={handleLogin} />}
      </SafeAreaView>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default App;
