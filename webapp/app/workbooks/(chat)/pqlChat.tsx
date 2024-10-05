"use client";

import { useEffect, useRef, useState } from "react";
import {
    Loader2,
} from "lucide-react";
import axiosInstance from "@/services/axios";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { chatProps } from "@/interfaces/props";
import { auth } from "@/services/firebase";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import ArcFormatDate from "@/services/formatDate";
import { AnalysisChatInterface, AnalysisChatMessageInterface } from "@/interfaces/main";

export default function StandardChat({ workbookId, tableId }: chatProps) {
    const { toast } = useToast();
    const [waitingServerMessage, setWaitingServerMessage] =
        useState<boolean>(false);

    const [chats, setChats] = useState<AnalysisChatInterface[]>([]);
    const [messages, setMessages] = useState<AnalysisChatMessageInterface[]>(
        []
    );
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [inputMessage, setInputMessage] = useState("");

    // ----- Message -----
    const scrollRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        // Scroll to bottom when new message is added
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axiosInstance.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/chat/analysis/${activeChatId}/`
                );
                const fetchedMessages: AnalysisChatMessageInterface[] =
                    response.data || [];
                console.log(fetchedMessages);
                setMessages(fetchedMessages);
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Error fetching messages",
                    description:
                        error.response?.data?.error ||
                        "Failed to load messages",
                });
            }
        };

        if (activeChatId) {
            fetchMessages();
        }
    }, [activeChatId]);

    const handleSendMessage = async () => {
        if (inputMessage.trim() && activeChatId) {
            const _newMessage: AnalysisChatMessageInterface = {
                id: Date.now().toString(), // temporary id, will be replaced by server
                userId: auth.currentUser?.uid || "",
                userType: "user",
                createdAt: new Date(),

                text: inputMessage,
                name: null,
                description: null
            };

            setMessages([...messages, _newMessage]);
            setInputMessage("");

            try {
                setWaitingServerMessage(true);
                const _newMessageResponse = await axiosInstance.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/chat/analysis/${activeChatId}/`,
                    _newMessage
                );
                const newMessageResponseData: AnalysisChatMessageInterface =
                    _newMessageResponse.data;
                console.log(newMessageResponseData);
                if (newMessageResponseData) {
                    newMessageResponseData.userId = auth.currentUser?.uid || "";
                    setMessages([
                        ...messages,
                        _newMessage,
                        newMessageResponseData,
                    ]);
                    setWaitingServerMessage(false);
                }
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Error sending message",
                    description: error.response.data.error
                        ? error.response.data.error
                        : "Failed to send message",
                });
                setWaitingServerMessage(false);
            }
        }
    };

    // ----- Chat -----
    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await axiosInstance.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/chat/analysis/workbook/${workbookId}/table/${tableId}/`
                );
                const fetchedChats: AnalysisChatInterface[] =
                    response.data || [];
                console.log(fetchedChats);
                setChats(fetchedChats);
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Error fetching chats",
                    description:
                        error.response?.data?.error || "Failed to load chats",
                });
            }
        };

        if (workbookId && tableId) {
            fetchChats();
        }
    }, [workbookId, tableId]);

    const startNewChat = async () => {
        try {
            const response = await axiosInstance.post(
                `${process.env.NEXT_PUBLIC_API_URL}/chat/analysis/workbook/${workbookId}/table/${tableId}/`
            );

            const newChat: AnalysisChatInterface = {
                id: response.data.id,
                name: response.data.name,
                updatedAt: new Date(),
                topic: "",
            };

            setChats([...chats, newChat]);
            setActiveChatId(newChat.id);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error getting data",
                description: error.response.data.error
                    ? error.response.data.error
                    : "Failed to fetch data",
                action: (
                    <ToastAction altText="Ok" onClick={startNewChat}>
                        Try again
                    </ToastAction>
                ),
            });
        }
    };

    const closeChat = async () => {
        setActiveChatId(null);
    };

    if (!workbookId || !tableId) {
        return <div>Loading...</div>;
    }
    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center px-4 py-1 border-b">
                {activeChatId ? (
                    <Button variant="link" size="icon" onClick={closeChat}>
                        x
                    </Button>
                ) : (
                    <div className="flex flex-grow justify-between">
                        <div></div>
                        <Button
                            variant="link"
                            onClick={startNewChat}
                            className="px-1"
                        >
                            + New Chat
                        </Button>
                    </div>
                )}
            </div>
            <div className="flex-grow p-4 overflow-y-auto" ref={scrollRef}>
                {activeChatId ? (
                    messages.map((message, index) => {
                        const messageDate = new Date(message.createdAt);
                        const userType =
                            message.userType === "user" ? "You" : "Model";
                        return (
                            <div key={index} className="mb-4">
                                <div className="p-2 bg-muted rounded-md">
                                    <div className="text-sm text-muted-foreground mb-1">
                                        {userType} &#8226;{" "}
                                        {ArcFormatDate(messageDate)}
                                    </div>
                                    {message.text}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div>
                        {chats.length > 0 ? (
                            chats.map((chat) => (
                                <div
                                    key={chat.id}
                                    className="mb-4 p-3 bg-muted rounded-md cursor-pointer hover:bg-gray-300"
                                    onClick={() => setActiveChatId(chat.id)}
                                >
                                    <div className="text-md font-medium">
                                        {chat.topic || "Untitled Chat"}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {ArcFormatDate(
                                            new Date(chat.updatedAt)
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-muted-foreground">
                                No chats available.
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="p-4 border-t">
                <div className="flex flex-col space-y-2">
                    <Textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-grow resize-none"
                        rows={Math.min(3, inputMessage.split("\n").length)}
                    />
                    <div className="flex">
                        {waitingServerMessage ? (
                            <Button disabled className="flex-grow">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Send
                            </Button>
                        ) : (
                            <Button
                                className="flex-grow"
                                onClick={handleSendMessage}
                            >
                                Send
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
