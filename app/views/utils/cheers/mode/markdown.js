import CodeMirror from 'codemirror';

/* eslint no-cond-assign: 0 */

CodeMirror.defineMode('markdown', (cmCfg, modeCfg) => {
  const htmlMode = CodeMirror.getMode(cmCfg, 'text/html');
  const htmlModeMissing = htmlMode.name === 'null';

  function getMode(name) {
    let current = name;
    if (CodeMirror.findModeByName) {
      const found = CodeMirror.findModeByName(current);
      if (found) {
        current = found.mime || found.mimes[0];
      }
    }
    const mode = CodeMirror.getMode(cmCfg, current);
    return mode.name === 'null' ? null : mode;
  }

  // Should characters that affect highlighting be highlighted separate?
  // Does not include characters that will be output (such as `1.` and `-` for lists)
  if (modeCfg.highlightFormatting === undefined) {
    modeCfg.highlightFormatting = false;
  }

  // Maximum number of nested blockquotes. Set to 0 for infinite nesting.
  // Excess `>` will emit `error` token.
  if (modeCfg.maxBlockquoteDepth === undefined) {
    modeCfg.maxBlockquoteDepth = 0;
  }

  // Turn on task lists? ("- [ ] " and "- [x] ")
  if (modeCfg.taskLists === undefined) {
    modeCfg.taskLists = false;
  }

  // Turn on strikethrough syntax
  if (modeCfg.strikethrough === undefined) {
    modeCfg.strikethrough = false;
  }

  if (modeCfg.emoji === undefined) {
    modeCfg.emoji = false;
  }

  if (modeCfg.fencedCodeBlockHighlighting === undefined) {
    modeCfg.fencedCodeBlockHighlighting = true;
  }

  if (modeCfg.xml === undefined) {
    modeCfg.xml = true;
  }

  // Allow token types to be overridden by user-provided token types.
  if (modeCfg.tokenTypeOverrides === undefined) {
    modeCfg.tokenTypeOverrides = {};
  }

  const tokenTypes = {
    header: 'header',
    headerHash: 'header-hash',
    headerTitle: 'header-title',
    inlineCode: 'inline-code',
    code: 'comment',
    codeBG: 'line-background-cheers-codeblock-bg',
    inlineLatex: 'inline-latex',
    latex: 'block-latex',
    quote: 'quote',
    list1: 'variable-2',
    list2: 'variable-3',
    list3: 'keyword',
    hr: 'hr',
    image: 'image',
    imageAltText: 'image-alt-text',
    imageMarker: 'image-marker',
    formatting: 'formatting',
    linkInline: 'link',
    linkEmail: 'link',
    linkText: 'link',
    linkHref: 'string',
    em: 'em',
    strong: 'strong',
    strikethrough: 'strikethrough',
    emoji: 'builtin',
  };

  for (const tokenType in tokenTypes) {
    if (Object.prototype.hasOwnProperty.call(tokenTypes, tokenType) && modeCfg.tokenTypeOverrides[tokenType]) {
      tokenTypes[tokenType] = modeCfg.tokenTypeOverrides[tokenType];
    }
  }

  const hrRE = /^([*\-_])(?:\s*\1){2,}\s*$/;
  const listRE = /^(?:[*\-+]|^[0-9]+([.)]))\s+/;
  const taskListRE = /^\[(x| )\](?=\s)/i; // Must follow listRE
  const atxHeaderRE = modeCfg.allowAtxHeaderWithoutSpace ? /^(#+)/ : /^(#+)(?: |$)/;
  // const atxHeaderRE = /^(#+)(?: |$) +/;
  const atxLatexRE = /^(\$+)\s*$/;
  const setextHeaderRE = /^ *(?:={1,}|-{1,})\s*$/;
  const textRE = /^[^#![\]*_\\<>` "'(~:$|]+/;
  const fencedCodeRE = /^(~~~+|```+)[ \t]*([\w+#-]*)[^\n`]*$/;
  const linkDefRE = /^\s*\[[^\]]+?\]:.*$/; // naive link-definition
  const tableRE = /^\s*\|[^|]+\|.+\|\s*$/; // Table
  const punctuation = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|};~\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E42\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC9\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDF3C-\uDF3E]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]/;
  const expandedTab = '    '; // CommonMark specifies tab as 4 spaces

  const linkRE = {
    ')': /^(?:[^\\()]|\\.|\((?:[^\\()]|\\.)*\))*?(?=\))/,
    ']': /^(?:[^\\[\]]|\\.|\[(?:[^\\[\]]|\\.)*\])*?(?=\])/,
  };

  function isLineEnd(stream) {
    return stream.string.length === stream.pos;
  }

  // switch mode
  function switchMode(state, mode) {
    state.localMode = modeCfg.fencedCodeBlockHighlighting && getMode(mode);
    if (state.localMode) {
      state.localState = CodeMirror.startState(state.localMode);
    }
  }

  function switchInline(stream, state, f) {
    state.f = f;
    state.inline = f;
    return f(stream, state);
  }

  function switchBlock(stream, state, f) {
    state.f = f;
    state.block = f;
    return f(stream, state);
  }

  function lineIsEmpty(line) {
    return !line || !/\S/.test(line.string);
  }

  // Inline
  function getType(state) {
    const styles = [];

    if (state.formatting) {
      styles.push(tokenTypes.formatting);

      if (typeof state.formatting === 'string') {
        state.formatting = [state.formatting];
      }

      for (let i = 0; i < state.formatting.length; i++) {
        styles.push(`${tokenTypes.formatting}-${state.formatting[i]}`);

        if (state.formatting[i] === 'header') {
          styles.push(`${tokenTypes.formatting}-${state.formatting[i]}-${state.header}`);
        }

        // Add `formatting-quote` and `formatting-quote-#` for blockquotes
        // Add `error` instead if the maximum blockquote nesting depth is passed
        if (state.formatting[i] === 'quote') {
          if (!modeCfg.maxBlockquoteDepth || modeCfg.maxBlockquoteDepth >= state.quote) {
            styles.push(`${tokenTypes.formatting}-${state.formatting[i]}-${state.quote}`);
          } else {
            styles.push('error');
          }
        }
      }
    }

    if (state.taskOpen) {
      styles.push('meta');
      return styles.length ? styles.join(' ') : null;
    }
    if (state.taskClosed) {
      styles.push('property');
      return styles.length ? styles.join(' ') : null;
    }

    if (state.linkHref) {
      styles.push(tokenTypes.linkHref, 'url');
    } else { // Only apply inline styles to non-url text
      if (state.strong) {
        styles.push(tokenTypes.strong);
      }
      if (state.em) {
        styles.push(tokenTypes.em);
      }
      if (state.strikethrough) {
        styles.push(tokenTypes.strikethrough);
      }
      if (state.emoji) {
        styles.push(tokenTypes.emoji);
      }
      if (state.linkText) {
        styles.push(tokenTypes.linkText);
      }
      if (state.latex) {
        if (state.inlineLatex) {
          styles.push(tokenTypes.inlineLatex);
        } else {
          styles.push(tokenTypes.latex);
        }
      }
      if (state.code) {
        // debugger;
        if (state.inlineCode) {
          styles.push(tokenTypes.inlineCode);
        } else if (state.codeBegin) {
          styles.push(tokenTypes.code, tokenTypes.codeBG, 'line-background-cheers-codeblock-begin-bg line-cheers-codeblock');
        } else if (state.codeEnd) {
          styles.push(tokenTypes.code, tokenTypes.codeBG, 'line-background-cheers-codeblock-end-bg line-cheers-codeblock');
        }
      }
      if (state.image) {
        styles.push(tokenTypes.image);
      }
      if (state.imageAltText) {
        styles.push(tokenTypes.imageAltText, 'link');
      }
      if (state.imageMarker) {
        styles.push(tokenTypes.imageMarker);
      }
    }

    if (state.header) {
      let type = tokenTypes.headerTitle;
      if (!state.headerHash) {
        type = tokenTypes.headerHash;
        state.headerHash = true;
        state.thisLine.headerHash = true;
      } else {
        type = tokenTypes.headerTitle;
      }

      styles.push(tokenTypes.header, `${tokenTypes.header}-${state.header}`, type, 'line-header');
    }

    if (state.quote) {
      styles.push(tokenTypes.quote);

      // Add `quote-#` where the maximum for `#` is modeCfg.maxBlockquoteDepth
      if (!modeCfg.maxBlockquoteDepth || modeCfg.maxBlockquoteDepth >= state.quote) {
        styles.push(`${tokenTypes.quote}-${state.quote}`);
      } else {
        styles.push(`${tokenTypes.quote}-${modeCfg.maxBlockquoteDepth}`);
      }
    }

    if (state.list !== false) {
      const listMod = (state.listStack.length - 1) % 3;
      if (!listMod) {
        styles.push(tokenTypes.list1);
      } else if (listMod === 1) {
        styles.push(tokenTypes.list2);
      } else {
        styles.push(tokenTypes.list3);
      }
    }

    if (state.trailingSpaceNewLine) {
      styles.push('trailing-space-new-line');
    } else if (state.trailingSpace) {
      styles.push(`trailing-space-${(state.trailingSpace % 2 ? 'a' : 'b')}`);
    }

    return styles.length ? styles.join(' ') : null;
  }

  function getLinkHrefInside(endChar) {
    return (stream, state) => {
      const ch = stream.next();

      if (ch === endChar) {
        state.f = inlineNormal; // eslint-disable-line
        state.inline = inlineNormal; // eslint-disable-line
        if (modeCfg.highlightFormatting) {
          state.formatting = 'link-string';
        }
        const returnState = getType(state);
        state.linkHref = false;
        return returnState;
      }

      stream.match(linkRE[endChar]);
      state.linkHref = true;
      return getType(state);
    };
  }

  function linkHref(stream, state) {
    // Check if space, and return NULL if so (to avoid marking the space)
    if (stream.eatSpace()) {
      return null;
    }
    const ch = stream.next();
    if (ch === '(' || ch === '[') {
      const func = getLinkHrefInside(ch === '(' ? ')' : ']');
      state.f = func;
      state.inline = func;
      if (modeCfg.highlightFormatting) state.formatting = 'link-string';
      state.linkHref = true;
      return getType(state);
    }
    return 'error';
  }

  function inlineNormal(stream, state) {
    const style = state.text(stream, state); // handleText
    if (typeof style !== 'undefined') {
      return style;
    }

    if (state.list) { // List marker (*, +, -, 1., etc)
      state.list = null;
      return getType(state);
    }

    if (state.taskList) {
      const taskOpen = stream.match(taskListRE, true)[1] === ' ';
      if (taskOpen) {
        state.taskOpen = true;
      } else {
        state.taskClosed = true;
      }
      if (modeCfg.highlightFormatting) {
        state.formatting = 'task';
      }
      state.taskList = false;
      return getType(state);
    }

    state.taskOpen = false;
    state.taskClosed = false;

    if (state.header && stream.match(/^#+$/, true)) {
      if (modeCfg.highlightFormatting) state.formatting = 'header';
      return getType(state);
    }

    const ch = stream.next();

    // Matches link titles present on next line
    if (state.linkTitle) {
      state.linkTitle = false;
      let matchCh = ch;
      if (ch === '(') {
        matchCh = ')';
      }
      matchCh = (`${matchCh}`).replace(/([.?*+^[\]\\(){}|-])/g, '\\$1');
      const regex = `^\\s*(?:[^${matchCh}\\\\]+|\\\\\\\\|\\\\.)${matchCh}`;
      if (stream.match(new RegExp(regex), true)) {
        return tokenTypes.linkHref;
      }
    }

    // If this block is changed, it may need to be updated in GFM mode
    if (ch === '`') {
      const previousFormatting = state.formatting;
      // if (modeCfg.highlightFormatting) {
      //   state.formatting = 'code';
      // }
      stream.eatWhile('`');
      const count = stream.current().length;
      if (state.code === 0 && (!state.quote || count === 1)) {
        state.code = count;
        state.inlineCode = true;
        const type = getType(state);
        return type;
      } else if (count === state.code) { // Must be exact
        state.inlineCode = true;
        const type = getType(state);
        state.code = 0;
        state.inlineCode = false;
        return type;
      }
      state.formatting = previousFormatting;
      return getType(state);
    } else if (state.code) {
      state.inlineCode = true;
      const type = getType(state);
      return type;
    }

    if (ch === '$' && stream.eatWhile(ch)) {
      if (state.latex === 0 && !state.quote) {
        state.formatting = 'inline-latex';
        state.latex = 1;
        state.inlineLatex = true;
        const types = getType(state);
        return types;
      } else if (state.inlineLatex) { // Remove inline Latex
        state.formatting = 'inline-latex';
        const inlineLatex = getType(state);
        state.inlineLatex = false;
        state.latex = 0;
        return inlineLatex;
      } else if (stream.match(/^[^\s]/, false)) { // Add inline latex
        state.latex = 1;
        state.inlineLatex = true;
        state.formatting = 'inline-latex';
        const types = getType(state);
        state.inlineLatex = false;
        return types;
      }
    }

    if (ch === '\\') {
      stream.next();
      if (modeCfg.highlightFormatting) {
        const type = getType(state);
        const formattingEscape = `${tokenTypes.formatting}-escape`;
        return type ? `${type} ${formattingEscape}` : formattingEscape;
      }
    }

    if (ch === '!' && stream.match(/\[[^\]]*\] ?(?:\(|\[)/, false)) {
      state.imageMarker = true;
      state.image = true;
      if (modeCfg.highlightFormatting) state.formatting = 'image';
      return getType(state);
    }

    if (ch === '[' && state.imageMarker && stream.match(/[^\]]*\](\(.*?\)| ?\[.*?\])/, false)) {
      state.imageMarker = false;
      state.imageAltText = true;
      if (modeCfg.highlightFormatting) state.formatting = 'image';
      return getType(state);
    }

    if (ch === ']' && state.imageAltText) {
      if (modeCfg.highlightFormatting) state.formatting = 'image';
      const type = getType(state);
      state.imageAltText = false;
      state.image = false;
      state.inline = linkHref;
      state.f = linkHref;
      return type;
    }

    if (ch === '[' && !state.image) {
      if (state.linkText && stream.match(/^.*?\]/)) {
        return getType(state);
      }
      state.linkText = true;
      if (modeCfg.highlightFormatting) state.formatting = 'link';
      return getType(state);
    }

    if (ch === ']' && state.linkText) {
      if (modeCfg.highlightFormatting) state.formatting = 'link';
      const type = getType(state);
      state.linkText = false;
      const func = stream.match(/\(.*?\)| ?\[.*?\]/, false) ? linkHref : inlineNormal;
      state.inline = func;
      state.f = func;
      return type;
    }

    if (ch === '<' && stream.match(/^(https?|ftps?):\/\/(?:[^\\>]|\\.)+>/, false)) {
      state.f = linkInline; // eslint-disable-line
      state.inline = linkInline; // eslint-disable-line
      if (modeCfg.highlightFormatting) state.formatting = 'link';
      let type = getType(state);
      if (type) {
        type += ' ';
      } else {
        type = '';
      }
      return type + tokenTypes.linkInline;
    }

    if (ch === '<' && stream.match(/^[^> \\]+@(?:[^\\>]|\\.)+>/, false)) {
      state.f = linkInline; // eslint-disable-line
      state.inline = linkInline; // eslint-disable-line
      if (modeCfg.highlightFormatting) {
        state.formatting = 'link';
      }
      let type = getType(state);
      if (type) {
        type += ' ';
      } else {
        type = '';
      }
      return type + tokenTypes.linkEmail;
    }

    if (ch === '|' && tableRE.test(stream.string)) {
      stream.pos = stream.start + 1;
      let istable = true;
      let rowStyles;
      let isEnd = false;

      let nextLine = stream.lookAhead(1);
      if (tableRE.test(nextLine)) {
        nextLine = nextLine.replace(/^\s*\|/, '').replace(/\|\s*$/, '');
      } else {
        if (state.table) {
          isEnd = true;
        }
        istable = false;
      }

      if (istable) {
        rowStyles = nextLine.split('|');
        for (let i = 0; i < rowStyles.length; i++) {
          let row = rowStyles[i];
          if (/^\s*--+\s*:\s*$/.test(row)) {
            row = 'right';
          } else if (/^\s*:\s*--+\s*$/.test(row)) {
            row = 'left';
          } else if (/^\s*:\s*--+\s*:\s*$/.test(row)) {
            row = 'center';
          } else if (/^\s*--+\s*$/.test(row)) {
            row = 'default';
          } else {
            istable = false;
            break;
          }
          rowStyles[i] = row;
        }
      }

      if (istable) {
        state.tableColumns = rowStyles;
        state.tableID = `T${stream.lineOracle.line}`;
        state.tableRow = 0;
        state.tableCol = 0;
        state.table = true;
      }

      if (state.table) {
        state.tableCol = 0;
      }

      if (istable || state.table) {
        const colUbound = state.tableColumns.length - 1;
        let types = '';
        if ((state.tableCol === 0 && /^\s*\|$/.test(stream.string.slice(0, stream.pos))) || stream.match(/^\s*$/, false)) {
          types += 'table-sep table-sep-dummy';
        } else if (state.tableCol < colUbound) {
          const row = state.tableRow;
          const col = state.tableCol++;
          if (col === 0) {
            types += ` line-table_${state.tableID} line-table-row line-table-row-${row}`;
          }
          types += ` table-sep table-sep-${col}`;
        }
        if (istable) {
          state.table = true;
        }
        if (isLineEnd(stream)) {
          state.tableRow++;
        }
        if (isEnd && isLineEnd(stream)) {
          state.table = false;
          state.tableCol = 0;
          state.tableRow = 0;
          state.tableColumns = [];
        }
        return types;
      }
    }

    if (modeCfg.xml && ch === '<' && stream.match(/^(!--|\?|!\[CDATA\[|[a-z][a-z0-9-]*(?:\s+[a-z_:.-]+(?:\s*=\s*[^>]+)?)*\s*(?:>|$))/i, false)) {
      const end = stream.string.indexOf('>', stream.pos);
      if (end !== -1) {
        const atts = stream.string.substring(stream.start, end);
        if (/markdown\s*=\s*('|"){0,1}1('|"){0,1}/.test(atts)) {
          state.md_inside = true;
        }
      }
      stream.backUp(1);
      state.htmlState = CodeMirror.startState(htmlMode);
      return switchBlock(stream, state, htmlBlock); // eslint-disable-line
    }

    if (modeCfg.xml && ch === '<' && stream.match(/^\/\w*?>/)) {
      state.md_inside = false;
      return 'tag';
    } else if (ch === '*' || ch === '_') {
      let len = 1;
      const before = stream.pos === 1 ? ' ' : stream.string.charAt(stream.pos - 2);
      while (len < 3 && stream.eat(ch)) {
        len++;
      }
      const after = stream.peek() || ' ';
      // See http://spec.commonmark.org/0.27/#emphasis-and-strong-emphasis
      const leftFlanking = !/\s/.test(after) && (!punctuation.test(after) || /\s/.test(before) || punctuation.test(before));
      const rightFlanking = !/\s/.test(before) && (!punctuation.test(before) || /\s/.test(after) || punctuation.test(after));
      let setEm = null;
      let setStrong = null;
      if (len % 2) { // Em
        if (!state.em && leftFlanking && (ch === '*' || !rightFlanking || punctuation.test(before))) {
          setEm = true;
        } else if (state.em === ch && rightFlanking && (ch === '*' || !leftFlanking || punctuation.test(after))) {
          setEm = false;
        }
      }
      if (len > 1) { // Strong
        if (!state.strong && leftFlanking && (ch === '*' || !rightFlanking || punctuation.test(before))) {
          setStrong = true;
        } else if (state.strong === ch && rightFlanking && (ch === '*' || !leftFlanking || punctuation.test(after))) {
          setStrong = false;
        }
      }
      if (setStrong != null || setEm != null) {
        if (modeCfg.highlightFormatting) {
          if (setEm === null) {
            state.formatting = 'strong';
          } else if (setStrong === null) {
            state.formatting = 'em';
          } else {
            state.formatting = 'strong em';
          }
        }
        if (setEm === true) {
          state.em = ch;
        }
        if (setStrong === true) {
          state.strong = ch;
        }
        const t = getType(state);
        if (setEm === false) {
          state.em = false;
        }
        if (setStrong === false) {
          state.strong = false;
        }
        return t;
      }
    } else if (ch === ' ') {
      if (stream.eat('*') || stream.eat('_')) { // Probably surrounded by spaces
        if (stream.peek() === ' ') { // Surrounded by spaces, ignore
          return getType(state);
        }
        stream.backUp(1);
      }
    }

    if (modeCfg.strikethrough) {
      if (ch === '~' && stream.eatWhile(ch)) {
        if (state.strikethrough) {// Remove strikethrough
          if (modeCfg.highlightFormatting) {
            state.formatting = 'strikethrough';
          }
          const strikethrough = getType(state);
          state.strikethrough = false;
          return strikethrough;
        } else if (stream.match(/^[^\s]/, false)) {// Add strikethrough
          state.strikethrough = true;
          if (modeCfg.highlightFormatting) {
            state.formatting = 'strikethrough';
          }
          return getType(state);
        }
      } else if (ch === ' ') {
        if (stream.match(/^~~/, true)) { // Probably surrounded by space
          if (stream.peek() === ' ') { // Surrounded by spaces, ignore
            return getType(state);
          }
          stream.backUp(2);
        }
      }
    }

    if (modeCfg.emoji && ch === ':' && stream.match(/^(?:[a-z_\d+][a-z_\d+-]*|-[a-z_\d+][a-z_\d+-]*):/)) {
      state.emoji = true;
      if (modeCfg.highlightFormatting) state.formatting = 'emoji';
      const retType = getType(state);
      state.emoji = false;
      return retType;
    }

    if (ch === ' ') {
      if (stream.match(/^ +$/, false)) {
        state.trailingSpace++;
      } else if (state.trailingSpace) {
        state.trailingSpaceNewLine = true;
      }
    }

    return getType(state);
  }

  function blockNormal(stream, state) {
    const firstTokenOnLine = stream.column() === state.indentation;
    const prevLineLineIsEmpty = lineIsEmpty(state.prevLine.stream);
    const prevLineIsIndentedCode = state.indentedCode;
    const prevLineIsHr = state.prevLine.hr;
    const prevLineIsList = state.list !== false;
    const maxNonCodeIndentation = (state.listStack[state.listStack.length - 1] || 0) + 3;

    state.indentedCode = false;

    const lineIndentation = state.indentation;
    // compute once per line (on first token)
    if (state.indentationDiff === null) {
      state.indentationDiff = state.indentation;
      if (prevLineIsList) {
        // Reset inline styles which shouldn't propagate aross list items
        state.em = false;
        state.strong = false;
        state.code = false;
        state.strikethrough = false;

        state.list = null;
        // While this list item's marker's indentation is less than the deepest
        //  list item's content's indentation,pop the deepest list item
        //  indentation off the stack, and update block indentation state
        while (lineIndentation < state.listStack[state.listStack.length - 1]) {
          state.listStack.pop();
          if (state.listStack.length) {
            state.indentation = state.listStack[state.listStack.length - 1];
          // less than the first list's indent -> the line is no longer a list
          } else {
            state.list = false;
          }
        }
        if (state.list !== false) {
          state.indentationDiff = lineIndentation - state.listStack[state.listStack.length - 1];
        }
      }
    }

    // not comprehensive (currently only for setext detection purposes)
    const allowsInlineContinuation = (
      !prevLineLineIsEmpty && !prevLineIsHr && !state.prevLine.header
      && (!prevLineIsList || !prevLineIsIndentedCode)
      && !state.prevLine.fencedCodeEnd
    );

    const isHr = (state.list === false || prevLineIsHr || prevLineLineIsEmpty)
      && state.indentation <= maxNonCodeIndentation && stream.match(hrRE);

    let match = null;

    if (
      state.indentationDiff >= 4
      && (prevLineIsIndentedCode || state.prevLine.fencedCodeEnd || state.prevLine.header || prevLineLineIsEmpty)) {
      stream.skipToEnd();
      state.indentedCode = true;
      return tokenTypes.code;
    } else if (stream.eatSpace()) {
      return null;
    } else if (
      firstTokenOnLine
      && state.indentation <= maxNonCodeIndentation
      && (match = stream.match(atxHeaderRE))
      && match[1].length <= 6
    ) {
      state.quote = 0;
      state.header = match[1].length;
      state.thisLine.header = true;
      if (modeCfg.highlightFormatting) {
        state.formatting = 'header';
      }
      state.f = state.inline;
      return getType(state);
    } else if (state.indentation <= maxNonCodeIndentation && stream.eat('>')) {
      state.quote = firstTokenOnLine ? 1 : state.quote + 1;
      if (modeCfg.highlightFormatting) state.formatting = 'quote';
      stream.eatSpace();
      return getType(state);
    } else if (
      !isHr
      && !state.setext
      && firstTokenOnLine
      && state.indentation <= maxNonCodeIndentation
      && (match = stream.match(listRE))
    ) {
      const listType = match[1] ? 'ol' : 'ul';

      state.indentation = lineIndentation + stream.current().length;
      state.list = true;
      state.quote = 0;

      // Add this list item's content's indentation to the stack
      state.listStack.push(state.indentation);

      if (modeCfg.taskLists && stream.match(taskListRE, false)) {
        state.taskList = true;
      }
      state.f = state.inline;
      if (modeCfg.highlightFormatting) state.formatting = ['list', `list-${listType}`];
      return getType(state);
    } else if (
      firstTokenOnLine
      && state.indentation <= maxNonCodeIndentation
      && (match = stream.match(fencedCodeRE, true))) {
      state.quote = 0;
      state.fencedEndRE = new RegExp(`${match[1]}+ *$`);
      // try switching mode
      switchMode(state, getMode(match[2]));

      state.f = local; // eslint-disable-line
      state.block = local; // eslint-disable-line
      if (modeCfg.highlightFormatting) {
        state.formatting = 'code-block';
      }
      state.code = -1;
      state.codeBegin = true;
      state.codeEnd = false;
      const types = getType(state);
      state.codeBegin = false;
      state.codeEnd = true;
      return types;
    // SETEXT has lowest block-scope precedence after HR, so check it after
    //  the others (code, blockquote, list...)
    } else if (
      firstTokenOnLine
      && state.indentation <= maxNonCodeIndentation
      && (match = stream.match(atxLatexRE))
      && match[0].length === 2
    ) { // latex block
      state.quote = 0;
      state.fencedEndRE = /^(\$+)\s*$/;

      // try switching mode
      switchMode(state, 'stex');

      state.f = local; // eslint-disable-line
      state.block = local; // eslint-disable-line
      if (modeCfg.highlightFormatting) {
        state.formatting = 'latex-block';
      }
      state.latex = -1;
      return getType(state);
    } else if (
      // if setext set, indicates line after ---/===
      state.setext || (
        // line before ---/===
        (!allowsInlineContinuation || !prevLineIsList) && !state.quote && state.list === false &&
        !state.code && !isHr && !linkDefRE.test(stream.string) &&
        (match = stream.lookAhead(1)) && (match = match.match(setextHeaderRE))
      )
    ) {
      if (!state.setext) {
        state.header = match[0].charAt(0) === '=' ? 1 : 2;
        state.setext = state.header;
      } else {
        state.header = state.setext;
        // has no effect on type so we can reset it now
        state.setext = 0;
        stream.skipToEnd();
        if (modeCfg.highlightFormatting) {
          state.formatting = 'header';
        }
      }
      state.thisLine.header = true;
      state.f = state.inline;
      return getType(state);
    } else if (isHr) {
      stream.skipToEnd();
      state.hr = true;
      state.thisLine.hr = true;
      return tokenTypes.hr;
    } else if (stream.peek() === '[') {
      return switchInline(stream, state, footnoteLink); // eslint-disable-line
    }

    return switchInline(stream, state, state.inline);
  }

  function linkInline(stream, state) {
    const ch = stream.next();

    if (ch === '>') {
      state.f = inlineNormal;
      state.inline = inlineNormal;
      if (modeCfg.highlightFormatting) {
        state.formatting = 'link';
      }
      let type = getType(state);
      if (type) {
        type += ' ';
      } else {
        type = '';
      }
      return type + tokenTypes.linkInline;
    }

    stream.match(/^[^>]+/, true);

    return tokenTypes.linkInline;
  }

  function local(stream, state) {
    const currListInd = state.listStack[state.listStack.length - 1] || 0;
    const hasExitedList = state.indentation < currListInd;
    const maxFencedEndInd = currListInd + 3;
    if (state.fencedEndRE && state.indentation <= maxFencedEndInd && (hasExitedList || stream.match(state.fencedEndRE))) {
      if (modeCfg.highlightFormatting) {
        if (state.latex) {
          state.formatting = 'latex-block';
        } else if (state.code) {
          state.formatting = 'code-block';
        }
      }
      let returnType;
      if (!hasExitedList) {
        returnType = getType(state);
      }
      state.localMode = null;
      state.localState = null;
      state.block = blockNormal;
      state.f = inlineNormal;
      state.fencedEndRE = null;
      if (state.latex) {
        state.latex = 0;
      } else if (state.code) {
        state.code = 0;
      }
      state.thisLine.fencedCodeEnd = true;
      if (hasExitedList) {
        return switchBlock(stream, state, state.block);
      }
      return returnType;
    } else if (state.localMode) {
      let block = '';
      if (state.latex) {
        state.formatting = 'latex-block';
      } else if (state.code) {
        state.formatting = 'code-block';
        block += ` ${tokenTypes.codeBG}`;
      }
      const types = state.localMode.token(stream, state.localState);
      return `${types}${block}`;
    }
    stream.skipToEnd();
    if (state.latex) {
      return `${tokenTypes.latex}-code`;
    } else if (state.code) {
      return `${tokenTypes.code} ${tokenTypes.codeBG}`;
    }
    return tokenTypes.code;
  }

  function handleText(stream, state) {
    if (stream.match(textRE, true)) {
      return getType(state);
    }
    return undefined;
  }

  function htmlBlock(stream, state) {
    const style = htmlMode.token(stream, state.htmlState);
    if (!htmlModeMissing) {
      const inner = CodeMirror.innerMode(htmlMode, state.htmlState);
      if ((inner.mode.name === 'xml' && inner.state.tagStart === null &&
           (!inner.state.context && inner.state.tokenize.isInText)) ||
          (state.md_inside && stream.current().indexOf('>') > -1)) {
        state.f = inlineNormal;
        state.block = blockNormal;
        state.htmlState = null;
      }
    }
    return style;
  }

  // first Blocks

  function blankLine(state) {
    // Reset linkTitle state
    state.linkTitle = false;
    state.linkHref = false;
    state.linkText = false;
    // Reset EM state
    state.em = false;
    // Reset STRONG state
    state.strong = false;
    // Reset strikethrough state
    state.strikethrough = false;
    // Reset state.quote
    state.quote = 0;
    // Reset state.indentedCode
    state.indentedCode = false;
    if (state.f === htmlBlock) {
      let exit = htmlModeMissing;
      if (!exit) {
        const inner = CodeMirror.innerMode(htmlMode, state.htmlState);
        exit = inner.mode.name === 'xml' && inner.state.tagStart === null &&
          (!inner.state.context && inner.state.tokenize.isInText);
      }
      if (exit) {
        state.f = inlineNormal;
        state.block = blockNormal;
        state.htmlState = null;
      }
    }
    // Reset state.trailingSpace
    state.trailingSpace = 0;
    state.trailingSpaceNewLine = false;
    // Mark this line as blank
    state.prevLine = state.thisLine;
    state.thisLine = {
      stream: null,
    };
    if (state.code) {
      return tokenTypes.codeBG;
    }
    return null;
  }

  function footnoteUrl(stream, state) {
    // Check if space, and return NULL if so (to avoid marking the space)
    if (stream.eatSpace()) {
      return null;
    }
    // Match URL
    stream.match(/^[^\s]+/, true);
    // Check for link title
    if (stream.peek() === undefined) { // End of line, set flag to check next line
      state.linkTitle = true;
    } else { // More content on line, check if link title
      stream.match(/^(?:\s+(?:"(?:[^"\\]|\\\\|\\.)+"|'(?:[^'\\]|\\\\|\\.)+'|\((?:[^)\\]|\\\\|\\.)+\)))?/, true);
    }
    state.f = inlineNormal;
    state.inline = inlineNormal;
    return `${tokenTypes.linkHref} url`;
  }

  function footnoteLinkInside(stream, state) {
    if (stream.match(/^\]:/, true)) {
      state.f = footnoteUrl;
      state.inline = footnoteUrl;
      if (modeCfg.highlightFormatting) {
        state.formatting = 'link';
      }
      const returnType = getType(state);
      state.linkText = false;
      return returnType;
    }

    stream.match(/^([^\]\\]|\\.)+/, true);

    return tokenTypes.linkText;
  }

  function footnoteLink(stream, state) {
    if (stream.match(/^([^\]\\]|\\.)*\]:/, false)) {
      state.f = footnoteLinkInside;
      stream.next(); // Consume [
      if (modeCfg.highlightFormatting) state.formatting = 'link';
      state.linkText = true;
      return getType(state);
    }
    return switchInline(stream, state, inlineNormal);
  }

  const mode = {
    startState() {
      return {
        f: blockNormal,

        prevLine: { stream: null },
        thisLine: { stream: null },

        block: blockNormal,
        htmlState: null,
        indentation: 0,

        inline: inlineNormal,
        text: handleText,

        formatting: false,
        linkText: false,
        linkHref: false,
        linkTitle: false,
        inlineLatex: false,
        latex: 0,
        code: 0,
        codeBegin: false,
        codeEnd: false,
        em: false,
        strong: false,
        headerHash: false,
        headerTitle: false,
        header: 0,
        setext: 0,
        hr: false,
        taskList: false,
        list: false,
        listStack: [],
        quote: 0,
        trailingSpace: 0,
        trailingSpaceNewLine: false,
        strikethrough: false,
        emoji: false,
        fencedEndRE: null,

        // table
        table: false,
        tableCol: 0,
        tableRow: 0,
        tableColumns: [],
        tableID: null,
      };
    },

    copyState(s) {
      return {
        f: s.f,

        prevLine: s.prevLine,
        thisLine: s.thisLine,

        block: s.block,
        htmlState: s.htmlState && CodeMirror.copyState(htmlMode, s.htmlState),
        indentation: s.indentation,

        localMode: s.localMode,
        localState: s.localMode ? CodeMirror.copyState(s.localMode, s.localState) : null,

        inline: s.inline,
        text: s.text,
        formatting: false,
        linkText: s.linkText,
        linkTitle: s.linkTitle,
        linkHref: s.linkHref,
        code: s.code,
        codeBegin: s.codeBegin,
        codeEnd: s.codeEnd,
        em: s.em,
        strong: s.strong,
        strikethrough: s.strikethrough,
        emoji: s.emoji,
        headerHash: s.headerHash,
        headerTitle: s.headerTitle,
        header: s.header,
        inlineLatex: s.inlineLatex,
        latex: s.latex,
        setext: s.setext,
        hr: s.hr,
        taskList: s.taskList,
        list: s.list,
        listStack: s.listStack.slice(0),
        quote: s.quote,
        indentedCode: s.indentedCode,
        trailingSpace: s.trailingSpace,
        trailingSpaceNewLine: s.trailingSpaceNewLine,
        md_inside: s.md_inside,
        fencedEndRE: s.fencedEndRE,

        table: s.table,
        tableCol: s.tableCol,
        tableRow: s.tableRow,
        tableColumns: s.tableColumns,
        tableID: s.tableId,
      };
    },

    token(stream, state) {
      // Reset state.formatting
      state.formatting = false;
      if (stream !== state.thisLine.stream) {
        state.header = 0;
        state.headerHash = 0;
        state.hr = false;


        if (stream.match(/^\s*$/, true)) {
          // blankLine(state);
          // return null;
        }

        state.prevLine = state.thisLine;
        state.thisLine = { stream };

        // Reset state.taskList
        state.taskList = false;

        // Reset state.trailingSpace
        state.trailingSpace = 0;
        state.trailingSpaceNewLine = false;

        if (!state.localState) {
          state.f = state.block;
          if (state.f !== htmlBlock) {
            const indentation = stream.match(/^\s*/, true)[0].replace(/\t/g, expandedTab).length;
            state.indentation = indentation;
            state.indentationDiff = null;
            if (indentation > 0) return null;
          }
        }
      }
      const styles = state.f(stream, state);
      return styles;
    },

    innerMode(state) {
      if (state.block === htmlBlock) {
        return {
          state: state.htmlState,
          mode: htmlMode,
        };
      }
      if (state.localState) {
        return {
          state: state.localState,
          mode: state.localMode,
        };
      }
      return {
        state,
        mode,
      };
    },

    indent(state, textAfter, line) {
      if (state.block === htmlBlock && htmlMode.indent) {
        return htmlMode.indent(state.htmlState, textAfter, line);
      }
      if (state.localState && state.localMode.indent) {
        return state.localMode.indent(state.localState, textAfter, line);
      }
      return CodeMirror.Pass;
    },

    blankLine,

    getType,

    blockCommentStart: '<!--',
    blockCommentEnd: '-->',
    closeBrackets: "()[]{}''\"\"``",
    fold: 'markdown',
  };
  return mode;
}, 'xml');

CodeMirror.defineMIME('text/markdown', 'markdown');

CodeMirror.defineMIME('text/x-markdown', 'markdown');
