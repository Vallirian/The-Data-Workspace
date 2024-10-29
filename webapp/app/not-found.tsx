import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
	return (
		<div>
			<div className="flex h-screen w-full items-center justify-center px-4">
				<Card className="mx-auto max-w-sm">
					<CardHeader>
						<CardTitle className="text-2xl">Going Somewhere?</CardTitle>
						<CardDescription>Hmmm 🤔, we couldn&apos;t find the page you were looking for.</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4">
							<p>For now you can redirect to the home page, we'll be looking into this one</p>
							<div className="flex justify-center">
								<Link href="/app/workbooks" className="mt-3 inline-block text-sm underline">
									Workbooks
								</Link>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
