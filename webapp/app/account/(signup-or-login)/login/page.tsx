"use client";

import { Suspense } from "react";
import { auth, googleProvider } from "@/services/firebase";
import { Button } from "@/components/ui/button";
import { EnvelopeOpenIcon } from "@radix-ui/react-icons";
import { signInWithPopup } from "firebase/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import Image from "next/image";

function Login() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const handleLogin = () => {
        signInWithPopup(auth, googleProvider)
            .then(() => {
                // Check if there's a redirect path
                const redirectPath = searchParams.get("redirect") || "/";
                router.push(redirectPath);
            })
            .catch((error) => {
                const errorMessage = error.message;
                toast({
                    variant: "destructive",
                    title: "Error signing in",
                    description: errorMessage,
                });
            });
    };

    return (
        <div className="flex min-h-screen">
            <Toaster />
            <div className="hidden w-1/2 bg-zinc-50 lg:block">
                <div className="flex h-full flex-col justify-between p-8">
                    <div className="flex items-center space-x-2">
                        {/* <div className="flex items-center space-x-2">
                            <Image
                                src="/images/logo-1-black-png.png"
                                alt="Logo"
                                width={24}
                                height={24}
                            />
                            <span className="text-xl font-semibold">Processly</span>
                        </div> */}
                    </div>
                    <div className="space-y-4">
                        <p className="text-2xl font-semibold">Zero data exposure analytics - powered by AI</p>
                    </div>
                </div>
            </div>

            <div className="flex w-full flex-col justify-between p-8 mb-12 lg:w-1/2">
                <div className="flex justify-end">
                    <Link className="text-sm text-gray-600 hover:underline" href="/account/signup" passHref>
                        Sign Up
                    </Link>
                </div>
                <div className="mx-auto w-full max-w-md space-y-8">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold">Welcome back!</h1>
                        <p className="text-gray-500">Continue with Google to log in</p>
                    </div>

                    <Button className="w-full bg-black text-white hover:bg-gray-800" variant="outline" onClick={handleLogin}>
                        <EnvelopeOpenIcon className="mr-2 h-4 w-4" />
                        Google
                    </Button>
                </div>
                <p className="text-center text-sm text-gray-500">
                    By clicking continue, you agree to our{" "}
                    <Link className="underline hover:text-gray-800" href="https://www.processly.ai" target="_blank" rel="noopener noreferrer">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link className="underline hover:text-gray-800" href="https://www.processly.ai" target="_blank" rel="noopener noreferrer">
                        Privacy Policy
                    </Link>
                    .
                </p>
            </div>
        </div>
    );
}

export default function LoginPageWrapper() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Login />
        </Suspense>
    );
}