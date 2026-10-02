# Miracle Engine Material Support for VS Code

Professional language support for material files used in graphics programming.

### 1. Full File Example
Shows syntax highlighting for a complete material file:

![Complete .myformat file example](https://raw.githubusercontent.com/Logris/material-vscode/main/media/preview.png)

## Features
- **Syntax Highlighting**: Full support for MyFormat syntax with DirectX/HLSL-inspired colors
- **IntelliSense**: Smart autocompletion for parameters, values, and texture types
- **Snippets**: Quick templates for common structures
- **File Support**: Works with `.template`, and `.mat` files

## Usage

1. Open any MyFormat file
2. Enjoy syntax highlighting and autocompletion
3. Use snippets by typing prefixes:
   - `texture` - Add texture parameter
   - `domain` - Set domain type
   - `shader` - Add shader reference
   - `block` - Create a new block
4. Format the document with `Shift+Alt+F` (or **Format Document**)

## Formatting

The extension registers a document formatter for Miracle material files (`.mat`, `.template`, `.fx`).
Press `Shift+Alt+F` (or run **Format Document** from the Command Palette) to format the current file.

The formatter:

- normalizes indentation to tabs according to `{ }` nesting;
- aligns parameter values into columns (values start 4 tabs from the block indentation);
- keeps annotations `<...>` and comments (`//`, `/* */`) untouched;
- removes trailing whitespace and indentation on blank lines.

Formatting is idempotent - running it twice produces the same result.