"use client";
import logo from "@/assets/logo.png";
import resumePreview from "@/assets/resume-preview.jpg";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { handleClientScriptLoad } from "next/script";

export default function Home() {
  return (
    <main className="bg-gray-100 text-gray-900 flex min-h-screen flex-col items-center justify-center gap-6 px-5 py-12 text-center md:flex-row md:text-start lg:gap-12">
      <div className="max-w-prose md:pr-30">
        <Image
          src={logo}
          alt="Logo"
          width={250}
          height={150}
          className="mx-auto md:ms-0"
          onClick={() => {
            console.log("abc");
          }}
        />
        <h1 className="mb-24 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Find the{" "}
          <span className="t inline-block bg-gradient-to-r bg-clip-text text-[#2563EB]">
            Perfect Job
          </span>{" "}
          in Minutes
        </h1>
        <p className="text-gray-500 mb-24 text-lg">
          Our <span className="font-bold">JobStack</span> helps you build your
          resume, analyze your skills, and get AI-driven job recommendations —
          all in one platform.
        </p>
        <Button asChild className="bg-[#2563EB] px-24 py-12 text-lg">
          <Link href="/home">Get started</Link>
        </Button>
      </div>
      <div>
        <Image
          src="/frontpage.svg"
          alt="Resume preview"
          width={600}
          height={900}
          className="shadow-md lg:rotate-[1.5deg]"
        />
      </div>
    </main>
  );
}
