const vscode = require('vscode');

const PARAMETER_VALUES = {
    'domain': ['GlobalWater', 'LocalWater', 'Terrain', 'Sky'],
    'cullMode': ['none', 'front', 'back'],
    'blendFunc': ['zero', 'one', 'srcAlpha', 'invSrcAlpha', 'destAlpha',
        'invDestAlpha', 'destColor', 'invDestColor', 'srcAlphaSat',
        'blendFactor', 'invBlendFactor'],
    'blendOp': ['add', 'subtract', 'revSubtract', 'min', 'max'],
    'filter': ['point', 'linear', 'anisotropic'],
    'depthFunc': ['less', 'lessEqual', 'equal', 'greaterEqual', 'greater', 'notEqual', 'always', 'never'],
    'cullMode': ['none', 'front', 'back'],
    'zWrite': ['true', 'false'],
    'zWriteEnable': ['true', 'false'],
    'depthClipEnable': ['true', 'false'],
    'scissorEnable': ['true', 'false'],
    'multiSampleEnable': ['true', 'false'],
    'antialiasedLineEnable': ['true', 'false'],
    'maxAnisotropy': ['1', '2', '4', '8', '16'],
    'mipLODBias': ['-3', '-2', '-1', '0', '1', '2', '3'],
    'maxLOD': ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
    'minLOD': ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
    'stencilOp': ['keep', 'zero', 'replace', 'incrSat', 'decrSat', 'invert', 'incr', 'decr'],
    'stencilFunc': ['less', 'lessEqual', 'equal', 'greaterEqual', 'greater', 'notEqual', 'always', 'never'],
    'fillMode': ['solid', 'wireframe'],
    'addressUV': ['clamp', 'wrap', 'mirror', 'border', 'mirrorOnce'],
    'texture': ['UserTexture', 'DepthTexture', 'RenderTarget']
};

// Определяет параметр в начале строки
function getLineStartParameter(lineText) {
    const match = lineText.match(/^\s*(\w+)(?:\[\d+\])?/);
    return match ? match[1] : null;
}

// Находит ближайший параметр перед курсором
function findNearestParameter(lineText, cursorPos) {
    const textBeforeCursor = lineText.substring(0, cursorPos);
    const match = textBeforeCursor.match(/(\w+)(?:\[\d+\])?\s+$/);
    return match ? match[1] : null;
}

// Находит диапазон текущего слова + индекс для текстур
function getCurrentValueRange(document, position, isTexture = false) {
    const line = document.lineAt(position.line);
    const lineText = line.text;
    const cursorPos = position.character;
    
    // Начало слова (до первого пробела перед курсором)
    let start = cursorPos;
    while (start > 0 && !/\s/.test(lineText[start - 1])) {
        start--;
    }
    
    // Конец слова
    let end = cursorPos;
    
    // Для текстур ищем до '[' или пробела
    if (isTexture) {
        while (end < lineText.length && !/\s/.test(lineText[end]) && lineText[end] !== '[') {
            end++;
        }
        // Если после слова есть '[число]', включаем его в диапазон
        if (end < lineText.length && lineText[end] === '[') {
            let bracketEnd = end + 1;
            while (bracketEnd < lineText.length && lineText[bracketEnd] !== ']') {
                bracketEnd++;
            }
            if (bracketEnd < lineText.length && lineText[bracketEnd] === ']') {
                end = bracketEnd + 1;
            }
        }
    } else {
        while (end < lineText.length && !/\s/.test(lineText[end])) {
            end++;
        }
    }
    
    return new vscode.Range(position.line, start, position.line, end);
}

// Извлекает индекс из текстурного значения
function extractTextureIndex(lineText, range) {
    const textInRange = lineText.substring(range.start.character, range.end.character);
    const match = textInRange.match(/\[(\d+)\]/);
    return match ? match[1] : null;
}

const completionProvider = vscode.languages.registerCompletionItemProvider(
    [{ language: 'myformat' }, { pattern: '**/*.template' }, { pattern: '**/*.mat' }],
    {
        provideCompletionItems(document, position) {
            const line = document.lineAt(position.line);
            const lineText = line.text;
            const cursorPos = position.character;
            
            console.log(`[MyFormat] Line: "${lineText}" | Cursor: ${cursorPos}`);
            
            // Определяем параметр
            let currentParam = getLineStartParameter(lineText);
            if (!currentParam) {
                currentParam = findNearestParameter(lineText, cursorPos);
            }
            
            console.log(`[MyFormat] Parameter: "${currentParam}"`);
            
            const completions = [];
            
            if (currentParam && PARAMETER_VALUES[currentParam]) {
                // Для текстур используем специальный диапазон
                const isTexture = currentParam === 'texture';
                const valueRange = getCurrentValueRange(document, position, isTexture);
                const currentValue = document.getText(valueRange);
                
                console.log(`[MyFormat] Value range: ${valueRange.start.character}-${valueRange.end.character}, value: "${currentValue}"`);
                
                // Для текстур: извлекаем индекс из текущего значения
                let textureIndex = null;
                if (isTexture) {
                    textureIndex = extractTextureIndex(lineText, valueRange);
                    console.log(`[MyFormat] Texture index: ${textureIndex}`);
                }
                
                const typedValue = currentValue.toLowerCase().replace(/\[\d+\]/, '');
                
                PARAMETER_VALUES[currentParam].forEach(value => {
/*                     if (typedValue && !value.toLowerCase().startsWith(typedValue)) {
                        return;
                    } */
                    
                    const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.Value);
                    
                    // Для текстур: добавляем индекс, если он был
                    if (isTexture) {
                        const displayText = textureIndex ? `${value}[${textureIndex}]` : value;
                        item.label = displayText;
                        item.insertText = displayText;
                        item.range = valueRange;
                    } else {
                        item.range = valueRange;
                    }
                    
                    // Документация
                    if (currentParam === 'texture') {
                        item.documentation = new vscode.MarkdownString(
                            `**${value}**\n\n` +
                            (value === 'UserTexture' ? 'Пользовательская текстура' :
                             value === 'DepthTexture' ? 'Текстура глубины' : 'Целевая текстура рендера')
                        );
                    }
                    
                    completions.push(item);
                });
            }
            
            // Предложение параметров
            if (!currentParam || lineText.trim() === '') {
                const parameters = ['domain', 'cullMode', 'blendFunc', 'texture',
                    'filter', 'addressUV', 'maxAnisotropy', 'mipLODBias',
                    'maxLOD', 'vertexShader', 'pixelShader', 'hullShader',
                    'domainShader', 'computeShader'];
                
                const valueRange = getCurrentValueRange(document, position);
                
                parameters.forEach(param => {
                    const item = new vscode.CompletionItem(param, vscode.CompletionItemKind.Property);
                    item.range = valueRange;
                    completions.push(item);
                });
            }
            
            console.log(`[MyFormat] Returning ${completions.length} completions`);
            return completions;
        }
    }
);

function activate(context) {
    console.log('MyFormat extension active');
    context.subscriptions.push(completionProvider);
}

function deactivate() {
    console.log('MyFormat extension deactivated');
}

module.exports = { activate, deactivate };