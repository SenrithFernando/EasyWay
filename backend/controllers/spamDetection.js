const REPEATED_CHARACTER_PATTERN = /^(.)\1{4,}$/;
const LETTER_OR_NUMBER_PATTERN = /[A-Za-z0-9]/;

const isRepeatedCharactersOnly = (value) => REPEATED_CHARACTER_PATTERN.test(value);

const isSymbolsOrWhitespaceOnly = (value) => !LETTER_OR_NUMBER_PATTERN.test(value);

const detectSpamComment = (comment) => {
  const normalizedComment = String(comment || '').trim();

  if (!normalizedComment) {
    return {
      isSpam: true,
      reason: 'Comment is required.',
    };
  }

  if (isRepeatedCharactersOnly(normalizedComment)) {
    return {
      isSpam: true,
      reason: 'Comment cannot contain only repeated characters.',
    };
  }

  if (isSymbolsOrWhitespaceOnly(normalizedComment)) {
    return {
      isSpam: true,
      reason: 'Comment must contain meaningful letters or numbers.',
    };
  }

  return {
    isSpam: false,
    reason: null,
  };
};

export { detectSpamComment, isRepeatedCharactersOnly, isSymbolsOrWhitespaceOnly };
