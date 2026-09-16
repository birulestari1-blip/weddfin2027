import React from 'react';
interface ErrorMessageProps {
    title?: string;
    message: string;
    onRetry?: () => void;
}
export declare const ErrorMessage: React.FC<ErrorMessageProps>;
export {};
