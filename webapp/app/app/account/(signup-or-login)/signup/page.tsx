"use client";

import { auth, googleProvider } from "@/services/firebase";
import { Button } from "@/components/ui/button";
import { EnvelopeOpenIcon } from "@radix-ui/react-icons";
import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation"; 

export default function Signup() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter(); 

    const handleLogin = () => {
        signInWithPopup(auth, googleProvider)
            .then((result) => {
                const credential =
                    GoogleAuthProvider.credentialFromResult(result);
                const token = credential ? credential.accessToken : null;

                // The signed-in user info.
                const user = result.user;
                setUser(user);

                router.push('/app/workbooks'); 
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                const email = error.customData.email;
                const credential =
                    GoogleAuthProvider.credentialFromError(error);
            });
    };

    return (
        <div className="flex min-h-screen">
            <div className="hidden w-1/2 bg-black text-white lg:block">
                <div className="flex h-full flex-col justify-between p-8">
                    <div className="flex items-center space-x-2">
                        {/* <div className="h-8 w-8 bg-white" /> */}
                        <div className="flex items-center space-x-2">
                            <img
                                src="/images/logo-1-white-png.png"
                                alt="Logo"
                                className="h-5 w-5"
                            />{" "}
                            {/* Adjust the path and size as needed */}
                            <span className="text-xl font-semibold">
                                Processly
                            </span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {/* <p className="text-2xl font-semibold">
                            "This library has saved me countless hours of work
                            and helped me deliver stunning designs to my clients
                            faster than ever before."
                        </p>
                        <p className="text-xl">Sofia Davis</p> */}
                    </div>
                </div>
            </div>

            <div className="flex w-full flex-col justify-between p-8 mb-12 lg:w-1/2">
                <div className="flex justify-end">
                    <Link
                        className="text-sm text-gray-600 hover:underline"
                        href="/account/login"
                        passHref
                    >
                        Log In
                    </Link>
                </div>
                <div className="mx-auto w-full max-w-md space-y-8">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold">Join today!</h1>
                        <p className="text-gray-500">
                            Continue with Google to sign up
                        </p>
                    </div>

                    <Button
                        className="w-full bg-black text-white hover:bg-gray-800"
                        variant="outline" onClick={handleLogin}
                    >
                        <EnvelopeOpenIcon className="mr-2 h-4 w-4" />
                        Google
                    </Button>
                </div>
                <p className="text-center text-sm text-gray-500">
                    By clicking continue, you agree to our{" "}
                    <Link
                        className="underline hover:text-gray-800"
                        href="https://www.processly.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                        className="underline hover:text-gray-800"
                        href="https://www.processly.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Privacy Policy
                    </Link>
                    .
                </p>
            </div>
        </div>
    )
}