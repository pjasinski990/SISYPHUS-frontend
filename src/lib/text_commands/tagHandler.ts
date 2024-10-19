function handleTag(tag: string): void {
    console.log(`Tag detected: ${tag}`);
}

function getTagSuggestions(availableTags: string[], input: string): string[] {
    const tagInput = input.slice(1).toLowerCase(); // Remove '#' and lowercase
    return availableTags.filter(tag => tag.toLowerCase().startsWith(tagInput));
}
