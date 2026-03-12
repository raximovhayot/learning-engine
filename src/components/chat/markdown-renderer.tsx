"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState, type ComponentPropsWithoutRef } from "react";

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2 py-1 rounded transition-colors cursor-pointer"
      style={{
        color: copied ? "var(--success)" : "var(--text-muted)",
        background: "transparent",
        border: "none",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.color = copied
          ? "var(--success)"
          : "var(--text-secondary)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.color = copied
          ? "var(--success)"
          : "var(--text-muted)")
      }
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

type CodeProps = ComponentPropsWithoutRef<"code"> & {
  inline?: boolean;
};

function CodeBlock({ inline, className, children, ...props }: CodeProps) {
  const match = /language-(\w+)/.exec(className || "");
  const code = String(children).replace(/\n$/, "");

  if (!inline && match) {
    return (
      <div className="code-block-wrapper">
        <div className="code-block-header">
          <span className="code-block-lang">{match[1]}</span>
          <CopyButton code={code} />
        </div>
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          customStyle={{
            margin: 0,
            borderRadius: "0 0 8px 8px",
            fontSize: "0.85rem",
            padding: "1rem",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  }

  if (!inline && code.includes("\n")) {
    return (
      <div className="code-block-wrapper">
        <div className="code-block-header">
          <span className="code-block-lang">text</span>
          <CopyButton code={code} />
        </div>
        <SyntaxHighlighter
          style={oneDark}
          language="text"
          PreTag="div"
          customStyle={{
            margin: 0,
            borderRadius: "0 0 8px 8px",
            fontSize: "0.85rem",
            padding: "1rem",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code className="inline-code" {...props}>
      {children}
    </code>
  );
}

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code: CodeBlock as never,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="markdown-link"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
