import React, { forwardRef } from "react";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const TextInput: React.FC<TextInputProps> = forwardRef(function TextInput(
  { label, ...rest },
  ref: React.Ref<HTMLInputElement>
) {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 dark:text-gray-300">{label}</label>
      <input
        ref={ref}
        className="border border-gray-300 px-4 py-2 rounded-md w-full focus:outline-none focus:ring focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
        {...rest}
      />
    </div>
  );
});

TextInput.displayName = "TextInput";

export default TextInput;
