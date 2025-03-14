import React from "react";

import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col min-h-screen">
			<div className="flex h-16 items-center justify-between py-4 px-28 border-b sticky top-0 z-50 w-full bg-white">
				<div className="flex items-center gap-2">
					<Link href="/">
						<Image src="/images/tds1.png" alt="TheDataWorkspace" width={50} height={50} className="object-cover rounded" />
					</Link>
				</div>
				<div className="flex items-center gap-4">
					<Link href="/about" className="text-sm font-medium hover:text-primary">
						About
					</Link>
					<Link href="https://www.youtube.com/channel/UCrUeGsvs-MulA7JNveDjDBQ" target="_" className="text-sm font-medium hover:text-primary hidden md:block">
						Demo
					</Link>
					{/* <Link href="/demo" className="text-sm font-medium hover:text-primary hidden md:block">
						Sign In
					</Link> */}
				</div>
			</div>
			<div>{children}</div>
			<footer className="bg-muted pt-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8 p-12">
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
						<Link href="https://www.linkedin.com/in/naol-basaye/" target="_" className="text-muted-foreground hover:text-foreground">
							Contact Us
						</Link>
					</div>
				</div>
				<div className="border-t mt-8 py-2 text-sm text-center text-muted-foreground">
					<p>© {new Date().getFullYear()} TheDataWorkspace. All rights reserved.</p>
				</div>
			</footer>
		</div>
	);
}
