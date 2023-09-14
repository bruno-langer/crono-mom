import { TextInput, View, Button, Pressable, Text, ToastAndroid, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, } from 'firebase/auth'
import { auth } from "../../firebaseConfig";
import { authErrors } from "../utils/firebaseErrorsCode";
import * as SecureStore from 'expo-secure-store';

export default function Login({ navigation }: any) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [autoLogin, setAutoLogin] = useState(true);

    const onLogin = () => {

        signInWithEmailAndPassword(auth, email, password).then(() => {
            SecureStore.setItemAsync('email', email).then(() => {
                SecureStore.setItemAsync('password', password).then(() => {
                    navigation.navigate("Home")
                })
            })
        }).catch((error) => {
            ToastAndroid.show(authErrors[error.code] || "Erro não encontrado", ToastAndroid.LONG)
        })


    }

    useEffect(() => {

        SecureStore.getItemAsync('email').then((storedEmail) => {
            SecureStore.getItemAsync('password').then((storedPassword) => {
                if (typeof storedEmail === 'string' && typeof storedPassword === 'string') {
                    signInWithEmailAndPassword(auth, storedEmail, storedPassword).then(() => {
                        navigation.navigate("Home")
                    })
                }
                else {
                    setAutoLogin(false)
                }
            }).catch(() => {
                setAutoLogin(false)
            })
        }).catch(() => {
            setAutoLogin(false)
        })


    }, [])

    return <View style={styles.container}>
        {
            autoLogin ? <Text>Entrando...</Text> : <>
                <View style={styles.formContainer}>
                    <TextInput
                        placeholder="Email"
                        textContentType="emailAddress"
                        defaultValue={email}
                        onChangeText={newText => setEmail(newText)}
                        keyboardType="email-address"
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Senha"
                        textContentType="password"
                        secureTextEntry
                        defaultValue={password}
                        onChangeText={newText => setPassword(newText)} 
                        style={styles.input}
                        />

                    <Button title="Entrar" onPress={onLogin} />
                    <Pressable>
                        <Text>Esqueci minha Senha</Text>
                    </Pressable>

                </View>
                <Pressable onPress={() => navigation.navigate("CreateUser")}>
                    <Text>Criar uma conta</Text>
                </Pressable>
            </>
        }
    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    formContainer: {
        width: "80%",
        height: "40%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-evenly"
    },
    input:{
        backgroundColor:"white",
        color:"black",
    }
})