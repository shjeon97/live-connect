import React from 'react';

interface AlertProps {
  type: 'success' | 'warning' | 'error';
  message: string;
}

const Alert: React.FC<AlertProps> = ({ type, message }) => {
  let alertClasses = '';

  if (type === 'success') {
    alertClasses = 'bg-green-200 text-green-800';
  } else if (type === 'warning') {
    alertClasses = 'bg-yellow-200 text-yellow-800';
  } else if (type === 'error') {
    alertClasses = 'bg-red-200 text-red-800';
  }

  return (
    <div className={`p-2 rounded-md ${alertClasses}`} role="alert">
      {message}
    </div>
  );
};

export default Alert;
