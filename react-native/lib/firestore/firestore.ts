// lib/firestore/firestore.ts
import { db } from "../firebase"; // ← your Web-SDK instance
import {
    doc,
    getDoc,
    setDoc,
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot,
    type DocumentData,
    type QuerySnapshot,
} from "firebase/firestore";

/**
 * Initializes a chat document under 'chats/{matchID}' if it doesn't already exist.
 */
export async function initChat(
    matchID: string,
    userIDInvestor: number,
    userIDCompany: number
): Promise<void> {
    const chatRef = doc(db, "chats", matchID);
    const chatSnap = await getDoc(chatRef);

    if (chatSnap.exists()) {
        console.log(`💬 Chat already exists for matchID=${matchID}`);
        return;
    }

    await setDoc(
        chatRef,
        {
            userA: userIDInvestor,
            userB: userIDCompany,
            matchID,
            initializedAt: serverTimestamp(),
        },
        { merge: true }
    );

    console.log(`✅ Chat initialized for matchID=${matchID}`);
}

/**
 * Starts listening to chats/{matchID}/messages, ordered by sentAt ascending.
 *
 * @param matchID  the string ID of your chat
 * @param onUpdate called whenever the message list changes
 * @returns        an unsubscribe function
 */
export function listenForMessages(
    matchID: string,
    onUpdate: (
        messages: Array<{
            id: string;
            senderId: number;
            text: string;
            sentAt: Date | null;
        }>
    ) => void
): () => void {
    const messagesRef = collection(db, "chats", matchID, "messages");
    const q = query(messagesRef, orderBy("sentAt", "asc"));

    const unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
            const msgs = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    senderId: data.senderId as number,
                    text: data.text as string,
                    sentAt: data.sentAt?.toDate() ?? null,
                };
            });
            onUpdate(msgs);
        },
        (error) => {
            console.error(
                `⚠️ listenForMessages error for chat ${matchID}:`,
                error
            );
        }
    );

    return unsubscribe;
}

export async function sendMessage(
    matchID: string,
    senderId: number,
    text: string
): Promise<void> {
    const messagesRef = collection(db, "chats", matchID, "messages");
    await addDoc(messagesRef, {
        senderId,
        text,
        sentAt: serverTimestamp(),
    });
    console.log(`✉️ Message sent in chat ${matchID}: "${text}"`);
}
