# Miracle Engine Material Support for VS Code

Professional language support for material files used in graphics programming.

### 1. Full File Example
Shows syntax highlighting for a complete material file:

![Complete .myformat file example](./media/preview.png)

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

## Example

```myformat
// Miracle Material Template
(layer)
{
    domain              surface

    zEnable             true
    
    cullMode            none

    texture[0]          UserTexture[2]
    filter[0]           anisotropic

    blendFunc           srcAlpha invSrcAlpha

    vertexShader        vs_main ./Shaders/water.vs.hlsl
    pixelShader         ps_main ./Shaders/water.ps.hlsl
}