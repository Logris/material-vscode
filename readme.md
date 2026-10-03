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
- removes trailing whitespace and indentation on blank lines;
- keeps annotations `<...>` and comments (`//`, `/* */`) untouched.

Formatting is idempotent - running it twice produces the same result.

### Value alignment

Parameter values are aligned into a column. The mode is controlled by the
`miracle.formatting.alignment` setting:

- `block` (default) - simple parameters (value without `{ }`) are aligned to the column of the
  **longest simple parameter name inside the block**; parameters whose value contains `{ }` are
  excluded from the block column and aligned individually (same as `line`);
- `line` - each parameter is aligned independently.

In both modes the column is at least 4 tabs from the block indentation, and padding uses tabs
plus spaces when a single tab is not enough to reach the column.