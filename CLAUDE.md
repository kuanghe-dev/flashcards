# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Commits

Do not include `Co-Authored-By` trailers in commit messages.

## Project Overview

`flashcards` is a browser-based app for learning Chinese. It reads Chinese characters from `.txt` files in the `assets/` subdirectory and displays them one at a time in flashcard style.

## Repository Structure

- `index.html` — App shell; sidebar + main flashcard area
- `style.css` — All styles (dark theme, sidebar, flashcard layout)
- `flashcards.js` — All app logic
- `assets/` — UTF-8 text files containing Chinese characters; filenames are in Chinese

## Architecture

- Pure static HTML/JS/CSS — no build step, no framework, no server-side logic
- Must be served via an HTTP server (not `file://`) because it uses `fetch()` to:
  - Load the `assets/` directory listing to discover `.txt` files dynamically
  - Load the content of selected files
- File discovery uses a manifest file `assets/index.json` (fetched on load)

## UI Flow

1. On load, the sidebar lists all `.txt` files found in `assets/` (filenames URL-decoded, `.txt` stripped), followed by a **Custom Input** checkbox
2. User selects one or more files and/or checks **Custom Input**, then clicks **Start**
3. If **Custom Input** is checked, a textarea appears below it where the user can paste or type Chinese characters directly
4. All selected files are fetched; characters from files and custom input are combined, deduplicated, then shuffled
5. On touch-capable devices (phones, tablets), the sidebar is automatically collapsed when the session starts
6. Flashcards are shown one at a time in the main area

## Navigation Controls

- **Click** / **Arrow Down** / **Arrow Right** / **Scroll down** / **Swipe left** — next card
- **Arrow Up** / **Arrow Left** / **Scroll up** / **Swipe right** — previous card (history is tracked within a session)

## Data File Format

Asset files in `assets/` contain Chinese characters encoded in UTF-8:

```
# Test Character Set

天地人 你我他
一二三四五 上下
```

Comment lines starting in `#` will be ignored. Only CJK Unified Ideographs (`\u4e00–\u9fff`, `\u3400–\u4dbf`) are extracted; all other content is ignored.
