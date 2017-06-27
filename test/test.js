import { parseHTML } from './html-parser';

import JSXParser from './jsx-parser';

import {
    readFileSync
} from 'fs';

const program = 'h';

const parseJSX = (new JSXParser()).parse;

var html = '<div><meita /><if name="ta">ag</if><!--adf --><ol id="test<i></i>" my name style="margin-left: 14px; padding-left: 14px; line-height: 160%;"><li><a href="#t0">一安装最新的nodejs</a></li><li><a href="#t1">二修改npm源为淘宝源</a></li><li><a href="#t2">三安装脚手架</a></li><li><a href="#t3">四创建React项目</a></li><li><a href="#t4">五调试打包React项目</a></li><li><a href="#t5">六测试预览项目</a></li></ol>af<br id="saf" />yy<script type="text/js">f<div></div></script></div>';

var html = '<div><p>123</p><a>123</a><ol id="test<i></i>" my name style="margin-left: 14px; padding-left: 14px; line-height: 160%;"><li><a href="#t0">一安装最新的nodejs</a></li><li><a href="#t1">二修改npm源为淘宝源</a></li><li><a href="#t2">三安装脚手架</a></li><li><a href="#t3">四创建React项目</a></li><li><a href="#t4">五调试打包React项目</a></li><li><a href="#t5">六测试预览项目</a></li></ol></div>';

var html2 = readFileSync('../table.html');

var html2 = `<div>
<p1 name="taf1"><span>test<i>1</i>...</span></p1>
<p2 name="taf2">test2...</p2>
<p3 name="taf3">test3...</p3>
<p4 name="taf3">test4...</p4>
<table>
<js>
for( var i = 0; i < 100; i++ ) {
    var s = i+ 4;
</js>
<tr>
    <td>1</td>
    <td>2</td>
    <td>3</td>
    <td>4</td>
</tr>
<js>
}
</js>
</table>
</div>`;

var html2 = `<div><s><i>1</id></s><js>var s1</js></div><br/><js>var s1</js>`

function makeAttrsMap (attrs) {
  const map = {}
  for (let i = 0, l = attrs.length; i < l; i++) {
    map[attrs[i].name] = attrs[i].value
  }
  return map
}

function isForbiddenTag (el) {
  return (
    el.tag === 'style' ||
    (el.tag === 'script' && (
      !el.attrsMap.type ||
      el.attrsMap.type === 'text/javascript'
    ))
  )
}


var str = [];

let queue = [];

//console.log(JSON.stringify(new JSXParser(html2).parse()));


//var jsx = <div myname = {program + '}'} test>test<p>11</p></div>;

let root, roots=[];

let currentParent;

let stack = [];

const ret = parseHTML(html2 + '', {
    start: function(tag, attrs, unary) {
        let element = {
            tag: tag,
            type: 1,
            attrsList: attrs,
            attrsMap: makeAttrsMap(attrs),
            parent: currentParent,
            children: []
        }

        if (isForbiddenTag(element)) {
            element.forbidden = true;
        }

        if (currentParent) {
            currentParent.children.push(element)
        }

        if(stack.length === 0) {
            roots.push(element);
        }

        if (!unary) {
            currentParent = element;
            stack.push(element);
        }

        if (!root) {
            root = element;
        }
    },
    end: function() {
        stack.length -= 1;
        currentParent = stack[stack.length - 1];
    },
    chars: function(text) {
        text = text.trim();
        if (text) {
            currentParent.children.push({
                type: 3,
                text: text
            })
        }
    }
});

