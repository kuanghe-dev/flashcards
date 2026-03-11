# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`flash-cards` is a browser-based app for learning Chinese. It reads Chinese characters from `.txt` files in the `assets/` subdirectory and displays them one at a time in flash card style.

## Repository Structure

- `index.html` — App shell; sidebar + main flash card area
- `style.css` — All styles (dark theme, sidebar, flash card layout)
- `flashcards.js` — All app logic
- `assets/` — UTF-8 text files containing Chinese characters; filenames are in Chinese

## Architecture

- Pure static HTML/JS/CSS — no build step, no framework, no server-side logic
- Must be served via an HTTP server (not `file://`) because it uses `fetch()` to:
  - Load the `assets/` directory listing to discover `.txt` files dynamically
  - Load the content of selected files
- No manifest file — file discovery relies on parsing directory listing HTML for `href` attributes ending in `.txt`

## UI Flow

1. On load, the sidebar lists all `.txt` files found in `assets/` (filenames URL-decoded, `.txt` stripped)
2. User selects one or more files via checkboxes, then clicks **Start**
3. All selected files are fetched, Chinese characters are extracted and deduplicated, then shuffled
4. Flash cards are shown one at a time in the main area

## Navigation Controls

- **Click** / **Space** / **PageDown** — next card
- **PageUp** — previous card (history is tracked within a session)

## Data File Format

Asset files in `assets/` contain Chinese characters encoded in UTF-8:

```
天地人你我他
一二三四五上下
```

Only CJK Unified Ideographs (`\u4e00–\u9fff`, `\u3400–\u4dbf`) are extracted; all other content is ignored.
