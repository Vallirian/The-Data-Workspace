import Image from "next/image";
import Link from "next/link";
import { Mail, BrushIcon as Broom, Lightbulb, Zap, Users, Package, BarChart3, Upload, Wand2, Repeat2, HelpCircle, Route, CheckCircle, Leaf, Shield, PianoIcon as ChessPawn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Home() {
	return (
		<div className="flex flex-col min-h-screen">
			<div className="flex h-16 items-center justify-between py-4 px-28 border-b sticky top-0 z-50 w-full">
				<div className="flex items-center gap-2">
					<Link href="/">
						<Image src="/images/tds1.png" alt="TheDataWorkspace" width={50} height={50} className="object-cover rounded" />
					</Link>
				</div>
				<div className="flex items-center gap-4">
					<Link href="/about" className="text-sm font-medium hover:text-primary">
						About
					</Link>
					<Link href="/demo" className="text-sm font-medium hover:text-primary hidden md:block">
						Demo
					</Link>
					<Link href="/demo" className="text-sm font-medium hover:text-primary hidden md:block">
						Sign In
					</Link>
				</div>
			</div>

			<main className="flex-1">
				{/* Hero Section */}
				<section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30">
					<div className="grid gap-28 md:grid-cols-2 px-28">
						<div className="space-y-6 mx-auto max-w-xl">
							<h1 className="text-4xl md:text-5xl font-bold tracking-tight">Transform Your Business Data Without The Grunt Work</h1>
							<p className="text-xl text-muted-foreground">Make impactful business decisions with zero-code data cleaning and guided analysis designed for businesses</p>
							<div className="flex flex-col sm:flex-row gap-4">
								<Button size="lg" asChild>
									<Link href="/get-started">Get Started</Link>
								</Button>
								<Button size="lg" variant="outline" asChild>
									<Link href="#how-it-works">See How It Works</Link>
								</Button>
							</div>
						</div>

						<div className="grid gap-4 grid-cols-2 ml-auto max-w-xl">
							<div className="bg-primary/10 p-6 rounded-lg border border-primary/20 hover:border-primary/40 transition-all">
								<div className="flex items-center gap-4">
									<div className="bg-blue-100 p-3 rounded-full">
										<Broom className="h-6 w-6 text-blue-600" />
									</div>
									<h3 className="font-medium">Effortless Data Cleaning</h3>
								</div>
								<p className="mt-2 text-muted-foreground">Eliminate 70% of the repetitive work with our AI-powered cleaning engine</p>
							</div>
							<div className="bg-primary/10 p-6 rounded-lg border border-primary/20 hover:border-primary/40 transition-all">
								<div className="flex items-center gap-4">
									<div className="bg-green-100 p-3 rounded-full">
										<Lightbulb className="h-6 w-6 text-green-600" />
									</div>
									<h3 className="font-medium">Guided Insights</h3>
								</div>
								<p className="mt-2 text-muted-foreground">Follow our decision-focused analysis framework to extract meaningful business insights</p>
							</div>
							<div className="col-span-2 bg-primary/10 p-6 rounded-lg border border-primary/20 hover:border-primary/40 transition-all">
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

				{/* For eCommerce Businesses */}
				<section className="py-20 bg-white">
					<div className="container max-w-6xl mx-auto px-4">
						<div className="text-center mb-16">
							<h2 className="text-3xl md:text-4xl font-bold mb-4">Data-Driven Decisions Made Simple</h2>
							<p className="text-xl text-muted-foreground max-w-2xl mx-auto">Stop drowning in spreadsheets and start making informed decisions</p>
						</div>

						<div className="grid md:grid-cols-2 gap-12 items-center mb-16">
							<div className="mx-auto">
								<Image src="/placeholder.svg?height=400&width=500" alt="Dashboard visualization" width={500} height={400} className="rounded-lg shadow-lg" />
							</div>
							<div className="space-y-6 mx-auto max-w-xl">
								<h3 className="text-2xl font-bold">For eCommerce Businesses</h3>
								<p className="text-lg text-muted-foreground">Increase conversion rates, optimize inventory, and understand customer behavior</p>
								<p className="text-lg">Connect your store data and get actionable insights within minutes</p>
								<Button size="lg" variant="outline">
									Connect Your Store
								</Button>
							</div>
						</div>

						<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
								<p className="text-muted-foreground">Predict stock needs and prevent overstock or stockouts</p>
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
							<h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
						</div>

						<div className="space-y-20">
							{/* Data Cleaning */}
							<div>
								<h3 className="text-2xl font-bold text-center mb-10">Data Cleaning</h3>
								<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
									<div className="bg-blue-50 p-6 rounded-lg border border-blue-100 hover:shadow-md transition-all">
										<div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
											<Upload className="h-6 w-6 text-blue-600" />
										</div>
										<h4 className="text-xl font-medium mb-2">Connect Your Data</h4>
										<p className="text-muted-foreground">Upload spreadsheets or connect directly to your eCommerce platform</p>
									</div>
									<div className="bg-blue-50 p-6 rounded-lg border border-blue-100 hover:shadow-md transition-all">
										<div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
											<Wand2 className="h-6 w-6 text-blue-600" />
										</div>
										<h4 className="text-xl font-medium mb-2">Automated Cleaning</h4>
										<p className="text-muted-foreground">Our AI identifies and fixes inconsistencies, duplicates, and formatting issues</p>
									</div>
									<div className="bg-blue-50 p-6 rounded-lg border border-blue-100 hover:shadow-md transition-all">
										<div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
											<Repeat2 className="h-6 w-6 text-blue-600" />
										</div>
										<h4 className="text-xl font-medium mb-2">Create Repeatable Workflows</h4>
										<p className="text-muted-foreground">Save your cleaning process for future use and maintain data consistency</p>
									</div>
								</div>
								<div className="text-center mt-8">
									<Button size="lg">Clean Your First Dataset</Button>
								</div>
							</div>

							{/* Data Analysis */}
							<div>
								<h3 className="text-2xl font-bold text-center mb-10">Data Analysis</h3>
								<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
									<div className="bg-green-50 p-6 rounded-lg border border-green-100 hover:shadow-md transition-all">
										<div className="bg-green-100 p-3 rounded-full w-fit mb-4">
											<HelpCircle className="h-6 w-6 text-green-600" />
										</div>
										<h4 className="text-xl font-medium mb-2">Define Your Question</h4>
										<p className="text-muted-foreground">Tell us what business decision you need to make</p>
									</div>
									<div className="bg-green-50 p-6 rounded-lg border border-green-100 hover:shadow-md transition-all">
										<div className="bg-green-100 p-3 rounded-full w-fit mb-4">
											<Route className="h-6 w-6 text-green-600" />
										</div>
										<h4 className="text-xl font-medium mb-2">Follow Guided Analysis</h4>
										<p className="text-muted-foreground">Our platform suggests relevant analyses and visualizations</p>
									</div>
									<div className="bg-green-50 p-6 rounded-lg border border-green-100 hover:shadow-md transition-all">
										<div className="bg-green-100 p-3 rounded-full w-fit mb-4">
											<CheckCircle className="h-6 w-6 text-green-600" />
										</div>
										<h4 className="text-xl font-medium mb-2">Get Actionable Results</h4>
										<p className="text-muted-foreground">Receive clear, jargon-free recommendations you can implement</p>
									</div>
								</div>
								<div className="text-center mt-8">
									<Button size="lg">Start Your Analysis</Button>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Technical Edge */}
				<section className="py-20 bg-white">
					<div className="container max-w-6xl mx-auto px-4">
						<div className="text-center mb-16">
							<h2 className="text-3xl md:text-4xl font-bold mb-4">Why Our Technology Stands Apart</h2>
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
					<div className="container text-center">
						<h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Data Experience?</h2>
						<p className="text-xl mb-8 max-w-2xl mx-auto">Join businesses that are making smarter decisions with cleaner data and guided analysis.</p>
						<Button size="lg" variant="secondary" asChild>
							<Link href="/get-started">Get Started with a Free Demo</Link>
						</Button>
					</div>
				</section>
			</main>

			<footer className="bg-muted py-12">
				<div className="container">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div>
							<h3 className="font-bold text-lg mb-4">TheDataWorkspace</h3>
							<p className="text-muted-foreground">Making data analysis accessible for every business user.</p>
						</div>
						<div>
							<h3 className="font-bold text-lg mb-4">Pages</h3>
							<ul className="space-y-2">
								<li>
									<Link href="/" className="text-muted-foreground hover:text-foreground">
										Home
									</Link>
								</li>
								<li>
									<Link href="/about" className="text-muted-foreground hover:text-foreground">
										About Us
									</Link>
								</li>
								<li>
									<Link href="/features" className="text-muted-foreground hover:text-foreground">
										Features
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h3 className="font-bold text-lg mb-4">Legal</h3>
							<ul className="space-y-2">
								<li>
									<Link href="/privacy" className="text-muted-foreground hover:text-foreground">
										Privacy Policy
									</Link>
								</li>
								<li>
									<Link href="/terms" className="text-muted-foreground hover:text-foreground">
										Terms of Service
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h3 className="font-bold text-lg mb-4">Contact</h3>
							<Dialog>
								<DialogTrigger asChild>
									<Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-foreground">
										Contact Us
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Contact Us</DialogTitle>
										<DialogDescription>
											Reach out to our team at <span className="font-medium">support@thedataworkspace.com</span>
										</DialogDescription>
									</DialogHeader>
									<div className="flex items-center justify-center py-4">
										<Mail className="h-12 w-12 text-primary" />
									</div>
								</DialogContent>
							</Dialog>
						</div>
					</div>
					<div className="border-t mt-8 pt-8 text-center text-muted-foreground">
						<p>© {new Date().getFullYear()} TheDataWorkspace. All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
