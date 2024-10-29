"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return (
		<div>
			<div className="flex h-screen w-full items-center justify-center px-4">
				<Card className="mx-auto max-w-sm">
					<CardHeader>
						<CardTitle className="text-2xl">Something is up!</CardTitle>
						<CardDescription>Hmmm 🤔, Something seems off here. We will look into it. </CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4">
							<p>For now you can redirect to the home page, we will be looking into this one</p>
							<div className="flex justify-between">
								<Button onClick={() => window.location.replace("/")} className="mt-3 inline-block text-sm">
									Go to Home
								</Button>
								<Button
									onClick={
										// Attempt to recover by trying to re-render the segment
										() => reset()
									}
									className="mt-3 inline-block text-sm"
								>
									Try again
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
