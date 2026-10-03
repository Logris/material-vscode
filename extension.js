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
    'texture': ['UserTexture', 'DepthTexture', 'RenderTarget'],
    'colorWriteMask': ['0', '1', '3', '7', '15']
};

const ANNOTATION_VALUES = {
        'widget': ['Slider', 'Color', 'ComboBox', 'EditBox'],
        'type' : ['Cubemap', "Array"]
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
    [{ language: 'miracle' }, { pattern: '**/*.template' }, { pattern: '**/*.mat' }, { pattern: '**/*.fx' }],
    {
        provideCompletionItems(document, position) {
            const line = document.lineAt(position.line);
            const lineText = line.text;
            const cursorPos = position.character;
            
            console.log(`[Miracle] Line: "${lineText}" | Cursor: ${cursorPos}`);
            
            // Определяем параметр
            let currentParam = getLineStartParameter(lineText);
            if (!currentParam) {
                currentParam = findNearestParameter(lineText, cursorPos);
            }
            
            console.log(`[Miracle] Parameter: "${currentParam}"`);
            
            const completions = [];
            
            if (currentParam && PARAMETER_VALUES[currentParam]) {
                // Для текстур используем специальный диапазон
                const isTexture = currentParam === 'texture';
                const valueRange = getCurrentValueRange(document, position, isTexture);
                const currentValue = document.getText(valueRange);
                
                console.log(`[Miracle] Value range: ${valueRange.start.character}-${valueRange.end.character}, value: "${currentValue}"`);
                
                // Для текстур: извлекаем индекс из текущего значения
                let textureIndex = null;
                if (isTexture) {
                    textureIndex = extractTextureIndex(lineText, valueRange);
                    console.log(`[Miracle] Texture index: ${textureIndex}`);
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

// ======================= ФОРМАТТЕР =======================

const TAB_SIZE = 4;                 // размер таба в пробелах
const MIN_VALUE_COLUMN = 16;        // минимальный отступ значений от начала уровня (4 таба)
const NON_PARAM_KEYWORDS = new Set(['namespace', 'Version', 'template', 'define']);

// Режимы выравнивания значений (настройка miracle.formatting.alignment)
const ALIGNMENT_BLOCK = 'block';    // по самому длинному имени в блоке
const ALIGNMENT_LINE = 'line';      // по каждому параметру отдельно
const ALIGNMENT_DEFAULT = ALIGNMENT_BLOCK;

// Считает фигурные скобки в строке, игнорируя содержимое строк "...",
// аннотаций <...> и комментариев //, /* */. Обновляет состояние state.
function scanBraces(line, state) {
    let leadingClosers = 0;
    let delta = 0;
    let countingLeading = true;

    for (let k = 0; k < line.length; k++) {
        const c = line[k];
        const d = line[k + 1];

        if (state.block) {
            if (c === '*' && d === '/') { state.block = false; k++; }
            continue;
        }
        if (state.line) { continue; }
        if (state.str) {
            if (c === '\\') { k++; continue; }
            if (c === '"') { state.str = false; }
            continue;
        }
        if (state.ann) {
            if (c === '>') { state.ann = false; }
            continue;
        }

        if (c === '/' && d === '/') { state.line = true; continue; }
        if (c === '/' && d === '*') { state.block = true; k++; continue; }
        if (c === '"') { state.str = true; continue; }
        if (c === '<') { state.ann = true; continue; }
        if (/\s/.test(c)) { continue; }

        if (countingLeading) {
            if (c === '}') { leadingClosers++; }
            else { countingLeading = false; }
        }
        if (c === '{') { delta++; }
        else if (c === '}') { delta--; }
    }

    state.line = false; // строчный комментарий заканчивается вместе со строкой
    state.str = false;  // строки и аннотации в этом формате однострочные
    state.ann = false;

    return { leadingClosers, delta };
}

// Возвращает строку табов для уровня вложенности
function indentFor(level) {
    return '\t'.repeat(Math.max(0, level));
}

// Разбивает правую часть параметра на единицы (значения, строки, группы,
// аннотации, комментарий), сохраняя содержимое групп дословно
function splitValueUnits(text) {
    const units = [];
    const n = text.length;
    let i = 0;

    while (i < n) {
        while (i < n && /\s/.test(text[i])) { i++; }
        if (i >= n) { break; }

        if (text[i] === '/' && (text[i + 1] === '/' || text[i + 1] === '*')) {
            units.push(text.slice(i).replace(/\s+$/, ''));
            break;
        }
        if (text[i] === '"') {
            let j = i + 1;
            while (j < n && text[j] !== '"') { if (text[j] === '\\') { j++; } j++; }
            units.push(text.slice(i, Math.min(j + 1, n)));
            i = Math.min(j + 1, n);
            continue;
        }
        if (text[i] === '(') {
            let depth = 0;
            let j = i;
            while (j < n) {
                if (text[j] === '(') { depth++; }
                else if (text[j] === ')') { depth--; if (depth === 0) { j++; break; } }
                j++;
            }
            units.push(text.slice(i, j));
            i = j;
            continue;
        }
        if (text[i] === '<') {
            let j = i + 1;
            while (j < n && text[j] !== '>') { j++; }
            units.push(text.slice(i, Math.min(j + 1, n)));
            i = Math.min(j + 1, n);
            continue;
        }

        let j = i;
        while (j < n && !/\s/.test(text[j]) && text[j] !== '"' && text[j] !== '(' && text[j] !== '<') {
            if (text[j] === '/' && text[j + 1] === '/') { break; }
            j++;
        }
        if (j === i) { j++; }
        units.push(text.slice(i, j));
        i = j;
    }

    return units;
}

// Формирует отступ (табы, затем пробелы), выравнивающий текст в колонку targetCol
function paddingToColumn(currentCol, targetCol) {
    if (targetCol <= currentCol) { return ' '; }
    let col = currentCol;
    let pad = '';
    // Следующая позиция таб-стопа от текущей колонки
    let nextStop = col % TAB_SIZE === 0 ? col + TAB_SIZE : col + (TAB_SIZE - (col % TAB_SIZE));
    // Пока таб не перескакивает цель - используем табы
    while (nextStop <= targetCol) {
        pad += '\t';
        col = nextStop;
        nextStop = col % TAB_SIZE === 0 ? col + TAB_SIZE : col + (TAB_SIZE - (col % TAB_SIZE));
    }
    // Остаток добиваем пробелами (например, для длинных имён параметров)
    if (col < targetCol) { pad += ' '.repeat(targetCol - col); }
    return pad;
}

function activate(context) {
    console.log('MyFormat extension active');
    context.subscriptions.push(completionProvider, formattingProvider);
}

const PARAM_LINE_RE = /^([A-Za-z_][A-Za-z0-9_]*(?:\[\d+\])?)(\s+)(\S[\s\S]*)$/;

// Разбирает строку как параметр (имя + правая часть) либо возвращает null
function parseParamLine(content) {
    if (/^[{(<]/.test(content)) { return null; }
    if (/^\/[/*]/.test(content)) { return null; }
    const m = content.match(PARAM_LINE_RE);
    if (!m) { return null; }
    if (NON_PARAM_KEYWORDS.has(m[1])) { return null; }
    if (m[3][0] === '<') { return null; } // аннотация перед значением - не трогаем
    return { name: m[1], rest: m[3] };
}

// Первый проход: разбирает документ на строки и считает максимальную длину
// имени параметра в каждом блоке (для режима выравнивания по блоку)
function analyzeDocument(text) {
    const lines = text.split(/\r\n|\r|\n/);
    const state = { str: false, ann: false, line: false, block: false };
    const parsed = [];
    const blockMaxName = new Map();
    const blockStack = [0];
    let blockCounter = 0;
    let depth = 0;

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const blockAtStart = state.block;
        const braces = scanBraces(raw, state);

        let level = depth - braces.leadingClosers;
        if (level < 0) { level = 0; }

        const item = {
            kind: blockAtStart ? 'blockcomment' : 'blank',
            trimmed: raw.replace(/\s+$/, ''),
            content: '',
            level,
            name: '',
            rest: '',
            blockId: blockStack[blockStack.length - 1]
        };

        if (!blockAtStart) {
            const content = item.trimmed.replace(/^\s+/, '');
            if (content !== '') {
                item.content = content;
                const param = parseParamLine(content);
                if (param) {
                    item.kind = 'param';
                    item.name = param.name;
                    item.rest = param.rest;
                    const currentMax = blockMaxName.get(item.blockId) || 0;
                    if (item.name.length > currentMax) {
                        blockMaxName.set(item.blockId, item.name.length);
                    }
                } else {
                    item.kind = 'code';
                }
            }
        }

        parsed.push(item);

        for (let k = 0; k < braces.delta; k++) {
            blockCounter++;
            blockStack.push(blockCounter);
        }
        for (let k = 0; k > braces.delta; k--) {
            if (blockStack.length > 1) { blockStack.pop(); }
        }

        depth += braces.delta;
    }

    return { parsed, blockMaxName };
}

// Второй проход: формирует строку вывода с учётом режима выравнивания
function renderLine(item, mode, blockMaxName) {
    if (item.kind === 'blockcomment') { return item.trimmed; }
    if (item.kind === 'blank') { return ''; }

    if (item.kind === 'param') {
        const indentCol = item.level * TAB_SIZE;
        const nameEndCol = indentCol + item.name.length;

        let targetCol;
        if (mode === ALIGNMENT_BLOCK) {
            const maxLen = blockMaxName.get(item.blockId) || item.name.length;
            targetCol = indentCol + Math.max(MIN_VALUE_COLUMN, maxLen + 1);
        } else {
            targetCol = Math.max(indentCol + MIN_VALUE_COLUMN, nameEndCol + 1);
        }

        const units = splitValueUnits(item.rest);
        return indentFor(item.level) + item.name + paddingToColumn(nameEndCol, targetCol) + units.join(' ');
    }

    return indentFor(item.level) + item.content;
}

// Полное форматирование текста документа
function formatText(text, eol, mode) {
    const eolChar = eol === '\r\n' ? '\r\n' : '\n';
    const alignment = mode === ALIGNMENT_LINE ? ALIGNMENT_LINE : ALIGNMENT_BLOCK;
    const { parsed, blockMaxName } = analyzeDocument(text);
    return parsed.map(item => renderLine(item, alignment, blockMaxName)).join(eolChar);
}

// Формирует правки форматирования для документа
function formatDocument(document) {
    const eol = document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';
    const mode = vscode.workspace
        .getConfiguration('miracle.formatting')
        .get('alignment', ALIGNMENT_DEFAULT);
    const original = document.getText();
    const formatted = formatText(original, eol, mode);
    if (formatted === original) { return []; }
    const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(original.length));
    return [vscode.TextEdit.replace(fullRange, formatted)];
}

const formattingProvider = vscode.languages.registerDocumentFormattingEditProvider(
    [{ language: 'miracle' }, { pattern: '**/*.mat' }, { pattern: '**/*.template' }, { pattern: '**/*.fx' }],
    {
        provideDocumentFormattingEdits(document) {
            return formatDocument(document);
        }
    }
);

function deactivate() {
    console.log('MyFormat extension deactivated');
}

module.exports = { activate, deactivate, formatText, formatDocument };