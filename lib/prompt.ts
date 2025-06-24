import nlp from 'compromise';

/**
 * Analyzes the input text for meaningful content.
 * @param text - The user input text.
 * @returns boolean - Whether the text is likely to produce a good image.
 */
export function isValidPrompt(text: string): boolean {
  if (text.length < 10) return false;

  // Use NLP to analyze the text structure
  const doc = nlp(text);

  // Check if there are enough meaningful words
  const nouns = doc.nouns().out('array').length;
  const verbs = doc.verbs().out('array').length;
  const adjectives = doc.adjectives().out('array').length;

  // Define a basic threshold: at least one noun and one verb or adjective
  if (nouns >= 1 && (verbs >= 1 || adjectives >= 1)) {
    return true;
  } else {
    return false;
  }
}
