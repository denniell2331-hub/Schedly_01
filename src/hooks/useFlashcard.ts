import { useState } from 'react';

import type { FlashcardConfig } from '../components/FlashcardModal';

export function useFlashcard() {
  const [flashcard, setFlashcard] =
    useState<FlashcardConfig | null>(null);

  const showFlashcard = (
    config: FlashcardConfig
  ) => {
    setFlashcard(config);
  };

  const closeFlashcard = () => {
    setFlashcard(null);
  };

  return {
    flashcard,
    showFlashcard,
    closeFlashcard,
  };
}
