import React from 'react';
interface EmptyStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}
export declare const EmptyState: React.FC<EmptyStateProps>;
export {};
