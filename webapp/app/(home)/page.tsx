"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, BrushIcon as Broom, Lightbulb, Zap, Users, Package, BarChart3, Upload, Wand2, Repeat2, HelpCircle, Route, CheckCircle, Leaf, Shield, PianoIcon as ChessPawn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

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
							<div className="flex flex-col sm:flex-row gap-4">
								<Button size="lg" onClick={handleButtonClick}>
									Get Started
								</Button>
								<Button size="lg" variant="outline" asChild>
									<Link href="#how-it-works">See How It Works</Link>
								</Button>
							</div>
						</div>

						<div className="grid gap-4 grid-cols-2 ml-auto max-w-xl">
							<div className="bg-primary/10 p-6 rounded-lg border border-primary/20 hover:border-primary/40 transition-all flex flex-col justify-center items-center">
								<div className="flex items-center gap-4">
									<div className="bg-blue-100 p-3 rounded-full">
										<Broom className="h-6 w-6 text-blue-600" />
									</div>
									<h3 className="font-medium">Effortless Data Cleaning</h3>
								</div>
								<p className="mt-2 text-muted-foreground">Eliminate 70% of repetitive work with our cleaning engine</p>
							</div>
							<div className="bg-primary/10 p-6 rounded-lg border border-primary/20 hover:border-primary/40 transition-all flex flex-col justify-center items-center">
								<div className="flex items-center gap-4 ">
									<div className="bg-green-100 p-3 rounded-full">
										<Lightbulb className="h-6 w-6 text-green-600" />
									</div>
									<h3 className="font-medium">AI-Powered Insights</h3>
								</div>
								<p className="mt-2 text-muted-foreground">Follow AI-powered, decision-focused analysis framework to extract meaningful business insights</p>
							</div>
							<div className="col-span-2 bg-primary/10 p-6 rounded-lg border border-primary/20 hover:border-primary/40 transition-all flex flex-col ">
								<div className="flex items-center gap-4">
									<div className="bg-purple-100 p-3 rounded-full">
										<Zap className="h-6 w-6 text-purple-600" />
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
										<Button variant="outline" className="">
											Connect Your Store
										</Button>
									</div>
								</div>
							</div>
						</div>

						<div className="flex gap-8">
							<div className="bg-muted p-6 rounded-lg border hover:shadow-md transition-all">
								<div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
									<Users className="h-6 w-6 text-primary" />
								</div>
								<h3 className="text-xl font-medium mb-2">Customer Segmentation</h3>
								<p className="text-muted-foreground">Identify high-value customers and tailor your marketing efforts</p>
							</div>
							<div className="bg-muted p-6 rounded-lg border hover:shadow-md transition-all">
								<div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
									<Package className="h-6 w-6 text-primary" />
								</div>
								<h3 className="text-xl font-medium mb-2">Inventory Optimization</h3>
								<p className="text-muted-foreground">Identify overstock and increase working capital while preventing stockouts</p>
							</div>
							<div className="bg-muted p-6 rounded-lg border hover:shadow-md transition-all">
								<div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
									<BarChart3 className="h-6 w-6 text-primary" />
								</div>
								<h3 className="text-xl font-medium mb-2">Marketing ROI Analysis</h3>
								<p className="text-muted-foreground">See which channels deliver the best returns on your ad spend</p>
							</div>
						</div>
					</div>
				</section>

				{/* How It Works */}
				<section id="how-it-works" className="py-20 bg-muted/30">
					<div className="container max-w-6xl mx-auto px-4">
						<div className="text-center mb-16">
							<h2 className="text-3xl font-semibold md:text-4xl mb-4">How It Works</h2>
						</div>

						<div className="grid md:grid-cols-2 gap-16">
							{/* Left Column: Data Cleaning */}
							<div>
								<h3 className="text-2xl text-center mb-10">Data Cleaning</h3>
								<div className="flex flex-col gap-2">
									<div className="grid md:grid-cols-2 gap-2 items-stretch">
										<div className="bg-blue-50 p-6 rounded-lg border border-blue-100 hover:shadow-md transition-all flex flex-col h-[250px]">
											<div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
												<Upload className="h-6 w-6 text-blue-600" />
											</div>
											<h4 className="text-xl font-medium mb-2">Connect Your Data</h4>
											<p className="text-muted-foreground">Upload spreadsheets or connect to your systems - continuously expanding integrations</p>
										</div>
										<div className="bg-blue-50 p-6 rounded-lg border border-blue-100 hover:shadow-md transition-all flex flex-col h-[250px]">
											<div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
												<Wand2 className="h-6 w-6 text-blue-600" />
											</div>
											<h4 className="text-xl font-medium mb-2">Create Repeatable Workflows</h4>
											<p className="text-muted-foreground">Save your cleaning process for future use and maintain data consistency</p>
										</div>
									</div>
									<div>
										<div className="bg-blue-50 p-6 rounded-lg border border-blue-100 hover:shadow-md transition-all flex flex-col h-[250px]">
											<div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
												<Repeat2 className="h-6 w-6 text-blue-600" />
											</div>

											<h4 className="text-xl font-medium mb-2">Automated Cleaning</h4>
											<p className="text-muted-foreground">Our algorithm identifies and fixes inconsistencies, duplicates, and formatting issues—giving you trustworthy data</p>
										</div>
									</div>
									<div className="text-center mt-8">
										<Button size="lg" variant="link" onClick={handleButtonClick}>
											Clean Your First Dataset
										</Button>
									</div>
								</div>
							</div>

							{/* Right Column: Data Analysis */}
							<div>
								<h3 className="text-2xl text-center mb-10">Data Analysis</h3>
								<div className="flex flex-col gap-2">
									<div>
										<div className="bg-green-50 p-6 rounded-lg border border-green-100 hover:shadow-md transition-all flex flex-col  h-[250px]">
											<div className="bg-green-100 p-3 rounded-full w-fit mb-4">
												<HelpCircle className="h-6 w-6 text-green-600" />
											</div>
											<h4 className="text-xl font-medium mb-2">AI-Powered, Decision Focused Analysis</h4>
											<p className="text-muted-foreground">Follow a guided analysis path, powered by AI, to the right answer and make impactful decisions fast</p>
										</div>
									</div>
									<div className="grid md:grid-cols-2 gap-2 items-stretch">
										<div className="bg-green-50 p-6 rounded-lg border border-green-100 hover:shadow-md transition-all flex flex-col h-[250px]">
											<div className="bg-green-100 p-3 rounded-full w-fit mb-4">
												<Route className="h-6 w-6 text-green-600" />
											</div>
											<h4 className="text-xl font-medium mb-2">Define Your Question</h4>
											<p className="text-muted-foreground">Tell us what business decision you need to make</p>
										</div>
										<div className="bg-green-50 p-6 rounded-lg border border-green-100 hover:shadow-md transition-all flex flex-col  h-[250px]">
											<div className="bg-green-100 p-3 rounded-full w-fit mb-4">
												<CheckCircle className="h-6 w-6 text-green-600" />
											</div>
											<h4 className="text-xl font-medium mb-2">Get Actionable Results</h4>
											<p className="text-muted-foreground">Get analysis summaries written in clear, easy-to-understand language</p>
										</div>
									</div>
									<div className="text-center mt-8">
										<Button size="lg" variant="link" onClick={handleButtonClick}>
											Start Your Analysis
										</Button>
									</div>
								</div>
							</div>
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
								<div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
									<Leaf className="h-6 w-6 text-primary" />
								</div>
								<h3 className="text-xl font-medium mb-2">Resource Efficiency</h3>
								<p className="text-muted-foreground">Our proprietary algorithms reduce AI token consumption by up to 80%</p>
							</div>
							<div className="p-6 rounded-lg border hover:shadow-md transition-all">
								<div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
									<Shield className="h-6 w-6 text-primary" />
								</div>
								<h3 className="text-xl font-medium mb-2">Data Security</h3>
								<p className="text-muted-foreground">Minimized data exposure with our targeted processing approach</p>
							</div>
							<div className="p-6 rounded-lg border hover:shadow-md transition-all">
								<div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
									<ChessPawn className="h-6 w-6 text-primary" />
								</div>
								<h3 className="text-xl font-medium mb-2">Task Delegation</h3>
								<p className="text-muted-foreground">Smart prioritization of AI models to give you the best results at the lowest cost</p>
							</div>
						</div>
						<div className="text-center mt-8">
							<Button variant="outline" size="lg">
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
						<Button size="lg" variant="secondary" asChild onClick={handleButtonClick}>
							Get Started with a Free Demo
						</Button>
					</div>
				</section>
			</main>
		</div>
	);
}
