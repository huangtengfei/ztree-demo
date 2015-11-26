//----------------弹窗相关操作-----------------

var selected, checkedNodes = [];
var treeDemo = $('#treeDemo');
	sub = $('#subscription'),
	selectedArea = $('#selected-area'),
    searchResult = $('#search-result');

// 打开内层弹窗
function set(){
	$('#innerModal').modal('show');	
	checkedNodes = checkedNodes || [];	
}

// 关闭内层弹窗，保存，更新外层弹窗字段值
function save() {
	var range = '';
	selected = checkedNodes;
	selected.forEach(function(s) {
		range = range + s.name + '; '
	})
	sub.val(range);
	$('#innerModal').modal('hide');
}

//----------------树相关操作-----------------
var push = [].push,
	setting = {
	    view: {
	        selectedMulti: true,
	        showIcon: false
	    },
	    check: {
	        enable: true,
	        chkStyle: 'checkbox',
	        radioType: "level"
	    },
	    data: {
	        simpleData: {
	            enable: true,
	            // idKey: "orgId",
	            // pIdKey: "parentOrgId"
	        }
	    },
	    callback: {
	        onCheck: onCheck
	    }
	};

function setCheck() {
	$.fn.zTree.init($("#treeDemo"), setting, zNodes);
}

// 选中/取消选中某一节点
function onCheck() {
	var zTree = $.fn.zTree.getZTreeObj("treeDemo"),
		nodes = zTree.getCheckedNodes(true);
	selectedArea.empty();
	
	nodes = nodes.filter(function(v){
		return v.getParentNode() === null;
	});
	console.log(nodes);

	checkedNodes = handle(nodes);
	console.log('len %s', checkedNodes.length);
	checkedNodes.forEach(function(v){
		console.log('id: %s, name %s', v.id, v.name);
	});

	console.log('-'.repeat(20));

	updateSelected(checkedNodes);
}

// 先找出选中节点中最上层的节点，然后遍历，半选的直接放到结果中，全选的再对children递归
function handle(nodes){
	return nodes.reduce(function(result, v){
		var checked = v.getCheckStatus();
		if(checked.checked){
			if(!checked.half){
				result.push(v);
			} else {
				if(Array.isArray(v.children)){
					push.apply(result, handle(v.children));
				} else {
					console.log('node is checked=true, half = true, but node.children is not Array ', v);
				}
			}
		}
		return result;
	} ,[]);
}

// 更新下面已选部分的内容
function updateSelected(checkedNodes) {
	checkedNodes.forEach(function(node){
		var div = $('<div></div>');
		var span = $('<span></span>').text(node.name);
		var icon = $('<span></span>').text('x');
		div.addClass('selected-item');
		div.attr('id', node.id);
		icon.addClass('remove-icon');
		icon.on('click', function(){
			remove(node);
		});
		selectedArea.append(div);
		div.append(span);
		div.append(icon);		
	})
}

// 移除某一节点
function remove(node) {
	$('#' + node.id).remove();
	checkedNodes.forEach(function(n, i){
		if(n.id === node.id){		
			var zTree = $.fn.zTree.getZTreeObj("treeDemo");
			zTree.checkNode(n, false, true);
			checkedNodes.splice(i, 1);
		}
	});	
}

//----------------搜索相关操作-----------------

var nodeList = [];	// 搜索结果

// 搜索
function search(value){  
    if(value != ""){   
    	var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        nodeList = zTree.getNodesByParamFuzzy('name', value); 	       
        if(nodeList && nodeList.length>0){  
            searchResult.show();
            treeDemo.hide();
            updateSearch(nodeList);
        }  
    }else{
    	searchResult.hide();
    	treeDemo.show();
    }
}  

// 根据搜索结果更新搜索显示区的内容
function updateSearch(nodeList){
	searchResult.empty();
	nodeList.forEach(function(n){
		var a = $('<a></a>').text(n.name);
		a.addClass('list-group-item');
		a.css('cursor', 'pointer');
		a.on('click', function(){
			var zTree = $.fn.zTree.getZTreeObj("treeDemo");
			zTree.selectNode(n);
			searchResult.hide();
			treeDemo.show();
		});
		searchResult.append(a);
	})
}	

// 搜索框onfocus时显示搜索结果
function showResult() {
	if(nodeList.length) {
		searchResult.show();
		treeDemo.hide();
	}
}

//----------------初始化-----------------
$(document).ready(function(){
	zNodes.forEach(function(z){
		checkedNodes.forEach(function(c){
			if(c.id === z.id){
				z.checked = true;
				z.open = true;
			}
		})
	})
    $.fn.zTree.init($("#treeDemo"), setting, zNodes);
	setCheck();			
	$("#r1").bind("change", setCheck);
	$("#r2").bind("change", setCheck);
	$("#disablechk").bind("change", setCheck);
});

    