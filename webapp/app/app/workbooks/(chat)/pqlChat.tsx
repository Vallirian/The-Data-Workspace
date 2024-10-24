"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import axiosInstance from "@/services/axios";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { chatProps } from "@/interfaces/props";
import { auth } from "@/services/firebase";
import { useToast } from "@/hooks/use-toast";
import ArcFormatDate from "@/services/formatDate";
import {
    AnalysisChatMessageInterface,
} from "@/interfaces/main";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ArcAutoFormat } from "@/services/autoFormat";

export default function AnalysisChat({
    workbookId,
    tableId,
    formulaId,
}: chatProps) {
    const { toast } = useToast();
    const [waitingServerMessage, setWaitingServerMessage] =
        useState<boolean>(false);
    const [messages, setMessages] = useState<AnalysisChatMessageInterface[]>(
        []
    );
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
        fetchMessages();        
    }, [formulaId]);

    const fetchMessages = async () => {
        try {
            const response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/formulas/${formulaId}/messages/`
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

    const handleSendMessage = async () => {
        if (inputMessage.trim() && !waitingServerMessage && formulaId) {
            const _newMessage: AnalysisChatMessageInterface = {
                id: Date.now().toString(), // temporary id, will be replaced by server
                userId: auth.currentUser?.uid || "",
                userType: "user",
                createdAt: new Date(),
                formula: formulaId,

                text: inputMessage,
                name: null,
                description: null,

                messageType: "text",
            };

            setMessages([...messages, _newMessage]);
            setInputMessage("");

            try {
                setWaitingServerMessage(true);
                const _newMessageResponse = await axiosInstance.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/formulas/${formulaId}/messages/`,
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

    if (!workbookId || !tableId || !formulaId) {
        return <div>Loading...</div>;
    }
    return (
        <div className="h-full flex flex-col">

            <div className="flex-grow overflow-y-auto" ref={scrollRef}>
                {messages.map((message, index) => {
                    const messageDate = new Date(message.createdAt);
                    const userType =
                        message.userType === "user" ? "You" : "Model";
                    return (
                        <div key={index} className="mb-4">
                            {message.messageType === "text" && (
                                <div className="p-2 bg-muted rounded-md">
                                    <div className="text-sm text-muted-foreground mb-1">
                                        {userType} &#8226;{" "}
                                        {ArcFormatDate(messageDate)}
                                    </div>
                                    {message.text}
                                </div>
                            )}
                            {(message.messageType === "kpi" ||
                                message.messageType === "table") && (
                                <Card className="flex flex-col cursor-pointer hover:bg-accent">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            {message.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="mb-2">{ArcAutoFormat(message.text)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {message.description}
                                        </p>
                                    </CardContent>
                                    <CardFooter>
                                        <p className="text-xs text-muted-foreground">
                                            {ArcFormatDate(messageDate)}
                                        </p>
                                    </CardFooter>
                                </Card>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="p-4">
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
