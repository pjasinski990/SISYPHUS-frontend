import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkAdmonition from 'src/lib/remarkAdmonition';

interface MarkdownRendererProps {
    content: string;
}

const components: Components = {
    div: ({ node, className, ...props }) => {
        if (className && className.includes('admonition')) {
            const typeMatch = className.match(/admonition (\w+)/);
            const type = typeMatch ? typeMatch[1] : '';
            return (
                <div className={`admonition ${type}`}>
                    <strong>
                        {getEmojiForType(type)} {type.toUpperCase()}
                    </strong>
                    <div>{props.children}</div>
                </div>
            );
        }
        return <div className={className} {...props} />;
    },
};

const getEmojiForType = (type: string): string => {
    switch (type) {
        case 'warning':
            return '⚠️';
        case 'info':
            return 'ℹ️';
        case 'tip':
            return '💡';
        case 'caution':
            return '⚠️';
        case 'note':
            return '📝';
        case 'danger':
            return '🔥';
        case 'success':
            return '✅';
        default:
            return '';
    }
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => (
    <ReactMarkdown
        className="prose dark:prose-invert p-2"
        remarkPlugins={[remarkGfm, remarkAdmonition]}
        components={components}
    >
        {content}
    </ReactMarkdown>
);

export default MarkdownRenderer;
