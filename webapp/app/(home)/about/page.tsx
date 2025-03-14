import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
	return (
		<section className="min-h-screen grid lg:grid-cols-2 gap-8 lg:gap-12 items-center px-4 lg:px-12 py-8 lg:py-0">
			<div className="flex-col">
				<div className="flex-col mb-6 lg:mb-12">
					<h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold tracking-tight">Data Shouldn't Be This Hard</h1>
				</div>
				<div className="text-sm sm:text-base mb-6 lg:mb-9">
					Make impactful business decisions with zero-code data cleaning
					<br className="hidden sm:block" /> and guided analysis designed for businesses{" "}
				</div>
			</div>
			<div className="flex-col justify-center space-y-6 lg:space-y-8">
				<div>
					<p className="text-lg font-bold mb-2">Who am I</p>
					<p className="text-sm sm:text-base">I'm a data scientist and business analyst (with seasoned data professional advisors) who has spent countless hours helping companies make sense of their data. I've worked extensively with data cleaning, analysis, dashboards, Machine Learning models, and now building data-driven products.</p>
				</div>
				<div>
					<p className="text-lg font-bold mb-2">Why I started The Data Workspace</p>
					<p className="text-sm sm:text-base">Every business has immense potential value locked in its data. However, cleaning data requires technical skills, and asking the right questions demands both business and technical expertise.</p>
					<p className="text-sm sm:text-base">Most business analysis work isn't directly related to decision-making—it's preprocessing like cleaning, organizing, and exploration. As a business analysis professional, I wanted a tool to handle this less creative process—the grunt work. The Data Workspace is that tool.</p>
				</div>
				<div>
					<p className="text-lg font-bold mb-2">The Mission</p>
					<p className="text-sm sm:text-base">My mission is to democratize data analysis so anyone can make data-driven, impactful decisions without technical barriers.</p>
				</div>
			</div>
		</section>
	);
}
