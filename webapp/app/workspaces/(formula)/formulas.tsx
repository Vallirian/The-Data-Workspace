"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "@/services/axios";
import { AnalysisChatMessageInterface, ErrorInterface, FormulaInterface } from "@/interfaces/main";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Code2, Copy, Loader2, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "sql-formatter";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { xcode } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { auth } from "@/services/firebase";
import { Textarea } from "@/components/ui/textarea";
import ArcFormatDate from "@/services/formatDate";
import { ArcAutoFormat } from "@/services/autoFormat";

export default function Formulas({ workbookId, tableId }: { workbookId: string; tableId: string }) {
	const [formulas, setFormulas] = useState<FormulaInterface[]>([]);
	const [activeFormula, setActiveFormula] = useState<FormulaInterface | null>(null);
	const { toast } = useToast();
	const [waitingServerMessage, setWaitingServerMessage] = useState<boolean>(false);
	const [messages, setMessages] = useState<AnalysisChatMessageInterface[]>([]);
	const [inputMessage, setInputMessage] = useState("");

	useEffect(() => {
		fetchFormulas();
	}, [workbookId]);

	const fetchFormulas = async () => {
		try {
			const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/formulas/`);
			const fetchedFormulas: FormulaInterface[] = response.data;
			setFormulas(fetchedFormulas);
		} catch (error: unknown) {
			const err = error as ErrorInterface;
			toast({
				variant: "destructive",
				title: "Error fetching formulas",
				description: err.response?.data?.error || "Failed to load formulas",
			});
		}
	};

	const deleteFormula = async (id: string) => {
		try {
			await axiosInstance.delete(`${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/formulas/${id}`);
			setFormulas(formulas.filter((formula) => formula.id !== id));
		} catch (error: unknown) {
			const err = error as ErrorInterface;
			toast({
				variant: "destructive",
				title: "Error deleting formula",
				description: err.response.data.error,
			});
		}
	};

	// edit formula
	const handleCreateFormula = async () => {
		try {
			const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/formulas/`, { dataTable: tableId });
			const newFormula: FormulaInterface = response.data;
			setFormulas([...formulas, newFormula]);
			setActiveFormula(newFormula);
		} catch (error: unknown) {
			const err = error as ErrorInterface;
			toast({
				variant: "destructive",
				title: "Error creating formula",
				description: err.response.data.error,
			});
		}
	};

	const handleCloseFormulaEditor = () => {
		fetchFormulas();
		setActiveFormula(null);
	};

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
	}, [activeFormula]);

	const fetchMessages = async () => {
		if (!activeFormula) return;
		try {
			const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/formulas/${activeFormula.id}/messages/`);
			const fetchedMessages: AnalysisChatMessageInterface[] = response.data || [];
			setMessages(fetchedMessages);
		} catch (error: unknown) {
			const err = error as ErrorInterface;
			toast({
				variant: "destructive",
				title: "Error fetching messages",
				description: err.response?.data?.error || "Failed to load messages",
			});
		}
	};

	const handleSendMessage = async () => {
		if (inputMessage.trim() && !waitingServerMessage && activeFormula) {
			const _newMessage: AnalysisChatMessageInterface = {
				id: Date.now().toString(), // temporary id, will be replaced by server
				userId: auth.currentUser?.uid || "",
				userType: "user",
				createdAt: new Date(),
				formula: activeFormula.id,

				text: inputMessage,
				name: null,
				description: null,

				messageType: "text",
			};

			setMessages([...messages, _newMessage]);
			setInputMessage("");

			try {
				setWaitingServerMessage(true);
				const _newMessageResponse = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/workbooks/${workbookId}/formulas/${activeFormula.id}/messages/`, _newMessage);
				const newMessageResponseData: AnalysisChatMessageInterface = _newMessageResponse.data;
				if (newMessageResponseData) {
					newMessageResponseData.userId = auth.currentUser?.uid || "";
					setMessages([...messages, _newMessage, newMessageResponseData]);

					// Scroll to bottom when new message is added
					if (scrollRef.current) {
						scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
					}

					// update the active formula name so it can be displayed in the chat header
					if (activeFormula && newMessageResponseData.name) {
						activeFormula.name = newMessageResponseData.name;
					}

					setWaitingServerMessage(false);
				}
			} catch (error: unknown) {
				const err = error as ErrorInterface;
				toast({
					variant: "destructive",
					title: "Error sending message",
					description: err.response.data.error ? err.response.data.error : "Failed to send message",
				});
				setWaitingServerMessage(false);
			}
		}
	};

	if (activeFormula) {
		return (
			<div className="h-full flex flex-col px-2">
				<div className="flex justify-between items-center px-4 py-2">
					<div>
						<small className="text-sm font-semibold leading-none">{activeFormula.name || "Untitled Formula"}</small>
					</div>
					<div>
						<Button variant="link" onClick={handleCloseFormulaEditor}>
							Close
						</Button>
					</div>
				</div>

				<ScrollArea className="flex-grow">
					{messages.map((message, index) => {
						const messageDate = new Date(message.createdAt);
						const userType = message.userType === "user" ? "You" : "Model";
						return (
							<div key={index} className="mb-4">
								{message.messageType === "text" && (
									<div className="p-2 bg-muted rounded-md">
										<div className="text-sm text-muted-foreground mb-1">
											{userType} &#8226; {ArcFormatDate(messageDate)}
										</div>
										{message.text}
									</div>
								)}
								{(message.messageType === "kpi" || message.messageType === "table") && (
									<Card className="flex flex-col cursor-pointer hover:bg-accent">
										<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
											<CardTitle className="text-sm font-medium">{message.name}</CardTitle>
										</CardHeader>
										<CardContent>
											<p className="mb-2">{ArcAutoFormat(message.text)}</p>
											<p className="text-xs text-muted-foreground">{message.description}</p>
										</CardContent>
										<CardFooter>
											<p className="text-xs text-muted-foreground">{ArcFormatDate(messageDate)}</p>
										</CardFooter>
									</Card>
								)}
							</div>
						);
					})}
				</ScrollArea>

				<div className="py-4 px-1 flex flex-col space-y-2">
					<Textarea value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Type a message..." className="flex-grow resize-none" rows={Math.min(3, inputMessage.split("\n").length)} />
					<div className="flex">
						{waitingServerMessage ? (
							<Button disabled className="flex-grow">
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Send
							</Button>
						) : (
							<Button className="flex-grow" onClick={handleSendMessage}>
								Send
							</Button>
						)}
					</div>
				</div>
			</div>
		);
	} else {
		return (
			<div className="h-full flex flex-col">
				<div className="flex justify-between items-center px-4 py-2">
					<div>
						<small className="text-sm font-semibold leading-none">Metrics</small>
					</div>
					<div>
						<Button variant="link" onClick={handleCreateFormula}>
							+ New Metric
						</Button>
					</div>
				</div>
				{formulas.length === 0 && (
					<div className="flex-grow flex items-center justify-center">
						<p className="text-muted-foreground">No formulas found</p>
					</div>
				)}
				{formulas.length > 0 && (
				<div className="flex-grow overflow-y-auto p-4">
					{formulas.map((formula) => (
						<div key={formula.id}>
							<div className="flex flex-col mb-4 rounded-xl bg-muted">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">{formula.name}</CardTitle>
								</CardHeader>
								<CardContent className="py-2">
									<p className="text-xs text-muted-foreground">{formula.description || "No description"}</p>
								</CardContent>
								<CardFooter className="flex justify-between py-1">
									<div>
										<Button variant="link" size="icon" onClick={() => setActiveFormula(formula)}>
											<Pencil size={14} />
										</Button>
										<Dialog>
											<DialogTrigger asChild>
												<Button variant="link" size="icon">
													<Code2 className="h-4 w-4" />
													<span className="sr-only">View SQL</span>
												</Button>
											</DialogTrigger>
											<DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[700px] w-[90vw]">
												<DialogHeader>
													<div className="flex gap-4 items-center">
														<DialogTitle>SQL for {formula.name}</DialogTitle>
														<div>
															<Copy
																className="h-4 w-4"
																onClick={() => {
																	navigator.clipboard.writeText(formula.arcSql || "");
																	toast({ title: "Copied", description: "SQL copied to clipboard", duration: 2000 });
																}}
															/>
														</div>
													</div>
												</DialogHeader>
												<DialogDescription className="max-h-[60vh] overflow-hidden flex flex-col">
													<ScrollArea className="w-full rounded-md border flex-grow">
														<div className="p-4">
															<SyntaxHighlighter
																language="pgsql"
																// oneLight, duotoneLight, gruvboxLight, materialLight
																style={xcode}
																customStyle={{
																	margin: 0,
																	padding: 0,
																	background: "transparent",
																}}
																wrapLines={true}
																wrapLongLines={true}
															>
																{(() => {
																	try {
																		// Attempt to format the SQL string
																		return format(formula.arcSql || "No SQL");
																	} catch (e) {
																		// If formatting fails, render the raw SQL
																		return formula.arcSql || "SQL could not be formatted";
																	}
																})()}
															</SyntaxHighlighter>
														</div>
														<ScrollBar orientation="horizontal" />
													</ScrollArea>
													<p className="text-sm text-muted-foreground py-2 mt-2">{formula.description}</p>
												</DialogDescription>
											</DialogContent>
										</Dialog>
									</div>
									<AlertDialog>
										<AlertDialogTrigger>
											<Trash2 size={14} />
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
												<AlertDialogDescription>This action cannot be undone. This will permanently delete the saved formula and remove it from report.</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<AlertDialogAction
													onClick={() => {
														deleteFormula(formula.id);
													}}
												>
													Continue
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</CardFooter>
							</div>
						</div>
					))}
				</div>
				)}
			</div>
		);
	}
}
