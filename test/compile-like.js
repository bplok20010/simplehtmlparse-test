
<div>
	你是谁
	<js>
		var x = 1;
	</js>
	<if gender="sex">
		<div>123</div>
	<else />
		2
	</if>
	<i>mynae</i>
</div>

----compile----
var v1 = []
h('div', null, v1);
	v1.push('你是谁');
	var x = 1;
	if( gender = sex ) {
		var v2 = [];
		v1.push(h('div'), null, v2);
		v2.push(123);
	} else {
		v1.push(2);
	}
	var v3 = []
	v1.push('i', null, v3);
	v3.push(mynae);