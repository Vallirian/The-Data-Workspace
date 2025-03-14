"use client";

import Link from "next/link";
import { BrushIcon as Broom, Lightbulb, Zap, Users, Package, BarChart3, Upload, Wand2, Repeat2, HelpCircle, Route, CheckCircle, Leaf, Shield, PianoIcon as ChessPawn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const chartData = [
	{ month: "January", safetyStock: 120, projectedDemand: 100 },
	{ month: "February", safetyStock: 130, projectedDemand: 110 },
	{ month: "March", safetyStock: 140, projectedDemand: 115 },
	{ month: "April", safetyStock: 150, projectedDemand: 125 },
	{ month: "May", safetyStock: 160, projectedDemand: 130 },
	{ month: "June", safetyStock: 170, projectedDemand: 140 },
];

const chartConfig = {
	safetyStock: {
		label: "SafetyStock",
		color: "hsl(var(--chart-1))",
	},
	projectedDemand: {
		label: "Projected Demand",
		color: "hsl(var(--chart-2))",
	},
} satisfies ChartConfig;

export default function Home() {
	const thisMonthData = chartData[chartData.length - 1];
	const prevMonthData = chartData[chartData.length - 2];
	const difference = ((thisMonthData.safetyStock - prevMonthData.safetyStock) / prevMonthData.safetyStock) * 100;

	const handleButtonClick = () => {
		window.open("https://www.youtube.com/@thedataworkspace", "_blank");
	};

	return (
		<div className="flex flex-col min-h-screen">
			<main className="flex-1">
				{/* Hero Section */}
				<section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30">
					<div className="grid gap-28 md:grid-cols-2 px-28">
						<div className="space-y-6 mx-auto max-w-xl">
							<h1 className="text-4xl md:text-5xl font-bold tracking-tight">Transform Your Business Data Without The Grunt Work</h1>
							<p className="text-xl text-muted-foreground">Make impactful business decisions with zero-code data cleaning and guided analysis designed for businesses</p>
							<div className="flex flex-col sm:flex-row gap-4 pt-28">
								<Button size="lg" onClick={handleButtonClick}>
									Get Started
								</Button>
								<Button size="lg" variant="outline" asChild>
									<Link href="#how-it-works">See How It Works</Link>
								</Button>
							</div>
						</div>

						<div className="grid gap-4 grid-cols-2 ml-auto max-w-xl">
							<div className="p-6 rounded-lg border transition-all flex flex-col justify-center h-[200px]">
								<div className="flex items-center gap-4">
									<div className="bg-blue-100 p-3 rounded-full">
										<Broom className="h-4 w-4 text-blue-600" />
									</div>
									<h3 className="font-medium">Effortless Data Cleaning</h3>
								</div>
								<p className="mt-2 text-muted-foreground">Eliminate 70% of repetitive work with our cleaning engine</p>
							</div>
							<div className="p-6 rounded-lg border transition-all flex flex-col justify-center h-[200px]">
								<div className="flex items-center gap-4 ">
									<div className="bg-green-100 p-3 rounded-full">
										<Lightbulb className="h-4 w-4 text-green-600" />
									</div>
									<h3 className="font-medium">AI-Powered Insights</h3>
								</div>
								<p className="mt-2 text-muted-foreground">Follow AI-powered, decision-focused analysis framework to extract meaningful business insights</p>
							</div>
							<div className="col-span-2 p-6 rounded-lg border transition-all flex flex-col justify-center h-[200px]">
								<div className="flex items-center gap-4">
									<div className="bg-purple-100 p-3 rounded-full">
										<Zap className="h-4 w-4 text-purple-600" />
									</div>
									<h3 className="font-medium">Resource Efficient</h3>
								</div>
								<p className="mt-2 text-muted-foreground">Our proprietary algorithms use up to 80% fewer tokens</p>
							</div>
						</div>
					</div>
				</section>

				{/* use Cases */}
				<section className="py-20 bg-white">
					<div className="container max-w-6xl mx-auto px-4">
						<div className="grid md:grid-cols-2 gap-12 items-center mb-16">
							<Card>
								<CardHeader>
									<CardTitle>Stock Profile</CardTitle>
									<CardDescription>January - June 2024</CardDescription>
								</CardHeader>
								<CardContent>
									<ChartContainer config={chartConfig}>
										<BarChart accessibilityLayer data={chartData}>
											<CartesianGrid vertical={false} />
											<XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} />
											<ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
											<Bar dataKey="safetyStock" fill={chartConfig.safetyStock.color} radius={4}>
												<LabelList dataKey="safetyStock" position="top" />
											</Bar>
											<Bar dataKey="projectedDemand" fill={chartConfig.projectedDemand.color} radius={4}>
												<LabelList dataKey="projectedDemand" position="top" />
											</Bar>
										</BarChart>
									</ChartContainer>
								</CardContent>
								<CardFooter className="flex-col items-start gap-2 text-sm">
									<div className="flex gap-2 font-medium leading-none">
										{`Trending ${difference >= 0 ? "up" : "down"} by ${Math.abs(Number(difference.toFixed(2)))}% this month`}
										<TrendingUp className="h-4 w-4" />
									</div>
									<div className="leading-none text-muted-foreground">Comparing Safety Stock vs Projected Demand</div>
								</CardFooter>
							</Card>

							<div className="flex flex-col justify-between h-full">
								<div className="mb-28">
									<h2 className="text-3xl md:text-4xl mb-4">Data-Driven Decisions Made Simple</h2>
									<p className="text-muted-foreground max-w-2xl mx-auto">Stop drowning in spreadsheets and start making informed decisions</p>
								</div>
								<div className="flex flex-col flex-grow justify-between">
									<div>
										<p className="text-xl">Increase conversion rates, optimize inventory, and understand customer behavior</p>
									</div>
									<div>
										<p className="text-lg mb-4">Connect your store data and get actionable insights within minutes</p>
										<Button variant="outline" className="" onClick={handleButtonClick}>
											Connect Your Store
										</Button>
									</div>
								</div>
							</div>
						</div>

						<div className="flex gap-8">
							<div className="bg-muted p-6 rounded-lg border hover:shadow-md transition-all">
								<div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
									<Users className="h-6 w-6 text-blue-600" />
								</div>
								<h3 className="text-xl font-medium mb-2">Customer Segmentation</h3>
								<p className="text-muted-foreground">Identify high-value customers and tailor your marketing efforts</p>
							</div>
							<div className="bg-muted p-6 rounded-lg border hover:shadow-md transition-all">
								<div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
									<Package className="h-6 w-6 text-blue-600" />
								</div>
								<h3 className="text-xl font-medium mb-2">Inventory Optimization</h3>
								<p className="text-muted-foreground">Identify overstock and increase working capital while preventing stockouts</p>
							</div>
							<div className="bg-muted p-6 rounded-lg border hover:shadow-md transition-all">
								<div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
									<BarChart3 className="h-6 w-6 text-blue-600" />
								</div>
								<h3 className="text-xl font-medium mb-2">Marketing ROI Analysis</h3>
								<p className="text-muted-foreground">See which channels deliver the best returns on your ad spend</p>
							</div>
						</div>
					</div>
				</section>

				{/* How it Works */}
				<section id="how-it-works" className="py-20 bg-white">
					<div className="container max-w-6xl mx-auto px-4">
						<motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-16">
							<h2 className="text-3xl font-medium md:text-4xl mb-4">How It Works</h2>
							<p className="text-muted-foreground text-lg">Preprocess and analyze your data without writing a single line of code</p>
						</motion.div>

						<div className="relative">
							{/* Timeline line */}
							<div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200"></div>

							{/* First step */}
							<TimelineItem title="Connect" description="Your analysis should be done on the data you trust. Clean and preprocess your data, with a click of a button." position="left" >
								<div className="max-w-sm">
									<div className="bg-blue-50 p-6 rounded-lg border border-blue-100 hover:shadow-md transition-all">
										<div className="bg-blue-100 p-2 rounded-full w-fit mb-4">
											<Upload className="h-3 w-3 text-blue-600" />
										</div>
										<h4 className="text-xl font-medium mb-2">Connect Your Data</h4>
										<p className="text-muted-foreground">Upload spreadsheets or connect to your systems with our continuously expanding integrations</p>
									</div>
								</div>
							</TimelineItem>

							<TimelineItem title="Automated Cleaning" description="Our advanced algorithms handle the grunt work for you." position="right" icon={<Repeat2 className="h-3 w-3 text-blue-600" />} iconBg="bg-blue-100">
								<div className="max-w-sm">
									<div className="bg-blue-50 p-6 rounded-lg border border-blue-100 hover:shadow-md transition-all">
										<div className="bg-blue-100 p-2 rounded-full w-fit mb-4">
											<Repeat2 className="h-3 w-3 text-blue-600" />
										</div>
										<h4 className="text-xl font-medium mb-2">Automated Cleaning</h4>
										<p className="text-muted-foreground">Our algorithm identifies and fixes inconsistencies, duplicates, and formatting issues—giving you trustworthy data</p>
										<Button variant="outline" size="sm" className="mt-4" onClick={handleButtonClick}>
											Clean Your First Dataset
										</Button>
									</div>
								</div>
							</TimelineItem>

							{/* Third step */}
							<TimelineItem title="Set Your Goal" description="Say what matters to you, what you want to get out of the analysis in your own words." position="left" icon={<HelpCircle className="h-3 w-3 text-green-600" />} iconBg="bg-green-100">
								<div className="max-w-sm">
									<div className="bg-green-50 p-6 rounded-lg border border-green-100 hover:shadow-md transition-all">
										<div className="bg-green-100 p-2 rounded-full w-fit mb-4">
											<Route className="h-3 w-3 text-green-600" />
										</div>
										<h4 className="text-xl font-medium mb-2">Define Your Question</h4>
										<p className="text-muted-foreground">Tell us what business decision you need to make</p>
									</div>
								</div>
							</TimelineItem>

							{/* Fourth step */}
							<TimelineItem title="AI-Powered Analysis" description="Let our AI guide you through the analysis process." position="right" icon={<Lightbulb className="h-3 w-3 text-green-600" />} iconBg="bg-green-100">
								<div className="max-w-sm">
									<div className="bg-green-50 p-6 rounded-lg border border-green-100 hover:shadow-md transition-all">
										<div className="bg-green-100 p-2 rounded-full w-fit mb-4">
											<HelpCircle className="h-3 w-3 text-green-600" />
										</div>
										<h4 className="text-xl font-medium mb-2">AI-Powered, Decision Focused Analysis</h4>
										<p className="text-muted-foreground">Follow a guided analysis path, powered by AI, to the right answer and make impactful decisions fast</p>
										<Button variant="outline" size="sm" className="mt-4" onClick={handleButtonClick}>
											Start Your Analysis
										</Button>
									</div>
								</div>
							</TimelineItem>

							{/* Fifth step */}
							<TimelineItem title="Get Results" description="Receive clear, actionable insights you can implement immediately." position="left" icon={<CheckCircle className="h-3 w-3 text-green-600" />} iconBg="bg-green-100">
								<div className="max-w-sm">
									<div className="bg-green-50 p-6 rounded-lg border border-green-100 hover:shadow-md transition-all">
										<div className="bg-green-100 p-2 rounded-full w-fit mb-4">
											<CheckCircle className="h-3 w-3 text-green-600" />
										</div>
										<h4 className="text-xl font-medium mb-2">Get Actionable Results</h4>
										<p className="text-muted-foreground">Get analysis summaries written in clear, easy-to-understand language</p>
									</div>
								</div>
							</TimelineItem>
						</div>
					</div>
				</section>

				{/* Technical Edge */}
				<section className="py-20 bg-white">
					<div className="container max-w-6xl mx-auto px-4">
						<div className="text-center mb-16">
							<h2 className="text-3xl md:text-4xl font-semibold mb-4">Why Our Technology Stands Apart</h2>
						</div>

						<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
							<div className="p-6 rounded-lg border hover:shadow-md transition-all">
								<div className="bg-purple-100 p-3 rounded-full w-fit mb-4">
									<Leaf className="h-6 w-6 text-purple-600" />
								</div>
								<h3 className="text-xl font-medium mb-2">Resource Efficiency</h3>
								<p className="text-muted-foreground">Our proprietary algorithms reduce AI token consumption by up to 80%</p>
							</div>
							<div className="p-6 rounded-lg border hover:shadow-md transition-all">
								<div className="bg-purple-100 p-3 rounded-full w-fit mb-4">
									<Shield className="h-6 w-6 text-purple-600" />
								</div>
								<h3 className="text-xl font-medium mb-2">Data Security</h3>
								<p className="text-muted-foreground">Minimized data exposure with our targeted processing approach</p>
							</div>
							<div className="p-6 rounded-lg border hover:shadow-md transition-all">
								<div className="bg-purple-100 p-3 rounded-full w-fit mb-4">
									<ChessPawn className="h-6 w-6 text-purple-600" />
								</div>
								<h3 className="text-xl font-medium mb-2">Task Delegation</h3>
								<p className="text-muted-foreground">Smart prioritization of AI models to give you the best results at the lowest cost</p>
							</div>
						</div>
						<div className="text-center mt-8">
							<Button variant="outline" size="lg" onClick={handleButtonClick}>
								Learn More About Our Technology
							</Button>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-20 bg-primary text-primary-foreground">
					<div className="text-center">
						<h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Data Experience?</h2>
						<p className="text-xl mb-8 max-w-2xl mx-auto">Join businesses that are making smarter decisions with cleaner data and guided analysis.</p>
						<Button size="lg" variant="secondary" onClick={handleButtonClick}>
							Get Started with a Free Demo
						</Button>
					</div>
				</section>
			</main>
		</div>
	);
}

