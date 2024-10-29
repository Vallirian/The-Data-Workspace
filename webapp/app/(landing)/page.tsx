import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
    return (
        <div className="min-h-screen">
            <div className="">
                {/* Header */}
                <header className="py-4 px-6 rounded-full mx-4 mb-10">
                    <div className="container mx-auto flex justify-between items-center">
                        <a href="#" className="hover:text-gray-300">
                            <div className="flex items-center space-x-2">
                                <img
                                    src="/images/logo-1-orange.png"
                                    alt="Processly logo"
                                    className="h-6 w-6"
                                />
                                {/* <span className="font-bold text-xl">Processly</span> */}
                            </div>
                        </a>
                        <nav className="hidden md:flex space-x-6"></nav>
                        <div>
                            <a href="#" className="hover:text-gray-300">
                                About
                            </a>
                            <Button
                                variant="link"
                                className="bg-white text-black hover:bg-gray-100"
                            >
                                Login
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="container mx-auto px-4 text-center">
                    <h2 className="text-sm tracking-wide my-4">
                        Unlock Your Superpower
                    </h2>
                    <h1 className="text-5xl md:text-5xl font-bold mb-6 leading-tight">
                        Zero-exposure, AI-powered analysis tool{" "}
                    </h1>
                    <h1 className="text-5xl md:text-5xl text-muted-foreground font-bold mb-6 leading-tight">
                        for the data analyst{" "}
                    </h1>

                    {/* <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Gain insights multiple times faster with AI without
                        exposing your data to AI models. Build and share
                        dashboards with your team. All in one place.
                    </p> */}
                    <Button size="lg" className="rounded-full px-8">
                        + Upload Data
                    </Button>

                    {/* Dashboard Preview */}
                    <style jsx>{`
                        .shadow-custom {
                            box-shadow: 0 -6px 12px rgba(0, 0, 0, 0.1);
                        }
                    `}</style>

                    <div
                        className="mt-16 bg-white rounded-t-2xl overflow-hidden shadow-custom"
                        style={{ height: "300px" }}
                    >
                        <Image
                            src="/placeholder.svg?height=400&width=800"
                            width={800}
                            height={400}
                            alt="Processly Preview"
                            className="w-full h-auto"
                        />
                    </div>
                </section>
            </div>

            {/* Team Cards Section */}
            <section className="container mx-auto px-4 py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Mike Card */}
                    <div className="bg-gray-100 rounded-3xl overflow-hidden">
                        <Image
                            src="/placeholder.svg?height=300&width=300"
                            width={300}
                            height={300}
                            alt="Mike"
                            className="w-full h-64 object-cover"
                        />
                        <div className="p-4 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">Mike</h3>
                                <p className="text-sm text-gray-600">
                                    Frontend Dev
                                </p>
                            </div>
                            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
                                +
                            </div>
                        </div>
                    </div>

                    {/* Quick and adaptable Card */}
                    <div className="bg-green-100 rounded-3xl p-6">
                        <h3 className="text-2xl font-bold mb-4">
                            Quick and adaptable
                        </h3>
                        <p>
                            Hire within a mere 72 hours. Easily adjust your team
                            size from month to month as required.
                        </p>
                    </div>

                    {/* Latisha Card */}
                    <div className="bg-gray-100 rounded-3xl overflow-hidden">
                        <Image
                            src="/placeholder.svg?height=300&width=300"
                            width={300}
                            height={300}
                            alt="Latisha"
                            className="w-full h-64 object-cover"
                        />
                        <div className="p-4 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">Latisha</h3>
                                <p className="text-sm text-gray-600">
                                    Mobile Dev
                                </p>
                            </div>
                            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
                                +
                            </div>
                        </div>
                    </div>

                    {/* Remote Talent Pool Card */}
                    <div className="bg-purple-100 rounded-3xl p-6 md:col-span-2">
                        <h3 className="text-2xl font-bold mb-4">
                            Remote Talent Pool
                        </h3>
                        <p>
                            Pre-vetted remote developers, designers, and product
                            managers with world-class technical and
                            communication skills
                        </p>
                    </div>

                    {/* Asger Card */}
                    <div className="bg-gray-100 rounded-3xl overflow-hidden">
                        <Image
                            src="/placeholder.svg?height=300&width=300"
                            width={300}
                            height={300}
                            alt="Asger"
                            className="w-full h-64 object-cover"
                        />
                        <div className="p-4 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">Asger</h3>
                                <p className="text-sm text-gray-600">
                                    UI/UX Designer
                                </p>
                            </div>
                            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
                                +
                            </div>
                        </div>
                    </div>

                    {/* Rest assured Card */}
                    <div className="bg-orange-100 rounded-3xl p-6">
                        <h3 className="text-2xl font-bold mb-4">
                            Rest assured, there are no crazy fees or legal
                            hassle to worry about.
                        </h3>
                    </div>
                </div>
            </section>
        </div>
    );
}
