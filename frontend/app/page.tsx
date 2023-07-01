"use client";

import { useForm } from "react-hook-form";
import TextInput from "@/components/TextInput";
import Alert from "@/components/Alert";

interface FormData {
  roomName: string;
  userName: string;
}

export default function Home() {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({ mode: "onChange" });

  const onSubmit = (data: FormData) => {
    console.log(data); // Handle form submission data here
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full sm:w-10/12 md:w-8/12 lg:w-6/12 xl:w-4/12 mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <h1 className="text-2xl font-bold mb-4">Live Connect</h1>
            <TextInput
              label="Room Name"
              type="text"
              placeholder="Enter your room name"
              {...register("roomName", {
                required: "Room Name is required",
              })}
            />
            {errors.roomName && errors.roomName.message && (
              <Alert type="error" message={errors.roomName.message} />
            )}

            <TextInput
              label="User Name"
              type="text"
              placeholder="Enter your user name"
              {...register("userName", {
                required: "User Name is required",
              })}
            />
            {errors.userName && errors.userName.message && (
              <Alert type="error" message={errors.userName.message} />
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md mt-4"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
