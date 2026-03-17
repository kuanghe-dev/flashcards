# Flashcards

A web application that displays Chinese characters as flashcards.

**Live app: https://kuanghe-dev.github.io/flashcards/**

## Features

- Select one or more character sets from the sidebar, then click **Start**
- Check **Custom Input** to paste or type your own Chinese characters directly
- Characters are deduplicated and shuffled across all selected sets and custom input
- Clean dark theme, works on desktop and mobile (iOS/Android)

## Navigation

| Action | Result |
|---|---|
| Click / Tap | Next card |
| Arrow Down / Right | Next card |
| Scroll down | Next card |
| Swipe left | Next card |
| Arrow Up / Left | Previous card |
| Scroll up | Previous card |
| Swipe right | Previous card |

## Adding Character Sets

Add a UTF-8 `.txt` file to the `assets/` directory containing Chinese characters, then update `assets/index.json` to include the filename. Comment lines starting in `#` will be ignored. Non-CJK characters in the file are also ignored — you can freely include notes, pinyin, or whitespace.

Example file content:
```
# Test Character Set

天地人 你我他
一二三四五 上下
```

Only CJK Unified Ideographs (`\u4e00–\u9fff`, `\u3400–\u4dbf`) are extracted.

## Running Locally

The app must be served over HTTP (not opened as a `file://` URL) because it uses `fetch()` to load assets. Any static file server works:

```bash
python3 -m http.server
```

Then open http://localhost:8000.

## Tech Stack

Pure HTML/CSS/JS — no build step, no framework, no dependencies.

## Credits

- App icon by [Icon Desai - Flaticon](https://www.flaticon.com/free-icons/chinese-language)
