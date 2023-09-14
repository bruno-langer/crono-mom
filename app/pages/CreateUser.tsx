import { View, Text, TextInput, Button, ToastAndroid, StyleSheet } from "react-native";
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from "../../firebaseConfig";
import { useState } from "react";
import * as SecureStore from 'expo-secure-store';
import { authErrors } from "../utils/firebaseErrorsCode";


export default function CreateUser({ navigation }: any) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const createUser = () => {
        if (email && password && confirmPassword) {
            if (password === confirmPassword) {
                createUserWithEmailAndPassword(auth, email, password).then(() => {
                    SecureStore.setItemAsync('email', email).then(() => {
                        SecureStore.setItemAsync('password', password).then(() => {
                            navigation.navigate("Home")
                        })
                    })
                }).catch((error) => {
                    ToastAndroid.show(authErrors[error.code] || "Erro não encontrado", ToastAndroid.LONG)
                })
            } else {
                ToastAndroid.show("Senhas não conferem", ToastAndroid.LONG)
            }
        }
        else {
            ToastAndroid.show("O cadastro não foi preenchido corretamente", ToastAndroid.LONG)
        }
    }

    return <View style={styles.container}>
        <View style={styles.formContainer}>

            <TextInput
                placeholder="Email"
                defaultValue={email}
                textContentType="emailAddress"
                onChangeText={text => setEmail(text)}
                style={styles.input}
            />
            <TextInput
                placeholder="Senha"
                defaultValue={password}
                onChangeText={text => setPassword(text)}
                style={styles.input}

            />
            <TextInput
                placeholder="Confirme sua Senha"
                defaultValue={confirmPassword}
                onChangeText={text => setConfirmPassword(text)}
                style={styles.input}

            />

            <Button title="Cadastrar" onPress={createUser} />
        </View>

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
    input: {
        backgroundColor: "white",
        color: "black",
    }
})