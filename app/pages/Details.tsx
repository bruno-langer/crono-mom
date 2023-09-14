import { Button, Text, View, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebaseConfig";
import { getDocs, collectionGroup, } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatMilisToText } from "../utils/formatMinuteSecond";

export default function Details({ navigation }: any) {

    const [timeList, setTimeList] = useState<{ start: number, duration: number }[]>([])


    useEffect(() => {
        const user = auth.currentUser?.uid
        if (typeof user !== "undefined") {
            const docRef = collectionGroup(db, `data-${user}`);
            getDocs(docRef).then((docSnapshot) => {
                if (!docSnapshot.empty) {
                    setTimeList(docSnapshot.docs.map((doc) => doc.data()) as { start: number, duration: number }[])
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            })
        }
    }, [])

    const getIntervals = () => {
        const list = timeList.sort((a, b) => a.start - b.start).map((mark, index) => {
            if (index < timeList.length - 1)
                return timeList[index + 1].start - mark.start
            return 0
        })
        list.pop()
        const shortlist = list.slice(-3)

        return {
            mean: shortlist.reduce((a, b) => a + b, 0) / list.length,
            max: Math.max(...list),
            min: Math.min(...list),
        }
    }

    return (
        <View style={{ flex: 1, alignItems: 'center', display: "flex", flexDirection: "column", width: "100%", overflow: "scroll", backgroundColor: "#7B4653" }}>
            <SafeAreaView style={{ width: "100%" }}>
                <View style={{ backgroundColor: "#FFB9CA", display: "flex", flexDirection: "row", justifyContent: "space-between", paddingVertical: 30, borderRadius: 5, marginTop: 20, marginHorizontal: 10 }}>
                    <View style={styles.intervalsContainer}>
                        <Text>Médio</Text>
                        <Text style={styles.intervalsText}>{formatMilisToText(getIntervals().mean)}</Text>
                    </View>
                    <View style={styles.intervalsContainer}>
                        <Text>Menor</Text>
                        <Text style={styles.intervalsText}>{formatMilisToText(getIntervals().min)}</Text>
                    </View>
                    <View style={styles.intervalsContainer}>
                        <Text>Maior</Text>
                        <Text style={styles.intervalsText}>{formatMilisToText(getIntervals().max)}</Text>
                    </View>
                </View>

                <Text style={styles.titleText}>Contrações Marcadas</Text>
                <View style={styles.listContainer}>
                    {timeList.sort((a, b) => b.start - a.start).map((time, index) => {
                        return (
                            <View key={index} style={styles.listItem}>
                                <Text>{new Date(time.start).toLocaleString()}</Text>
                                <Text>{formatMilisToText(time.duration)}</Text>
                            </View>
                        )
                    })}
                </View>
                <View>

                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({

    titleText: {
        fontSize: 20,
        fontWeight: "200",
        marginVertical: 20,
        marginHorizontal: 10,
        color: "#FFB9CA",
    },

    listItem: {
        width: "100%",
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    listContainer: {
        height: "70%",
        backgroundColor: "#FFB9CA",
        flexDirection: "column",
        alignItems: "center",
        marginHorizontal: 10,
        padding: 16
    },
    intervalsContainer: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        color: "#7B4653",

    },
    intervalsText: {
        fontWeight: "bold",
        color: "#7B4653",
        fontSize: 24
    }
})