function transform(ASTElement, $root){
    var codes= [];
    var stack = [];
    //var stackAST = [];

    function parser(ast){
        var isTextNode = ast.type === 3;

        var $var =  '_$var_' + ( ast.tag || 'text' ) + `_${uuid++}_`;
        codes.push(`var ${$var} = [];`);

        var parentVar = stack[stack.length - 1] || $root;
        //var parentAST = stackAST[stackAST.length - 1];

        stack.push($var);
        //stackAST.push(ast);

        if( !isTextNode ) {

            ast.children.forEach((child, i)=>{
                if( child.type === 3 ) {
                    codes.push(`${$var}.push(${JSON.stringify(child.text)});`); 
                } else if( child.type === 1 ) {
                    if( child.tag == 'js' ) {
                        if( child.children.length ) {
                            codes.push(`${child.children[0].text}`);
                        }
                    } else {
                        parser(child);
                    }
                }
            });

        }

        stack.length -= 1;
        //stackAST.length -= 1;

        //if( ast.tag === 'js' ) return;

        //if( stack.length )
            codes.push(`${parentVar}.push(${program}("${ast.tag}", ${JSON.stringify(ast.attrsMap)}, ${$var}));`);
        //else 
           // codes.push(`${program}("${ast.tag}", ${JSON.stringify(ast.attrsMap)}, ${$var});`);
    }

    parser(ASTElement);

    return codes.join('\n');
}

function compile(ASTElements){
    var $var = `_temp_${uuid++}_`;
    var codes = [`var ${$var} = [];`];

    for( var i=0;i<ASTElements.length;i++ ) {
        var ast = ASTElements[i];
        if( ast.type === 3 ) {
            codes.push(`${$var}.push(${ast.text})`);
        } else if( ast.type === 1 && ast.tag === 'js' ) {
             if( ast.children.length ) {
                codes.push(`${ast.children[0].text}`);
             }
        } else {    
            codes.push(transform(ast, $var));
        }
    }

    codes.push( `return ${$var}` );

    return new Function('props', 'state', 'context', codes.join('\n')) ;
}

let uuid = 1;
let ASTElement = root;

//console.log(roots);

//transform
console.log(compile(roots).toString());

/**
 * <div id="t1"><p>test...</p></div>
 * ```js
 * var v1 = [];
 * var v2 = [];
 * v2.push('test...');
 * v1.push(h('p', null, v2));
 * h('div', {id:'t1'}, v1);
 * ```
*/

function includes(text, sep) {
    return text.indexOf(sep) >= 0;
}

const curlyMap = {'{': 1, '}': -1};

console.log( convertText({
    type : 'text'
},null,'adf{2+1 + "{}" }fg') );

function isStringOnlyCode(txt) {
    return /^\s*\{.*}\s*$/g.test(txt);
    //txt = txt.trim();
    //return txt.length && txt.charAt(0) === '{' && txt.charAt(txt.length - 1) === '}';
}

function convertText(node, context, txt, normalizeWhitespaces) {
    function jsonText(text) {
        return JSON.stringify(normalizeWhitespaces ? normalizeHtmlWhitespace(text) : text);
    }
    let res = '';
    let first = true;
    const concatChar = node.type === 'text' ? ',' : '+';
 
    while (includes(txt, '{')) {
        const start = txt.indexOf('{');
        const pre = txt.substr(0, start);
        if (pre) {
            res += (first ? '' : concatChar) + jsonText(pre);
            first = false;
        }
        let curlyCounter = 1;
        let end = start;
        while (++end < txt.length && curlyCounter > 0) {
            curlyCounter += curlyMap[txt.charAt(end)] || 0;
        }
        if (curlyCounter === 0) {
            const needsParens = start !== 0 || end !== txt.length - 1;
            res += (first ? '' : concatChar) + (needsParens ? '(' : '') + txt.substr(start + 1, end - start - 2) + (needsParens ? ')' : '');
            first = false;
            txt = txt.substr(end);
        } else {
            //throw RTCodeError.build(context, node, `Failed to parse text '${txt}'`);
        }
    }
    if (txt) {
        res += (first ? '' : concatChar) + jsonText(txt);
    }
    if (res === '') {
        res = 'true';
    }
    return res;
}