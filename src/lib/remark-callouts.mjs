// Turns Obsidian callouts into styled boxes:
//   > [!warning] Optional title
//   > Body text
export default function remarkCallouts() {
  return (tree) => walk(tree);
}

function walk(node) {
  if (node.type === 'blockquote') transform(node);
  for (const child of node.children ?? []) walk(child);
}

function transform(quote) {
  const first = quote.children?.[0];
  const text = first?.type === 'paragraph' ? first.children?.[0] : null;
  if (text?.type !== 'text') return;
  const m = text.value.match(/^\[!(\w+)\][+-]?[ \t]*([^\n]*)\n?/);
  if (!m) return;

  const type = m[1].toLowerCase();
  const title = m[2].trim() || type.charAt(0).toUpperCase() + type.slice(1);
  text.value = text.value.slice(m[0].length);
  if (!text.value) first.children.shift();
  if (first.children.length === 0) quote.children.shift();

  quote.data = { hName: 'aside', hProperties: { className: ['callout', `callout-${type}`] } };
  quote.children.unshift({
    type: 'paragraph',
    data: { hProperties: { className: ['callout-title'] } },
    children: [{ type: 'text', value: title }],
  });
}
