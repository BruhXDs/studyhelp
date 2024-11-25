export function splitTextIntoFragments(text: string): string[] {
  if (!text) return [];

  // Split text into sentences first
  const sentences = text
    .replace(/([.!?])\s+/g, '$1|')
    .split('|')
    .filter(sentence => sentence.trim());

  const fragments: string[] = [];

  sentences.forEach(sentence => {
    // Split sentence into words
    const words = sentence.trim().split(/\s+/);

    let currentFragment = '';
    let wordCount = 0;

    words.forEach((word, index) => {
      const isLastWord = index === words.length - 1;
      const hasEndPunctuation = /[.!?,;:]$/.test(word);
      const isConnector = /^(and|or|but|if|the|a|an)$/i.test(word);
      const nextWordIsConnector = words[index + 1] && /^(and|or|but|if|the|a|an)$/i.test(words[index + 1]);

      // Add word to current fragment
      if (currentFragment) {
        currentFragment += ' ' + word;
      } else {
        currentFragment = word;
      }
      wordCount++;

      // Conditions to create a new fragment
      const shouldSplit = (
        hasEndPunctuation || // Split on punctuation
        isLastWord || // Split at end of sentence
        wordCount >= 2 || // Split after 2 words
        (wordCount === 1 && !isConnector && !nextWordIsConnector) // Split single significant words
      );

      if (shouldSplit) {
        if (currentFragment) {
          fragments.push(currentFragment.trim());
        }
        currentFragment = '';
        wordCount = 0;
      }
    });

    // Add any remaining fragment
    if (currentFragment) {
      fragments.push(currentFragment.trim());
    }
  });

  // Post-process fragments to combine very short ones with next fragment
  const mergedFragments: string[] = [];
  for (let i = 0; i < fragments.length; i++) {
    const current = fragments[i];
    const next = fragments[i + 1];

    if (current.length <= 3 && next) { // If current fragment is very short
      mergedFragments.push(`${current} ${next}`);
      i++; // Skip next fragment since we merged it
    } else {
      mergedFragments.push(current);
    }
  }

  return mergedFragments;
}