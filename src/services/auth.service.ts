import { authorize, AuthConfiguration, AuthorizeResult, logout } from 'react-native-app-auth';
import * as Keychain from 'react-native-keychain';

// 1. Keycloak Configuration
// This object contains all the details needed to communicate with your Keycloak server.
export const keycloakConfig: AuthConfiguration = {
  issuer: 'http://192.168.35.60:8080/realms/my-app-realm', // For Android emulatorhttp://localhost:8444/realms/master
  // issuer: 'http://localhost:8080/realms/my-app-realm', // For iOS simulator
  clientId: 'react-native-app',
  redirectUrl: 'com.myapp.auth:/oauth2redirect',
  scopes: ['openid', 'profile', 'email'], // Request 'openid' for authentication
  dangerouslyAllowInsecureHttpRequests: true
};

// 2. The SignIn Function
// This function encapsulates the entire PKCE login flow.

export const signIn = async (): Promise<AuthorizeResult> => {
  try {
    // The authorize function does all the magic!
    // It opens the browser, lets the user log in, and handles the redirect.
    const authState = await authorize(keycloakConfig);
    console.log('Login successful!', authState);
    console.log('Access token is: ', authState.accessToken);
    // authState contains accessToken, refreshToken, idToken, and more!
    return authState;
  } catch (error) {
    console.error('Login failed!', error);
    // Re-throw the error so the UI can handle it
    throw error;
  }
};

// export const signOut = async (idToken: string): Promise<void> => {
//   try {
//     // The logout function clears the session with Keycloak.
//     await logout(keycloakConfig, {
//       idTokenHint: idToken,
//       postLogoutRedirectUri: keycloakConfig.redirectUrl, // Where to redirect after logout
//     });
//     console.log('Logout successful!');
//   } catch (error) {
//     console.error('Logout failed!', error);
//     throw error;
//   }
// };



export const signOut = async (): Promise<void> => {

  try {
    const credentials = await Keychain.getGenericPassword();
    if(credentials){
      const authState: AuthorizeResult = await JSON.parse(credentials.password);

      await logout(keycloakConfig, {
        idToken: authState.idToken,
        postLogoutRedirectUrl: keycloakConfig.redirectUrl
      });

      await Keychain.resetGenericPassword();
      console.log('Reset password successfully!');
    }
  }
  catch (error){
    console.error('Failed to sign out!', error);
    await Keychain.resetGenericPassword();
    throw error;
  }


}