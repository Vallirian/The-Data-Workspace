"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Upload, Plus, Croissant, X, ChartLineIcon } from "lucide-react";
import axiosInstance from "@/services/axios";
import {
    StandardChatInterface,
    StandardChatMessageInterface,
    WorkbookInterface,
} from "@/interfaces/main";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { chatProps } from "@/interfaces/props";
import { auth } from "@/services/firebase";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { set } from "date-fns";
import ArcFormatDate from "@/services/formatDate";
import { Toggle } from "@/components/ui/toggle";
import { Cross1Icon, Cross2Icon, FontBoldIcon } from "@radix-ui/react-icons";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function StandardChat({ workbookId, tableId }: chatProps) {
    const { toast } = useToast();

    const [chats, setChats] = useState<StandardChatInterface[]>([]);
    const [messages, setMessages] = useState<StandardChatMessageInterface[]>(
        []
    );
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [inputMessage, setInputMessage] = useState("");

    // ----- Message -----
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axiosInstance.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/chat/${activeChatId}/`
                );
                const fetchedMessages: StandardChatMessageInterface[] =
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
            const _newMessage: StandardChatMessageInterface = {
                id: Date.now().toString(), // temporary id, will be replaced by server
                text: inputMessage,
                userId: auth.currentUser?.uid || "",
                userType: "user",
                createdAt: new Date(),
            };

            setMessages([...messages, _newMessage]);

            try {
                const _newMessageResponse = await axiosInstance.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/chat/${activeChatId}/`,
                    _newMessage
                );
                const newMessageResponseData: StandardChatMessageInterface =
                    _newMessageResponse.data;
                console.log(newMessageResponseData);
                if (newMessageResponseData) {
                    newMessageResponseData.userId = auth.currentUser?.uid || "";
                    setMessages([
                        ...messages,
                        _newMessage,
                        newMessageResponseData,
                    ]);
                }
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Error sending message",
                    description: error.response.data.error
                        ? error.response.data.error
                        : "Failed to send message",
                });
            }

            setInputMessage("");
        }
    };

    // ----- Chat -----
    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await axiosInstance.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/chat/workbook/${workbookId}/table/${tableId}/`
                );
                const fetchedChats: StandardChatInterface[] =
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
                `${process.env.NEXT_PUBLIC_API_URL}/chat/workbook/${workbookId}/table/${tableId}/`
            );

            const newChat: StandardChatInterface = {
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
                <div>
                    {activeChatId ? (
                        <Button
                            variant="link"
                            size="icon"
                            onClick={closeChat}
                        >
                            x
                        </Button>
                    ) : (
                        <div>
                            <Button
                                variant="link"
                                onClick={startNewChat}
                                className="px-1"
                            >
                                + Chat
                            </Button>
                        </div>
                    )}
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Switch id="airplane-mode" />
                        <Label htmlFor="airplane-mode">Anlysis Mode</Label>
                    </div>
                </div>
            </div>
            <ScrollArea className="flex-grow p-4">
                {activeChatId ? (
                    messages.map((message, index) => {
                        const messageDate = new Date(message.createdAt); // Convert to Date object because it is a string when fetched from server
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
                                    onClick={() => setActiveChatId(chat.id)} // Function to set active chat
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
            </ScrollArea>
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
                        <Button
                            className="flex-grow"
                            onClick={handleSendMessage}
                        >
                            Send
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
