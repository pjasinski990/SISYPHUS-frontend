import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { Paragraph, Parent, Text } from 'mdast';

const remarkAdmonition: Plugin = () => {
    return (tree) => {
        visit(tree, 'blockquote', (node: Parent) => {
            if (!node.children || node.children.length === 0) return;

            const firstChild = node.children[0];
            if (firstChild.type !== 'paragraph') return;

            const textNode = firstChild.children[0];
            if (textNode.type !== 'text') return;

            const match = textNode.value.match(/^\[!(\w+)\]\s*(.*)/);
            if (!match) return;

            const type = match[1].toLowerCase();
            const content = match[2];

            // Modify the first paragraph to remove the admonition syntax
            textNode.value = content;

            // Transform blockquote to div.admonition
            if (!node.data) node.data = {};
            node.data.hName = 'div'; // Removed the non-null assertion
            node.data.hProperties = {
                className: `admonition ${type}`,
            };
        });
    };
};

export default remarkAdmonition;
