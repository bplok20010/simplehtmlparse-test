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

var str = [];

let queue = [];

//console.log(JSON.stringify(new JSXParser(html2).parse()));


//var jsx = <div myname = {program + '}'} test>test<p>11</p></div>;

let root;

let currentParent;

let stack = [];

const ret = parseHTML(html2 + '', {
    start: function(tag, attr, unary) {
        str.push((queue.length ? ',' : '') + `h(${tag},null`);
        queue.push(tag);
        console.log(tag,'...');
        if (unary) {
            str.push(`null)`);
            queue.pop();
        }
        let element = {
            tag: tag,
            type: 1,
            attrsList: attr,
            //parent: currentParent,
            children: []
        }

        if (currentParent) {
            currentParent.children.push(element)
                //element.parent = currentParent;
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
        str.push(`)`);
        queue.pop();

        const element = stack[stack.length - 1];
        //const lastNode = element.children[element.children.length - 1]
        //if (lastNode && lastNode.type === 3 && lastNode.text === ' ') {
        //    element.children.pop()
        //}
        stack.length -= 1;
        currentParent = stack[stack.length - 1];
    },
    chars: function(text) {
        str.push(`,"${text}"`);

        //const children = currentParent.children
        text = text.trim();
        if (text) {
            currentParent.children.push({
                type: 3,
                text: text
            })
        }
    }
});

function transform(ASTElement){

    var str= [];

    var stack = [];
    var stackAST = [];

    function parser1(ast){
        var cid =  `_c${uuid++}_` + ( ast.tag || 'text' ) + '_';
        str.push(`\nvar ${cid} = [];`);

        var parent = stack[stack.length - 1];
        var parentAST = stackAST[stackAST.length - 1];

        stack.push(cid);
        stackAST.push(ast);

        ast.children = ast.children || [];

        ast.children.forEach((child, i)=>{
            if( child.type === 3 ) {
                str.push(`\n${cid}.push(${JSON.stringify(child.text)});`); 
            } else if( child.type === 1 ) {
                if( child.tag == 'js' ) {
                    if( child.children[0] ) {
                        str.push(`\n${child.children[0].text}`);
                    }
                } else {
                    parser1(child);
                }
            }
        });

        stack.length -= 1;
        stackAST.length -= 1;

        if( stack.length )
            str.push(`\n${parent}.push(h("${ast.tag}", null, ${cid}));`);
        else 
            str.push(`\nh("${ast.tag}", null, ${cid});`);
    }

    str.push(parser1(ASTElement));

    return str.join('');
}

//console.log(root);

//console.log(JSON.stringify(root));

let uuid = 1;
let ASTElement = root;
//transform
console.log(transform(root));

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