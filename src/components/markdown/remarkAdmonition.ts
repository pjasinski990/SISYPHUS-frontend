import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { Paragraph, Parent, Text } from 'mdast';

const remarkAdmonition: Plugin = () => {
    return tree => {
        visit(tree, 'blockquote', (node: Parent) => {
            const paragraph = node.children?.[0] as Paragraph;
            if (paragraph && paragraph.type === 'paragraph') {
                const textNode = paragraph.children[0] as Text;
                if (textNode && textNode.type === 'text') {
                    const match = textNode.value.match(/^\[!(\w+)\]\s*(.*)/);
                    if (match) {
                        const type = match[1].toLowerCase();
                        const content = match[2];

                        if (!node.data) node.data = {};
                        node.data.hName! = 'div';
                        node.data.hProperties = {
                            className: `admonition ${type}`,
                        };

                        textNode.value = content;
                    }
                }
            }
        });
    };
};

export default remarkAdmonition;
