import { Button, Text, TextInput, View, ToastAndroid } from "react-native";
import { setStringAsync } from 'expo-clipboard';
import { auth, db } from "../../firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { useContext, useState } from "react";
import { TokenContext } from "../../App";

export default function Options() {

    const [name, setName] = useState("");
    const [relation, setRelation] = useState("");
    const [user, setUser] = useState("");

    const { token } = useContext(TokenContext);

    return <View>
        <View>
            <Text>Receber Notificação</Text>
            <TextInput placeholder="Seu Nome"
                onChangeText={(text) => setName(text)}
            />
            <TextInput placeholder="Nome Parceiro"
                onChangeText={(text) => setRelation(text)}
            />
            <TextInput placeholder="Código de compartilhamento"
                onChangeText={(text) => setUser(text)}
            />
            <Button title="Ativar Notificações" onPress={() => {

                if (typeof user !== "undefined" && typeof name !== "undefined" && typeof relation !== "undefined") {
                    const ref = collection(db, `notification-${user}`);
                    addDoc(ref, {
                        name,
                        relation,
                        token,
                    }).then(() => {
                        ToastAndroid.show("Notificações ativadas com sucesso", ToastAndroid.LONG)
                    })
                }
                else {
                    ToastAndroid.show("Configuração Incorreta", ToastAndroid.SHORT)
                }
            }} />
        </View>
        <View>
            <Text>Compartilhe aqui seu código para notificar parceiro(a)</Text>
            <Button title="Compartilhar" onPress={() => {
                const userId = auth.currentUser?.uid
                if (!userId) return
                setStringAsync(userId).then(() => {
                    ToastAndroid.show("Código copiado com sucesso", ToastAndroid.SHORT)
                })

            }} />
        </View>
    </View>
}