# Content Directory

This folder contains all learning content for the Edo Japan Study App. The backend reads these JSON files and serves them through the API.

## Schemas

### `flashcards.json`

```json
{
  "cards": [
    {
      "id": "unique-id",
      "category": "Category Name",
      "front": "Question text",
      "back": "Answer text (can be multi-line)",
      "difficulty": "core | important | detail"
    }
  ]
}
```

### `quiz_questions.json`

```json
{
  "questions": [
    {
      "id": "mc-unique-id",
      "type": "multiple_choice",
      "category": "Category Name",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "Why this is the correct answer",
      "difficulty": "core | important | detail"
    },
    {
      "id": "sa-unique-id",
      "type": "short_answer",
      "category": "Category Name",
      "question": "Question text",
      "expected_answer": "Full expected answer",
      "keywords": ["keyword1", "keyword2"],
      "explanation": "Detailed explanation",
      "difficulty": "core | important | detail"
    }
  ]
}
```

### `explain_prompts.json`

```json
{
  "prompts": [
    {
      "id": "unique-id",
      "category": "Category Name",
      "prompt": "Open-ended question",
      "rubric": [
        "Key point 1 the answer should cover",
        "Key point 2",
        "Key point 3"
      ],
      "difficulty": "core | important | detail"
    }
  ]
}
```

## Categories

Use these category names consistently across all content files:

- `Unification` — Three shoguns, unification process
- `Social Structure` — Emperor, Shogun, Daimyo, samurai, merchants, eta/hinin
- `Government` — Two levels of government, Bakufu
- `Cities & Economy` — Major Edo period cities
- `Popular Culture` — Geishas, kabuki, woodblock prints, bunraku
- `Isolation` — Reasons for isolation, Closed Country Edict 1635
- `Foreign Contact` — Dutch trade, Dejima, Portuguese contact
- `Geography` — Four islands, major cities, map facts

## Difficulty Levels

- `core` — Must-know for the exam
- `important` — Should know, frequently tested
- `detail` — Nice to know, less likely on exam

## Adding Content

1. Edit the appropriate JSON file
2. Follow the schema above exactly
3. Use a unique `id` (convention: `category-prefix-number`)
4. Assign a category from the list above
5. Restart the backend (or it will reload automatically in dev mode)
