"use client";

import { useForm } from "react-hook-form";
import TextInput from "@/components/TextInput";
import Alert from "@/components/Alert";
import { socket } from "@/api/socket-io";

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
    console.log(data);

    console.log(socket);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full sm:w-10/12 md:w-8/12 lg:w-6/12 xl:w-4/12 mx-auto">
        <h1 className="text-2xl font-bold  ">Live Connect</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <TextInput
              label="Room Name"
              type="text"
              placeholder="Enter your room name"
              {...register("roomName", {
                required: "Room Name is required",
                pattern: /^\S+$/,
              })}
            />
            {errors.roomName &&
              errors.roomName.message &&
              errors.roomName.type === "required" && (
                <Alert type="error" message={errors.roomName.message} />
              )}
            {errors.roomName && errors.roomName.type === "pattern" && (
              <Alert
                type="error"
                message="Room Name should not contain spaces"
              />
            )}

            <TextInput
              label="User Name"
              type="text"
              placeholder="Enter your user name"
              {...register("userName", {
                required: "User Name is required",
                pattern: /^\S+$/,
              })}
            />
            {errors.userName &&
              errors.userName.message &&
              errors.userName.type === "required" && (
                <Alert type="error" message={errors.userName.message} />
              )}
            {errors.userName && errors.userName.type === "pattern" && (
              <Alert
                type="error"
                message="User Name should not contain spaces"
              />
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md mt-4"
          >
            Enter the room
          </button>
        </form>
      </div>
    </div>
  );
}