function TimelineItem({ year, title, description, position, icon, iconBg, children }: { year: string; title: string; description: string; position: "left" | "right"; icon: React.ReactNode; iconBg: string; children: React.ReactNode }) {
	const itemRef = useRef(null);
	const isInView = useInView(itemRef, { once: true, amount: 0.3 });

	return (
		<div className="relative mb-24 last:mb-0">
			{/* Timeline dot */}
			<motion.div initial={{ scale: 0, opacity: 0 }} animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="absolute left-1/2 transform -translate-x-1/2 z-10 w-12 h-12 rounded-full bg-white flex items-center justify-center border-4 border-gray-600" />

			<div ref={itemRef} className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${position === "left" ? "md:text-right" : "md:text-left"}`}>
				{/* Year and title - always visible */}
				<motion.div initial={{ opacity: 0, x: position === "left" ? -50 : 50 }} animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: position === "left" ? -50 : 50 }} transition={{ duration: 0.6 }} className={`${position === "left" ? "md:order-1" : "md:order-2"} p-6`}>
					<div className="text-2xl font-bold">{year}</div>
					<h3 className="text-2xl font-medium mb-2">{title}</h3>
					<p className="text-gray-400">{description}</p>
				</motion.div>

				{/* Content - always visible */}
				<motion.div initial={{ opacity: 0, x: position === "left" ? 50 : -50 }} animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: position === "left" ? 50 : -50 }} transition={{ duration: 0.6, delay: 0.1 }} className={`${position === "left" ? "md:order-2" : "md:order-1"} p-6`}>
					{children}
				</motion.div>
			</div>
		</div>
	);
}
