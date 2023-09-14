import { Button, Text, View, StyleSheet, Platform, Pressable } from "react-native";
import { useEffect, useState, useRef, useContext } from "react";
import { auth, db } from "../../firebaseConfig";
import { collection, addDoc, getDocs, collectionGroup, Query, } from "firebase/firestore";
import { formatMilisToText } from "../utils/formatMinuteSecond";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { TokenContext } from "../../App";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

// Can use this function below OR use Expo's Push Notification Tool from: https://expo.dev/notifications
async function sendPushNotification(token: string, title: string, body: string) {
    const message = {
        to: token,
        sound: 'default',
        title,
        body,
        data: { someData: 'goes here' },
    };

    const req = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `key=AAAAvYeRFPk:APA91bFAxECVNDSKmci8u4wYwUAvudJqhtVxKUFhBTzY4TXBaDQJh7FNwwzAojhJ8vKQI1F0o-SUAYdjBNyqWZOG_LFfSXB19WFWnEhxxf-ffy5Z_RcKJBgAQNJcy_A_D3QfZuEuj8q1`,
        },
        body: JSON.stringify({
            to: token,
            priority: 'normal',
            data: {
                experienceId: '@bruno-langer/app',
                scopeKey: '@bruno-langer/app',
                title: title,
                message: body,
            },
        }),
    });
    console.log(req.status)
}

async function registerForPushNotificationsAsync() {
    console.log("opa")
    let token;
    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }
        token = (await Notifications.getDevicePushTokenAsync()).data;
        console.log(token);
    } else {
        alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    return token;
}

const getNotificationsToken = async (): Promise<{ token: string, name: string, relation: string }[]> => {
    const user = auth.currentUser?.uid

    if (typeof user !== "undefined") {
        const docRef = collectionGroup(db, `notification-${user}`);
        const docSnapshot = await getDocs<{ token: string, name: string, relation: string }>(docRef as Query<{ token: string, name: string, relation: string }>)
        if (!docSnapshot.empty) {
            return docSnapshot.docs.map((doc) => doc.data())
        }

    }
    return []
}

export default function HomeScreen({ navigation }: any) {

    const [isCouting, setCounting] = useState(false)
    const [startTime, setStartTime] = useState(0)
    const [diffTime, setDiffTime] = useState(0)
    const [lastInfos, setLastInfos] = useState<{ start: number, duration: number, mean: number }>({ duration: 0, start: 0, mean: 0 })
    const [notificationConfigList, setNotificationConfigList] = useState<{ token: string, name: string, relation: string }[]>()

    const [notification, setNotification] = useState(false);

    const responseListener = useRef<any>();
    const notificationListener = useRef<any>();

    const { setToken } = useContext(TokenContext)

    const updateInfos = () => {

        const user = auth.currentUser?.uid
        if (typeof user !== "undefined") {
            const docRef = collectionGroup(db, `data-${user}`);
            getDocs<{ start: number, duration: number }>(docRef as Query<{ start: number, duration: number }>).then((docSnapshot) => {
                if (!docSnapshot.empty) {
                    const { start, duration } = docSnapshot.docs.sort((a, b) => b.data().start - a.data().start)[0].data()
                    const mean = docSnapshot.docs.map((doc) => doc.data().duration).reduce((a, b) => a + b) / docSnapshot.docs.length
                    setLastInfos({
                        start,
                        duration,
                        mean
                    })
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            })
        }
    }


    useEffect(() => {

        registerForPushNotificationsAsync().then(token => {
            setToken(token ?? "")
        })

        notificationListener.current = Notifications.addNotificationReceivedListener(notificationValue => {
            setNotification(!!notificationValue);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });


        return () => {
            Notifications.removeNotificationSubscription(notificationListener.current);
        }

    }, [])

    useEffect(() => {
        updateInfos()
        getNotificationsToken().then((list) => setNotificationConfigList(list))

    }, [])


    useEffect(() => {
        const time = setInterval(() => {
            if (isCouting)
                setDiffTime(Date.now() - startTime)
        }, 1000)
        return () => clearInterval(time)
    }, [startTime])


    const minuteCount = Math.floor(diffTime / 60000).toString().padStart(2, "0")
    const secondCount = Math.floor(((diffTime / 60000) % 1) * 60).toString().padStart(2, "0")


    return (
        <View style={{ flex: 1, alignItems: 'center', flexDirection: "column", backgroundColor: "#7B4653" }}>
            <View style={styles.container}>
                <Text style={styles.counterText}>
                    {isCouting ? `${minuteCount}:${secondCount}` : "00:00"}
                </Text>
                {isCouting ?
                    <Pressable onPress={() => {
                        const user = auth.currentUser?.uid
                        if (typeof user !== "undefined") {
                            const ref = collection(db, `data-${user}`);
                            addDoc(ref, {
                                start: startTime,
                                duration: diffTime
                            })
                        }
                        setDiffTime(0)
                        setCounting(false)
                        setStartTime(Date.now())
                        updateInfos()
                    }}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>Parar</Text>
                    </Pressable>
                    :
                    <Pressable onPress={() => {
                        setStartTime(Date.now())
                        setCounting(true)
                        console.log(notificationConfigList)
                        notificationConfigList?.map((config) => {
                            sendPushNotification(config.token, "Alerta de Contração!!", `${config.name}! ${config.relation} está tendo uma contração exatamente agora`)
                        })
                    }}
                        style={styles.button}
                    ><Text
                        style={styles.buttonText}
                    >Começar Contagem</Text></Pressable>}
            </View >

            <Pressable style={styles.detailsContainer} onPress={() => navigation.navigate("Details")} >
                <Text>Ultima Marcação</Text>
                <View style={styles.detailsInfo}>
                    <Text>{new Date(lastInfos.start).toLocaleString()}</Text>
                    <Text>{formatMilisToText(lastInfos.duration)}</Text>
                </View>
                {/* <Button title="Detalhes" onPress={() => navigation.navigate("Details")} /> */}
                {/* <Button title="Opções" onPress={() => navigation.navigate("Options")} /> */}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // height: "75%",
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    counterText: {
        fontWeight: "100",
        fontSize: 140,
        color: "#FFB9CA",
    },
    detailsContainer: {
        width: "100%",
        // height: "25%",
        backgroundColor: "#FFB9CA",
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        elevation: 30,
        paddingVertical: 16,
        paddingHorizontal: 24
    },
    detailsInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    button: {
        backgroundColor: "#FFB9CA",
        paddingHorizontal: 40,
        padding: 10,
        borderRadius: 100,
        color: "#7B4653",
        shadowColor: "#FFB9CA",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 15
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "normal"
    }
});
