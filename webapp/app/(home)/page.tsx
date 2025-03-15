"use client";

import Link from "next/link";
import { BrushIcon as Broom, Lightbulb, Zap, Users, Package, BarChart3, Wand2, Shield, PawPrint, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";

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
		color: "rgba(0, 122, 255, 0.8)",
	},
	projectedDemand: {
		label: "Projected Demand",
		color: "rgba(88, 86, 214, 0.6)",
	},
} satisfies ChartConfig;

const timelineEvents = [
	{
		title: "Connect",
		description: "Clean and preprocess your data with one click.",
		details: "Upload spreadsheets or connect to your systems with our continuously expanding integrations.",
		icon: <Wand2 className="h-5 w-5" />,
	},
	{
		title: "Automated Cleaning",
		description: "Our advanced algorithms handle the grunt work for you.",
		details: "Our algorithm identifies and fixes inconsistencies, duplicates, and formatting issues—giving you trustworthy data.",
		icon: <Broom className="h-5 w-5" />,
	},
	{
		title: "Set Your Goal",
		description: "Tell us what business decision you need to make.",
		details: "Say what matters to you, what you want to get out of the analysis in your own words.",
		icon: <Lightbulb className="h-5 w-5" />,
	},
	{
		title: "AI-Powered Analysis",
		description: "Let our AI guide you through the analysis process.",
		details: "Follow a guided analysis path, powered by AI, to the right answer and make impactful decisions fast.",
		icon: <Zap className="h-5 w-5" />,
	},
	{
		title: "Get Results",
		description: "Receive clear, actionable insights you can implement immediately.",
		details: "Get analysis summaries written in clear, easy-to-understand language.",
		icon: <TrendingUp className="h-5 w-5" />,
	},
];

