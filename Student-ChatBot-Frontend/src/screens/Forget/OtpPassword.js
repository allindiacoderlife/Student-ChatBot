import { View, Text, TouchableOpacity, TextInput, Image, Dimensions, Alert, ScrollView } from 'react-native'
import LottieView from 'lottie-react-native'
import { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import axios from 'axios'
import { Ionicons, SimpleLineIcons } from '@expo/vector-icons'
import { OtpInput } from 'react-native-otp-entry'
import AsyncStorage from '@react-native-async-storage/async-storage'

const { width, height } = Dimensions.get('window')

const OtpPassword = () => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [isLogin, setIsLogin] = useState("");
    const [stLogin, setStLogin] = useState("login");
    const [acType, setAcType] = useState("");
    const [login, setLogin] = useState(true);
    const navigation = useNavigation();
    const handleGoBack = () => {
        navigation.goBack();
    }
    const handleSubmit = () => {
        console.log("Submit", email);
        const userData = {
            email: email,
            otp: otp,
        }
        console.log(userData);
        axios
            .post("https://student-chatbot-a8hx.onrender.com/otpverify" || "http://192.168.225.123:5001/otpverify", userData)
            .then((res) => {
                console.log(res.data);
                if (res.data.status === "Ok") {
                    Alert.alert("Otp Verified");
                    if (isLogin == login) {
                        AsyncStorage.setItem("isLoginIN", JSON.stringify(true));
                        if (acType == "Student") {
                            navigation.navigate("Profile");
                        } else if(acType == "admin") {
                            navigation.navigate("AdminHome")
                        } else if (acType == "college"){
                            navigation.navigate("CollegeForm")
                        }
                    } else {
                        navigation.navigate("ChangePassword");
                    }
                } else {
                    Alert.alert("Otp Not Verified", JSON.stringify(res.data));
                }
            })
    }
    const handleResendCode = () => {
        const userData = {
            email: email,
        }
        axios
            .post("https://student-chatbot-a8hx.onrender.com/otpResend", userData)
            .then((res) => {
                console.log(res.data);
                if (res.data.status === "Ok") {
                    Alert.alert("Otp Resend", "Please check your email");
                } else {
                    Alert.alert("Otp Not Resend", JSON.stringify(res.data));
                }
            })
    }
    useEffect(() => {
        AsyncStorage.getItem("email").then((value) => {
            setEmail(value);
        })
        AsyncStorage.getItem("isLogin").then((value) => {
            setIsLogin(value);
        })
        AsyncStorage.getItem("acType").then((value) => {
            setAcType(value);
        })
        console.log(isLogin);
    }, [])
    return (
        <SafeAreaView className='flex-1 bg-white p-5'>
            <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                    className="h-10 w-10 bg-gray-300 rounded-full justify-center items-center"
                    onPress={handleGoBack}
                >
                    <Ionicons name="arrow-back-outline" size={32} color="#45484A" />
                </TouchableOpacity>
                <View className="my-5">
                    <Text className="text-3xl font-semibold text-primary">OTP</Text>
                    <Text className="text-3xl font-semibold text-primary">Verification</Text>
                    <Text className="text-3xl font-semibold text-primary">Code</Text>
                    <LottieView
                        source={require("../../assets/lottie/Otp.json")}
                        className="absolute"
                        style={{
                            width: width * 0.5,
                            height: width * 1,
                            top: height / 2 - width * 1.4,
                            right: height / 2 - width * 1,
                        }}
                        autoPlay
                        loop
                    />
                </View>
                {/* form */}
                <View className="mt-[20%]">
                    <OtpInput
                        numberOfDigits={6}
                        style={{ width: width * 0.8, height: 50 }}
                        onChange={(e) => setOtp(e.nativeEvent.text)}
                        onTextChange={setOtp}
                        value={otp}
                    />
                    <View className="flex-row justify-center items-center my-10 gap-x-1">
                        <Text className="text-primary font-normal">
                            Don't receive the code?
                        </Text>
                        {/* Sign up Button */}
                        <TouchableOpacity className='' onPress={handleResendCode}>
                            <Text className="text-primary font-bold" >
                                Resend Code
                            </Text>
                        </TouchableOpacity>
                        {/* Gaust Login */}
                    </View>
                    <TouchableOpacity
                        className="bg-primary rounded-full mt-5"
                        onPress={() => handleSubmit()}
                    >
                        <Text className="text-white text-2xl font-semibold text-center p-2.5">
                            Submit
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default OtpPassword