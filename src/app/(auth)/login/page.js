"use client";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function Login() {
    const [loading, setLoading] = useState(false);
    const googleSignIn = async e => {
        try {
            setLoading(true);
            e.preventDefault();
            await signIn("google", {
                callbackUrl: "/dashboard",
                redirect: true
            });
            toast.success("Login successfull.");
        } catch (error) {
            console.log(error);
            setLoading(false);
            toast.error("Something went wrong with your login.");
        }
    };
    return (
        <div className="flex items-center justify-center h-screen">
            <Button isLoading={loading} onClick={googleSignIn}>
                {loading ? null : (
                    <Image
                        className="w-6 h-6"
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        loading="lazy"
                        alt="google logo"
                        width={6}
                        height={6}
                    />
                )}
                <span className="ml-2">Login with Google</span>
            </Button>
        </div>
    );
}
