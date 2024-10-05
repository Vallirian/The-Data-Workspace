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

export default function StandardChat({ workbookId, tableId }: chatProps) {
    const [chats, setChats] = useState<StandardChatInterface[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [inputMessage, setInputMessage] = useState("");

    const handleSendMessage = () => {
        if (inputMessage.trim() && activeChatId) {
            const newMessage: StandardChatMessageInterface = {
                id: Date.now().toString(), // temporary id, will be replaced by server
                type: "standard",
                text: inputMessage,
                userId: auth.currentUser?.uid || "",
                userType: "user",
                createdAt: new Date(),
            };
            setChats((prevChats) =>
                prevChats.map((chat) =>
                    chat.id === activeChatId
                        ? {
                              ...chat,
                              messages: [
                                  ...(chat.messages as StandardChatMessageInterface[]),
                                  newMessage,
                              ],
                          }
                        : chat
                )
            );

            setInputMessage("");
        }
    };

    const startNewChat = () => {
        const newChat: StandardChatInterface = {
            id: Date.now().toString(),
            name: `Chat ${chats.length + 1}`,
            messages: [],
        };
        setChats([...chats, newChat]);
        setActiveChatId(newChat.id);
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
                        ?.messages.map((message, index) => (
                            <div key={index} className="mb-4">
                                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                    <span>{message.userId}</span>
                                    <span>
                                        {message.createdAt.toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="p-2 bg-muted rounded-md">
                                    {message.text}
                                </div>
                            </div>
                        ))}
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
