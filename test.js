const SimpleHtmlParser = require('./htmlparser')
const parser = new SimpleHtmlParser();

var queue = [];

parser.parse(`<div>
    <h1>111'<sdiv>22</sdiv>'11</h1>
    <if>
    c
    </if>
    <empty />
    <p>2<a href="/t">c</a></p>
</div>`, {
    startElement: function(tag, attr) {
        console.log(tag, attr);
    },
    endElement: function(tag) {
        console.log(tag);
    },
    characters: function(s) {
        // console.log(s);
    },
    comment: function(s) { console.log(s); }
})