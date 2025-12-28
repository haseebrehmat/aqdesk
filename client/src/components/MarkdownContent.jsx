import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./markdown.css";

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
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer noopener">{children}</a>
  ),
  h1: ({ children }) => <h2>{children}</h2>,
};

export default function MarkdownContent({ children, className = "" }) {
  return (
    <div className={`md-content ${className}`.trim()}>
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
