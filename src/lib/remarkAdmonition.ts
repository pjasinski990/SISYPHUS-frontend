import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { Parent } from 'mdast';

const remarkAdmonition: Plugin = () => {
    return tree => {
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

            textNode.value = content;

            if (!node.data) node.data = {};
            node.data.hName = 'div';
            node.data.hProperties = {
                className: `admonition ${type}`,
            };
        });
    };
};

export default remarkAdmonition;
