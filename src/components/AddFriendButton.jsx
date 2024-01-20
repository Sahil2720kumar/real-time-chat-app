"use client";
import Button from "./ui/Button";
import { addFriendValidator } from "@/lib/validators/add-friend";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

export default function AddFriendButton() {
    const [showSuccessState, setShowSuccessState] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors }
    } = useForm({
        resolvers: zodResolver(addFriendValidator)
    });

    const addFriend = async email => {
        try {
            const validatedEmail = addFriendValidator.parse({ email: email });
            console.log(validatedEmail);
            setIsLoading(true);
            await axios.post("/api/friends/add", {
                email: validatedEmail
            });

            setShowSuccessState(true);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            if (error instanceof z.ZodError) {
                setError("email", { message: error.issues[0].message });
                return;
            }

            if (error instanceof AxiosError) {
                setError("email", { message: error.response?.data });
                return;
            }
            setError("email", { message: "Something went wrong." });
        }
    };

    const onSubmit = data => {
        setShowSuccessState(false);
        addFriend(data.email);
    };
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm">
            <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
            >
                Add friend by E-Mail
            </label>

            <div className="mt-2 flex gap-4">
                <input
                    {...register("email")}
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="you@example.com"
                />
                <Button isLoading={isLoading} type="submit">
                    Add
                </Button>
            </div>
            <p className="mt-1 text-sm text-red-600">{errors.email?.message}</p>
            {showSuccessState ? (
                <p className="mt-1 text-sm text-green-600">
                    Friend request sent!
                </p>
            ) : null}
        </form>
    );
}
