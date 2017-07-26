jQuery.ajax = (function(_ajax){
    
    var protocol = location.protocol,
        hostname = location.hostname,
        exRegex = RegExp(protocol + '//' + hostname),
        YQL = 'http' + (/^https/.test(protocol)?'s':'') + '://query.yahooapis.com/v1/public/yql?callback=?',
        query = 'select * from html where url="{URL}" and xpath="*"';
    
    function isExternal(url) {
        return !exRegex.test(url) && /:\/\//.test(url);
    }
    
    return function(o) {
        
        var url = o.url;
        
        if ( /get/i.test(o.type) && !/json/i.test(o.dataType) && isExternal(url) ) {
            
            // Manipulate options so that JSONP-x request is made to YQL
            
            o.url = YQL;
            o.dataType = 'json';
            
            o.data = {
                q: query.replace(
                    '{URL}',
                    url + (o.data ?
                        (/\?/.test(url) ? '&' : '?') + jQuery.param(o.data)
                    : '')
                ),
                format: 'xml'
            };
            
            // Since it's a JSONP request
            // complete === success
            if (!o.success && o.complete) {
                o.success = o.complete;
                delete o.complete;
            }
            
            o.success = (function(_success){
                return function(data) {
                    
                    if (_success) {
                        // Fake XHR callback.
                        _success.call(this, {
                            responseText: (data.results[0] || '')
                                // YQL screws with <script>s
                                // Get rid of them
                                .replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, '')
                        }, 'success');
                    }
                    
                };
            })(o.success);
            
        }
        
        return _ajax.apply(this, arguments);
        
    };
    
})(jQuery.ajax);

//$('#container').load('http://google.com'); // SERIOUSLY!
 
$.ajax({
    url: 'http://www.guildwarsguru.com/forum/gw-gear-stat-ranges-req-t10440240.html',
    type: 'GET',
    success: function(res) {
        
        document.getElementById("NeiRong").innerHTML = parseTranslate(res.responseText);
		
		//在生成表格后，换表格第一行颜色； 需放在ajax内，否则浏览器将在表格出现前试图改色
		var list = document.getElementsByTagName("th");
		var indexArray = 0;
		while (indexArray < list.length){
			list[indexArray].style.background = "#CBEAC0";
			indexArray = indexArray+1;
		}
		
		set_loading(false);
    }
});

function set_loading(loading) {
    $('#loading-indicator').toggleClass('hide', !loading);
    $('#result-wrapper').toggleClass('hide', loading);
}


function parseTranslate(data){

	//擦掉表格前后的内容
	var temp = data.split("Do you wonder what the game's maximum and minimum");
    var temp1 = temp[1];
    
	temp = temp1.split("Claims for better stuff to have dropped");
    data = temp[0];
	
	//抽出表格
	data=data.replace(/(.|\n)*(<table(.|\n)*?<table(.|\n)*?<\/table>)(.|\n)*/gi, '$2');
	
	//修饰表格 | 重要
	data=data.replace(/(^|[^A-Za-z])<table class="stg_table tborder">(?=[^A-Za-z]|$)/gi, '<table class="table table-condensed table-bordered table-striped" id="display">'); 
	
	//开始转换
	data=data.replace(/req/gi, '需求');
	data=data.replace(/>Axe</gi, '>斧<');
	data=data.replace(/>Bow</gi, '>弓<');
	data=data.replace(/>Dagger</gi, '>匕首<');
	data=data.replace(/>Focus</gi, '>聚能器<');
	
	data=data.replace(/>Hammer</gi, '>锤<');
	data=data.replace(/>Scythe</gi, '>镰刀<');
	data=data.replace(/>Shield</gi, '>盾<');
	data=data.replace(/>Spear</gi, '>矛<');
	data=data.replace(/>Staff</gi, '>法杖<');
	
	data=data.replace(/>Sword</gi, '>剑<');
	data=data.replace(/>Wand</gi, '>魔杖<');
	data=data.replace(/>Staff \(below\)</gi, '>法杖 (见下)<');
	data=data.replace(/>Staff white\/blue</gi, '>法杖 白/蓝<');
	data=data.replace(/>Staff purple\/gold</gi, '>法杖 紫/金<');
	data=data.replace(/ Max HSR /gi, '恢复时间减半几率 高');
	
	data=data.replace(/ Min HSR /gi, '恢复时间减半几率 低');
	data=data.replace(/ Max Ene /gi, '能量 高');
	data=data.replace(/ Min Ene /gi, '能量 低');
	data=data.replace(/ Max DMG /gi, '伤害 高');
	data=data.replace(/ Min DMG /gi, '伤害 低');
	
	data=data.replace(/Max/gi, '高');
	data=data.replace(/Min/gi, '低');
	
	data=data.replace(/<tr class="alt2"><td> 需求 <\/td><td>  <\/td><td> 0 <\/td><td> 1 <\/td><td> 2 <\/td><td> 3 <\/td><td> 4 <\/td><td> 5 <\/td><td> 6 <\/td><td> 7 <\/td><td> 8 <\/td><td> 9 <\/td><td> 10 <\/td><td> 11 <\/td><td> 12 <\/td><td> 13<\/td><\/tr>/gi,'<tr class="alt2"><td style="background:#CBEAC0;"> 需求 </td><td style="background:#CBEAC0;">  </td><td style="background:#CBEAC0;"> 0 </td><td style="background:#CBEAC0;"> 1 </td><td style="background:#CBEAC0;"> 2 </td><td style="background:#CBEAC0;"> 3 </td><td style="background:#CBEAC0;"> 4 </td><td style="background:#CBEAC0;"> 5 </td><td style="background:#CBEAC0;"> 6 </td><td style="background:#CBEAC0;"> 7 </td><td style="background:#CBEAC0;"> 8 </td><td style="background:#CBEAC0;"> 9 </td><td style="background:#CBEAC0;"> 10 </td><td style="background:#CBEAC0;"> 11 </td><td style="background:#CBEAC0;"> 12 </td><td style="background:#CBEAC0;"> 13</td></tr>');
	
    
    return data;
}