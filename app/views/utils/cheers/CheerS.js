import 'codemirror/lib/codemirror.css';

import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/lua/lua';
import 'codemirror/mode/stex/stex';
import 'codemirror/mode/php/php';
import 'codemirror/mode/python/python';
import 'codemirror/mode/sql/sql';
import 'codemirror/mode/go/go';

import 'codemirror/addon/fold/markdown-fold';

import CodeMirror from 'codemirror';

import './addon/srcoll/scrollbars';
import './addon/srcoll/scrollbars.scss';

import './mode/markdown';

const CheerS = CodeMirror;

export default CheerS;
