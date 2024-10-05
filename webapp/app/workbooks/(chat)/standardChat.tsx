"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Upload, Plus } from "lucide-react";
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

export default function StandardChat({ workbookId, tableId }: chatProps) {
    const { toast } = useToast();

    const [chats, setChats] = useState<StandardChatInterface[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [inputMessage, setInputMessage] = useState("");

    // ----- Message -----
    const handleSendMessage = async () => {
        console.log(inputMessage);
        if (inputMessage.trim() && activeChatId) {
            const _newMessage: StandardChatMessageInterface = {
                id: Date.now().toString(), // temporary id, will be replaced by server
                text: inputMessage,
                userId: auth.currentUser?.uid || "",
                userType: "user",
                createdAt: new Date(),
            };

            try {
                const _newMessageResponse = await axiosInstance.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/chat/${activeChatId}/send/`,
                    _newMessage
                );
                const newMessageResponseData: StandardChatMessageInterface =
                    _newMessageResponse.data;
                console.log(newMessageResponseData);
                if (newMessageResponseData) {
                    newMessageResponseData.userId = auth.currentUser?.uid || "";
                    setChats((prevChats) =>
                        prevChats.map((chat) =>
                            chat.id === activeChatId
                                ? {
                                      ...chat,
                                      messages: [
                                          ...(chat.messages as StandardChatMessageInterface[]),
                                          newMessageResponseData,
                                      ],
                                  }
                                : chat
                        )
                    );
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
                const fetchedChats: StandardChatInterface[] = response.data.chats || [];
                console.log(fetchedChats);
                setChats(fetchedChats);
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Error fetching chats",
                    description: error.response?.data?.error || "Failed to load chats",
                });
            }
        };

        if (workbookId && tableId) {
            fetchChats();
        }
    }, [workbookId, tableId, toast]);

    const startNewChat = async () => {
        try {
            const response = await axiosInstance.post(
                `${process.env.NEXT_PUBLIC_API_URL}/chat/workbook/${workbookId}/table/${tableId}/`
            );

            const newChat: StandardChatInterface = {
                id: response.data.id,
                name: response.data.name,
                messages: [],
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

    const selectChat = (chatId: string) => {
        setActiveChatId(chatId);
    };

    if (!workbookId || !tableId) {
        return <div>Loading...</div>;
    }
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
                <Select value={activeChatId || ""} onValueChange={selectChat}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a chat" />
                    </SelectTrigger>
                    <SelectContent>
                        {chats.map((chat) => (
                            <SelectItem key={chat.id} value={chat.id}>
                                {chat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={startNewChat} size="icon">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <ScrollArea className="flex-grow p-4">
                {activeChatId &&
                    chats
                        .find((chat) => chat.id === activeChatId)
                        ?.messages.map((message, index) => {
                            const messageDate = new Date(message.createdAt); // Convert to Date object because it is a string when fetched from server
                            const userType =
                                message.userType === "user" ? "You" : "Model";
                            return (
                                <div key={index} className="mb-4">
                                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                        <span>{userType}</span>
                                        <span>
                                            {messageDate.toLocaleDateString()}
                                        </span>{" "}
                                    </div>
                                    <div className="p-2 bg-muted rounded-md">
                                        {message.text}
                                    </div>
                                </div>
                            );
                        })}
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
                    <Button onClick={handleSendMessage}>Send</Button>
                </div>
            </div>
        </div>
    );
}