export default function Home() {
	const thisMonthData = chartData[chartData.length - 1];
	const prevMonthData = chartData[chartData.length - 2];
	const difference = ((thisMonthData.safetyStock - prevMonthData.safetyStock) / prevMonthData.safetyStock) * 100;

	const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start end", "end start"],
	});

	const scaleX = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001,
	});

	const handleButtonClick = () => {
		window.open("https://www.youtube.com/@thedataworkspace", "_blank");
	};

	return (
		<div className="flex flex-col min-h-screen bg-[#FAFAFA]">
			<main className="flex-1">
				{/* Hero Section */}
				<section className="py-24 md:py-32">
					<div className="container mx-auto px-6 max-w-7xl">
						<div className="flex flex-col items-center text-center mb-16">
							<h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-[#1D1D1F] max-w-4xl">
								Transform Your Business Data Without <span className="text-[#D70015]">The Grunt Work</span>
							</h1>
							<p className="mt-6 text-xl text-[#86868B] max-w-2xl">Make impactful business decisions with zero-code data cleaning and guided analysis designed for businesses</p>
							<div className="flex flex-col sm:flex-row gap-5 mt-10">
								<Button size="lg" onClick={handleButtonClick} className="bg-[#0071E3] hover:bg-[#0077ED] rounded-full text-white px-8 py-6 text-base font-medium">
									Get Started
								</Button>
								<Button size="lg" variant="outline" asChild className="border-[#0071E3] text-[#0071E3] rounded-full hover:bg-[#0071E3]/10 px-8 py-6 text-base font-medium">
									<Link href="#how-it-works">See How It Works</Link>
								</Button>
							</div>
						</div>
					</div>
				</section>

				{/* Data-Driven Decisions */}
				{/* <section className="py-24 bg-white">
					<div className="container mx-auto px-6 max-w-7xl">
						<div className="text-center mb-16">
							<h2 className="text-3xl md:text-4xl font-semibold text-[#1D1D1F]">Data-Driven Decisions Made Simple</h2>
							<p className="mt-4 text-[#86868B] max-w-2xl mx-auto">Stop drowning in spreadsheets and start making informed decisions</p>
						</div>

						<div className="grid md:grid-cols-2 gap-12 items-center mb-20">
							<motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
								<Card className="overflow-hidden border-gray-300 shadow-lg rounded-2xl">
									<CardHeader className="pb-2">
										<CardTitle className="text-[#1D1D1F]">Stock Profile</CardTitle>
										<CardDescription>January - June 2024</CardDescription>
									</CardHeader>
									<CardContent className="pt-6">
										<ChartContainer config={chartConfig}>
											<BarChart accessibilityLayer data={chartData}>
												<CartesianGrid vertical={false} stroke="#EEEEEE" />
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
									<CardFooter className="flex-col items-start gap-2 text-sm py-4">
										<div className="flex gap-2 font-medium leading-none text-[#1D1D1F]">
											{`Trending ${difference >= 0 ? "up" : "down"} by ${Math.abs(Number(difference.toFixed(2)))}% this month`}
											<TrendingUp className="h-4 w-4" />
										</div>
										<div className="leading-none text-[#86868B]">Comparing Safety Stock vs Projected Demand</div>
									</CardFooter>
								</Card>
							</motion.div>

							<motion.div className="flex flex-col justify-between h-full" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
								<div className="mb-16">
									<p className="text-xl text-[#1D1D1F]">Increase conversion rates, optimize inventory, and understand customer behavior</p>
								</div>
								<div>
									<p className="text-lg mb-6 text-[#86868B]">Connect your store data and get actionable insights within minutes</p>
									<Button onClick={handleButtonClick} className="bg-[#0071E3] hover:bg-[#0077ED] text-white px-6 py-5 rounded-full text-base font-medium">
										Connect Your Store
									</Button>
								</div>
							</motion.div>
						</div>

						<div className="grid md:grid-cols-3 gap-6">
							{[
								{
									icon: <Users className="h-6 w-6 text-[#0071E3]" />,
									title: "Customer Segmentation",
									description: "Identify high-value customers and tailor your marketing efforts",
								},
								{
									icon: <Package className="h-6 w-6 text-[#0071E3]" />,
									title: "Inventory Optimization",
									description: "Identify overstock and increase working capital while preventing stockouts",
								},
								{
									icon: <BarChart3 className="h-6 w-6 text-[#0071E3]" />,
									title: "Marketing ROI Analysis",
									description: "See which channels deliver the best returns on your ad spend",
								},
							].map((item, index) => (
								<motion.div key={index} className="p-6 rounded-2xl bg-white shadow-sm border border-[#E5E5E5]" whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)" }} transition={{ duration: 0.2 }}>
									<div className="bg-[#E9F5FF] p-3 rounded-full w-fit mb-4">{item.icon}</div>
									<h3 className="text-xl font-medium mb-2 text-[#1D1D1F]">{item.title}</h3>
									<p className="text-[#86868B]">{item.description}</p>
								</motion.div>
							))}
						</div>
					</div>
				</section> */}

				{/* How It Works */}
				<section ref={containerRef} className="py-24 bg-[#F5F5F7] overflow-hidden" id="how-it-works">
					<div className="container mx-auto px-6 max-w-7xl">
						<motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
							<h2 className="text-3xl md:text-4xl font-semibold text-[#1D1D1F]">How It Works</h2>
							<p className="mt-4 text-lg text-[#86868B]">Preprocess and analyze your data without writing a single line of code</p>
						</motion.div>

						<div className="max-w-3xl mx-auto">
							{timelineEvents.map((event, index) => (
								<motion.div key={index} className="mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true, amount: 0.3 }}>
									<div className="flex gap-6">
										<div className="flex-shrink-0">
											<div className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm border border-[#E5E5E5]">
												<span className="text-[#0071E3]">{event.icon}</span>
											</div>
										</div>
										<div>
											<h3 className="text-xl font-medium mb-2 text-[#1D1D1F]">{event.title}</h3>
											<p className="text-[#86868B] mb-2">{event.description}</p>
											<Button variant="ghost" size="sm" onClick={() => setExpandedEvent(expandedEvent === index ? null : index)} className="text-[#0071E3] hover:bg-[#0071E3]/10 p-0 h-auto">
												{expandedEvent === index ? "Show less" : "Learn more"}
											</Button>

											<motion.div
												initial={{ height: 0, opacity: 0 }}
												animate={{
													height: expandedEvent === index ? "auto" : 0,
													opacity: expandedEvent === index ? 1 : 0,
												}}
												transition={{ duration: 0.3 }}
												className="overflow-hidden mt-2"
											>
												<p className="pt-2 text-sm text-[#86868B] pl-0">{event.details}</p>
											</motion.div>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* Technical Edge */}
				<section className="py-24 bg-white">
					<div className="container mx-auto px-6 max-w-7xl">
						<div className="text-center mb-16">
							<h2 className="text-3xl md:text-4xl font-semibold text-[#1D1D1F]">Why Our Technology Stands Apart</h2>
						</div>

						<div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
							{[
								{
									title: "Resource Efficiency",
									description: "Our proprietary algorithms reduce AI token consumption by up to 80%",
									color: "bg-[#F5F0FF]",
									textColor: "text-[#AF52DE]",
								},
								{
									title: "Data Security",
									description: "Minimized data exposure with our targeted processing approach",
									color: "bg-[#F0FEF4]",
									textColor: "text-[#34C759]",
								},
								{
									title: "Task Delegation",
									description: "Smart prioritization of AI models to give you the best results at the lowest cost",
									color: "bg-[#FFF9EB]",
									textColor: "text-[#FF9500]",
								},
							].map((item, index) => (
								<motion.div key={index} className="p-8 rounded-2xl bg-white shadow-sm border border-[#E5E5E5]" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)" }} viewport={{ once: true }}>
									<div className={`${item.color} p-3 rounded-full w-fit mb-4`}>
										<span className={`${item.textColor}`}>{index === 0 ? <Zap className="h-6 w-6" /> : index === 1 ? <Shield className="h-6 w-6" /> : <Network className="h-6 w-6" />}</span>
									</div>
									<h3 className="text-xl font-medium mb-3 text-[#1D1D1F]">{item.title}</h3>
									<p className="text-[#86868B]">{item.description}</p>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-24 bg-white">
					<div className="container mx-auto px-6 max-w-7xl">
						<div className="text-center max-w-2xl mx-auto">
							<h2 className="text-3xl md:text-4xl font-semibold mb-6 text-[#1D1D1F]">Ready to Transform Your Data Experience?</h2>
							<p className="text-xl mb-8 text-[#86868B]">Join businesses that are making smarter decisions with cleaner data and guided analysis.</p>
							<Button size="lg" variant="secondary" onClick={handleButtonClick} className="bg-[#0071E3] hover:bg-[#0077ED] rounded-full text-white px-8 py-6 text-base font-medium">
								Get Started with a Free Demo
							</Button>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
