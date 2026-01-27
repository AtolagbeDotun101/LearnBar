import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRenderProps {
  content: any;
}

const MarkdownRender: React.FC<MarkdownRenderProps> = ({ content }) => {
  return (
    <div className='text-neutral-700'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className='text-xl font-bold mb-t mt-4' {...props} />,
          h2: ({ node, ...props }) => <h2 className='text-lg font-bold mb-2 mt-4' {...props} />,
          h3: ({ node, ...props }) => <h3 className='text-md font-bold mb-2' {...props} />,
          h4: ({ node, ...props }) => <h4 className='text-sm font-bold mb-1 mt-3' {...props} />,
          p: ({ node, ...props }) => <p className='mb-2 leading-relaxed' {...props} />,
          a: ({ node, ...props }) => <a className='text-[#00d492] hover:underline' {...props} />,
          ul: ({ node, ...props }) => <ul className='list-disc list-inside mb-2 ml-4' {...props} />,
          ol: ({ node, ...props }) => <ol className='list-decimal list-inside mb-2 ml-4' {...props} />,
          li: ({ node, ...props }) => <li className='mb-1' {...props} />,
          strong: ({ node, ...props }) => <strong className='font-bold' {...props} />,
          em: ({ node, ...props }) => <em className='italic' {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className='border-l-4 border-neutral-300 pl-4 italic text-neutral-600 my-4' {...props} />
          ),
          // ✅ Fixed: Proper code component with syntax highlighting
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={dracula}
                language={match[1]}
                preTag='div'
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className='bg-neutral-100 p-1 font-mono text-sm' {...props}>
                {children}
              </code>
            );
          },
          pre: ({ node, ...props }) => <pre className='bg-neutral-800 text-white p-3 rounded-md overflow-auto my-4 font-mono text-sm' {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRender;