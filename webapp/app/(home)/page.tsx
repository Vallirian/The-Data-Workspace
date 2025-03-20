"use client";

import Link from "next/link";
import { BrushIcon as Broom, Lightbulb, Zap, Wand2, Shield, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";
import { useState, useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

const timelineEvents = [
	{
		title: "Connect",
		description: "Clean and preprocess your data with one click.",
		details: "Our platform's user-friendly interface makes it simple to upload spreadsheets or connect to your systems with our continuously expanding integrations. By centralizing all your data in one place, you ensure that you're always analyzing the most accurate and up-to-date information, so you can make confident decisions and avoid the headaches associated with scattered or inconsistent datasets.",
		icon: <Wand2 className="h-5 w-5" />,
	},
	{
		title: "Automated Cleaning",
		description: "Our advanced algorithms handle the grunt work for you.",
		details: "By employing sophisticated machine learning methods, our automated cleaning process identifies and corrects inconsistencies, duplicates, and formatting issues. This not only saves you valuable time but also ensures that you're working with trustworthy data, empowering you to focus on strategic analysis rather than manual clean-up tasks.",
		icon: <Broom className="h-5 w-5" />,
	},
	{
		title: "Set Your Goal",
		description: "Tell us what business decision you need to make.",
		details: "Rather than sifting through endless columns and tables of raw information, simply define your key business objective—from forecasting sales to optimizing marketing campaigns. By articulating your goal upfront, the platform can tailor its analysis to surface the insights most relevant to your needs, eliminating unnecessary noise and boosting your decision-making process.",
		icon: <Lightbulb className="h-5 w-5" />,
	},
	{
		title: "AI-Powered Analysis",
		description: "Let our AI guide you through the analysis process.",
		details: "Our system leverages top-tier Large Language Models to break down complex datasets into clear, meaningful insights. With guided suggestions and real-time feedback, you can uncover hidden correlations, predict future outcomes, and craft targeted strategies, all while significantly reducing the time and expertise required for thorough analysis.",
		icon: <Zap className="h-5 w-5" />,
	},
	{
		title: "Get Results",
		description: "Receive clear, actionable insights you can implement immediately.",
		details: "Once your analysis is complete, our platform delivers concise, straightforward summaries that highlight the key findings and recommendations. By translating technical data points into practical advice, you gain instant clarity on the steps you need to take, enabling you to quickly execute improvements, optimize performance, and achieve your desired outcomes.",
		icon: <TrendingUp className="h-5 w-5" />,
	},
];

export default function Home() {
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
		<div className="flex flex-col min-h-screen bg-white">
			<main className="flex-1">
				{/* Hero Section */}
				<section className="py-28 md:py-36">
					<div className="container mx-auto px-6 max-w-6xl">
						<div className="flex flex-col items-center text-center mb-20">
							<h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-[#111111] max-w-4xl leading-tight">
								Transform Your Business Data Without <span className="text-[#D70015]">The Grunt Work</span>
							</h1>
							<p className="mt-8 text-xl text-[#555555] max-w-2xl leading-relaxed">Make impactful business decisions with zero-code data cleaning and guided analysis designed for businesses</p>
							<div className="flex flex-col sm:flex-row gap-6 mt-12">
								<Button size="lg" className="bg-[#0071E3] hover:bg-[#0077ED] text-white px-8 py-6 text-base font-bold shadow-sm transition-all duration-200 rounded-lg">
									<Link href="/workspaces" className="text-sm font-bold">
										Try with Demo Data
									</Link>
								</Button>
								<Button size="lg" variant="outline" asChild className="border-none bg-blue-200 text-blue-700 hover:bg-blue-400 hover:text-blue-800 font-bold px-8 py-6 text-base transition-all duration-200 rounded-lg">
									<Link href="#how-it-works">See How It Works</Link>
								</Button>
							</div>
						</div>
					</div>
				</section>

				{/* Technical Edge - Moved up as requested */}
				<section className="py-28 bg-[#FAFAFA]">
					<div className="container mx-auto px-6 max-w-6xl">
						<div className="text-center mb-20">
							<h2 className="text-3xl md:text-4xl font-semibold text-[#111111]">Why Our Technology Stands Apart</h2>
						</div>

						<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
							{[
								{
									title: "Resource Efficiency",
									description: "Our proprietary algorithms reduce AI token consumption by up to 80%",
									color: "bg-[#F8F5FF]",
									textColor: "text-[#AF52DE]",
									icon: <Zap className="h-6 w-6" />,
								},
								{
									title: "Data Security",
									description: "Minimized data exposure with our targeted processing approach",
									color: "bg-[#F5FFF7]",
									textColor: "text-[#34C759]",
									icon: <Shield className="h-6 w-6" />,
								},
								{
									title: "Task Delegation",
									description: "Smart prioritization of AI models to give you the best results at the lowest cost",
									color: "bg-[#FFFAF0]",
									textColor: "text-[#FF9500]",
									icon: <Network className="h-6 w-6" />,
								},
							].map((item, index) => (
								<div key={index} className="p-10 rounded-lg bg-white border border-[#EEEEEE] shadow-sm transition-all duration-300">
									<motion.div
										whileHover={{
											y: -4,
											scale: 1.02,
											boxShadow: "0 0 0 rgba(255, 255, 255, 0)",
											transition: { duration: 0.3, ease: "easeOut" },
										}}
									>
										<div className={`${item.color} p-4 rounded-full w-fit mb-6`}>
											<span className={`${item.textColor}`}>{item.icon}</span>
										</div>
										<h3 className="text-xl font-medium mb-4 text-[#111111]">{item.title}</h3>
										<p className="text-[#555555] leading-relaxed">{item.description}</p>
									</motion.div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* How It Works */}
				<section ref={containerRef} className="py-28 bg-white overflow-hidden" id="how-it-works">
					<div className="container mx-auto px-6 max-w-6xl">
						<motion.div className="text-center mb-20" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} viewport={{ once: true, margin: "-100px" }}>
							<h2 className="text-3xl md:text-4xl font-semibold text-[#111111]">How It Works</h2>
							<p className="mt-5 text-lg text-[#555555] max-w-2xl mx-auto">Preprocess and analyze your data without writing a single line of code</p>
						</motion.div>

						<div className="max-w-3xl mx-auto">
							{timelineEvents.map((event, index) => (
								<motion.div key={index} className="mb-20 last:mb-0" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true, amount: 0.3 }}>
									<div className="flex gap-8">
										<div className="flex-shrink-0">
											<div className="flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-sm border border-[#EEEEEE]">
												<span className="text-[#111111]">{event.icon}</span>
											</div>
										</div>
										<div>
											<h3 className="text-xl font-medium mb-3 text-[#111111]">{event.title}</h3>
											<p className="text-[#555555] mb-3 leading-relaxed">{event.description}</p>
											<Link
												href="#"
												onClick={(e) => {
													e.preventDefault();
													setExpandedEvent(expandedEvent === index ? null : index);
												}}
												className="text-[#0071E3] hover:text-[#0077ED] font-medium text-sm inline-flex items-center"
											>
												{expandedEvent === index ? "Show less" : "Learn more"} →
											</Link>

											<motion.div
												initial={{ height: 0, opacity: 0 }}
												animate={{
													height: expandedEvent === index ? "auto" : 0,
													opacity: expandedEvent === index ? 1 : 0,
												}}
												transition={{ duration: 0.3 }}
												className="overflow-hidden mt-3"
											>
												<p className="pt-2 text-sm text-[#666666] pl-0 leading-relaxed">{event.details}</p>
											</motion.div>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-28 bg-[#FAFAFA]">
					<div className="container mx-auto px-6 max-w-6xl">
						<div className="text-center max-w-2xl mx-auto">
							<h2 className="text-3xl md:text-4xl font-semibold mb-8 text-[#111111]">Ready to Transform Your Data Experience?</h2>
							<p className="text-xl mb-10 text-[#555555] leading-relaxed">Join businesses that are making smarter decisions with cleaner data and guided analysis.</p>
							<Link href="#" onClick={handleButtonClick} className="inline-flex items-center text-[#0071E3] hover:text-[#0077ED] font-medium text-lg">
								Get Started with a Free Demo →
							</Link>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
