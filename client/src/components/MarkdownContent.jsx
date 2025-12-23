import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const allowedElements = [
  "a",
  "blockquote",
  "br",
  "code",
  "del",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "hr",
  "li",
  "ol",
  "p",
  "pre",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "ul",
];

const components = {
  h1: ({ children }) => <h2 className="text-xl font-semibold text-white mt-5 mb-2">{children}</h2>,
  h2: ({ children }) => <h2 className="text-lg font-semibold text-white mt-5 mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-semibold text-white mt-4 mb-2">{children}</h3>,
  h4: ({ children }) => <h4 className="text-sm font-semibold text-white mt-4 mb-2">{children}</h4>,
  p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="text-blue-400 underline decoration-blue-400/50 underline-offset-2 hover:text-blue-300"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-4 border-slate-600 pl-4 text-slate-400">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-6">{children}</ol>,
  code: ({ children, className }) => (
    <code className={`${className || ""} rounded bg-slate-950 px-1.5 py-0.5 font-mono text-[0.9em] text-cyan-200`}>
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="min-w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-slate-700 bg-slate-800 px-3 py-2 font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-slate-700 px-3 py-2">{children}</td>,
  hr: () => <hr className="my-5 border-slate-700" />,
};

export default function MarkdownContent({ children, className = "" }) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        allowedElements={allowedElements}
        skipHtml
        components={components}
      >
        {children || ""}
      </ReactMarkdown>
    </div>
  );
}
