import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  HomeScreen,
  LoginScreen,
  SignUpScreen,
  OnboardingScreen,
  ChatScreen,
  ProfileScreen,
  FormScreen,
  OtpScreen,
  PanalScreen,
} from "../screens";
import { useEffect, useState } from "react";
import { getItem } from "../utils/asyncStorage";

const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  const [IsLogin, setIsLogin] = useState(false);

  const checkLogin = async () => {
    let login = await getItem("isLogin");
    // console.log(login);
    setIsLogin(login);
    // console.log("IsLogin", IsLogin);
  };

  useEffect(() => {
    checkLogin();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        // initialRouteName="Login" //this for testing
        // initialRouteName={IsLogin ? "Home" : "Login"}
        initialRouteName="Panal0" >
        <Stack.Screen name="Login"
          options={{ headerShown: false }}
          component={LoginScreen}
        />
        <Stack.Screen
          name="Onboarding"
          options={{ headerShown: false }}
          component={OnboardingScreen}
        />
        <Stack.Screen
          name="SignUp"
          options={{ headerShown: false }}
          component={SignUpScreen}
        />
        <Stack.Screen
          name="Home"
          options={{ headerShown: false }}
          component={HomeScreen}
        />
        <Stack.Screen
          name="Profile"
          options={{ headerShown: false }}
          component={ProfileScreen}
        />
        <Stack.Screen
          name="Chat"
          options={{ headerShown: false }}
          component={ChatScreen}
        />
        <Stack.Screen
          name="Form"
          options={{ headerShown: false }}
          component={FormScreen}
        />
        <Stack.Screen
        name="Otp"
        options={{headerShown:false}}
        component={OtpScreen}
        />
        <Stack.Screen
        name="Panal"
        options={{headerShown:false}}
        component={PanalScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
