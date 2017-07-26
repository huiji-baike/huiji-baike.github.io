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
    url: 'http://wiki.guildwars.com/wiki/Zaishen_Challenge_Quest',
    type: 'GET',
    success: function(res) {
        
        document.getElementById("ZongJie").innerHTML = parseTranslate(prepShortData(res.responseText));
		
		//在生成表格后，换表格第一行颜色； 需放在ajax内，否则浏览器将在表格出现前试图改色
		var list = document.getElementsByTagName("th");
		var indexArray = 0;
		while (indexArray < list.length){
			list[indexArray].style.background = "#CBEAC0";
			indexArray = indexArray+1;
		}
		//since set load control both div at the same time, don't want to accidentally toggle before the one below is done, which will then make this div invisible again
		//set_loading(false);
    }
});
 
$.ajax({
    url: 'http://wiki.guildwars.com/wiki/Daily_activities',
    type: 'GET',
    success: function(res) {
        
        document.getElementById("NeiRong").innerHTML = parseTranslate(prepLongData(res.responseText));
		
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

function kaiguan() {              
	if ($('#all-cycle-results').hasClass('hide')){
		$('#all-cycle-results').removeClass('hide');
	}
	else
	{
		$('#all-cycle-results').addClass('hide');
	}
}

function prepShortData(data){
	
	//===> 注: 转换次序可产生意外效果； 务须按网页源代码制定转换规则，亦要小心后续规则改动了早些已转换完毕的字句  <===
	//===> 注: 转换次序可产生意外效果； 务须按网页源代码制定转换规则，亦要小心后续规则改动了早些已转换完毕的字句  <===
	//===> 注: 转换次序可产生意外效果； 务须按网页源代码制定转换规则，亦要小心后续规则改动了早些已转换完毕的字句  <===
	//===> 例: data=data.replace(/(^|[^A-Za-z])(<a href="\/wiki)(?=[^A-Za-z]|$)/gi, '<a href="http://wiki.guildwars.com/wiki/');

	//擦掉表格前后的内容
	var temp = data.split("refresh the list</a>");//
    var temp1 = temp[1];
    
	temp = temp1.split("The listed rewards are those");
    data = temp[0];
	
	//清理表格前遗留部分 "."</p> 而后开始: <table ...
	data=data.replace(/((.|\n)*?<table)(?=[^A-Za-z]|$)/gi, '<table'); 
	
	//修饰表格 | 重要
	data=data.replace(/(^|[^A-Za-z])<table.*?cellpadding="3".*?>(?=[^A-Za-z]|$)/gi, '<table class="table table-condensed table-bordered table-striped" id="display">'); 
	
	//内容居中
	data=data.replace(/(^|[^A-Za-z])<td style="text-align: right;">(?=[^A-Za-z]|$)/gi, '$1<td style="text-align: center;">'); //日期
	//data=data.replace(/(^|[^A-Za-z])<td>(?=[^A-Za-z]|$)/gi, '$1<td style="text-align: right;">');
	
	//改最后表格一行
	data=data.replace(/(^|[^A-Za-z])colspan="5" style="text-align(?=[^A-Za-z]|$)/gi, '$1colspan="6" style="background:#CBEAC0;text-align'); //加长横行，加绿色
	data=data.replace(/(^|[^A-Za-z])font-style: italic;(?=[^A-Za-z]|$)/gi, ''); //改字体
	data=data.replace(/<a(.|\n){0,3}href="\/wiki\/Daily_activities" title="Daily activities">(.|n)*?<\/a>/gi, '<span style="padding: 0  5em;font-weight:700;color:#428bca;cursor: pointer;" onclick="kaiguan()"> 击此 展开 全表  (含光刃，先锋队，及[毁灭前]旅者) <\/span>'); //改说明
	
	//擦表格后各字, 即 The listed rewards are those 之前的html
	data=data.replace(/(^|[^A-Za-z])<dl>(.|\n)*?<dd>(.|\n)*?<small>(.|\n)*?"(?=[^A-Za-z]|$)/gi, '$1');
	
	data=data.replace(/(^|[^A-Za-z])(<th>(.|\n){0,3}Single reward(.|\n)*?<\/th>)(?=[^A-Za-z]|$)/gi, '$1<th>奖赏统计 ( <img alt="铜币" height="19" src="http://jizhan1.gitcafe.io/战承文件/铜币.png" srcset="http://jizhan1.gitcafe.io/战承文件/铜币29.png 1.5x, http://jizhan1.gitcafe.io/战承文件/铜币38.png 2x" width="19"><a href="http://wiki.guildwars.com/wiki/Copper_Zaishen_Coin" title="铜战承币">铜战承币</a> )</th>'); 
	
	//日期加1
	//data=data.replace(/ \d{1,2} (?!\+)/gi, function(n){ return " "+(parseInt(n)+1)+" "; });
	
	return data;
}

function prepLongData(data){

	//===> 注: 转换次序可产生意外效果； 务须按网页源代码制定转换规则，亦要小心后续规则改动了早些已转换完毕的字句  <===
	//===> 注: 转换次序可产生意外效果； 务须按网页源代码制定转换规则，亦要小心后续规则改动了早些已转换完毕的字句  <===
	//===> 注: 转换次序可产生意外效果； 务须按网页源代码制定转换规则，亦要小心后续规则改动了早些已转换完毕的字句  <===
	//===> 例: data=data.replace(/(^|[^A-Za-z])(<a href="\/wiki)(?=[^A-Za-z]|$)/gi, '<a href="http://wiki.guildwars.com/wiki/');
	
	//擦掉表格前后的内容
	var temp = data.split("</dd></dl>");
    var temp1 = temp[1];
    
	temp = temp1.split("<hr");
    data = temp[0];
	
	//擦掉NewPP limit report前的<!--
	//data=data.replace(/(^|[^A-Za-z])(<!--)(?=[^A-Za-z]|$)/gi, '');
	
	//插入说明 | 已删
	//data=data.replace(/(^|[^A-Za-z])(<\/th><\/tr>)(?=[^A-Za-z]|$)/gi, '$1$2<tr><td style="text-align: center;" colspan = "6">  每周循环 于以下各晚11点起 生效   <b>|</b>   内容与激战网同步、名目或未尽校   <\/td><\/tr>');
	
	//修饰材料个数
	//data=data.replace(/(^|[^A-Za-z])<td> (\d) <a(?=[^A-Za-z]|$)/gi, '$1<td>  [ $2 ]  <a');
	
	//修饰表格 | 重要
	data=data.replace(/(^|[^A-Za-z])<table.*?cellpadding="3".*?>(?=[^A-Za-z]|$)/gi, '<table class="table table-condensed table-bordered table-striped" id="display">'); 
	
	//内容居中
	data=data.replace(/(^|[^A-Za-z])<td style="text-align: right;">(?=[^A-Za-z]|$)/gi, '$1<td style="text-align: center;">'); //日期
	//data=data.replace(/(^|[^A-Za-z])<td>(?=[^A-Za-z]|$)/gi, '$1<td style="text-align: right;">');
	
	//日期加1
	//data=data.replace(/ \d{1,2} (?!\+)/gi, function(n){ return " "+(parseInt(n)+1)+" "; });
	
	return data;
}


function parseTranslate(data){

	
	data=data.replace(/(^|[^A-Za-z])(<a href="\/wiki)(?=[^A-Za-z]|$)/gi, '<a href="http://wiki.guildwars.com/wiki');
	data=data.replace(/(^|[^A-Za-z])(<a class="mw-redirect" href="\/wiki\/Skale)(?=[^A-Za-z]|$)/gi, '<a href="http://wiki.guildwars.com/wiki/Skale');
	
	//开始转换
	data=data.replace(/(^|[^A-Za-z])(>Prophecies<)(?=[^A-Za-z]|$)/gi, '$1>一章<');
	data=data.replace(/(^|[^A-Za-z])(>Factions<)(?=[^A-Za-z]|$)/gi, '$1>二章<');
	data=data.replace(/(^|[^A-Za-z])(>Nightfall<)(?=[^A-Za-z]|$)/gi, '$1>三章<');
	data=data.replace(/(^|[^A-Za-z])(>Eye of the North<)(?=[^A-Za-z]|$)/gi, '$1>四章<');
	
	data=data.replace(/(^|[^A-Za-z])(>Kryta<)(?=[^A-Za-z]|$)/gi, '$1>科瑞塔<');
	data=data.replace(/(^|[^A-Za-z])(>Shing Jea Island<)(?=[^A-Za-z]|$)/gi, '$1>星岬岛<');
	data=data.replace(/(^|[^A-Za-z])(>Northern Shiverpeaks<)(?=[^A-Za-z]|$)/gi, '$1>北席娃山脉<');
	data=data.replace(/(^|[^A-Za-z])(>Southern Shiverpeaks<)(?=[^A-Za-z]|$)/gi, '$1>南席娃山脉<');
	data=data.replace(/(^|[^A-Za-z])(>Far Shiverpeaks<)(?=[^A-Za-z]|$)/gi, '$1>远北席娃山脉(四章)<');
	data=data.replace(/(^|[^A-Za-z])(>Ring of Fire Islands<)(?=[^A-Za-z]|$)/gi, '$1>火环岛<');
	data=data.replace(/(^|[^A-Za-z])(>maguuma jungle<)(?=[^A-Za-z]|$)/gi, '$1>梅古玛丛林<');
	data=data.replace(/(^|[^A-Za-z])(>kourna<)(?=[^A-Za-z]|$)/gi, '$1>高楠<');
	data=data.replace(/(^|[^A-Za-z])(>vabbi<)(?=[^A-Za-z]|$)/gi, '$1>瓦贝<');
	data=data.replace(/(^|[^A-Za-z])(>the jade sea<)(?=[^A-Za-z]|$)/gi, '$1>碧玉海<');
	data=data.replace(/(^|[^A-Za-z])(>crystal desert<)(?=[^A-Za-z]|$)/gi, '$1>水晶沙漠<');
	data=data.replace(/(^|[^A-Za-z])(>tarnished coast<)(?=[^A-Za-z]|$)/gi, '$1>灰暗海岸<');
	data=data.replace(/(^|[^A-Za-z])(>the desolation<)(?=[^A-Za-z]|$)/gi, '$1>硫磺地带<');
	data=data.replace(/(^|[^A-Za-z])(>charr homelands<)(?=[^A-Za-z]|$)/gi, '$1>夏尔故乡<');
	data=data.replace(/(^|[^A-Za-z])(>istan<)(?=[^A-Za-z]|$)/gi, '$1>艾斯坦<');
    
    //旅行者 相关语句，含材料，城镇，及敌人名称 
    data=data.replace(/(^|[^A-Za-z])(>Ice Tooth CaveS*?<)(?=[^A-Za-z]|$)/gi, '$1>冰牙洞穴<');
    data=data.replace(/(^|[^A-Za-z])(>Anvil RockS*?<)(?=[^A-Za-z]|$)/gi, '$1>铁砧石<');
    data=data.replace(/(^|[^A-Za-z])(>Frostfire DryderS*?<)(?=[^A-Za-z]|$)/gi, '$1>霜火蛛化精灵<');
    data=data.replace(/(^|[^A-Za-z])(>Frostfire FangS*?<)(?=[^A-Za-z]|$)/gi, '$1>霜火尖牙<');
	data=data.replace(/(^|[^A-Za-z])(>Boreas SeabedS*? \(explorable area\)<)(?=[^A-Za-z]|$)/gi, '$1>风神海床 (探索区)<');
    data=data.replace(/(^|[^A-Za-z])(>Boreas SeabedS*?<)(?=[^A-Za-z]|$)/gi, '$1>风神海床<');
    data=data.replace(/(^|[^A-Za-z])(>Pongmei ValleyS*?<)(?=[^A-Za-z]|$)/gi, '$1>朋美谷<');
    data=data.replace(/(^|[^A-Za-z])(>Rot Wallow TuskS*?<)(?=[^A-Za-z]|$)/gi, '$1>腐败兽獠牙<');
    data=data.replace(/(^|[^A-Za-z])(>Rot WallowS*?<)(?=[^A-Za-z]|$)/gi, '$1>腐败兽<');
    data=data.replace(/(^|[^A-Za-z])(>Elona Reach<)(?=[^A-Za-z]|$)/gi, '$1>伊洛那流域<');
    data=data.replace(/(^|[^A-Za-z])(>Diviner's Ascent<)(?=[^A-Za-z]|$)/gi, '$1>预言者之坡<');
    data=data.replace(/(^|[^A-Za-z])(>Sand DrakeS*?<)(?=[^A-Za-z]|$)/gi, '$1>沙龙兽<');
    data=data.replace(/(^|[^A-Za-z])(>Topaz CrestS*?<)(?=[^A-Za-z]|$)/gi, '$1>黄宝石颈脊<');
    data=data.replace(/(^|[^A-Za-z])(>Rata Sum<)(?=[^A-Za-z]|$)/gi, '$1>洛达顶点<');
    data=data.replace(/(^|[^A-Za-z])(>Magus Stones<)(?=[^A-Za-z]|$)/gi, '$1>玛古斯之石<');
    data=data.replace(/(^|[^A-Za-z])(>LifeweaverS*?<)(?=[^A-Za-z]|$)/gi, '$1>织命者<');
    data=data.replace(/(^|[^A-Za-z])(>BloodweaverS*?<)(?=[^A-Za-z]|$)/gi, '$1>织血者<');
    data=data.replace(/(^|[^A-Za-z])(>VenomweaverS*?<)(?=[^A-Za-z]|$)/gi, '$1>织恨者<');
    data=data.replace(/(^|[^A-Za-z])(>SpiderS*?<)(?=[^A-Za-z]|$)/gi, '$1>蜘蛛<');
    data=data.replace(/(^|[^A-Za-z])(>Weaver LegS*?<)(?=[^A-Za-z]|$)/gi, '$1>编织者的腿<');
    data=data.replace(/(^|[^A-Za-z])(>Yahnur MarketS*?<)(?=[^A-Za-z]|$)/gi, '$1>雅诺尔市集<');
    data=data.replace(/(^|[^A-Za-z])(>Vehtendi Valley<)(?=[^A-Za-z]|$)/gi, '$1>巍天帝峡谷<');
    data=data.replace(/(^|[^A-Za-z])(>Storm JacarandaS*?<)(?=[^A-Za-z]|$)/gi, '$1>暴风荆棘<');
    data=data.replace(/(^|[^A-Za-z])(>Mirage IbogaS*?<)(?=[^A-Za-z]|$)/gi, '$1>幻象伊波枷<');
    data=data.replace(/(^|[^A-Za-z])(>Enchanted Brambles<)(?=[^A-Za-z]|$)/gi, '$1>魔法树根<');
    data=data.replace(/(^|[^A-Za-z])(>Whistling ThornbrushS*?<)(?=[^A-Za-z]|$)/gi, '$1>荆棘之藤<');
    data=data.replace(/(^|[^A-Za-z])(>Sentient SporeS*?<)(?=[^A-Za-z]|$)/gi, '$1>知觉孢子<');
    data=data.replace(/(^|[^A-Za-z])(>AhojS*?<)(?=[^A-Za-z]|$)/gi, '$1>亚禾<');
    data=data.replace(/(^|[^A-Za-z])(>Bottle of Vabbian WineS*?<)(?=[^A-Za-z]|$)/gi, '$1>瓦贝红酒<');
    data=data.replace(/(^|[^A-Za-z])(>Jarimiya the Unmerciful<)(?=[^A-Za-z]|$)/gi, '$1>残酷 贾米里<');
    data=data.replace(/(^|[^A-Za-z])(>Blacktide Den<)(?=[^A-Za-z]|$)/gi, '$1>黑潮之穴<');
    data=data.replace(/(^|[^A-Za-z])(>Lahtenda Bog<)(?=[^A-Za-z]|$)/gi, '$1>洛天帝沼泽<');
    data=data.replace(/(^|[^A-Za-z])(>Mandragor ImpS*?<)(?=[^A-Za-z]|$)/gi, '$1>曼陀罗恶魔<');
    data=data.replace(/(^|[^A-Za-z])(>Mandragor SlitherS*?<)(?=[^A-Za-z]|$)/gi, '$1>曼陀罗之藤<');
    data=data.replace(/(^|[^A-Za-z])(>Stoneflesh MandragorS*?<)(?=[^A-Za-z]|$)/gi, '$1>曼陀罗石根<');
    data=data.replace(/(^|[^A-Za-z])(>Mandragor SwamprootS*?<)(?=[^A-Za-z]|$)/gi, '$1>曼陀罗根<');
    data=data.replace(/(^|[^A-Za-z])(>Vasburg Armory<)(?=[^A-Za-z]|$)/gi, '$1>维思柏兵营<');
	data=data.replace(/(^|[^A-Za-z])(>The Eternal GroveS*? \(explorable area\)<)(?=[^A-Za-z]|$)/gi, '$1>永恒之林 (探索区)<');
    data=data.replace(/(^|[^A-Za-z])(>The Eternal Grove<)(?=[^A-Za-z]|$)/gi, '$1>永恒之林<');
    data=data.replace(/(^|[^A-Za-z])(>Skill Hungry GakiS*?<)(?=[^A-Za-z]|$)/gi, '$1>灵巧的饿鬼<');
    data=data.replace(/(^|[^A-Za-z])(>Pain Hungry GakiS*?<)(?=[^A-Za-z]|$)/gi, '$1>痛苦的饿鬼<');
    data=data.replace(/(^|[^A-Za-z])(>The Time EaterS*?<)(?=[^A-Za-z]|$)/gi, '$1>时间吞噬者<');
    data=data.replace(/(^|[^A-Za-z])(>The Scar EaterS*?<)(?=[^A-Za-z]|$)/gi, '$1>疤痕吞噬者<');
    data=data.replace(/(^|[^A-Za-z])(>Quarrel Falls<)(?=[^A-Za-z]|$)/gi, '$1>怨言瀑布<');
    data=data.replace(/(^|[^A-Za-z])(>SilverwoodS*?<)(?=[^A-Za-z]|$)/gi, '$1>银树<');
    data=data.replace(/(^|[^A-Za-z])(>Maguuma WarriorS*?<)(?=[^A-Za-z]|$)/gi, '$1>梅古玛战士<');
    data=data.replace(/(^|[^A-Za-z])(>Maguuma HunterS*?<)(?=[^A-Za-z]|$)/gi, '$1>梅古玛猎人<');
    data=data.replace(/(^|[^A-Za-z])(>Maguuma ProtectorS*?<)(?=[^A-Za-z]|$)/gi, '$1>梅古玛守护者<');
    data=data.replace(/(^|[^A-Za-z])(>Maguuma ManeS*?<)(?=[^A-Za-z]|$)/gi, '$1>梅古玛鬃毛<');
    data=data.replace(/(^|[^A-Za-z])(>Seeker's PassageS*?<)(?=[^A-Za-z]|$)/gi, '$1>探索者通道<');
    data=data.replace(/(^|[^A-Za-z])(>Salt FlatsS*?<)(?=[^A-Za-z]|$)/gi, '$1>盐滩<');
    data=data.replace(/(^|[^A-Za-z])(>The Amnoon OasisS*?<)(?=[^A-Za-z]|$)/gi, '$1>安奴绿洲<');
    data=data.replace(/(^|[^A-Za-z])(>Prophet's PathS*?<)(?=[^A-Za-z]|$)/gi, '$1>先知之路<');
    data=data.replace(/(^|[^A-Za-z])(>Jade ScarabS*?<)(?=[^A-Za-z]|$)/gi, '$1>翡翠圣甲虫<');
    data=data.replace(/(^|[^A-Za-z])(>Jade MandibleS*?<)(?=[^A-Za-z]|$)/gi, '$1>翡翠下颚骨<');
    data=data.replace(/(^|[^A-Za-z])(>Temple of the AgesS*?<)(?=[^A-Za-z]|$)/gi, '$1>世纪神殿<');
    data=data.replace(/(^|[^A-Za-z])(>Sunjiang DistrictS*? \(explorable area\)<)(?=[^A-Za-z]|$)/gi, '$1>孙江行政区 (探索区)<');
    data=data.replace(/(^|[^A-Za-z])(>Sunjiang DistrictS*?<)(?=[^A-Za-z]|$)/gi, '$1>孙江行政区<');
    data=data.replace(/(^|[^A-Za-z])(>Shenzun TunnelsS*?<)(?=[^A-Za-z]|$)/gi, '$1>申赞通道<');
    data=data.replace(/(^|[^A-Za-z])(>AfflictedS*?<)(?=[^A-Za-z]|$)/gi, '$1>被感染的<');
    data=data.replace(/(^|[^A-Za-z])(>Putrid CystS*?<)(?=[^A-Za-z]|$)/gi, '$1>腐败胞囊<');
    data=data.replace(/(^|[^A-Za-z])(>Temple of the AgesS*?<)(?=[^A-Za-z]|$)/gi, '$1>世纪神殿<');
    data=data.replace(/(^|[^A-Za-z])(>The Black CurtainS*?<)(?=[^A-Za-z]|$)/gi, '$1>黑色帷幕<');
    data=data.replace(/(^|[^A-Za-z])(>Kessex PeakS*?<)(?=[^A-Za-z]|$)/gi, '$1>凯席斯山峰<');
    data=data.replace(/(^|[^A-Za-z])(>Talmark WildernessS*?<)(?=[^A-Za-z]|$)/gi, '$1>突马克荒地<');
    data=data.replace(/(^|[^A-Za-z])(>Forest MinotaurS*?<)(?=[^A-Za-z]|$)/gi, '$1>森林牛头怪<');
    data=data.replace(/(^|[^A-Za-z])(>Forest Minotaur HornS*?<)(?=[^A-Za-z]|$)/gi, '$1>森林牛头怪的角<');
    data=data.replace(/(^|[^A-Za-z])(>The AstralariumS*?<)(?=[^A-Za-z]|$)/gi, '$1>亚斯特拉利姆<');
    data=data.replace(/(^|[^A-Za-z])(>Zehlon ReachS*?<)(?=[^A-Za-z]|$)/gi, '$1>列隆流域<');
    data=data.replace(/(^|[^A-Za-z])(>Beknur HarborS*?<)(?=[^A-Za-z]|$)/gi, '$1>别克诺港<');
    data=data.replace(/(^|[^A-Za-z])(>Issnur IslesS*?<)(?=[^A-Za-z]|$)/gi, '$1>伊斯诺岛<');
    data=data.replace(/(^|[^A-Za-z])(>Skale BlighterS*?<)(?=[^A-Za-z]|$)/gi, '$1>黑暗鳞怪<');
    data=data.replace(/(^|[^A-Za-z])(>Frigid SkaleS*?<)(?=[^A-Za-z]|$)/gi, '$1>寒冰鳞怪<');
    data=data.replace(/(^|[^A-Za-z])(>Ridgeback SkaleS*?<)(?=[^A-Za-z]|$)/gi, '$1>脊背鳞怪<');
    data=data.replace(/(^|[^A-Za-z])(>Skale FinS*?<)(?=[^A-Za-z]|$)/gi, '$1>鳞怪鳍<');
    data=data.replace(/(^|[^A-Za-z])(>Chef PanjohS*?<)(?=[^A-Za-z]|$)/gi, '$1>大厨 潘乔<');
    data=data.replace(/(^|[^A-Za-z])(>Bowl of Skalefin SoupS*?<)(?=[^A-Za-z]|$)/gi, '$1>鳞怪鳍汤<');
    data=data.replace(/(^|[^A-Za-z])(>Sage LandsS*?<)(?=[^A-Za-z]|$)/gi, '$1>荒原<');
    data=data.replace(/(^|[^A-Za-z])(>Mamnoon LagoonS*?<)(?=[^A-Za-z]|$)/gi, '$1>玛奴泻湖<');
    data=data.replace(/(^|[^A-Za-z])(>Henge of DenraviS*?<)(?=[^A-Za-z]|$)/gi, '$1>丹拉维圣地<');
    data=data.replace(/(^|[^A-Za-z])(>Tangle RootS*?<)(?=[^A-Za-z]|$)/gi, '$1>纠结之根<');
    data=data.replace(/(^|[^A-Za-z])(>Dry TopS*?<)(?=[^A-Za-z]|$)/gi, '$1>干燥高地<');
    data=data.replace(/(^|[^A-Za-z])(>Root BehemothS*?<)(?=[^A-Za-z]|$)/gi, '$1>根巨兽<');
    data=data.replace(/(^|[^A-Za-z])(>Behemoth JawS*?<)(?=[^A-Za-z]|$)/gi, '$1>巨兽颚<');
    data=data.replace(/(^|[^A-Za-z])(>SifhallaS*?<)(?=[^A-Za-z]|$)/gi, '$1>袭哈拉<');
    data=data.replace(/(^|[^A-Za-z])(>Jaga MoraineS*?<)(?=[^A-Za-z]|$)/gi, '$1>亚加摩瑞恩<');
    data=data.replace(/(^|[^A-Za-z])(>Berserking BisonS*?<)(?=[^A-Za-z]|$)/gi, '$1>海冶克狂战士<');
    data=data.replace(/(^|[^A-Za-z])(>Berserking MinotaurS*?<)(?=[^A-Za-z]|$)/gi, '$1>牛头怪狂战士<');
    data=data.replace(/(^|[^A-Za-z])(>Berserking WendigoS*?<)(?=[^A-Za-z]|$)/gi, '$1>狂战士 纹帝哥<');
    data=data.replace(/(^|[^A-Za-z])(>Berserking AurochsS*?<)(?=[^A-Za-z]|$)/gi, '$1>棘狼狂战士<');
    data=data.replace(/(^|[^A-Za-z])(>Berserker HornS*?<)(?=[^A-Za-z]|$)/gi, '$1>狂战士的角<');
    data=data.replace(/(^|[^A-Za-z])(>Brauer AcademyS*?<)(?=[^A-Za-z]|$)/gi, '$1>巴尔学院<');
    data=data.replace(/(^|[^A-Za-z])(>Drazach ThicketS*?<)(?=[^A-Za-z]|$)/gi, '$1>德瑞扎灌木林<');
    data=data.replace(/(^|[^A-Za-z])(>Tanglewood CopseS*?<)(?=[^A-Za-z]|$)/gi, '$1>谭格坞树林<');
    data=data.replace(/(^|[^A-Za-z])(>Pongmei ValleyS*?<)(?=[^A-Za-z]|$)/gi, '$1>朋美谷<');
    data=data.replace(/(^|[^A-Za-z])(>UndergrowthS*?<)(?=[^A-Za-z]|$)/gi, '$1>矮树丛<');
    data=data.replace(/(^|[^A-Za-z])(>Dragon MossS*?<)(?=[^A-Za-z]|$)/gi, '$1>龙苔<');
    data=data.replace(/(^|[^A-Za-z])(>Dragon RootS*?<)(?=[^A-Za-z]|$)/gi, '$1>龙根<');
    data=data.replace(/(^|[^A-Za-z])(>Fishermen's HavenS*?<)(?=[^A-Za-z]|$)/gi, '$1>渔人避风港<');
    data=data.replace(/(^|[^A-Za-z])(>Stingray StrandS*?<)(?=[^A-Za-z]|$)/gi, '$1>魟鱼湖滨<');
    data=data.replace(/(^|[^A-Za-z])(>Tears of the FallenS*?<)(?=[^A-Za-z]|$)/gi, '$1>战死者之泪<');
    data=data.replace(/(^|[^A-Za-z])(>Grand DrakeS*?<)(?=[^A-Za-z]|$)/gi, '$1>强龙兽<');
    data=data.replace(/(^|[^A-Za-z])(>Sanctum CayS*?<)(?=[^A-Za-z]|$)/gi, '$1>神圣沙滩<');
    data=data.replace(/(^|[^A-Za-z])(>Lightning DrakeS*?<)(?=[^A-Za-z]|$)/gi, '$1>闪光龙兽<');
    data=data.replace(/(^|[^A-Za-z])(>Spiked CrestS*?<)(?=[^A-Za-z]|$)/gi, '$1>尖刺的颈脊<');
    data=data.replace(/(^|[^A-Za-z])(>Imperial SanctumS*?<)(?=[^A-Za-z]|$)/gi, '$1>帝国圣所<');
	data=data.replace(/(^|[^A-Za-z])(>Raisu PalaceS*? \(explorable area\)<)(?=[^A-Za-z]|$)/gi, '$1>莱苏皇宫 (探索区)<');
    data=data.replace(/(^|[^A-Za-z])(>Raisu PalaceS*?<)(?=[^A-Za-z]|$)/gi, '$1>莱苏皇宫<');
    data=data.replace(/(^|[^A-Za-z])(>Soul StoneS*?<)(?=[^A-Za-z]|$)/gi, '$1>灵魂石<');
    data=data.replace(/(^|[^A-Za-z])(>Tihark OrchardS*?<)(?=[^A-Za-z]|$)/gi, '$1>提亚克林地<');
    data=data.replace(/(^|[^A-Za-z])(>Forum HighlandsS*?<)(?=[^A-Za-z]|$)/gi, '$1>高地广场<');
    data=data.replace(/(^|[^A-Za-z])(>Skree WingS*?<)(?=[^A-Za-z]|$)/gi, '$1>鸟妖翅膀<');
    data=data.replace(/(^|[^A-Za-z])(>SkreeS*?<)(?=[^A-Za-z]|$)/gi, '$1>鸟妖<');
    data=data.replace(/(^|[^A-Za-z])(>Serenity TempleS*?<)(?=[^A-Za-z]|$)/gi, '$1>宁静神殿<');
    data=data.replace(/(^|[^A-Za-z])(>Pockmark FlatsS*?<)(?=[^A-Za-z]|$)/gi, '$1>麻点平原<');
    data=data.replace(/(^|[^A-Za-z])(>Storm RiderS*?<)(?=[^A-Za-z]|$)/gi, '$1>暴风驾驭者<');
    data=data.replace(/(^|[^A-Za-z])(>Stormy EyeS*?<)(?=[^A-Za-z]|$)/gi, '$1>暴风之眼<');
    data=data.replace(/(^|[^A-Za-z])(>Gates of KrytaS*?<)(?=[^A-Za-z]|$)/gi, '$1>科瑞塔之门<');
    data=data.replace(/(^|[^A-Za-z])(>Scoundrel's RiseS*?<)(?=[^A-Za-z]|$)/gi, '$1>恶汉山丘<');
    data=data.replace(/(^|[^A-Za-z])(>Griffon's MouthS*?<)(?=[^A-Za-z]|$)/gi, '$1>狮鹭兽隘口<');
    data=data.replace(/(^|[^A-Za-z])(>Spiritwood PlankS*?<)(?=[^A-Za-z]|$)/gi, '$1>心灵之板<');
    data=data.replace(/(^|[^A-Za-z])(>Tsumei VillageS*?<)(?=[^A-Za-z]|$)/gi, '$1>苏梅村<');
    data=data.replace(/(^|[^A-Za-z])(>Panjiang PeninsulaS*?<)(?=[^A-Za-z]|$)/gi, '$1>班让半岛<');
    data=data.replace(/(^|[^A-Za-z])(>Naga HideS*?<)(?=[^A-Za-z]|$)/gi, '$1>纳迦皮<');
    data=data.replace(/(^|[^A-Za-z])(>NagaS*?<)(?=[^A-Za-z]|$)/gi, '$1>纳迦<');
    data=data.replace(/(^|[^A-Za-z])(>SifhallaS*?<)(?=[^A-Za-z]|$)/gi, '$1>袭哈拉<');
    data=data.replace(/(^|[^A-Za-z])(>Drakkar LakeS*?<)(?=[^A-Za-z]|$)/gi, '$1>卓卡湖<');
    data=data.replace(/(^|[^A-Za-z])(>Frozen ElementalS*?<)(?=[^A-Za-z]|$)/gi, '$1>冰元素<');
    data=data.replace(/(^|[^A-Za-z])(>Piles*? of Elemental DustS*?<)(?=[^A-Za-z]|$)/gi, '$1>元素之土<');
    //data=data.replace(/(^|[^A-Za-z])(>Leviathan PitsS*?<)(?=[^A-Za-z]|$)/gi, '$1>卑尔根温泉<');
    //data=data.replace(/(^|[^A-Za-z])(>Silent SurfS*?<)(?=[^A-Za-z]|$)/gi, '$1>尼伯山丘<');
    //data=data.replace(/(^|[^A-Za-z])(>OniS*?<)(?=[^A-Za-z]|$)/gi, '$1>柯瑞塔北部<');
    //data=data.replace(/(^|[^A-Za-z])(>Keen Oni TalonS*?<)(?=[^A-Za-z]|$)/gi, '$1>硬瘤<');
    data=data.replace(/(^|[^A-Za-z])(>Leviathan PitsS*?<)(?=[^A-Za-z]|$)/gi, '$1>利拜亚森矿场<');
    data=data.replace(/(^|[^A-Za-z])(>Silent SurfS*?<)(?=[^A-Za-z]|$)/gi, '$1>寂静之浪<');
    data=data.replace(/(^|[^A-Za-z])(>Seafarer's RestS*?<)(?=[^A-Za-z]|$)/gi, '$1>航海者休憩处<');
    data=data.replace(/(^|[^A-Za-z])(>OniS*?<)(?=[^A-Za-z]|$)/gi, '$1>鬼<');
    data=data.replace(/(^|[^A-Za-z])(>Keen Oni TalonS*?<)(?=[^A-Za-z]|$)/gi, '$1>鬼爪<');
    data=data.replace(/(^|[^A-Za-z])(>Ice Caves of SorrowS*?<)(?=[^A-Za-z]|$)/gi, '$1>悲伤冰谷<');
    data=data.replace(/(^|[^A-Za-z])(>IcedomeS*?<)(?=[^A-Za-z]|$)/gi, '$1>冰顶<');
    data=data.replace(/(^|[^A-Za-z])(>Siege Ice GolemS*?<)(?=[^A-Za-z]|$)/gi, '$1>攻城冰高仑<');
    data=data.replace(/(^|[^A-Za-z])(>Icy LodestoneS*?<)(?=[^A-Za-z]|$)/gi, '$1>冰磁石<');
    data=data.replace(/(^|[^A-Za-z])(>Augury RockS*?<)(?=[^A-Za-z]|$)/gi, '$1>占卜之石<');
    data=data.replace(/(^|[^A-Za-z])(>Skyward ReachS*?<)(?=[^A-Za-z]|$)/gi, '$1>天际流域<');
    data=data.replace(/(^|[^A-Za-z])(>Destiny's GorgeS*?<)(?=[^A-Za-z]|$)/gi, '$1>命运峡谷<');
    data=data.replace(/(^|[^A-Za-z])(>Prophet's PathS*?<)(?=[^A-Za-z]|$)/gi, '$1>探索者通道/先知通道<');
    data=data.replace(/(^|[^A-Za-z])(>Salt FlatsS*?<)(?=[^A-Za-z]|$)/gi, '$1>盐滩<');
    data=data.replace(/(^|[^A-Za-z])(>Storm KinS*?<)(?=[^A-Za-z]|$)/gi, '$1>风暴魔<');
    data=data.replace(/(^|[^A-Za-z])(>Shriveled EyeS*?<)(?=[^A-Za-z]|$)/gi, '$1>干枯的眼睛<');
    data=data.replace(/(^|[^A-Za-z])(>Camp HojanuS*?<)(?=[^A-Za-z]|$)/gi, '$1>何加努营地<');
    data=data.replace(/(^|[^A-Za-z])(>Barbarous ShoreS*?<)(?=[^A-Za-z]|$)/gi, '$1>野蛮河岸<');
    data=data.replace(/(^|[^A-Za-z])(>CorsairS*?<)(?=[^A-Za-z]|$)/gi, '$1>海盗<');
    data=data.replace(/(^|[^A-Za-z])(>Gold DoubloonS*?<)(?=[^A-Za-z]|$)/gi, '$1>金古币<');
    data=data.replace(/(^|[^A-Za-z])(>Dragon's ThroatS*?<)(?=[^A-Za-z]|$)/gi, '$1>龙喉<');
    data=data.replace(/(^|[^A-Za-z])(>Shadow's PassageS*?<)(?=[^A-Za-z]|$)/gi, '$1>阴暗通道<');
    data=data.replace(/(^|[^A-Za-z])(>rare material traderS*?<)(?=[^A-Za-z]|$)/gi, '$1>稀有材料商<');
    data=data.replace(/(^|[^A-Za-z])(>Luxon factionS*?<)(?=[^A-Za-z]|$)/gi, '$1>勒克森荣誉值<');
    data=data.replace(/(^|[^A-Za-z])(>Jadeite ShardS*?<)(?=[^A-Za-z]|$)/gi, '$1>硬玉<');
    data=data.replace(/(^|[^A-Za-z])(>Port SledgeS*?<)(?=[^A-Za-z]|$)/gi, '$1>雪橇港<');
    data=data.replace(/(^|[^A-Za-z])(>Witman's FollyS*?<)(?=[^A-Za-z]|$)/gi, '$1>威特曼的怪异建筑<');
    data=data.replace(/(^|[^A-Za-z])(>GrawlS*?<)(?=[^A-Za-z]|$)/gi, '$1>穴居人<');
    data=data.replace(/(^|[^A-Za-z])(>Grawl CroneS*?<)(?=[^A-Za-z]|$)/gi, '$1>穴居人巫婆<');
    data=data.replace(/(^|[^A-Za-z])(>Intricate Grawl NecklaceS*?<)(?=[^A-Za-z]|$)/gi, '$1>精细的穴居人项链<');
    data=data.replace(/(^|[^A-Za-z])(>The Mouth of TormentS*?<)(?=[^A-Za-z]|$)/gi, '$1>苦痛之地隘口<');
    data=data.replace(/(^|[^A-Za-z])(>Crystal OverlookS*?<)(?=[^A-Za-z]|$)/gi, '$1>水晶高地<');
    data=data.replace(/(^|[^A-Za-z])(>Ruins of MorahS*?<)(?=[^A-Za-z]|$)/gi, '$1>摩拉废墟<');
    data=data.replace(/(^|[^A-Za-z])(>Mandragor Sand DevilS*?<)(?=[^A-Za-z]|$)/gi, '$1>曼陀罗沙恶魔<');
    data=data.replace(/(^|[^A-Za-z])(>Mandragor TerrorS*?<)(?=[^A-Za-z]|$)/gi, '$1>惊骇曼陀罗<');
    data=data.replace(/(^|[^A-Za-z])(>Ravenous MandragorS*?<)(?=[^A-Za-z]|$)/gi, '$1>曼陀罗贪婪者<');
    data=data.replace(/(^|[^A-Za-z])(>Luminous StoneS*?<)(?=[^A-Za-z]|$)/gi, '$1>发亮的石头<');
    data=data.replace(/(^|[^A-Za-z])(>Dzagonur BastionS*?<)(?=[^A-Za-z]|$)/gi, '$1>萨岗诺棱堡<');
    data=data.replace(/(^|[^A-Za-z])(>Wilderness of BahdzaS*?<)(?=[^A-Za-z]|$)/gi, '$1>巴萨荒野<');
    data=data.replace(/(^|[^A-Za-z])(>Behemoth GravebaneS*?<)(?=[^A-Za-z]|$)/gi, '$1>剧毒巨兽<');
    data=data.replace(/(^|[^A-Za-z])(>Scytheclaw BehemothS*?<)(?=[^A-Za-z]|$)/gi, '$1>镰刀爪巨兽<');
    data=data.replace(/(^|[^A-Za-z])(>Behemoth HideS*?<)(?=[^A-Za-z]|$)/gi, '$1>巨兽皮革<');
    data=data.replace(/(^|[^A-Za-z])(>Rata SumS*?<)(?=[^A-Za-z]|$)/gi, '$1>洛达顶点<');
    data=data.replace(/(^|[^A-Za-z])(>Riven EarthS*?<)(?=[^A-Za-z]|$)/gi, '$1>撕裂大地<');
    data=data.replace(/(^|[^A-Za-z])(>RaptorS*?<)(?=[^A-Za-z]|$)/gi, '$1>毒瑞克斯<');
    data=data.replace(/(^|[^A-Za-z])(>AngorodonS*?<)(?=[^A-Za-z]|$)/gi, '$1>安哥罗顿<');
    data=data.replace(/(^|[^A-Za-z])(>Saurian BoneS*?<)(?=[^A-Za-z]|$)/gi, '$1>蜥蜴骨头<');
    data=data.replace(/(^|[^A-Za-z])(>Sanctum CayS*?<)(?=[^A-Za-z]|$)/gi, '$1>神圣沙滩<');
    data=data.replace(/(^|[^A-Za-z])(>Stingray StrandS*?<)(?=[^A-Za-z]|$)/gi, '$1>魟鱼湖滨<');
    data=data.replace(/(^|[^A-Za-z])(>Fishermen's HavenS*?<)(?=[^A-Za-z]|$)/gi, '$1>渔人避风港<');
    data=data.replace(/(^|[^A-Za-z])(>Talmark WildernessS*?<)(?=[^A-Za-z]|$)/gi, '$1>突马克荒地<');
    data=data.replace(/(^|[^A-Za-z])(>Inferno ImpS*?|FIRE IMPS*?<)(?=[^A-Za-z]|$)/gi, '$1>地狱小恶魔<');
    data=data.replace(/(^|[^A-Za-z])(>Glowing HeartS*?<)(?=[^A-Za-z]|$)/gi, '$1>灼热的心脏<');
    data=data.replace(/(^|[^A-Za-z])(>House zu HeltzerS*?<)(?=[^A-Za-z]|$)/gi, '$1>凤核议院<');
    data=data.replace(/(^|[^A-Za-z])(>FerndaleS*?<)(?=[^A-Za-z]|$)/gi, '$1>厥谷<');
    data=data.replace(/(^|[^A-Za-z])(>Rare crafting materialS*?<)(?=[^A-Za-z]|$)/gi, '$1>稀有材料<');
    data=data.replace(/(^|[^A-Za-z])(>Amber ChunkS*?<)(?=[^A-Za-z]|$)/gi, '$1>琥珀<');
    data=data.replace(/(^|[^A-Za-z])(>Kurzick BureaucratS*?<)(?=[^A-Za-z]|$)/gi, '$1>库兹柯理事<');
    data=data.replace(/(^|[^A-Za-z])(>Kodlonu HamletS*?<)(?=[^A-Za-z]|$)/gi, '$1>克拓奴‧哈姆雷特<');
    data=data.replace(/(^|[^A-Za-z])(>Issnur IslesS*?<)(?=[^A-Za-z]|$)/gi, '$1>伊斯诺岛<');
    data=data.replace(/(^|[^A-Za-z])(>Irontooth DrakeS*?<)(?=[^A-Za-z]|$)/gi, '$1>钢牙龙兽<');
    data=data.replace(/(^|[^A-Za-z])(>Rilohn RefugeS*?<)(?=[^A-Za-z]|$)/gi, '$1>里欧恩难民营<');
    data=data.replace(/(^|[^A-Za-z])(>Steelfang DrakeS*?<)(?=[^A-Za-z]|$)/gi, '$1>硬甲龙兽<');
    data=data.replace(/(^|[^A-Za-z])(>Chunk of Drake FleshS*?<)(?=[^A-Za-z]|$)/gi, '$1>大块龙兽肉<');
    data=data.replace(/(^|[^A-Za-z])(>Chef LonbahnS*?<)(?=[^A-Za-z]|$)/gi, '$1>大厨 萝韩<');
    data=data.replace(/(^|[^A-Za-z])(>Drake KabobS*?<)(?=[^A-Za-z]|$)/gi, '$1>烤龙兽肉<');
    data=data.replace(/(^|[^A-Za-z])(>Beacon's PerchS*?<)(?=[^A-Za-z]|$)/gi, '$1>毕肯高地<');
    data=data.replace(/(^|[^A-Za-z])(>Lornar's PassS*?<)(?=[^A-Za-z]|$)/gi, '$1>洛拿斯通道<');
    data=data.replace(/(^|[^A-Za-z])(>Tomb of the Primeval KingsS*?<)(?=[^A-Za-z]|$)/gi, '$1>先王之墓<');
    data=data.replace(/(^|[^A-Za-z])(>Banished Dream RiderS*?<)(?=[^A-Za-z]|$)/gi, '$1>被放逐的梦想骑士<');
    data=data.replace(/(^|[^A-Za-z])(>Phantom ResidueS*?<)(?=[^A-Za-z]|$)/gi, '$1>幻影残留物<');
    //data=data.replace(/(^|[^A-Za-z])(>Zos Shivros ChannelS*?<)(?=[^A-Za-z]|$)/gi, '$1>山吉之街<');
    data=data.replace(/(^|[^A-Za-z])(>Nahpui QuarterS*? \(explorable area\)<)(?=[^A-Za-z]|$)/gi, '$1>纳普区 (探索区)<');
    data=data.replace(/(^|[^A-Za-z])(>Nahpui QuarterS*?<)(?=[^A-Za-z]|$)/gi, '$1>纳普区<');
    data=data.replace(/(^|[^A-Za-z])(>Essence of DragonS*?<)(?=[^A-Za-z]|$)/gi, '$1>龙之质体<');
    data=data.replace(/(^|[^A-Za-z])(>Essence of KirinS*?<)(?=[^A-Za-z]|$)/gi, '$1>麒麟之质体<');
    data=data.replace(/(^|[^A-Za-z])(>Essence of PhoenixS*?<)(?=[^A-Za-z]|$)/gi, '$1>凤之质体<');
    data=data.replace(/(^|[^A-Za-z])(>Essence of TurtleS*?<)(?=[^A-Za-z]|$)/gi, '$1>龟之质体<');
    data=data.replace(/(^|[^A-Za-z])(>Celestial EssenceS*?<)(?=[^A-Za-z]|$)/gi, '$1>天神质体<');
    data=data.replace(/(^|[^A-Za-z])(>The Granite CitadelS*?<)(?=[^A-Za-z]|$)/gi, '$1>花岗岩堡垒<');
    data=data.replace(/(^|[^A-Za-z])(>Spearhead PeakS*?<)(?=[^A-Za-z]|$)/gi, '$1>尖枪山<');
    data=data.replace(/(^|[^A-Za-z])(>Ice ImpS*?<)(?=[^A-Za-z]|$)/gi, '$1>冰小恶魔<');
    data=data.replace(/(^|[^A-Za-z])(>Frigid HeartS*?<)(?=[^A-Za-z]|$)/gi, '$1>冰冻的心脏<');
    data=data.replace(/(^|[^A-Za-z])(>Thirsty RiverS*?<)(?=[^A-Za-z]|$)/gi, '$1>干枯河流<');
    data=data.replace(/(^|[^A-Za-z])(>The ScarS*?<)(?=[^A-Za-z]|$)/gi, '$1>断崖<');
    data=data.replace(/(^|[^A-Za-z])(>Destiny's GorgeS*?<)(?=[^A-Za-z]|$)/gi, '$1>命运峡谷<');
    data=data.replace(/(^|[^A-Za-z])(>Augury RockS*?<)(?=[^A-Za-z]|$)/gi, '$1>占卜之石<');
    data=data.replace(/(^|[^A-Za-z])(>Skyward ReachS*?<)(?=[^A-Za-z]|$)/gi, '$1>天际流域<');
    data=data.replace(/(^|[^A-Za-z])(>HydraS*?<)(?=[^A-Za-z]|$)/gi, '$1>三头龙<');
    data=data.replace(/(^|[^A-Za-z])(>Dessicated Hydra ClawS*?<)(?=[^A-Za-z]|$)/gi, '$1>干燥的三头龙爪<');
    data=data.replace(/(^|[^A-Za-z])(>Umbral GrottoS*?<)(?=[^A-Za-z]|$)/gi, '$1>阴影石穴<');
    data=data.replace(/(^|[^A-Za-z])(>Verdant CascadesS*?<)(?=[^A-Za-z]|$)/gi, '$1>远野瀑布<');
    data=data.replace(/(^|[^A-Za-z])(>Skelk ReaperS*?<)(?=[^A-Za-z]|$)/gi, '$1>司怪收割者<');
    data=data.replace(/(^|[^A-Za-z])(>Skelk ScourgerS*?<)(?=[^A-Za-z]|$)/gi, '$1>司怪严惩者<');
    data=data.replace(/(^|[^A-Za-z])(>Skelk AfflictorS*?<)(?=[^A-Za-z]|$)/gi, '$1>司怪折磨者<');
    data=data.replace(/(^|[^A-Za-z])(>Skelk ClawS*?<)(?=[^A-Za-z]|$)/gi, '$1>司怪爪<');
    data=data.replace(/(^|[^A-Za-z])(>Vasburg ArmoryS*?<)(?=[^A-Za-z]|$)/gi, '$1>维思柏兵营<');
    data=data.replace(/(^|[^A-Za-z])(>Morostav TrailS*?<)(?=[^A-Za-z]|$)/gi, '$1>摩洛神秘通道<');
    data=data.replace(/(^|[^A-Za-z])(>Durheim ArchivesS*?<)(?=[^A-Za-z]|$)/gi, '$1>杜汉姆卷藏室<');
    data=data.replace(/(^|[^A-Za-z])(>Fungal WallowS*?<)(?=[^A-Za-z]|$)/gi, '$1>泥泞兽<');
    data=data.replace(/(^|[^A-Za-z])(>TruffleS*?<)(?=[^A-Za-z]|$)/gi, '$1>松露<');
    data=data.replace(/(^|[^A-Za-z])(>Kodlonu HamletS*?<)(?=[^A-Za-z]|$)/gi, '$1>克拓奴 哈姆雷特<');
    data=data.replace(/(^|[^A-Za-z])(>Mehtani KeysS*?<)(?=[^A-Za-z]|$)/gi, '$1>梅坦尼之钥<');
    data=data.replace(/(^|[^A-Za-z])(>CorsairS*?<)(?=[^A-Za-z]|$)/gi, '$1>海盗<');
    data=data.replace(/(^|[^A-Za-z])(>Silver Bullion CoinS*?<)(?=[^A-Za-z]|$)/gi, '$1>银铸币<');
    data=data.replace(/(^|[^A-Za-z])(>Camp RankorS*?<)(?=[^A-Za-z]|$)/gi, '$1>蓝口营地<');
    data=data.replace(/(^|[^A-Za-z])(>Snake DanceS*?<)(?=[^A-Za-z]|$)/gi, '$1>蛇舞<');
    data=data.replace(/(^|[^A-Za-z])(>Blessed GriffonS*?<)(?=[^A-Za-z]|$)/gi, '$1>被祝福的狮鹫兽<');
    data=data.replace(/(^|[^A-Za-z])(>Frosted Griffon WingS*?<)(?=[^A-Za-z]|$)/gi, '$1>冻结的狮鹫兽翅膀<');
    data=data.replace(/(^|[^A-Za-z])(>Augury RockS*?<)(?=[^A-Za-z]|$)/gi, '$1>占卜之石<');
    data=data.replace(/(^|[^A-Za-z])(>Prophet's PathS*?<)(?=[^A-Za-z]|$)/gi, '$1>先知之路<');
    data=data.replace(/(^|[^A-Za-z])(>Minotaur (Crystal Desert)S*?<)(?=[^A-Za-z]|$)/gi, '$1>牛头怪<');
    data=data.replace(/(^|[^A-Za-z])(>Minotaur HornS*?<)(?=[^A-Za-z]|$)/gi, '$1>牛头怪角<');
    data=data.replace(/(^|[^A-Za-z])(>Zin Ku CorridorS*?<)(?=[^A-Za-z]|$)/gi, '$1>辛库走廊<');
    data=data.replace(/(^|[^A-Za-z])(>Tahnnakai TempleS*? \(explorable area\)<)(?=[^A-Za-z]|$)/gi, '$1>谭纳凯神殿 (探索区)<');
	data=data.replace(/(^|[^A-Za-z])(>Tahnnakai TempleS*?<)(?=[^A-Za-z]|$)/gi, '$1>谭纳凯神殿<');
    data=data.replace(/(^|[^A-Za-z])(>Jade BrotherhoodS*?<)(?=[^A-Za-z]|$)/gi, '$1>翡翠兄弟会<');
    data=data.replace(/(^|[^A-Za-z])(>Jade BraceletS*?<)(?=[^A-Za-z]|$)/gi, '$1>翡翠手镯<');
    data=data.replace(/(^|[^A-Za-z])(>Zen DaijunS*? \(explorable area\)<)(?=[^A-Za-z]|$)/gi, '$1>祯台郡 (探索区)<');
	data=data.replace(/(^|[^A-Za-z])(>Zen DaijunS*?<)(?=[^A-Za-z]|$)/gi, '$1>祯台郡<');
    data=data.replace(/(^|[^A-Za-z])(>Haiju LagoonS*?<)(?=[^A-Za-z]|$)/gi, '$1>海幽泻湖<');
    data=data.replace(/(^|[^A-Za-z])(>Crimson Skull Spirit LordS*?<)(?=[^A-Za-z]|$)/gi, '$1>红颅灵王<');
    data=data.replace(/(^|[^A-Za-z])(>Crimson Skull LongbowS*?<)(?=[^A-Za-z]|$)/gi, '$1>红颅长弓手<');
    data=data.replace(/(^|[^A-Za-z])(>Crimson Skull MentalistS*?<)(?=[^A-Za-z]|$)/gi, '$1>红颅心灵使<');
    data=data.replace(/(^|[^A-Za-z])(>Crimson Skull PriestS*?<)(?=[^A-Za-z]|$)/gi, '$1>红颅祭司<');
    data=data.replace(/(^|[^A-Za-z])(>Gold Crimson Skull CoinS*?<)(?=[^A-Za-z]|$)/gi, '$1>红颅金币<');
    data=data.replace(/(^|[^A-Za-z])(>Mihanu TownshipS*?<)(?=[^A-Za-z]|$)/gi, '$1>米哈努小镇<');
    data=data.replace(/(^|[^A-Za-z])(>Holdings of ChokhinS*?<)(?=[^A-Za-z]|$)/gi, '$1>舟克辛卷藏室<');
    data=data.replace(/(^|[^A-Za-z])(>Bull Trainer GiantS*?<)(?=[^A-Za-z]|$)/gi, '$1>Bull Trainer Giant<');
    data=data.replace(/(^|[^A-Za-z])(>Pillaged GoodsS*?<)(?=[^A-Za-z]|$)/gi, '$1>掠夺的货品<');
    data=data.replace(/(^|[^A-Za-z])(>Lion's ArchS*?<)(?=[^A-Za-z]|$)/gi, '$1>狮子拱门<');
    data=data.replace(/(^|[^A-Za-z])(>North Kryta ProvinceS*?<)(?=[^A-Za-z]|$)/gi, '$1>科瑞塔北部<');
    data=data.replace(/(^|[^A-Za-z])(>Caromi Tengu BraveS*?<)(?=[^A-Za-z]|$)/gi, '$1>卡洛米天狗勇士<');
    data=data.replace(/(^|[^A-Za-z])(>Caromi Tengu WildS*?<)(?=[^A-Za-z]|$)/gi, '$1>卡洛米天狗野人<');
    data=data.replace(/(^|[^A-Za-z])(>Caromi Tengu ScoutS*?<)(?=[^A-Za-z]|$)/gi, '$1>卡洛米天狗射手<');
    data=data.replace(/(^|[^A-Za-z])(>Feathered Caromi ScalpS*?<)(?=[^A-Za-z]|$)/gi, '$1>卡洛米羽毛头皮<');
    data=data.replace(/(^|[^A-Za-z])(>Altrumm RuinsS*?<)(?=[^A-Za-z]|$)/gi, '$1>奥楚兰废墟<');
    data=data.replace(/(^|[^A-Za-z])(>ArborstoneS*? \(explorable area\)<)(?=[^A-Za-z]|$)/gi, '$1>亭石 (探索区)<');
    data=data.replace(/(^|[^A-Za-z])(>ArborstoneS*?<)(?=[^A-Za-z]|$)/gi, '$1>亭石<');
    data=data.replace(/(^|[^A-Za-z])(>Vasburg ArmoryS*?<)(?=[^A-Za-z]|$)/gi, '$1>维思柏兵营<');
    data=data.replace(/(^|[^A-Za-z])(>Morostav TrailS*?<)(?=[^A-Za-z]|$)/gi, '$1>摩洛神秘通道<');
    data=data.replace(/(^|[^A-Za-z])(>Stone ReaperS*?<)(?=[^A-Za-z]|$)/gi, '$1>石之收割者<');
    data=data.replace(/(^|[^A-Za-z])(>Stone RainS*?<)(?=[^A-Za-z]|$)/gi, '$1>石之雨<');
    data=data.replace(/(^|[^A-Za-z])(>Stone SoulS*?<)(?=[^A-Za-z]|$)/gi, '$1>石之灵<');
    data=data.replace(/(^|[^A-Za-z])(>Stone CarvingS*?<)(?=[^A-Za-z]|$)/gi, '$1>石雕品<');
    data=data.replace(/(^|[^A-Za-z])(>Honur HillS*?<)(?=[^A-Za-z]|$)/gi, '$1>霍奴尔丘陵<');
    data=data.replace(/(^|[^A-Za-z])(>Resplendent MakuunS*?<)(?=[^A-Za-z]|$)/gi, '$1>奢华之城．莫肯<');
    data=data.replace(/(^|[^A-Za-z])(>Dasha VestibuleS*?<)(?=[^A-Za-z]|$)/gi, '$1>达沙走廊<');
    data=data.replace(/(^|[^A-Za-z])(>Key of AhdashimS*?<)(?=[^A-Za-z]|$)/gi, '$1>哈达辛之钥<');
    data=data.replace(/(^|[^A-Za-z])(>The Hidden City of AhdashimS*?<)(?=[^A-Za-z]|$)/gi, '$1>隐藏之城．哈达辛<');
    data=data.replace(/(^|[^A-Za-z])(>Sapphire DjinnS*?<)(?=[^A-Za-z]|$)/gi, '$1>蓝宝石巨灵<');
    data=data.replace(/(^|[^A-Za-z])(>Sapphire Djinn EssenceS*?<)(?=[^A-Za-z]|$)/gi, '$1>蓝宝石巨灵精华<');
    data=data.replace(/(^|[^A-Za-z])(>Henge of DenraviS*?<)(?=[^A-Za-z]|$)/gi, '$1>丹拉维圣地<');
    data=data.replace(/(^|[^A-Za-z])(>Tangle RootS*?<)(?=[^A-Za-z]|$)/gi, '$1>纠结之恨<');
    data=data.replace(/(^|[^A-Za-z])(>Jungle TrollS*?<)(?=[^A-Za-z]|$)/gi, '$1>丛林巨魔<');
    data=data.replace(/(^|[^A-Za-z])(>Jungle Troll TuskS*?<)(?=[^A-Za-z]|$)/gi, '$1>丛林巨魔獠牙<');
    data=data.replace(/(^|[^A-Za-z])(>Wehhan TerracesS*?<)(?=[^A-Za-z]|$)/gi, '$1>薇恩平台<');
    data=data.replace(/(^|[^A-Za-z])(>Bahdok CavernsS*?<)(?=[^A-Za-z]|$)/gi, '$1>巴多克洞穴<');
    data=data.replace(/(^|[^A-Za-z])(>Pogahn PassageS*?<)(?=[^A-Za-z]|$)/gi, '$1>波甘驿站<');
    data=data.replace(/(^|[^A-Za-z])(>Dejarin EstateS*?<)(?=[^A-Za-z]|$)/gi, '$1>达贾林庄园<');
    data=data.replace(/(^|[^A-Za-z])(>Cracked MesaS*?<)(?=[^A-Za-z]|$)/gi, '$1>疯狂梅萨<');
    data=data.replace(/(^|[^A-Za-z])(>Stone Shard CragS*?<)(?=[^A-Za-z]|$)/gi, '$1>巨大岩石怪<');
    data=data.replace(/(^|[^A-Za-z])(>Sentient LodestoneS*?<)(?=[^A-Za-z]|$)/gi, '$1>知觉磁石<');
    data=data.replace(/(^|[^A-Za-z])(>Marhan's GrottoS*?<)(?=[^A-Za-z]|$)/gi, '$1>马翰洞穴<');
    data=data.replace(/(^|[^A-Za-z])(>Ice FloeS*?<)(?=[^A-Za-z]|$)/gi, '$1>浮冰<');
    data=data.replace(/(^|[^A-Za-z])(>Thunderhead KeepS*?<)(?=[^A-Za-z]|$)/gi, '$1>雷云要塞<');
    data=data.replace(/(^|[^A-Za-z])(>MursaatS*?<)(?=[^A-Za-z]|$)/gi, '$1>马赛特<');
    data=data.replace(/(^|[^A-Za-z])(>Mursaat TokenS*?<)(?=[^A-Za-z]|$)/gi, '$1>马赛特记号<');
    data=data.replace(/(^|[^A-Za-z])(>Eye of the NorthS*?<)(?=[^A-Za-z]|$)/gi, '$1>极地之眼<');
    data=data.replace(/(^|[^A-Za-z])(>Ice Cliff ChasmsS*?<)(?=[^A-Za-z]|$)/gi, '$1>冰崖裂口<');
    data=data.replace(/(^|[^A-Za-z])(>Gwen's gardenS*?<)(?=[^A-Za-z]|$)/gi, '$1>关的庭园<');
    data=data.replace(/(^|[^A-Za-z])(>BattledepthsS*?<)(?=[^A-Za-z]|$)/gi, '$1>战斗深渊<');
    data=data.replace(/(^|[^A-Za-z])(>Chromatic DrakeS*?<)(?=[^A-Za-z]|$)/gi, '$1>染色龙兽<');
    data=data.replace(/(^|[^A-Za-z])(>Chromatic ScaleS*?<)(?=[^A-Za-z]|$)/gi, '$1>染色的麟片<');
    data=data.replace(/(^|[^A-Za-z])(>Augury RockS*?<)(?=[^A-Za-z]|$)/gi, '$1>占卜之石<');
    data=data.replace(/(^|[^A-Za-z])(>The Arid SeaS*?<)(?=[^A-Za-z]|$)/gi, '$1>枯竭之海<');
    data=data.replace(/(^|[^A-Za-z])(>Dunes of DespairS*?<)(?=[^A-Za-z]|$)/gi, '$1>绝望沙丘<');
    data=data.replace(/(^|[^A-Za-z])(>Sand GiantS*?<)(?=[^A-Za-z]|$)/gi, '$1>沙巨人<');
    data=data.replace(/(^|[^A-Za-z])(>Massive JawboneS*?<)(?=[^A-Za-z]|$)/gi, '$1>粗大下颚骨<');
    data=data.replace(/(^|[^A-Za-z])(>Leviathan PitsS*?<)(?=[^A-Za-z]|$)/gi, '$1>利拜亚森矿场<');
    data=data.replace(/(^|[^A-Za-z])(>Gyala HatcheryS*? \(explorable area\)<)(?=[^A-Za-z]|$)/gi, '$1>盖拉孵化所 (探索区)<');
	data=data.replace(/(^|[^A-Za-z])(>Gyala HatcheryS*?<)(?=[^A-Za-z]|$)/gi, '$1>盖拉孵化所<');
    data=data.replace(/(^|[^A-Za-z])(>Leviathan ClawS*?<)(?=[^A-Za-z]|$)/gi, '$1>利拜亚森之爪<');
    data=data.replace(/(^|[^A-Za-z])(>Leviathan EyeS*?<)(?=[^A-Za-z]|$)/gi, '$1>利拜亚森之眼<');
    data=data.replace(/(^|[^A-Za-z])(>Leviathan MouthS*?<)(?=[^A-Za-z]|$)/gi, '$1>利拜亚森之口<');
    data=data.replace(/(^|[^A-Za-z])(>Moon ShellS*?<)(?=[^A-Za-z]|$)/gi, '$1>月贝<');
    data=data.replace(/(^|[^A-Za-z])(>Frontier GateS*?<)(?=[^A-Za-z]|$)/gi, '$1>边境关所<');
    data=data.replace(/(^|[^A-Za-z])(>Eastern FrontierS*?<)(?=[^A-Za-z]|$)/gi, '$1>东方边境<');
    data=data.replace(/(^|[^A-Za-z])(>Carrion DevourerS*?<)(?=[^A-Za-z]|$)/gi, '$1>腐肉蝎<');
    data=data.replace(/(^|[^A-Za-z])(>Whiptail DevourerS*?<)(?=[^A-Za-z]|$)/gi, '$1>鞭尾蝎<');
    data=data.replace(/(^|[^A-Za-z])(>Plague DevourerS*?<)(?=[^A-Za-z]|$)/gi, '$1>瘟疫蝎<');
    data=data.replace(/(^|[^A-Za-z])(>Fetid CarapaceS*?<)(?=[^A-Za-z]|$)/gi, '$1>恶臭的甲壳<');
    data=data.replace(/(^|[^A-Za-z])(>Beacon's PerchS*?<)(?=[^A-Za-z]|$)/gi, '$1>毕肯高地<');
    data=data.replace(/(^|[^A-Za-z])(>Deldrimor BowlS*?<)(?=[^A-Za-z]|$)/gi, '$1>戴尔狄摩盆地<');
    data=data.replace(/(^|[^A-Za-z])(>Shiverpeak WarriorS*?<)(?=[^A-Za-z]|$)/gi, '$1>席娃山脉战士<');
    data=data.replace(/(^|[^A-Za-z])(>Shiverpeak LongbowS*?<)(?=[^A-Za-z]|$)/gi, '$1>席娃山脉弓手<');
    data=data.replace(/(^|[^A-Za-z])(>Shiverpeak ProtectorS*?<)(?=[^A-Za-z]|$)/gi, '$1>席娃山脉守护者<');
    data=data.replace(/(^|[^A-Za-z])(>Shiverpeak ManeS*?<)(?=[^A-Za-z]|$)/gi, '$1>席娃山脉鬃毛<');
    data=data.replace(/(^|[^A-Za-z])(>The MarketplaceS*?<)(?=[^A-Za-z]|$)/gi, '$1>市集<');
    data=data.replace(/(^|[^A-Za-z])(>Bukdek BywayS*?<)(?=[^A-Za-z]|$)/gi, '$1>巴德克小径<');
    data=data.replace(/(^|[^A-Za-z])(>Branches of Juni BerrieS*?<)(?=[^A-Za-z]|$)/gi, '$1>柳树枝<');
    data=data.replace(/(^|[^A-Za-z])(>Sunspear SanctuaryS*?<)(?=[^A-Za-z]|$)/gi, '$1>日戟避难所<');
    data=data.replace(/(^|[^A-Za-z])(>Marga CoastS*?<)(?=[^A-Za-z]|$)/gi, '$1>马加海岸<');
    data=data.replace(/(^|[^A-Za-z])(>RonjokS*?<)(?=[^A-Za-z]|$)/gi, '$1>罗鸠村<');
    data=data.replace(/(^|[^A-Za-z])(>ChunoS*?<)(?=[^A-Za-z]|$)/gi, '$1>周纳<');
    data=data.replace(/(^|[^A-Za-z])(>Insatiable AppetiteS*?<)(?=[^A-Za-z]|$)/gi, '$1>贪得无厌的食欲<');
    data=data.replace(/(^|[^A-Za-z])(>TomaS*?<)(?=[^A-Za-z]|$)/gi, '$1>托玛<');
    data=data.replace(/(^|[^A-Za-z])(>Tihark OrchardS*?<)(?=[^A-Za-z]|$)/gi, '$1>提亚克林地<');
    data=data.replace(/(^|[^A-Za-z])(>Garden of SeborhinS*?<)(?=[^A-Za-z]|$)/gi, '$1>希伯欣花园<');
    data=data.replace(/(^|[^A-Za-z])(>Forum HighlandsS*?<)(?=[^A-Za-z]|$)/gi, '$1>高地广场<');
    data=data.replace(/(^|[^A-Za-z])(>Roaring EtherS*?<)(?=[^A-Za-z]|$)/gi, '$1>苍穹咆哮者<');
    data=data.replace(/(^|[^A-Za-z])(>Roaring Ether ClawS*?<)(?=[^A-Za-z]|$)/gi, '$1>苍穹咆哮者之爪<');
    data=data.replace(/(^|[^A-Za-z])(>Seitung HarborS*?<)(?=[^A-Za-z]|$)/gi, '$1>青函港<');
    data=data.replace(/(^|[^A-Za-z])(>Zen DaijunS*?<)(?=[^A-Za-z]|$)/gi, '$1>祯邰郡<');
    data=data.replace(/(^|[^A-Za-z])(>Rolls*? of ParchmentS*?<)(?=[^A-Za-z]|$)/gi, '$1>羊皮纸卷<');
	data=data.replace(/(^|[^A-Za-z])(>Kaineng CityS*?<)(?=[^A-Za-z]|$)/gi, '$1>凯宁城<');
    data=data.replace(/(^|[^A-Za-z])(>Kaineng CenterS*?<)(?=[^A-Za-z]|$)/gi, '$1>凯宁中心<');
    data=data.replace(/(^|[^A-Za-z])(>Xue YiS*?<)(?=[^A-Za-z]|$)/gi, '$1>薛易<');
    data=data.replace(/(^|[^A-Za-z])(>Wood PlankS*?<)(?=[^A-Za-z]|$)/gi, '$1>树木<');
    data=data.replace(/(^|[^A-Za-z])(>Rolls*? of ParchmentS*?<)(?=[^A-Za-z]|$)/gi, '$1>羊皮纸卷<');
    data=data.replace(/(^|[^A-Za-z])(>Doomlore ShrineS*?<)(?=[^A-Za-z]|$)/gi, '$1>末日传说神殿<');
    data=data.replace(/(^|[^A-Za-z])(>Dalada UplandsS*?<)(?=[^A-Za-z]|$)/gi, '$1>达拉达山地<');
    data=data.replace(/(^|[^A-Za-z])(>Charr SeekerS*?<)(?=[^A-Za-z]|$)/gi, '$1>夏尔追寻者<');
    data=data.replace(/(^|[^A-Za-z])(>Charr BlademasterS*?<)(?=[^A-Za-z]|$)/gi, '$1>夏尔剑术大师<');
    data=data.replace(/(^|[^A-Za-z])(>Charr ProphetS*?<)(?=[^A-Za-z]|$)/gi, '$1>夏尔先知<');
    data=data.replace(/(^|[^A-Za-z])(>Charr FlameshielderS*?<)(?=[^A-Za-z]|$)/gi, '$1>夏尔避燃者<');
    data=data.replace(/(^|[^A-Za-z])(>Superb Charr CarvingS*?<)(?=[^A-Za-z]|$)/gi, '$1>超级夏尔雕刻品<');
    data=data.replace(/(^|[^A-Za-z])(>OlafsteadS*?<)(?=[^A-Za-z]|$)/gi, '$1>欧拉夫之地<');
    data=data.replace(/(^|[^A-Za-z])(>Varajar FellsS*?<)(?=[^A-Za-z]|$)/gi, '$1>维拉戛阵地<');
    data=data.replace(/(^|[^A-Za-z])(>Modniir BerserkerS*?<)(?=[^A-Za-z]|$)/gi, '$1>莫得米狂战士<');
    data=data.replace(/(^|[^A-Za-z])(>Modniir HunterS*?<)(?=[^A-Za-z]|$)/gi, '$1>莫得米猎人<');
    data=data.replace(/(^|[^A-Za-z])(>Modniir ManeS*?<)(?=[^A-Za-z]|$)/gi, '$1>莫得米鬃毛<');
    data=data.replace(/(^|[^A-Za-z])(>Leviathan PitsS*?<)(?=[^A-Za-z]|$)/gi, '$1>利拜亚森矿场<');
    data=data.replace(/(^|[^A-Za-z])(>Rhea's CraterS*?<)(?=[^A-Za-z]|$)/gi, '$1>席亚火山口<');
    data=data.replace(/(^|[^A-Za-z])(>Outcast WarriorS*?<)(?=[^A-Za-z]|$)/gi, '$1>被流放的战士<');
    data=data.replace(/(^|[^A-Za-z])(>Outcast AssassinS*?<)(?=[^A-Za-z]|$)/gi, '$1>被流放的暗杀者<');
    data=data.replace(/(^|[^A-Za-z])(>Outcast RitualistS*?<)(?=[^A-Za-z]|$)/gi, '$1>被流放的祭祀者<');
    data=data.replace(/(^|[^A-Za-z])(>Majesty's RestS*?<)(?=[^A-Za-z]|$)/gi, '$1>王者安息地<');
    data=data.replace(/(^|[^A-Za-z])(>Druid's OverlookS*?<)(?=[^A-Za-z]|$)/gi, '$1>德鲁伊高地<');
    data=data.replace(/(^|[^A-Za-z])(>Temple of the AgesS*?<)(?=[^A-Za-z]|$)/gi, '$1>世纪神殿<');
    data=data.replace(/(^|[^A-Za-z])(>Thorn DevourerS*?<)(?=[^A-Za-z]|$)/gi, '$1>棘刺蝎<');
    data=data.replace(/(^|[^A-Za-z])(>Fevered DevourerS*?<)(?=[^A-Za-z]|$)/gi, '$1>热病蝎<');
    data=data.replace(/(^|[^A-Za-z])(>Thorny CarapaceS*?<)(?=[^A-Za-z]|$)/gi, '$1>多刺的甲壳<');
    data=data.replace(/(^|[^A-Za-z])(>Bone PalaceS*?<)(?=[^A-Za-z]|$)/gi, '$1>白骨宫殿<');
    data=data.replace(/(^|[^A-Za-z])(>The Alkali PanS*?<)(?=[^A-Za-z]|$)/gi, '$1>金属熔炉<');
    data=data.replace(/(^|[^A-Za-z])(>Ruby DjinnS*?<)(?=[^A-Za-z]|$)/gi, '$1>红宝石巨灵<');
    data=data.replace(/(^|[^A-Za-z])(>Ruby Djinn EssenceS*?<)(?=[^A-Za-z]|$)/gi, '$1>红宝石巨灵精华<');
    data=data.replace(/(^|[^A-Za-z])(>Piken SquareS*?<)(?=[^A-Za-z]|$)/gi, '$1>派肯广场<');
    data=data.replace(/(^|[^A-Za-z])(>The BreachS*?<)(?=[^A-Za-z]|$)/gi, '$1>缺口<');
	data=data.replace(/(^|[^A-Za-z])(>Old AscalonS*?<)(?=[^A-Za-z]|$)/gi, '$1>旧阿斯卡隆<');
	data=data.replace(/(^|[^A-Za-z])(>Ascalon FoothillsS*?<)(?=[^A-Za-z]|$)/gi, '$1>阿斯卡隆丘陵<');
    data=data.replace(/(^|[^A-Za-z])(>AscalonS*?<)(?=[^A-Za-z]|$)/gi, '$1>阿斯卡隆<');
    data=data.replace(/(^|[^A-Za-z])(>CharrS*?<)(?=[^A-Za-z]|$)/gi, '$1>夏尔<');
    data=data.replace(/(^|[^A-Za-z])(>Charr HideS*?<)(?=[^A-Za-z]|$)/gi, '$1>夏尔皮<');
    data=data.replace(/(^|[^A-Za-z])(>Ventari's RefugeS*?<)(?=[^A-Za-z]|$)/gi, '$1>凡特里庇护所<');
    data=data.replace(/(^|[^A-Za-z])(>The FallsS*?<)(?=[^A-Za-z]|$)/gi, '$1>陷落区<');
    data=data.replace(/(^|[^A-Za-z])(>The Fissure of WoeS*?<)(?=[^A-Za-z]|$)/gi, '$1>灾难裂痕<');
    data=data.replace(/(^|[^A-Za-z])(>Forest of the Wailing LordS*?<)(?=[^A-Za-z]|$)/gi, '$1>悲鸣领主区<');
    data=data.replace(/(^|[^A-Za-z])(>Gloom SeedS*?<)(?=[^A-Za-z]|$)/gi, '$1>黑暗种子<');
    data=data.replace(/(^|[^A-Za-z])(>Breaker HollowS*?<)(?=[^A-Za-z]|$)/gi, '$1>断崖谷<');
    data=data.replace(/(^|[^A-Za-z])(>Mount QinkaiS*?<)(?=[^A-Za-z]|$)/gi, '$1>今凯山<');
    data=data.replace(/(^|[^A-Za-z])(>Naga WarriorS*?<)(?=[^A-Za-z]|$)/gi, '$1>迦纳战士<');
    data=data.replace(/(^|[^A-Za-z])(>Naga ArcherS*?<)(?=[^A-Za-z]|$)/gi, '$1>迦纳弓手<');
    data=data.replace(/(^|[^A-Za-z])(>Naga RitualistS*?<)(?=[^A-Za-z]|$)/gi, '$1>迦纳祭祀者<');
    data=data.replace(/(^|[^A-Za-z])(>Naga SkinS*?<)(?=[^A-Za-z]|$)/gi, '$1>迦纳外皮<');
    data=data.replace(/(^|[^A-Za-z])(>Riverside ProvinceS*?<)(?=[^A-Za-z]|$)/gi, '$1>河畔地带<');
    data=data.replace(/(^|[^A-Za-z])(>Twin Serpent LakesS*?<)(?=[^A-Za-z]|$)/gi, '$1>双头蛇湖泊<');
    data=data.replace(/(^|[^A-Za-z])(>Lion's ArchS*?<)(?=[^A-Za-z]|$)/gi, '$1>狮子拱门<');
    data=data.replace(/(^|[^A-Za-z])(>Bog SkaleS*?<)(?=[^A-Za-z]|$)/gi, '$1>泥鳞怪<');
    data=data.replace(/(^|[^A-Za-z])(>Twin Serpent LakesS*?<)(?=[^A-Za-z]|$)/gi, '$1>双头蛇湖泊<');
    data=data.replace(/(^|[^A-Za-z])(>Gruhn the FisherS*?<)(?=[^A-Za-z]|$)/gi, '$1>渔人古露恩<');
    data=data.replace(/(^|[^A-Za-z])(>Bog Skale FinS*?<)(?=[^A-Za-z]|$)/gi, '$1>泥鳞怪的鳍<');
    data=data.replace(/(^|[^A-Za-z])(>HerringS*?<)(?=[^A-Za-z]|$)/gi, '$1>鲱鱼<');
    data=data.replace(/(^|[^A-Za-z])(>Doomlore ShrineS*?<)(?=[^A-Za-z]|$)/gi, '$1>末日传说神殿<');
    data=data.replace(/(^|[^A-Za-z])(>Sacnoth ValleyS*?<)(?=[^A-Za-z]|$)/gi, '$1>圣诺谷<');
    data=data.replace(/(^|[^A-Za-z])(>Grawl ChampionS*?<)(?=[^A-Za-z]|$)/gi, '$1>穴居人冠军<');
    data=data.replace(/(^|[^A-Za-z])(>Grawl Dark PriestS*?<)(?=[^A-Za-z]|$)/gi, '$1>穴居人黑暗祭司<');
    data=data.replace(/(^|[^A-Za-z])(>Stone Grawl NecklaceS*?<)(?=[^A-Za-z]|$)/gi, '$1>石穴居人项链<');
    data=data.replace(/(^|[^A-Za-z])(>Jokanur DiggingsS*?<)(?=[^A-Za-z]|$)/gi, '$1>卓坎诺挖掘点<');
    data=data.replace(/(^|[^A-Za-z])(>Fahranur, The First CityS*?<)(?=[^A-Za-z]|$)/gi, '$1>旧城 法兰努尔<');
    data=data.replace(/(^|[^A-Za-z])(>Beautiful IbogaS*?<)(?=[^A-Za-z]|$)/gi, '$1>美丽伊波枷<');
    data=data.replace(/(^|[^A-Za-z])(>Fanged IbogaS*?<)(?=[^A-Za-z]|$)/gi, '$1>毒牙伊波枷<');
    data=data.replace(/(^|[^A-Za-z])(>Sentient SeedS*?<)(?=[^A-Za-z]|$)/gi, '$1>知觉种子<');
    data=data.replace(/(^|[^A-Za-z])(>Seitung HarborS*?<)(?=[^A-Za-z]|$)/gi, '$1>青函港<');
    data=data.replace(/(^|[^A-Za-z])(>Saoshang TrailS*?<)(?=[^A-Za-z]|$)/gi, '$1>绍商小径<');
    data=data.replace(/(^|[^A-Za-z])(>Mantid DarkwingS*?<)(?=[^A-Za-z]|$)/gi, '$1>螳螂黑翼<');
    data=data.replace(/(^|[^A-Za-z])(>Mantid GlitterfangS*?<)(?=[^A-Za-z]|$)/gi, '$1>螳螂锐牙<');
    data=data.replace(/(^|[^A-Za-z])(>Mantid PincerS*?<)(?=[^A-Za-z]|$)/gi, '$1>螳螂镰<');
    data=data.replace(/(^|[^A-Za-z])(>Ember Light CampS*?<)(?=[^A-Za-z]|$)/gi, '$1>残火营地<');
    data=data.replace(/(^|[^A-Za-z])(>Perdition RockS*?<)(?=[^A-Za-z]|$)/gi, '$1>破灭石<');
    data=data.replace(/(^|[^A-Za-z])(>Mahgo HydraS*?<)(?=[^A-Za-z]|$)/gi, '$1>码果三头龙<');
    data=data.replace(/(^|[^A-Za-z])(>Mahgo ClawS*?<)(?=[^A-Za-z]|$)/gi, '$1>码果的爪<');
    data=data.replace(/(^|[^A-Za-z])(>Yohlon HavenS*?<)(?=[^A-Za-z]|$)/gi, '$1>犹朗避难所<');
    data=data.replace(/(^|[^A-Za-z])(>Arkjok WardS*?<)(?=[^A-Za-z]|$)/gi, '$1>阿尔科监禁区<');
    data=data.replace(/(^|[^A-Za-z])(>Mandragor ImpS*?<)(?=[^A-Za-z]|$)/gi, '$1>曼陀罗恶魔<');
    data=data.replace(/(^|[^A-Za-z])(>Mandragor SlitherS*?<)(?=[^A-Za-z]|$)/gi, '$1>曼陀罗撕裂者<');
    data=data.replace(/(^|[^A-Za-z])(>Mandragor RootS*?<)(?=[^A-Za-z]|$)/gi, '$1>曼陀罗根<');
    data=data.replace(/(^|[^A-Za-z])(>Yohlon HavenS*?<)(?=[^A-Za-z]|$)/gi, '$1>犹朗避难所<');
    data=data.replace(/(^|[^A-Za-z])(>YajideS*?<)(?=[^A-Za-z]|$)/gi, '$1>叶吉达<');
    data=data.replace(/(^|[^A-Za-z])(>Mandragor Root CakeS*?<)(?=[^A-Za-z]|$)/gi, '$1>曼陀罗根糕点<');
    data=data.replace(/(^|[^A-Za-z])(>Mandragor RootS*?<)(?=[^A-Za-z]|$)/gi, '$1>曼陀罗根<');
    data=data.replace(/(^|[^A-Za-z])(>Snake DanceS*?<)(?=[^A-Za-z]|$)/gi, '$1>蛇舞<');
    data=data.replace(/(^|[^A-Za-z])(>Dreadnought's DriftS*?<)(?=[^A-Za-z]|$)/gi, '$1>无惧者之丘<');
    data=data.replace(/(^|[^A-Za-z])(>Beacon's PerchS*?<)(?=[^A-Za-z]|$)/gi, '$1>毕肯高地<');
    data=data.replace(/(^|[^A-Za-z])(>Deldrimor War CampS*?<)(?=[^A-Za-z]|$)/gi, '$1>戴尔狄摩兵营<');
    data=data.replace(/(^|[^A-Za-z])(>Azure ShadowS*?<)(?=[^A-Za-z]|$)/gi, '$1>湛蓝阴影<');
    data=data.replace(/(^|[^A-Za-z])(>Azure RemainS*?<)(?=[^A-Za-z]|$)/gi, '$1>湛蓝残留物<');
    data=data.replace(/(^|[^A-Za-z])(>The MarketplaceS*?<)(?=[^A-Za-z]|$)/gi, '$1>市集<');
    data=data.replace(/(^|[^A-Za-z])(>Wajjun BazaarS*?<)(?=[^A-Za-z]|$)/gi, '$1>瓦江市场<');
    data=data.replace(/(^|[^A-Za-z])(>Am FahS*?<)(?=[^A-Za-z]|$)/gi, '$1>安费<');
    data=data.replace(/(^|[^A-Za-z])(>Plague IdolS*?<)(?=[^A-Za-z]|$)/gi, '$1>瘟疫法器<');
    data=data.replace(/(^|[^A-Za-z])(>Tarnished HavenS*?<)(?=[^A-Za-z]|$)/gi, '$1>灰暗避难所<');
    data=data.replace(/(^|[^A-Za-z])(>Alcazia TangleS*?<)(?=[^A-Za-z]|$)/gi, '$1>纠结之艾卡滋亚<');
    data=data.replace(/(^|[^A-Za-z])(>Umbral GrottoS*?<)(?=[^A-Za-z]|$)/gi, '$1>阴影石穴<');
    data=data.replace(/(^|[^A-Za-z])(>Verdant CascadesS*?<)(?=[^A-Za-z]|$)/gi, '$1>原野瀑布<');
    data=data.replace(/(^|[^A-Za-z])(>QuetzalS*?<)(?=[^A-Za-z]|$)/gi, '$1>长尾<');
    data=data.replace(/(^|[^A-Za-z])(>Quetzal CrestsS*?<)(?=[^A-Za-z]|$)/gi, '$1>长尾冠毛<');
    data=data.replace(/(^|[^A-Za-z])(>The Mouth of TormentS*?<)(?=[^A-Za-z]|$)/gi, '$1>苦痛之地隘口<');
    data=data.replace(/(^|[^A-Za-z])(>Poisoned OutcropsS*?<)(?=[^A-Za-z]|$)/gi, '$1>剧毒地表<');
    data=data.replace(/(^|[^A-Za-z])(>MargoniteS*?<)(?=[^A-Za-z]|$)/gi, '$1>玛骨奈<');
    data=data.replace(/(^|[^A-Za-z])(>Margonite MaskS*?<)(?=[^A-Za-z]|$)/gi, '$1>玛骨奈面具<');
    data=data.replace(/(^|[^A-Za-z])(>The Granite CitadelS*?<)(?=[^A-Za-z]|$)/gi, '$1>花岗岩堡垒<');
    data=data.replace(/(^|[^A-Za-z])(>Tasca's DemiseS*?<)(?=[^A-Za-z]|$)/gi, '$1>塔斯加之死<');
    data=data.replace(/(^|[^A-Za-z])(>Mineral SpringsS*?<)(?=[^A-Za-z]|$)/gi, '$1>矿物泉源<');
    data=data.replace(/(^|[^A-Za-z])(>TenguS*?<)(?=[^A-Za-z]|$)/gi, '$1>天狗<');
    data=data.replace(/(^|[^A-Za-z])(>AvicaraS*?<)(?=[^A-Za-z]|$)/gi, '$1>阿比卡拉<');
    data=data.replace(/(^|[^A-Za-z])(>Feathered Avicara ScalpS*?<)(?=[^A-Za-z]|$)/gi, '$1>阿比卡拉头皮羽毛<');
    data=data.replace(/(^|[^A-Za-z])(>Fort RanikS*?<)(?=[^A-Za-z]|$)/gi, '$1>瑞尼克要塞<');
    data=data.replace(/(^|[^A-Za-z])(>Regent ValleyS*?<)(?=[^A-Za-z]|$)/gi, '$1>统治者之谷<');
    data=data.replace(/(^|[^A-Za-z])(>Red Iris FlowerS*?<)(?=[^A-Za-z]|$)/gi, '$1>红色鸢尾花<');
    data=data.replace(/(^|[^A-Za-z])(>Grendich CourthouseS*?<)(?=[^A-Za-z]|$)/gi, '$1>葛兰迪法院<');
    data=data.replace(/(^|[^A-Za-z])(>Flame Temple CorridorS*?<)(?=[^A-Za-z]|$)/gi, '$1>夏尔火焰神殿<');
    data=data.replace(/(^|[^A-Za-z])(>CharrS*?<)(?=[^A-Za-z]|$)/gi, '$1>夏尔<');
    data=data.replace(/(^|[^A-Za-z])(>Charr CarvingS*?<)(?=[^A-Za-z]|$)/gi, '$1>夏尔雕刻品<');
    data=data.replace(/(^|[^A-Za-z])(>Yak's BendS*?<)(?=[^A-Za-z]|$)/gi, '$1>牦牛村<');
    data=data.replace(/(^|[^A-Za-z])(>Traveler's ValeS*?<)(?=[^A-Za-z]|$)/gi, '$1>旅人谷<');
    data=data.replace(/(^|[^A-Za-z])(>Rare material traderS*?<)(?=[^A-Za-z]|$)/gi, '$1>稀有材料商人<');
    data=data.replace(/(^|[^A-Za-z])(>Bolts*? of LinenS*?<)(?=[^A-Za-z]|$)/gi, '$1>亚麻布<');
    data=data.replace(/(^|[^A-Za-z])(>ArtisanS*?<)(?=[^A-Za-z]|$)/gi, '$1>工匠<');
    data=data.replace(/(^|[^A-Za-z])(>Plant FiberS*?<)(?=[^A-Za-z]|$)/gi, '$1>植物纤维<');
    data=data.replace(/(^|[^A-Za-z])(>Gunnar's HoldS*?<)(?=[^A-Za-z]|$)/gi, '$1>甘拿的占领地<');
    data=data.replace(/(^|[^A-Za-z])(>Norrhart DomainsS*?<)(?=[^A-Za-z]|$)/gi, '$1>诺恩之心领地<');
    data=data.replace(/(^|[^A-Za-z])(>Dreamroot MandragorS*?<)(?=[^A-Za-z]|$)/gi, '$1>梦之根曼陀罗<');
    data=data.replace(/(^|[^A-Za-z])(>Mandragor ScavengerS*?<)(?=[^A-Za-z]|$)/gi, '$1>拾荒曼陀罗<');
    data=data.replace(/(^|[^A-Za-z])(>Mystic MandragorS*?<)(?=[^A-Za-z]|$)/gi, '$1>秘教曼陀罗<');
    data=data.replace(/(^|[^A-Za-z])(>Ulcerous MandragorS*?<)(?=[^A-Za-z]|$)/gi, '$1>已腐蚀曼陀罗<');
    data=data.replace(/(^|[^A-Za-z])(>Frigid Mandragor HuskS*?<)(?=[^A-Za-z]|$)/gi, '$1>呆板曼陀罗外壳<');
    data=data.replace(/(^|[^A-Za-z])(>Champion's DawnS*?<)(?=[^A-Za-z]|$)/gi, '$1>勇士曙光<');
    data=data.replace(/(^|[^A-Za-z])(>Cliffs of DohjokS*?<)(?=[^A-Za-z]|$)/gi, '$1>杜夏悬崖<');
    data=data.replace(/(^|[^A-Za-z])(>CorsairS*?<)(?=[^A-Za-z]|$)/gi, '$1>海盗<');
    data=data.replace(/(^|[^A-Za-z])(>Copper ShillingS*?<)(?=[^A-Za-z]|$)/gi, '$1>铜先令<');
    data=data.replace(/(^|[^A-Za-z])(>The WildsS*?<)(?=[^A-Za-z]|$)/gi, '$1>荒原<');
    data=data.replace(/(^|[^A-Za-z])(>Sage LandsS*?<)(?=[^A-Za-z]|$)/gi, '$1>贤者领地<');
    data=data.replace(/(^|[^A-Za-z])(>Wind Rider (Maguuma Jungle)S*?<)(?=[^A-Za-z]|$)/gi, '$1>驭风者<');
    data=data.replace(/(^|[^A-Za-z])(>Ancient EyeS*?<)(?=[^A-Za-z]|$)/gi, '$1>远古之眼<');
    data=data.replace(/(^|[^A-Za-z])(>Sunspear SanctuaryS*?<)(?=[^A-Za-z]|$)/gi, '$1>日戟避难所<');
    data=data.replace(/(^|[^A-Za-z])(>Sunward MarchesS*?<)(?=[^A-Za-z]|$)/gi, '$1>向阳边境<');
    data=data.replace(/(^|[^A-Za-z])(>Mirage IbogaS*?<)(?=[^A-Za-z]|$)/gi, '$1>幻象伊波枷<');
    data=data.replace(/(^|[^A-Za-z])(>Murmuring ThornbrushS*?<)(?=[^A-Za-z]|$)/gi, '$1>荆棘之藤<');
    data=data.replace(/(^|[^A-Za-z])(>Sentient SporeS*?<)(?=[^A-Za-z]|$)/gi, '$1>知觉孢子<');
    data=data.replace(/(^|[^A-Za-z])(>Gates of KrytaS*?<)(?=[^A-Za-z]|$)/gi, '$1>科瑞塔关所<');
    data=data.replace(/(^|[^A-Za-z])(>Scoundrel's RiseS*?<)(?=[^A-Za-z]|$)/gi, '$1>恶汉山丘<');
    data=data.replace(/(^|[^A-Za-z])(>Bog Skale FinS*?<)(?=[^A-Za-z]|$)/gi, '$1>泥鳞怪的鳍<');
    data=data.replace(/(^|[^A-Za-z])(>Bog SkaleS*?<)(?=[^A-Za-z]|$)/gi, '$1>泥鳞怪<');
    data=data.replace(/(^|[^A-Za-z])(>Zos Shivros ChannelS*?<)(?=[^A-Za-z]|$)/gi, '$1>佐席洛斯水道<');
    data=data.replace(/(^|[^A-Za-z])(>Kraken SpawnS*?<)(?=[^A-Za-z]|$)/gi, '$1>海妖卵<');
    data=data.replace(/(^|[^A-Za-z])(>Kraken EyeS*?<)(?=[^A-Za-z]|$)/gi, '$1>海妖之眼<');
    data=data.replace(/(^|[^A-Za-z])(>Grendich CourthouseS*?<)(?=[^A-Za-z]|$)/gi, '$1>葛兰迪法院<');
    data=data.replace(/(^|[^A-Za-z])(>Flame Temple CorridorS*?<)(?=[^A-Za-z]|$)/gi, '$1>夏尔火焰神殿<');
    data=data.replace(/(^|[^A-Za-z])(>Dragon's GulletS*?<)(?=[^A-Za-z]|$)/gi, '$1>巨龙峡谷<');
    data=data.replace(/(^|[^A-Za-z])(>Abomination (NPC)S*?<)(?=[^A-Za-z]|$)/gi, '$1>憎恨者<');
    data=data.replace(/(^|[^A-Za-z])(>Gruesome RibcageS*?<)(?=[^A-Za-z]|$)/gi, '$1>可怕的胸腔<');
    data=data.replace(/(^|[^A-Za-z])(>Longeye's LedgeS*?<)(?=[^A-Za-z]|$)/gi, '$1>长眼岩脉<');
    data=data.replace(/(^|[^A-Za-z])(>Grothmar WardownsS*?<)(?=[^A-Za-z]|$)/gi, '$1>古斯玛战争丘陵地<');
    data=data.replace(/(^|[^A-Za-z])(>Mandragor Dust DevilS*?<)(?=[^A-Za-z]|$)/gi, '$1>曼陀罗尘魔<');
    data=data.replace(/(^|[^A-Za-z])(>Mandragor Smoke DevilS*?<)(?=[^A-Za-z]|$)/gi, '$1>曼陀罗烟魔<');
    data=data.replace(/(^|[^A-Za-z])(>Vile MandragorS*?<)(?=[^A-Za-z]|$)/gi, '$1>暗黑曼陀罗<');
    data=data.replace(/(^|[^A-Za-z])(>Fibrous Mandragor RootS*?<)(?=[^A-Za-z]|$)/gi, '$1>纤维曼陀罗根<');
    data=data.replace(/(^|[^A-Za-z])(>Chantry of SecretsS*?<)(?=[^A-Za-z]|$)/gi, '$1>隐密教堂<');
    data=data.replace(/(^|[^A-Za-z])(>Yatendi CanyonsS*?<)(?=[^A-Za-z]|$)/gi, '$1>亚天帝峡谷<');
    data=data.replace(/(^|[^A-Za-z])(>Rain BeetleS*?<)(?=[^A-Za-z]|$)/gi, '$1>雨甲虫<');
    data=data.replace(/(^|[^A-Za-z])(>Rock BeetleS*?<)(?=[^A-Za-z]|$)/gi, '$1>石甲虫<');
    data=data.replace(/(^|[^A-Za-z])(>GeodeS*?<)(?=[^A-Za-z]|$)/gi, '$1>晶石<');
    data=data.replace(/(^|[^A-Za-z])(>Vizunah Square (Local Quarter)S*?<)(?=[^A-Za-z]|$)/gi, '$1>薇茹广场本地<');
    data=data.replace(/(^|[^A-Za-z])(>The UndercityS*?<)(?=[^A-Za-z]|$)/gi, '$1>地下城<');
    data=data.replace(/(^|[^A-Za-z])(>Kappa (level 20)S*?<)(?=[^A-Za-z]|$)/gi, '$1>河童<');
    data=data.replace(/(^|[^A-Za-z])(>Ancient Kappa ShellS*?<)(?=[^A-Za-z]|$)/gi, '$1>古河童壳<');
    data=data.replace(/(^|[^A-Za-z])(>Temple of the AgesS*?<)(?=[^A-Za-z]|$)/gi, '$1>世纪神殿<');
    data=data.replace(/(^|[^A-Za-z])(>The Black CurtainS*?<)(?=[^A-Za-z]|$)/gi, '$1>黑色帷幕<');
    data=data.replace(/(^|[^A-Za-z])(>Fog NightmareS*?<)(?=[^A-Za-z]|$)/gi, '$1>迷雾梦靥<');
    data=data.replace(/(^|[^A-Za-z])(>Shadowy RemnantsS*?<)(?=[^A-Za-z]|$)/gi, '$1>阴影残留物<');
    data=data.replace(/(^|[^A-Za-z])(>Remains of SahlahjaS*?<)(?=[^A-Za-z]|$)/gi, '$1>萨拉迦遗址<');
    data=data.replace(/(^|[^A-Za-z])(>The Sulfurous WastesS*?<)(?=[^A-Za-z]|$)/gi, '$1>硫磺荒地<');
    data=data.replace(/(^|[^A-Za-z])(>Awakened CavalierS*?<)(?=[^A-Za-z]|$)/gi, '$1>觉醒的骑士<');
    data=data.replace(/(^|[^A-Za-z])(>Mummy WrappingS*?<)(?=[^A-Za-z]|$)/gi, '$1>木乃伊裹尸布<');
    data=data.replace(/(^|[^A-Za-z])(>Tsumei VillageS*?<)(?=[^A-Za-z]|$)/gi, '$1>苏梅村<');
    data=data.replace(/(^|[^A-Za-z])(>Sunqua ValeS*?<)(?=[^A-Za-z]|$)/gi, '$1>桑泉谷<');
    data=data.replace(/(^|[^A-Za-z])(>SensaliS*?<)(?=[^A-Za-z]|$)/gi, '$1>圣沙利天狗<');
    data=data.replace(/(^|[^A-Za-z])(>Feathered ScalpS*?<)(?=[^A-Za-z]|$)/gi, '$1>羽头皮<');
    data=data.replace(/(^|[^A-Za-z])(>Bone PalaceS*?<)(?=[^A-Za-z]|$)/gi, '$1>白骨宫殿<');
    data=data.replace(/(^|[^A-Za-z])(>Joko's DomainS*?<)(?=[^A-Za-z]|$)/gi, '$1>杰格领地<');
    data=data.replace(/(^|[^A-Za-z])(>Gate of TormentS*?<)(?=[^A-Za-z]|$)/gi, '$1>苦痛之门<');
    data=data.replace(/(^|[^A-Za-z])(>Nightfallen JahaiS*?<)(?=[^A-Za-z]|$)/gi, '$1>夜蚀暗殒 夏亥<');
    data=data.replace(/(^|[^A-Za-z])(>Graven MonolithS*?<)(?=[^A-Za-z]|$)/gi, '$1>铭刻石雕<');
    data=data.replace(/(^|[^A-Za-z])(>Inscribed ShardS*?<)(?=[^A-Za-z]|$)/gi, '$1>铭刻碎片<');
    data=data.replace(/(^|[^A-Za-z])(>Vlox's FallsS*?<)(?=[^A-Za-z]|$)/gi, '$1>弗洛克斯瀑布<');
    data=data.replace(/(^|[^A-Za-z])(>Arbor BayS*?<)(?=[^A-Za-z]|$)/gi, '$1>亚伯湾<');
    data=data.replace(/(^|[^A-Za-z])(>Krait SkinS*?<)(?=[^A-Za-z]|$)/gi, '$1>环蛇皮<');
    data=data.replace(/(^|[^A-Za-z])(>KraitS*?<)(?=[^A-Za-z]|$)/gi, '$1>环蛇<');
    data=data.replace(/(^|[^A-Za-z])(>The Granite CitadelS*?<)(?=[^A-Za-z]|$)/gi, '$1>花岗岩堡垒<');
    data=data.replace(/(^|[^A-Za-z])(>Tasca's DemiseS*?<)(?=[^A-Za-z]|$)/gi, '$1>塔斯加之死<');
    data=data.replace(/(^|[^A-Za-z])(>Stone Summit BadgeS*?<)(?=[^A-Za-z]|$)/gi, '$1>石峰标志<');
    data=data.replace(/(^|[^A-Za-z])(>Stone SummitS*?<)(?=[^A-Za-z]|$)/gi, '$1>石峰矮人<');
    data=data.replace(/(^|[^A-Za-z])(>Defend Droknar's ForgeS*?<)(?=[^A-Za-z]|$)/gi, '$1>保卫卓克纳熔炉<');
    data=data.replace(/(^|[^A-Za-z])(>Lutgardis ConservatoryS*?<)(?=[^A-Za-z]|$)/gi, '$1>路嘉蒂斯温室<');
    data=data.replace(/(^|[^A-Za-z])(>Melandru's HopeS*?<)(?=[^A-Za-z]|$)/gi, '$1>梅兰朵的盼望<');
    data=data.replace(/(^|[^A-Za-z])(>Echovald ForestS*?<)(?=[^A-Za-z]|$)/gi, '$1>石化森林<');
    data=data.replace(/(^|[^A-Za-z])(>Dredge IncisorS*?<)(?=[^A-Za-z]|$)/gi, '$1>挖掘者之牙<');
    data=data.replace(/(^|[^A-Za-z])(>DredgeS*?<)(?=[^A-Za-z]|$)/gi, '$1>挖掘者<');
    data=data.replace(/(^|[^A-Za-z])(>Grendich CourthouseS*?<)(?=[^A-Za-z]|$)/gi, '$1>葛兰迪法院<');
    data=data.replace(/(^|[^A-Za-z])(>Diessa LowlandsS*?<)(?=[^A-Za-z]|$)/gi, '$1>底耶沙低地<');
    data=data.replace(/(^|[^A-Za-z])(>GargoyleS*?<)(?=[^A-Za-z]|$)/gi, '$1>石像鬼<');
    data=data.replace(/(^|[^A-Za-z])(>Flash GargoyleS*?<)(?=[^A-Za-z]|$)/gi, '$1>迅速石像鬼<');
    data=data.replace(/(^|[^A-Za-z])(>Shatter GargoyleS*?<)(?=[^A-Za-z]|$)/gi, '$1>破碎石像鬼<');
    data=data.replace(/(^|[^A-Za-z])(>Resurrect GargoyleS*?<)(?=[^A-Za-z]|$)/gi, '$1>复活石像鬼<');
    data=data.replace(/(^|[^A-Za-z])(>Singed Gargoyle SkullS*?<)(?=[^A-Za-z]|$)/gi, '$1>烧焦的石像鬼头颅<');
    data=data.replace(/(^|[^A-Za-z])(>Pogahn PassageS*?<)(?=[^A-Za-z]|$)/gi, '$1>波甘驿站<');
    data=data.replace(/(^|[^A-Za-z])(>Gandara, the Moon FortressS*?<)(?=[^A-Za-z]|$)/gi, '$1>弦月要塞 干达拉<');
    data=data.replace(/(^|[^A-Za-z])(>Kournan militaryS*?<)(?=[^A-Za-z]|$)/gi, '$1>高楠士兵<');
    data=data.replace(/(^|[^A-Za-z])(>Kournan PendantS*?<)(?=[^A-Za-z]|$)/gi, '$1>高楠垂饰<');
    data=data.replace(/(^|[^A-Za-z])(>Sunjiang DistrictS*?<)(?=[^A-Za-z]|$)/gi, '$1>孙江行政区<');
    data=data.replace(/(^|[^A-Za-z])(>Shenzun TunnelsS*?<)(?=[^A-Za-z]|$)/gi, '$1>申赞通道<');
    data=data.replace(/(^|[^A-Za-z])(>Plant FiberS*?<)(?=[^A-Za-z]|$)/gi, '$1>植物纤维<');
    data=data.replace(/(^|[^A-Za-z])(>Tempered Glass VialS*?<)(?=[^A-Za-z]|$)/gi, '$1>调合后的玻璃瓶<');
    data=data.replace(/(^|[^A-Za-z])(>Kaineng CenterS*?<)(?=[^A-Za-z]|$)/gi, '$1>凯宁中心<');
    data=data.replace(/(^|[^A-Za-z])(>Vials*? of InkS*?<)(?=[^A-Za-z]|$)/gi, '$1>小瓶油水<');
    data=data.replace(/(^|[^A-Za-z])(>Camp RankorS*?<)(?=[^A-Za-z]|$)/gi, '$1>蓝口营地<');
    data=data.replace(/(^|[^A-Za-z])(>Talus ChuteS*?<)(?=[^A-Za-z]|$)/gi, '$1>碎石坡道<');
    data=data.replace(/(^|[^A-Za-z])(>Mountain TrollS*?<)(?=[^A-Za-z]|$)/gi, '$1>山巨魔<');
    data=data.replace(/(^|[^A-Za-z])(>Mountain Troll TuskS*?<)(?=[^A-Za-z]|$)/gi, '$1>山巨魔獠牙<');
    data=data.replace(/(^|[^A-Za-z])(>Kodonur CrossroadsS*?<)(?=[^A-Za-z]|$)/gi, '$1>科登诺路口<');
    data=data.replace(/(^|[^A-Za-z])(>Dejarin EstateS*?<)(?=[^A-Za-z]|$)/gi, '$1>达贾林庄<');
    data=data.replace(/(^|[^A-Za-z])(>Blue Tongue HeketS*?<)(?=[^A-Za-z]|$)/gi, '$1>蓝舌哈克蛙<');
    data=data.replace(/(^|[^A-Za-z])(>Beast Sworn HeketS*?<)(?=[^A-Za-z]|$)/gi, '$1>野性哈克蛙<');
    data=data.replace(/(^|[^A-Za-z])(>Blood Cowl HeketS*?<)(?=[^A-Za-z]|$)/gi, '$1>冷血哈克蛙<');
    data=data.replace(/(^|[^A-Za-z])(>Heket TongueS*?<)(?=[^A-Za-z]|$)/gi, '$1>哈克蛙舌<');
    data=data.replace(/(^|[^A-Za-z])(>Longeye's LedgeS*?<)(?=[^A-Za-z]|$)/gi, '$1>长眼岩脉<');
    data=data.replace(/(^|[^A-Za-z])(>Bjora MarchesS*?<)(?=[^A-Za-z]|$)/gi, '$1>碧拉边境<');
    data=data.replace(/(^|[^A-Za-z])(>Jotun SkullsmasherS*?<)(?=[^A-Za-z]|$)/gi, '$1>碎骨角顿<');
    data=data.replace(/(^|[^A-Za-z])(>Jotun MindbreakerS*?<)(?=[^A-Za-z]|$)/gi, '$1>断绪角顿<');
    data=data.replace(/(^|[^A-Za-z])(>Jotun BladeturnerS*?<)(?=[^A-Za-z]|$)/gi, '$1>转刃角顿<');
    data=data.replace(/(^|[^A-Za-z])(>Jotun PeltS*?<)(?=[^A-Za-z]|$)/gi, '$1>角顿皮毛<');
    data=data.replace(/(^|[^A-Za-z])(>Harvest TempleS*?<)(?=[^A-Za-z]|$)/gi, '$1>丰收神殿<');
    data=data.replace(/(^|[^A-Za-z])(>Unwaking WatersS*? \(explorable area\)<)(?=[^A-Za-z]|$)/gi, '$1>沉睡之水 (探索区)<');
	data=data.replace(/(^|[^A-Za-z])(>Unwaking WatersS*?<)(?=[^A-Za-z]|$)/gi, '$1>沉睡之水<');
    data=data.replace(/(^|[^A-Za-z])(>Saltspray DragonS*?<)(?=[^A-Za-z]|$)/gi, '$1>盐雾之龙<');
    data=data.replace(/(^|[^A-Za-z])(>Rockhide DragonS*?<)(?=[^A-Za-z]|$)/gi, '$1>岩皮之龙<');
    data=data.replace(/(^|[^A-Za-z])(>Azure CrestS*?<)(?=[^A-Za-z]|$)/gi, '$1>湛蓝羽冠<');
    data=data.replace(/(^|[^A-Za-z])(>Yak's BendS*?<)(?=[^A-Za-z]|$)/gi, '$1>牦牛村<');
    data=data.replace(/(^|[^A-Za-z])(>HydraS*?<)(?=[^A-Za-z]|$)/gi, '$1>三头龙<');
    data=data.replace(/(^|[^A-Za-z])(>Leathery ClawS*?<)(?=[^A-Za-z]|$)/gi, '$1>强韧的爪<');
    data=data.replace(/(^|[^A-Za-z])(>Grand Court of SebelkehS*?<)(?=[^A-Za-z]|$)/gi, '$1>希贝克大宫廷<');
    data=data.replace(/(^|[^A-Za-z])(>The Mirror of LyssS*?<)(?=[^A-Za-z]|$)/gi, '$1>丽之镜湖<');
    data=data.replace(/(^|[^A-Za-z])(>Roaring Ether HeartS*?<)(?=[^A-Za-z]|$)/gi, '$1>苍穹咆啸者之心<');
    data=data.replace(/(^|[^A-Za-z])(>Roaring EtherS*?<)(?=[^A-Za-z]|$)/gi, '$1>苍穹咆啸者<');
    data=data.replace(/(^|[^A-Za-z])(>Senji's CornerS*?<)(?=[^A-Za-z]|$)/gi, '$1>山吉之街<');
    data=data.replace(/(^|[^A-Za-z])(>Xaquang SkywayS*?<)(?=[^A-Za-z]|$)/gi, '$1>夏安便道<');
    data=data.replace(/(^|[^A-Za-z])(>VerminS*?<)(?=[^A-Za-z]|$)/gi, '$1>寄生虫<');
    data=data.replace(/(^|[^A-Za-z])(>Vermin HidesS*?<)(?=[^A-Za-z]|$)/gi, '$1>寄生虫皮革<');
    data=data.replace(/(^|[^A-Za-z])(>Sunspear Great HallS*?<)(?=[^A-Za-z]|$)/gi, '$1>日戟大会堂<');
    data=data.replace(/(^|[^A-Za-z])(>Plains of JarinS*?<)(?=[^A-Za-z]|$)/gi, '$1>贾林平原<');
    data=data.replace(/(^|[^A-Za-z])(>Fanged IbogaS*?<)(?=[^A-Za-z]|$)/gi, '$1>尖牙伊波茄<');
    data=data.replace(/(^|[^A-Za-z])(>Iboga PetalS*?<)(?=[^A-Za-z]|$)/gi, '$1>伊波茄花瓣<');
    data=data.replace(/(^|[^A-Za-z])(>Champion's DawnS*?<)(?=[^A-Za-z]|$)/gi, '$1>勇士曙光<');
    data=data.replace(/(^|[^A-Za-z])(>Chef VolonS*?<)(?=[^A-Za-z]|$)/gi, '$1>大厨 瓦隆<');
    data=data.replace(/(^|[^A-Za-z])(>Pahnai SaladS*?<)(?=[^A-Za-z]|$)/gi, '$1>伊波茄沙拉<');
    data=data.replace(/(^|[^A-Za-z])(>Seitung HarborS*?<)(?=[^A-Za-z]|$)/gi, '$1>青函港<');
    data=data.replace(/(^|[^A-Za-z])(>Jaya BluffsS*?<)(?=[^A-Za-z]|$)/gi, '$1>蛇野断崖<');
    data=data.replace(/(^|[^A-Za-z])(>Mountain YetiS*?<)(?=[^A-Za-z]|$)/gi, '$1>山雪怪<');
    data=data.replace(/(^|[^A-Za-z])(>Longhair YetiS*?<)(?=[^A-Za-z]|$)/gi, '$1>长毛雪怪<');
    data=data.replace(/(^|[^A-Za-z])(>Red YetiS*?<)(?=[^A-Za-z]|$)/gi, '$1>红雪怪<');
    data=data.replace(/(^|[^A-Za-z])(>Stolen SuppliesS*?<)(?=[^A-Za-z]|$)/gi, '$1>失窃的补给品<');
    data=data.replace(/(^|[^A-Za-z])(>Aurora GladeS*?<)(?=[^A-Za-z]|$)/gi, '$1>欧若拉林地<');
    data=data.replace(/(^|[^A-Za-z])(>Ettin's BackS*?<)(?=[^A-Za-z]|$)/gi, '$1>双头怪隐匿地<');
    data=data.replace(/(^|[^A-Za-z])(>Dry TopS*?<)(?=[^A-Za-z]|$)/gi, '$1>干燥高地<');
    data=data.replace(/(^|[^A-Za-z])(>Nicholas the TravelerS*?<)(?=[^A-Za-z]|$)/gi, '$1>地图<');
    data=data.replace(/(^|[^A-Za-z])(>Thorn StalkerS*?<)(?=[^A-Za-z]|$)/gi, '$1>棘刺潜行者<');
    data=data.replace(/(^|[^A-Za-z])(>Tangled SeedS*?<)(?=[^A-Za-z]|$)/gi, '$1>纠结的种子<');
    data=data.replace(/(^|[^A-Za-z])(>Iron Mines of MoladuneS*?<)(?=[^A-Za-z]|$)/gi, '$1>莫拉登矿山<');
    data=data.replace(/(^|[^A-Za-z])(>Frozen ForestS*?<)(?=[^A-Za-z]|$)/gi, '$1>冰冻森林<');
    data=data.replace(/(^|[^A-Za-z])(>PinesoulS*?<)(?=[^A-Za-z]|$)/gi, '$1>松木怪<');
    data=data.replace(/(^|[^A-Za-z])(>Alpine SeedS*?<)(?=[^A-Za-z]|$)/gi, '$1>柏木种子<');
    data=data.replace(/(^|[^A-Za-z])(>Gadd's EncampmentS*?<)(?=[^A-Za-z]|$)/gi, '$1>盖德营区<');
    data=data.replace(/(^|[^A-Za-z])(>Sparkfly SwampS*?<)(?=[^A-Za-z]|$)/gi, '$1>火星蝇沼泽<');
    data=data.replace(/(^|[^A-Za-z])(>Bogroot GrowthsS*?<)(?=[^A-Za-z]|$)/gi, '$1>泥塘根源地<');
    data=data.replace(/(^|[^A-Za-z])(>HeketS*?<)(?=[^A-Za-z]|$)/gi, '$1>青蛙族群<');
    data=data.replace(/(^|[^A-Za-z])(>Rata SumS*?<)(?=[^A-Za-z]|$)/gi, '$1>洛达顶点<');
    data=data.replace(/(^|[^A-Za-z])(>Magus StonesS*?<)(?=[^A-Za-z]|$)/gi, '$1>马古斯之石<');
    data=data.replace(/(^|[^A-Za-z])(>Oola's LabS*?<)(?=[^A-Za-z]|$)/gi, '$1>呜拉实验室<');
    data=data.replace(/(^|[^A-Za-z])(>Hylek AminiS*?<)(?=[^A-Za-z]|$)/gi, '$1>海格克 阿纳尼<');
    data=data.replace(/(^|[^A-Za-z])(>Hylek NahualliS*?<)(?=[^A-Za-z]|$)/gi, '$1>海格克 纳猾里<');
    data=data.replace(/(^|[^A-Za-z])(>Hylek TlamatiniS*?<)(?=[^A-Za-z]|$)/gi, '$1>海格克 拉玛提尼<');
    data=data.replace(/(^|[^A-Za-z])(>Amphibian TongueS*?<)(?=[^A-Za-z]|$)/gi, '$1>双面人的舌头<');
    data=data.replace(/(^|[^A-Za-z])(>Kodonur CrossroadsS*?<)(?=[^A-Za-z]|$)/gi, '$1>科登诺路口<');
    data=data.replace(/(^|[^A-Za-z])(>The Floodplain of MahnkelonS*?<)(?=[^A-Za-z]|$)/gi, '$1>曼克隆泛滥平原<');
    data=data.replace(/(^|[^A-Za-z])(>Embark BeachS*?<)(?=[^A-Za-z]|$)/gi, '$1>征途海滩<');
    data=data.replace(/(^|[^A-Za-z])(>MerchantS*?<)(?=[^A-Za-z]|$)/gi, '$1>杂货商人<');
    data=data.replace(/(^|[^A-Za-z])(>Dwarven AleS*?<)(?=[^A-Za-z]|$)/gi, '$1>矮人啤酒<');
    data=data.replace(/(^|[^A-Za-z])(>Gunnar's HoldS*?<)(?=[^A-Za-z]|$)/gi, '$1>甘拿的占领地<');
    data=data.replace(/(^|[^A-Za-z])(>Kilroy StonekinS*?<)(?=[^A-Za-z]|$)/gi, '$1>基罗伊石族<');
    data=data.replace(/(^|[^A-Za-z])(>Fronis Irontoe's LairS*?<)(?=[^A-Za-z]|$)/gi, '$1>铁趾 佛朗尼的巢穴<');
    data=data.replace(/(^|[^A-Za-z])(>Irontoe'*?s*? ChestS*?<)(?=[^A-Za-z]|$)/gi, '$1>最终宝箱<');
    data=data.replace(/(^|[^A-Za-z])(>Eredon TerraceS*?<)(?=[^A-Za-z]|$)/gi, '$1>雷尔登平地<');
    data=data.replace(/(^|[^A-Za-z])(>Maishang HillsS*?<)(?=[^A-Za-z]|$)/gi, '$1>麦尚山丘<');
    data=data.replace(/(^|[^A-Za-z])(>Pongmei ValleyS*?<)(?=[^A-Za-z]|$)/gi, '$1>朋美谷<');
    data=data.replace(/(^|[^A-Za-z])(>Islands*? GuardianS*?<)(?=[^A-Za-z]|$)/gi, '$1>岛屿守护者<');
    data=data.replace(/(^|[^A-Za-z])(>Guardian MossS*?<)(?=[^A-Za-z]|$)/gi, '$1>守护者苔<');
    data=data.replace(/(^|[^A-Za-z])(>Gate of DesolationS*?<)(?=[^A-Za-z]|$)/gi, '$1>荒芜之地入口<');
    data=data.replace(/(^|[^A-Za-z])(>Turai's ProcessionS*?<)(?=[^A-Za-z]|$)/gi, '$1>托雷长廊<');
    data=data.replace(/(^|[^A-Za-z])(>Water Djinn EssenceS*?<)(?=[^A-Za-z]|$)/gi, '$1>水巨灵精华<');
    data=data.replace(/(^|[^A-Za-z])(>Water DjinnS*?<)(?=[^A-Za-z]|$)/gi, '$1>水巨灵<');
    data=data.replace(/(^|[^A-Za-z])(>Hulking Stone ElementalS*?<)(?=[^A-Za-z]|$)/gi, '$1>巨石元素<');
    data=data.replace(/(^|[^A-Za-z])(>Scorched LodestoneS*?<)(?=[^A-Za-z]|$)/gi, '$1>烧焦的磁石<');
    data=data.replace(/(^|[^A-Za-z])(>Amatz BasinS*?<)(?=[^A-Za-z]|$)/gi, '$1>亚马兹盆地<');
    data=data.replace(/(^|[^A-Za-z])(>Mourning Veil FallsS*?<)(?=[^A-Za-z]|$)/gi, '$1>哀伤之幕瀑布<');
    data=data.replace(/(^|[^A-Za-z])(>Rare material traderS*?<)(?=[^A-Za-z]|$)/gi, '$1>稀有材料商<');
    data=data.replace(/(^|[^A-Za-z])(>Tempered Glass VialS*?<)(?=[^A-Za-z]|$)/gi, '$1>调和后的玻璃瓶<');
    data=data.replace(/(^|[^A-Za-z])(>Bergen Hot SpringsS*?<)(?=[^A-Za-z]|$)/gi, '$1>卑尔根温泉<');
    data=data.replace(/(^|[^A-Za-z])(>Nebo TerraceS*?<)(?=[^A-Za-z]|$)/gi, '$1>尼伯山丘<');
    data=data.replace(/(^|[^A-Za-z])(>Cursed LandsS*?<)(?=[^A-Za-z]|$)/gi, '$1>诅咒之地<');
    data=data.replace(/(^|[^A-Za-z])(>Skeleton RangerS*?<)(?=[^A-Za-z]|$)/gi, '$1>骷髅游侠<');
    data=data.replace(/(^|[^A-Za-z])(>Skeleton SorcererS*?<)(?=[^A-Za-z]|$)/gi, '$1>骷髅巫师<');
    data=data.replace(/(^|[^A-Za-z])(>Grasping GhoulS*?<)(?=[^A-Za-z]|$)/gi, '$1>贪婪的食尸鬼<');
    data=data.replace(/(^|[^A-Za-z])(>Zombie WarlockS*?<)(?=[^A-Za-z]|$)/gi, '$1>僵尸法魔<');
    data=data.replace(/(^|[^A-Za-z])(>Skeleton BowmasterS*?<)(?=[^A-Za-z]|$)/gi, '$1>骷髅弓箭手<');
    data=data.replace(/(^|[^A-Za-z])(>Decayed Orr EmblemS*?<)(?=[^A-Za-z]|$)/gi, '$1>腐烂的欧尔纹章<');
    data=data.replace(/(^|[^A-Za-z])(>BeetletunS*?<)(?=[^A-Za-z]|$)/gi, '$1>甲虫镇<');
    data=data.replace(/(^|[^A-Za-z])(>Watchtower CoastS*?<)(?=[^A-Za-z]|$)/gi, '$1>瞭望塔海岸<');
    data=data.replace(/(^|[^A-Za-z])(>Gates of KrytaS*?<)(?=[^A-Za-z]|$)/gi, '$1>科瑞塔关所<');
    data=data.replace(/(^|[^A-Za-z])(>Scoundrel's RiseS*?<)(?=[^A-Za-z]|$)/gi, '$1>恶汉山丘<');
    data=data.replace(/(^|[^A-Za-z])(>Mergoyle WavebreakerS*?<)(?=[^A-Za-z]|$)/gi, '$1>碎浪石像魔<');
    data=data.replace(/(^|[^A-Za-z])(>Mergoyle SkullS*?<)(?=[^A-Za-z]|$)/gi, '$1>石像魔头颅<');
    data=data.replace(/(^|[^A-Za-z])(>Nundu BayS*?<)(?=[^A-Za-z]|$)/gi, '$1>纳度湾<');
    data=data.replace(/(^|[^A-Za-z])(>Marga CoastS*?<)(?=[^A-Za-z]|$)/gi, '$1>马加海岸<');
    data=data.replace(/(^|[^A-Za-z])(>Yohlon HavenS*?<)(?=[^A-Za-z]|$)/gi, '$1>犹朗避难所<');
    data=data.replace(/(^|[^A-Za-z])(>Arkjok WardS*?<)(?=[^A-Za-z]|$)/gi, '$1>阿尔科监禁区<');
    data=data.replace(/(^|[^A-Za-z])(>Bladed Veldt TermiteS*?<)(?=[^A-Za-z]|$)/gi, '$1>利刃草原蚁<');
    data=data.replace(/(^|[^A-Za-z])(>Veldt Beetle LanceS*?<)(?=[^A-Za-z]|$)/gi, '$1>草原尖刺甲虫<');
    data=data.replace(/(^|[^A-Za-z])(>Veldt Beetle QueenS*?<)(?=[^A-Za-z]|$)/gi, '$1>草原甲虫后<');
    data=data.replace(/(^|[^A-Za-z])(>Insect CarapaceS*?<)(?=[^A-Za-z]|$)/gi, '$1>甲虫壳<');
    data=data.replace(/(^|[^A-Za-z])(>CavalonS*?<)(?=[^A-Za-z]|$)/gi, '$1>卡瓦隆<');
    data=data.replace(/(^|[^A-Za-z])(>ArchipelagosS*?<)(?=[^A-Za-z]|$)/gi, '$1>群岛<');
    data=data.replace(/(^|[^A-Za-z])(>Creeping CarpS*?<)(?=[^A-Za-z]|$)/gi, '$1>爬行鲤鱼<');
    data=data.replace(/(^|[^A-Za-z])(>Scuttle FishS*?<)(?=[^A-Za-z]|$)/gi, '$1>甲板鱼<');
    data=data.replace(/(^|[^A-Za-z])(>IrukandjiS*?<)(?=[^A-Za-z]|$)/gi, '$1>毒水母<');
    data=data.replace(/(^|[^A-Za-z])(>Black PearlS*?<)(?=[^A-Za-z]|$)/gi, '$1>黑珍珠<');
    data=data.replace(/(^|[^A-Za-z])(>Bone PalaceS*?<)(?=[^A-Za-z]|$)/gi, '$1>白骨宫殿<');
    data=data.replace(/(^|[^A-Za-z])(>Joko's DomainS*?<)(?=[^A-Za-z]|$)/gi, '$1>杰格领地<');
    data=data.replace(/(^|[^A-Za-z])(>The Shattered RavinesS*?<)(?=[^A-Za-z]|$)/gi, '$1>碎裂沟谷<');
    data=data.replace(/(^|[^A-Za-z])(>Basalt GrottoS*?<)(?=[^A-Za-z]|$)/gi, '$1>玄武岩石穴<');
    data=data.replace(/(^|[^A-Za-z])(>Sandstorm CragS*?<)(?=[^A-Za-z]|$)/gi, '$1>沙风暴．克雷格<');
    data=data.replace(/(^|[^A-Za-z])(>Shambling MesaS*?<)(?=[^A-Za-z]|$)/gi, '$1>震颤者．梅萨<');
    data=data.replace(/(^|[^A-Za-z])(>Sandblasted LodestoneS*?<)(?=[^A-Za-z]|$)/gi, '$1>喷沙磁石<');
    data=data.replace(/(^|[^A-Za-z])(>Yak's BendS*?<)(?=[^A-Za-z]|$)/gi, '$1>牦牛村<');
    data=data.replace(/(^|[^A-Za-z])(>Traveler's ValeS*?<)(?=[^A-Za-z]|$)/gi, '$1>旅人谷<');
    data=data.replace(/(^|[^A-Za-z])(>Iron Horse MineS*?<)(?=[^A-Za-z]|$)/gi, '$1>铁马矿山<');
    data=data.replace(/(^|[^A-Za-z])(>Beacon's PerchS*?<)(?=[^A-Za-z]|$)/gi, '$1>毕肯高地<');
    data=data.replace(/(^|[^A-Za-z])(>Deldrimor BowlS*?<)(?=[^A-Za-z]|$)/gi, '$1>戴尔迪摩盆地<');
    data=data.replace(/(^|[^A-Za-z])(>Griffon's MouthS*?<)(?=[^A-Za-z]|$)/gi, '$1>狮鹫兽隘口<');
    data=data.replace(/(^|[^A-Za-z])(>Snow EttinS*?<)(?=[^A-Za-z]|$)/gi, '$1>冰雪双头巨人<');
    data=data.replace(/(^|[^A-Za-z])(>Icy HumpS*?<)(?=[^A-Za-z]|$)/gi, '$1>冰雪瘤<');
    data=data.replace(/(^|[^A-Za-z])(>Ran Musu GardensS*?<)(?=[^A-Za-z]|$)/gi, '$1>岚穆苏花园<');
    data=data.replace(/(^|[^A-Za-z])(>Minister Cho's EstateS*? \(explorable area\)<)(?=[^A-Za-z]|$)/gi, '$1>周大臣庄园 (探索区)<');
	data=data.replace(/(^|[^A-Za-z])(>Minister Cho's EstateS*?<)(?=[^A-Za-z]|$)/gi, '$1>周大臣庄园<');
    data=data.replace(/(^|[^A-Za-z])(>Sickened ServantS*?<)(?=[^A-Za-z]|$)/gi, '$1>病变的使者<');
    data=data.replace(/(^|[^A-Za-z])(>Sickened PeasantS*?<)(?=[^A-Za-z]|$)/gi, '$1>病变的书记<');
    data=data.replace(/(^|[^A-Za-z])(>Sickened Guard (warrior)S*?<)(?=[^A-Za-z]|$)/gi, '$1>病变的警卫<');
    data=data.replace(/(^|[^A-Za-z])(>Forgotten Trinket Boxe*?S*?<)(?=[^A-Za-z]|$)/gi, '$1>被遗忘的小箱子<');
    data=data.replace(/(^|[^A-Za-z])(>Ventari's RefugeS*?<)(?=[^A-Za-z]|$)/gi, '$1>凡特里庇护所<');
    data=data.replace(/(^|[^A-Za-z])(>Ettin's BackS*?<)(?=[^A-Za-z]|$)/gi, '$1>双头怪隐匿第<');
    data=data.replace(/(^|[^A-Za-z])(>Reed BogS*?<)(?=[^A-Za-z]|$)/gi, '$1>芦苇沼泽地<');
    data=data.replace(/(^|[^A-Za-z])(>The FallsS*?<)(?=[^A-Za-z]|$)/gi, '$1>陷落区<');
    data=data.replace(/(^|[^A-Za-z])(>Maguuma SpiderS*?<)(?=[^A-Za-z]|$)/gi, '$1>梅古玛蜘蛛<');
    data=data.replace(/(^|[^A-Za-z])(>Maguuma Spider WebS*?<)(?=[^A-Za-z]|$)/gi, '$1>梅古玛蜘蛛丝<');
    data=data.replace(/(^|[^A-Za-z])(>Jennur's HordeS*?<)(?=[^A-Za-z]|$)/gi, '$1>征纳群落<');
    data=data.replace(/(^|[^A-Za-z])(>Vehjin MinesS*?<)(?=[^A-Za-z]|$)/gi, '$1>威金矿坑<');
    data=data.replace(/(^|[^A-Za-z])(>Cobalt ScabaraS*?<)(?=[^A-Za-z]|$)/gi, '$1>深蓝斯卡巴拉<');
    data=data.replace(/(^|[^A-Za-z])(>Cobalt MokeleS*?<)(?=[^A-Za-z]|$)/gi, '$1>深蓝魔克雷<');
    data=data.replace(/(^|[^A-Za-z])(>Cobalt ShriekerS*?<)(?=[^A-Za-z]|$)/gi, '$1>深蓝尖啸者<');
    data=data.replace(/(^|[^A-Za-z])(>Cobalt TalonS*?<)(?=[^A-Za-z]|$)/gi, '$1>深蓝之爪<');
    data=data.replace(/(^|[^A-Za-z])(>Sunspear SanctuaryS*?<)(?=[^A-Za-z]|$)/gi, '$1>日戟避难所<');
    data=data.replace(/(^|[^A-Za-z])(>Command PostS*?<)(?=[^A-Za-z]|$)/gi, '$1>指挥所<');
    data=data.replace(/(^|[^A-Za-z])(>Jahai BluffsS*?<)(?=[^A-Za-z]|$)/gi, '$1>夏亥峭壁<');
    data=data.replace(/(^|[^A-Za-z])(>Rare material traderS*?<)(?=[^A-Za-z]|$)/gi, '$1>稀有材料商人<');
    data=data.replace(/(^|[^A-Za-z])(>Elonian Leathers*(?: SquareS*?)?<)(?=[^A-Za-z]|$)/gi, '$1>伊洛那皮革<');
    data=data.replace(/(^|[^A-Za-z])(>Deldrimor War CampS*?<)(?=[^A-Za-z]|$)/gi, '$1>戴尔狄摩兵营<');
    data=data.replace(/(^|[^A-Za-z])(>Grenth's FootprintS*?<)(?=[^A-Za-z]|$)/gi, '$1>古兰斯的足迹<');
    data=data.replace(/(^|[^A-Za-z])(>Sorrow's FurnaceS*?<)(?=[^A-Za-z]|$)/gi, '$1>哀伤熔炉<');
    data=data.replace(/(^|[^A-Za-z])(>Priest of SorrowsS*?<)(?=[^A-Za-z]|$)/gi, '$1>哀伤祭司<');
    data=data.replace(/(^|[^A-Za-z])(>Summit WardenS*?<)(?=[^A-Za-z]|$)/gi, '$1>石峰看守者<');
    data=data.replace(/(^|[^A-Za-z])(>Summit SurveyorS*?<)(?=[^A-Za-z]|$)/gi, '$1>石峰测量员<');
    data=data.replace(/(^|[^A-Za-z])(>Summit Dark BinderS*?<)(?=[^A-Za-z]|$)/gi, '$1>石峰黑暗束缚者<');
    data=data.replace(/(^|[^A-Za-z])(>Summit Deep KnightS*?<)(?=[^A-Za-z]|$)/gi, '$1>石峰深渊骑士<');
    data=data.replace(/(^|[^A-Za-z])(>Summit TaskmasterS*?<)(?=[^A-Za-z]|$)/gi, '$1>石峰工头<');
    data=data.replace(/(^|[^A-Za-z])(>Enslavement StoneS*?<)(?=[^A-Za-z]|$)/gi, '$1>奴隶石<');
    data=data.replace(/(^|[^A-Za-z])(>Ventari's RefugeS*?<)(?=[^A-Za-z]|$)/gi, '$1>凡特里避难所<');
    data=data.replace(/(^|[^A-Za-z])(>Ettin's BackS*?<)(?=[^A-Za-z]|$)/gi, '$1>双头怪隐匿地<');
    data=data.replace(/(^|[^A-Za-z])(>The WildsS*?<)(?=[^A-Za-z]|$)/gi, '$1>荒原<');
    data=data.replace(/(^|[^A-Za-z])(>Moss ScarabS*?<)(?=[^A-Za-z]|$)/gi, '$1>苔圣甲虫<');
    data=data.replace(/(^|[^A-Za-z])(>Mossy MandibleS*?<)(?=[^A-Za-z]|$)/gi, '$1>生苔下颚骨<');
    data=data.replace(/(^|[^A-Za-z])(>Ran Musu GardensS*?<)(?=[^A-Za-z]|$)/gi, '$1>岚穆苏花园<');
    data=data.replace(/(^|[^A-Za-z])(>Kinya ProvinceS*?<)(?=[^A-Za-z]|$)/gi, '$1>欣弥领地<');
    data=data.replace(/(^|[^A-Za-z])(>Panjiang PeninsulaS*?<)(?=[^A-Za-z]|$)/gi, '$1>班让半岛<');
    data=data.replace(/(^|[^A-Za-z])(>Crimson SkullS*?<)(?=[^A-Za-z]|$)/gi, '$1>红颅<');
    data=data.replace(/(^|[^A-Za-z])(>Copper Crimson Skull CoinS*?<)(?=[^A-Za-z]|$)/gi, '$1>红颅铜币<');
    data=data.replace(/(^|[^A-Za-z])(>Dunes of DespairS*?<)(?=[^A-Za-z]|$)/gi, '$1>绝望沙丘<');
    data=data.replace(/(^|[^A-Za-z])(>Vulture DriftsS*?<)(?=[^A-Za-z]|$)/gi, '$1>秃鹰沙丘<');
    data=data.replace(/(^|[^A-Za-z])(>Enchanted HammerS*?<)(?=[^A-Za-z]|$)/gi, '$1>附魔巨锤兵<');
    data=data.replace(/(^|[^A-Za-z])(>Enchanted SwordS*?<)(?=[^A-Za-z]|$)/gi, '$1>附魔长剑兵<');
    data=data.replace(/(^|[^A-Za-z])(>Enchanted BowS*?<)(?=[^A-Za-z]|$)/gi, '$1>附魔弓兵<');
    data=data.replace(/(^|[^A-Za-z])(>Forgotten SealS*?<)(?=[^A-Za-z]|$)/gi, '$1>遗忘者图章<');
    data=data.replace(/(^|[^A-Za-z])(>Dasha VestibuleS*?<)(?=[^A-Za-z]|$)/gi, '$1>达沙走廊<');
    data=data.replace(/(^|[^A-Za-z])(>The Hidden City of AhdashimS*?<)(?=[^A-Za-z]|$)/gi, '$1>隐藏之城 哈达辛<');
    data=data.replace(/(^|[^A-Za-z])(>Key of AhdashimS*?<)(?=[^A-Za-z]|$)/gi, '$1>哈达辛之钥<');
    data=data.replace(/(^|[^A-Za-z])(>Diamond Djinn EssenceS*?<)(?=[^A-Za-z]|$)/gi, '$1>钻石巨灵精华<');
    data=data.replace(/(^|[^A-Za-z])(>Diamond DjinnS*?<)(?=[^A-Za-z]|$)/gi, '$1>钻石巨灵<');
    data=data.replace(/(^|[^A-Za-z])(>Temple of the AgesS*?<)(?=[^A-Za-z]|$)/gi, '$1>世纪神殿<');
    data=data.replace(/(^|[^A-Za-z])(>Talmark WildernessS*?<)(?=[^A-Za-z]|$)/gi, '$1>突马克荒地<');
    data=data.replace(/(^|[^A-Za-z])(>Bergen Hot SpringsS*?<)(?=[^A-Za-z]|$)/gi, '$1>卑尔根温泉<');
    data=data.replace(/(^|[^A-Za-z])(>Cursed LandsS*?<)(?=[^A-Za-z]|$)/gi, '$1>诅咒之地<');
    data=data.replace(/(^|[^A-Za-z])(>Ancient OakheartS*?<)(?=[^A-Za-z]|$)/gi, '$1>古老橡树妖<');
    data=data.replace(/(^|[^A-Za-z])(>OakheartS*?<)(?=[^A-Za-z]|$)/gi, '$1>橡树妖<');
    data=data.replace(/(^|[^A-Za-z])(>Spined AloeS*?<)(?=[^A-Za-z]|$)/gi, '$1>突刺芦荟<');
    data=data.replace(/(^|[^A-Za-z])(>Reed StalkerS*?<)(?=[^A-Za-z]|$)/gi, '$1>芦苇潜行者<');
    data=data.replace(/(^|[^A-Za-z])(>Abnormal SeedS*?<)(?=[^A-Za-z]|$)/gi, '$1>畸形的种子<');
    data=data.replace(/(^|[^A-Za-z])(>The Mouth of TormentS*?<)(?=[^A-Za-z]|$)/gi, '$1>苦痛之地隘口<');
    data=data.replace(/(^|[^A-Za-z])(>The Ruptured HeartS*?<)(?=[^A-Za-z]|$)/gi, '$1>破裂之心<');
    data=data.replace(/(^|[^A-Za-z])(>Gate of TormentS*?<)(?=[^A-Za-z]|$)/gi, '$1>苦痛之门<');
    data=data.replace(/(^|[^A-Za-z])(>Realm of TormentS*?<)(?=[^A-Za-z]|$)/gi, '$1>苦痛领域<');
    data=data.replace(/(^|[^A-Za-z])(>Nightfallen JahaiS*?<)(?=[^A-Za-z]|$)/gi, '$1>夜蚀暗殒 夏亥<');
    data=data.replace(/(^|[^A-Za-z])(>Arm of InsanityS*?<)(?=[^A-Za-z]|$)/gi, '$1>狂乱武装<');
    data=data.replace(/(^|[^A-Za-z])(>Scythe of ChaosS*?<)(?=[^A-Za-z]|$)/gi, '$1>混沌镰刀<');
    data=data.replace(/(^|[^A-Za-z])(>Blade of CorruptionS*?<)(?=[^A-Za-z]|$)/gi, '$1>堕落之刃<');
    data=data.replace(/(^|[^A-Za-z])(>Shadow of FearS*?<)(?=[^A-Za-z]|$)/gi, '$1>恐惧暗影<');
    data=data.replace(/(^|[^A-Za-z])(>Rain of TerrorS*?<)(?=[^A-Za-z]|$)/gi, '$1>惊骇之雨<');
    data=data.replace(/(^|[^A-Za-z])(>Herald of NightmaresS*?<)(?=[^A-Za-z]|$)/gi, '$1>梦靥使者<');
    data=data.replace(/(^|[^A-Za-z])(>Spear of TormentS*?<)(?=[^A-Za-z]|$)/gi, '$1>苦痛之矛<');
    data=data.replace(/(^|[^A-Za-z])(>Word of MadnessS*?<)(?=[^A-Za-z]|$)/gi, '$1>疯狂话语<');
    data=data.replace(/(^|[^A-Za-z])(>Demonic RelicS*?<)(?=[^A-Za-z]|$)/gi, '$1>恶魔残片<');
    data=data.replace(/(^|[^A-Za-z])(>Ice Tooth CaveS*?<)(?=[^A-Za-z]|$)/gi, '$1>冰牙洞穴<');
    data=data.replace(/(^|[^A-Za-z])(>Anvil RockS*?<)(?=[^A-Za-z]|$)/gi, '$1>铁砧石<');
    data=data.replace(/(^|[^A-Za-z])(>Frostfire DryderS*?<)(?=[^A-Za-z]|$)/gi, '$1>霜火蛛化精灵<');
    data=data.replace(/(^|[^A-Za-z])(>Frostfire FangS*?<)(?=[^A-Za-z]|$)/gi, '$1>霜火尖牙<');
    data=data.replace(/(^|[^A-Za-z])(>Pongmei ValleyS*?<)(?=[^A-Za-z]|$)/gi, '$1>朋美谷<');
    data=data.replace(/(^|[^A-Za-z])(>Rot WallowS*?<)(?=[^A-Za-z]|$)/gi, '$1>腐败兽<');
    data=data.replace(/(^|[^A-Za-z])(>Rot Wallow TuskS*?<)(?=[^A-Za-z]|$)/gi, '$1>腐败兽獠牙<');
    data=data.replace(/(^|[^A-Za-z])(>Elona ReachS*?<)(?=[^A-Za-z]|$)/gi, '$1>伊洛那流域<');
    data=data.replace(/(^|[^A-Za-z])(>Diviner's AscentS*?<)(?=[^A-Za-z]|$)/gi, '$1>预言者之坡<');
    data=data.replace(/(^|[^A-Za-z])(>Sand DrakeS*?<)(?=[^A-Za-z]|$)/gi, '$1>沙龙兽<');
    data=data.replace(/(^|[^A-Za-z])(>Topaz CrestS*?<)(?=[^A-Za-z]|$)/gi, '$1>黄宝石颈脊<');
    data=data.replace(/(^|[^A-Za-z])(>Rata SumS*?<)(?=[^A-Za-z]|$)/gi, '$1>洛达顶点<');
    data=data.replace(/(^|[^A-Za-z])(>Magus StonesS*?<)(?=[^A-Za-z]|$)/gi, '$1>玛古斯之石<');
    data=data.replace(/(^|[^A-Za-z])(>LifeweaverS*?<)(?=[^A-Za-z]|$)/gi, '$1>织命者<');
    data=data.replace(/(^|[^A-Za-z])(>BloodweaverS*?<)(?=[^A-Za-z]|$)/gi, '$1>织血者<');
    data=data.replace(/(^|[^A-Za-z])(>VenomweaverS*?<)(?=[^A-Za-z]|$)/gi, '$1>织恨者<');
    data=data.replace(/(^|[^A-Za-z])(>SpiderS*?<)(?=[^A-Za-z]|$)/gi, '$1>蜘蛛<');
    data=data.replace(/(^|[^A-Za-z])(>Weaver LegS*?<)(?=[^A-Za-z]|$)/gi, '$1>编织者的腿<');
    data=data.replace(/(^|[^A-Za-z])(>Yahnur MarketS*?<)(?=[^A-Za-z]|$)/gi, '$1>雅诺尔市集<');
    data=data.replace(/(^|[^A-Za-z])(>Vehtendi ValleyS*?<)(?=[^A-Za-z]|$)/gi, '$1>巍天帝峡谷<');
    data=data.replace(/(^|[^A-Za-z])(>Storm JacarandaS*?<)(?=[^A-Za-z]|$)/gi, '$1>暴风荆棘<');
    data=data.replace(/(^|[^A-Za-z])(>Mirage IbogaS*?<)(?=[^A-Za-z]|$)/gi, '$1>幻象伊波枷<');
    data=data.replace(/(^|[^A-Za-z])(>Enchanted BramblesS*?<)(?=[^A-Za-z]|$)/gi, '$1>魔法树根<');
    data=data.replace(/(^|[^A-Za-z])(>Whistling ThornbrushS*?<)(?=[^A-Za-z]|$)/gi, '$1>荆棘之藤<');
    data=data.replace(/(^|[^A-Za-z])(>Sentient SporeS*?<)(?=[^A-Za-z]|$)/gi, '$1>知觉孢子<');
    data=data.replace(/(^|[^A-Za-z])(>AhojS*?<)(?=[^A-Za-z]|$)/gi, '$1>亚禾<');
    data=data.replace(/(^|[^A-Za-z])(>Bottle of Vabbian WineS*?<)(?=[^A-Za-z]|$)/gi, '$1>瓦贝红酒<');
    data=data.replace(/(^|[^A-Za-z])(>Jarimiya the UnmercifulS*?<)(?=[^A-Za-z]|$)/gi, '$1>残酷 贾米里<');
    data=data.replace(/(^|[^A-Za-z])(>Blacktide DenS*?<)(?=[^A-Za-z]|$)/gi, '$1>黑潮之穴<');
    data=data.replace(/(^|[^A-Za-z])(>Lahtenda BogS*?<)(?=[^A-Za-z]|$)/gi, '$1>洛天帝沼泽<');
    data=data.replace(/(^|[^A-Za-z])(>Mandragor ImpS*?<)(?=[^A-Za-z]|$)/gi, '$1>曼陀罗恶魔<');
    data=data.replace(/(^|[^A-Za-z])(>Mandragor SlitherS*?<)(?=[^A-Za-z]|$)/gi, '$1>曼陀罗之藤<');
    data=data.replace(/(^|[^A-Za-z])(>Stoneflesh MandragorS*?<)(?=[^A-Za-z]|$)/gi, '$1>曼陀罗石根<');
    data=data.replace(/(^|[^A-Za-z])(>Mandragor SwamprootS*?<)(?=[^A-Za-z]|$)/gi, '$1>曼陀罗根<');
    data=data.replace(/(^|[^A-Za-z])(>Vasburg ArmoryS*?<)(?=[^A-Za-z]|$)/gi, '$1>维思柏兵营<');
    
    data=data.replace(/(^|[^A-Za-z])(>Skill Hungry GakiS*?<)(?=[^A-Za-z]|$)/gi, '$1>灵巧的饿鬼<');
    data=data.replace(/(^|[^A-Za-z])(>Pain Hungry GakiS*?<)(?=[^A-Za-z]|$)/gi, '$1>痛苦的饿鬼<');
    data=data.replace(/(^|[^A-Za-z])(>Quarrel FallsS*?<)(?=[^A-Za-z]|$)/gi, '$1>怨言瀑布<');
    data=data.replace(/(^|[^A-Za-z])(>SilverwoodS*?<)(?=[^A-Za-z]|$)/gi, '$1>银树<');
    data=data.replace(/(^|[^A-Za-z])(>Maguuma WarriorS*?<)(?=[^A-Za-z]|$)/gi, '$1>梅古玛战士<');
    data=data.replace(/(^|[^A-Za-z])(>Maguuma HunterS*?<)(?=[^A-Za-z]|$)/gi, '$1>梅古玛猎人<');
    data=data.replace(/(^|[^A-Za-z])(>Maguuma ProtectorS*?<)(?=[^A-Za-z]|$)/gi, '$1>梅古玛守护者<');
    data=data.replace(/(^|[^A-Za-z])(>Maguuma ManeS*?<)(?=[^A-Za-z]|$)/gi, '$1>梅古玛鬃毛<');
    data=data.replace(/(^|[^A-Za-z])(>Seeker's PassageS*?<)(?=[^A-Za-z]|$)/gi, '$1>探索者通道<');
    data=data.replace(/(^|[^A-Za-z])(>Salt FlatsS*?<)(?=[^A-Za-z]|$)/gi, '$1>盐滩<');
    data=data.replace(/(^|[^A-Za-z])(>The Amnoon OasisS*?<)(?=[^A-Za-z]|$)/gi, '$1>安努绿洲<');
    data=data.replace(/(^|[^A-Za-z])(>Prophet's PathS*?<)(?=[^A-Za-z]|$)/gi, '$1>先知之路<');
    data=data.replace(/(^|[^A-Za-z])(>Jade ScarabS*?<)(?=[^A-Za-z]|$)/gi, '$1>翡翠圣甲虫<');
    data=data.replace(/(^|[^A-Za-z])(>Jade MandibleS*?<)(?=[^A-Za-z]|$)/gi, '$1>翡翠下颚骨<');
    data=data.replace(/(^|[^A-Za-z])(>Temple of the AgesS*?<)(?=[^A-Za-z]|$)/gi, '$1>辛库走廊<');
    data=data.replace(/(^|[^A-Za-z])(>Sunjiang DistrictS*?<)(?=[^A-Za-z]|$)/gi, '$1>孙江行政区<');
    data=data.replace(/(^|[^A-Za-z])(>Sunjiang DistrictS*?<)(?=[^A-Za-z]|$)/gi, '$1>孙江行政区<');
    data=data.replace(/(^|[^A-Za-z])(>Shenzun TunnelsS*?<)(?=[^A-Za-z]|$)/gi, '$1>申赞通道<');
    data=data.replace(/(^|[^A-Za-z])(>AfflictedS*?<)(?=[^A-Za-z]|$)/gi, '$1>被感染的<');
    data=data.replace(/(^|[^A-Za-z])(>Putrid CystS*?<)(?=[^A-Za-z]|$)/gi, '$1>腐败胞囊<');
    data=data.replace(/(^|[^A-Za-z])(>The AstralariumS*?<)(?=[^A-Za-z]|$)/gi, '$1>世纪神殿<');
    data=data.replace(/(^|[^A-Za-z])(>Zehlon ReachS*?<)(?=[^A-Za-z]|$)/gi, '$1>黑色帷幕<');
    data=data.replace(/(^|[^A-Za-z])(>Beknur HarborS*?<)(?=[^A-Za-z]|$)/gi, '$1>突马克荒地<');
    data=data.replace(/(^|[^A-Za-z])(>Skale BlighterS*?<)(?=[^A-Za-z]|$)/gi, '$1>森林牛头怪<');
    data=data.replace(/(^|[^A-Za-z])(>Skale FinS*?<)(?=[^A-Za-z]|$)/gi, '$1>森林牛头怪的角<');
    data=data.replace(/(^|[^A-Za-z])(>The AstralariumS*?<)(?=[^A-Za-z]|$)/gi, '$1>亚斯特拉利姆<');
    data=data.replace(/(^|[^A-Za-z])(>Zehlon ReachS*?<)(?=[^A-Za-z]|$)/gi, '$1>列隆流域<');
    data=data.replace(/(^|[^A-Za-z])(>Beknur HarborS*?<)(?=[^A-Za-z]|$)/gi, '$1>别克诺港<');
    data=data.replace(/(^|[^A-Za-z])(>Issnur IslesS*?<)(?=[^A-Za-z]|$)/gi, '$1>伊斯诺岛<');
    data=data.replace(/(^|[^A-Za-z])(>Skale BlighterS*?<)(?=[^A-Za-z]|$)/gi, '$1>黑暗鳞怪<');
    data=data.replace(/(^|[^A-Za-z])(>Frigid SkaleS*?<)(?=[^A-Za-z]|$)/gi, '$1>寒冰鳞怪<');
    data=data.replace(/(^|[^A-Za-z])(>Ridgeback SkaleS*?<)(?=[^A-Za-z]|$)/gi, '$1>脊背鳞怪<');
    data=data.replace(/(^|[^A-Za-z])(>Skale FinS*?<)(?=[^A-Za-z]|$)/gi, '$1>鳞怪鳍<');
    data=data.replace(/(^|[^A-Za-z])(>Chef PanjohS*?<)(?=[^A-Za-z]|$)/gi, '$1>大厨 潘乔<');
    data=data.replace(/(^|[^A-Za-z])(>Bowl of Skalefin SoupS*?<)(?=[^A-Za-z]|$)/gi, '$1>鳞怪鳍汤<');
    data=data.replace(/(^|[^A-Za-z])(>Sage LandsS*?<)(?=[^A-Za-z]|$)/gi, '$1>荒原<');
    data=data.replace(/(^|[^A-Za-z])(>Mamnoon LagoonS*?<)(?=[^A-Za-z]|$)/gi, '$1>玛奴泻湖<');
    data=data.replace(/(^|[^A-Za-z])(>Henge of DenraviS*?<)(?=[^A-Za-z]|$)/gi, '$1>丹拉维圣地<');
    data=data.replace(/(^|[^A-Za-z])(>Tangle RootS*?<)(?=[^A-Za-z]|$)/gi, '$1>纠结之根<');
    data=data.replace(/(^|[^A-Za-z])(>Dry TopS*?<)(?=[^A-Za-z]|$)/gi, '$1>干燥高地<');
    data=data.replace(/(^|[^A-Za-z])(>Behemoth JawS*?<)(?=[^A-Za-z]|$)/gi, '$1>巨兽颚<');
    data=data.replace(/(^|[^A-Za-z])(>Root BehemothS*?<)(?=[^A-Za-z]|$)/gi, '$1>根巨兽<');
    data=data.replace(/(^|[^A-Za-z])(>Brauer AcademyS*?<)(?=[^A-Za-z]|$)/gi, '$1>袭哈拉<');
    data=data.replace(/(^|[^A-Za-z])(>Jaga MoraineS*?<)(?=[^A-Za-z]|$)/gi, '$1>亚加摩瑞恩<');
    data=data.replace(/(^|[^A-Za-z])(>UndergrowthS*?<)(?=[^A-Za-z]|$)/gi, '$1>海冶克狂战士<');
    data=data.replace(/(^|[^A-Za-z])(>Dragon MossS*?<)(?=[^A-Za-z]|$)/gi, '$1>牛头怪狂战士<');
    data=data.replace(/(^|[^A-Za-z])(>Dragon MossS*?<)(?=[^A-Za-z]|$)/gi, '$1>狂战士 纹帝哥<');
    data=data.replace(/(^|[^A-Za-z])(>Dragon MossS*?<)(?=[^A-Za-z]|$)/gi, '$1>棘狼狂战士<');
    data=data.replace(/(^|[^A-Za-z])(>Berserker HornS*?<)(?=[^A-Za-z]|$)/gi, '$1>狂战士的角<');
    data=data.replace(/(^|[^A-Za-z])(>Brauer AcademyS*?<)(?=[^A-Za-z]|$)/gi, '$1>巴尔学院<');
    data=data.replace(/(^|[^A-Za-z])(>Drazach ThicketS*?<)(?=[^A-Za-z]|$)/gi, '$1>德瑞扎灌木林<');
    data=data.replace(/(^|[^A-Za-z])(>Tanglewood CopseS*?<)(?=[^A-Za-z]|$)/gi, '$1>谭格坞树林<');
    data=data.replace(/(^|[^A-Za-z])(>Pongmei ValleyS*?<)(?=[^A-Za-z]|$)/gi, '$1>朋美谷<');
    data=data.replace(/(^|[^A-Za-z])(>UndergrowthS*?<)(?=[^A-Za-z]|$)/gi, '$1>矮树丛<');
    data=data.replace(/(^|[^A-Za-z])(>Dragon MossS*?<)(?=[^A-Za-z]|$)/gi, '$1>龙苔<');
    data=data.replace(/(^|[^A-Za-z])(>Dragon RootS*?<)(?=[^A-Za-z]|$)/gi, '$1>龙根<');
    data=data.replace(/(^|[^A-Za-z])(>Fishermen's HavenS*?<)(?=[^A-Za-z]|$)/gi, '$1>渔人避风港<');
    data=data.replace(/(^|[^A-Za-z])(>Stingray StrandS*?<)(?=[^A-Za-z]|$)/gi, '$1>魟鱼湖滨<');
    data=data.replace(/(^|[^A-Za-z])(>Tears of the FallenS*?<)(?=[^A-Za-z]|$)/gi, '$1>战死者之泪<');
    data=data.replace(/(^|[^A-Za-z])(>Grand DrakeS*?<)(?=[^A-Za-z]|$)/gi, '$1>强龙兽<');
    data=data.replace(/(^|[^A-Za-z])(>Sanctum CayS*?<)(?=[^A-Za-z]|$)/gi, '$1>神圣沙滩<');
    data=data.replace(/(^|[^A-Za-z])(>Lightning DrakeS*?<)(?=[^A-Za-z]|$)/gi, '$1>闪光龙兽<');
    data=data.replace(/(^|[^A-Za-z])(>Spiked CrestS*?<)(?=[^A-Za-z]|$)/gi, '$1>尖刺的颈脊<');
    data=data.replace(/(^|[^A-Za-z])(>Imperial SanctumS*?<)(?=[^A-Za-z]|$)/gi, '$1>帝国圣所<');
    data=data.replace(/(^|[^A-Za-z])(>Soul StoneS*?<)(?=[^A-Za-z]|$)/gi, '$1>灵魂石<');
    data=data.replace(/(^|[^A-Za-z])(>Tihark OrchardS*?<)(?=[^A-Za-z]|$)/gi, '$1>提亚克林地<');
    data=data.replace(/(^|[^A-Za-z])(>Forum HighlandsS*?<)(?=[^A-Za-z]|$)/gi, '$1>高地广场<');
    data=data.replace(/(^|[^A-Za-z])(>Skree WingS*?<)(?=[^A-Za-z]|$)/gi, '$1>鸟妖翅膀<');
    data=data.replace(/(^|[^A-Za-z])(>SkreeS*?<)(?=[^A-Za-z]|$)/gi, '$1>鸟妖<');
    data=data.replace(/(^|[^A-Za-z])(>Serenity TempleS*?<)(?=[^A-Za-z]|$)/gi, '$1>宁静神殿<');
    data=data.replace(/(^|[^A-Za-z])(>Pockmark FlatsS*?<)(?=[^A-Za-z]|$)/gi, '$1>麻点平原<');
    data=data.replace(/(^|[^A-Za-z])(>Storm RiderS*?<)(?=[^A-Za-z]|$)/gi, '$1>暴风驾驭者<');
    data=data.replace(/(^|[^A-Za-z])(>Stormy EyeS*?<)(?=[^A-Za-z]|$)/gi, '$1>暴风之眼<');
    data=data.replace(/(^|[^A-Za-z])(>Gates of KrytaS*?<)(?=[^A-Za-z]|$)/gi, '$1>科瑞塔之门<');
    data=data.replace(/(^|[^A-Za-z])(>Scoundrel's RiseS*?<)(?=[^A-Za-z]|$)/gi, '$1>恶汉山丘<');
    data=data.replace(/(^|[^A-Za-z])(>Griffon's MouthS*?<)(?=[^A-Za-z]|$)/gi, '$1>狮鹭兽隘口<');
    data=data.replace(/(^|[^A-Za-z])(>Spiritwood PlankS*?<)(?=[^A-Za-z]|$)/gi, '$1>心灵之板<');
    data=data.replace(/(^|[^A-Za-z])(>Tsumei VillageS*?<)(?=[^A-Za-z]|$)/gi, '$1>苏梅村<');
    data=data.replace(/(^|[^A-Za-z])(>Panjiang PeninsulaS*?<)(?=[^A-Za-z]|$)/gi, '$1>班让半岛<');
    data=data.replace(/(^|[^A-Za-z])(>NagaS*?<)(?=[^A-Za-z]|$)/gi, '$1>纳迦<');
    data=data.replace(/(^|[^A-Za-z])(>Naga HideS*?<)(?=[^A-Za-z]|$)/gi, '$1>纳迦皮<');
    data=data.replace(/(^|[^A-Za-z])(>SifhallaS*?<)(?=[^A-Za-z]|$)/gi, '$1>袭哈拉<');
    data=data.replace(/(^|[^A-Za-z])(>Drakkar LakeS*?<)(?=[^A-Za-z]|$)/gi, '$1>卓卡湖<');
    data=data.replace(/(^|[^A-Za-z])(>Frozen ElementalS*?<)(?=[^A-Za-z]|$)/gi, '$1>冰元素<');
    data=data.replace(/(^|[^A-Za-z])(>Pile of Elemental DustS*?<)(?=[^A-Za-z]|$)/gi, '$1>元素之土<');
    data=data.replace(/(^|[^A-Za-z])(>Bergen Hot SpringsS*?<)(?=[^A-Za-z]|$)/gi, '$1>卑尔根温泉<');
    data=data.replace(/(^|[^A-Za-z])(>Nebo TerraceS*?<)(?=[^A-Za-z]|$)/gi, '$1>尼伯山丘<');
    data=data.replace(/(^|[^A-Za-z])(>North Kryta ProvinceS*?<)(?=[^A-Za-z]|$)/gi, '$1>科瑞塔北部<');
    data=data.replace(/(^|[^A-Za-z])(>Gypsie EttinS*?<)(?=[^A-Za-z]|$)/gi, '$1>流浪双头巨人<');
    data=data.replace(/(^|[^A-Za-z])(>Hardened HumpS*?<)(?=[^A-Za-z]|$)/gi, '$1>硬瘤<');
    data=data.replace(/(^|[^A-Za-z])(>Leviathan PitsS*?<)(?=[^A-Za-z]|$)/gi, '$1>利拜亚森矿场<');
    data=data.replace(/(^|[^A-Za-z])(>Silent SurfS*?<)(?=[^A-Za-z]|$)/gi, '$1>寂静之浪<');
    data=data.replace(/(^|[^A-Za-z])(>Seafarer's RestS*?<)(?=[^A-Za-z]|$)/gi, '$1>航海者休憩处<');
    data=data.replace(/(^|[^A-Za-z])(>OniS*?<)(?=[^A-Za-z]|$)/gi, '$1>鬼<');
    data=data.replace(/(^|[^A-Za-z])(>Keen Oni TalonS*?<)(?=[^A-Za-z]|$)/gi, '$1>锐利细鬼爪<');
    data=data.replace(/(^|[^A-Za-z])(>Ice Caves of SorrowS*?<)(?=[^A-Za-z]|$)/gi, '$1>悲伤冰谷<');
    data=data.replace(/(^|[^A-Za-z])(>IcedomeS*?<)(?=[^A-Za-z]|$)/gi, '$1>冰点<');
    data=data.replace(/(^|[^A-Za-z])(>Ice ElementalS*?<)(?=[^A-Za-z]|$)/gi, '$1>冰元素<');
    data=data.replace(/(^|[^A-Za-z])(>Ice GolemS*?<)(?=[^A-Za-z]|$)/gi, '$1>冰高仑<');
    data=data.replace(/(^|[^A-Za-z])(>Icy LodestoneS*?<)(?=[^A-Za-z]|$)/gi, '$1>冰磁石<');
    data=data.replace(/(^|[^A-Za-z])(>Augury RockS*?<)(?=[^A-Za-z]|$)/gi, '$1>占卜之石<');
    data=data.replace(/(^|[^A-Za-z])(>Skyward ReachS*?<)(?=[^A-Za-z]|$)/gi, '$1>天际流域<');
    data=data.replace(/(^|[^A-Za-z])(>Destiny's GorgeS*?<)(?=[^A-Za-z]|$)/gi, '$1>命运峡谷<');
    data=data.replace(/(^|[^A-Za-z])(>Prophet's PathS*?<)(?=[^A-Za-z]|$)/gi, '$1>探索者通道<');
    data=data.replace(/(^|[^A-Za-z])(>Salt FlatsS*?<)(?=[^A-Za-z]|$)/gi, '$1>盐滩<');
    data=data.replace(/(^|[^A-Za-z])(>Storm KinS*?<)(?=[^A-Za-z]|$)/gi, '$1>风暴魔<');
    data=data.replace(/(^|[^A-Za-z])(>Shriveled EyeS*?<)(?=[^A-Za-z]|$)/gi, '$1>干枯的眼睛<');    
    data=data.replace(/(^|[^A-Za-z])(>Skull JujuS*?<)(?=[^A-Za-z]|$)/gi, '$1>头骨土符<');
    data=data.replace(/(^|[^A-Za-z])(>Skull JujuS*?<)(?=[^A-Za-z]|$)/gi, '$1>颅骨土符<');
    data=data.replace(/(^|[^A-Za-z])(>Bone CharmS*?<)(?=[^A-Za-z]|$)/gi, '$1>骨制护符<');
	
	//data=data.replace(/(^|[^A-Za-z])(Note:)(?=[^A-Za-z]|$)/gi, '$1注:');
	//data=data.replace(/(^|[^A-Za-z])(Nicholas' location and requested item changes weekly on Monday at 15:00 UTC.)(?=[^A-Za-z]|$)/gi, '$1每周循环 于以下各晚11点起 生效');
	//data=data.replace(/(^|[^A-Za-z])(If your browser does not update the item and location, you can <a rel="nofollow" class="external text" href="http:\/\/wiki.guildwars.com\/index.php\?title=Nicholas_the_Traveler\/Cycle&amp;action=purge">refresh the list<\/a>\.)(?=[^A-Za-z]|$)/gi, '$1');

	data=data.replace(/(^|[^A-Za-z])(January)(?=[^A-Za-z]|$)/gi, '$1一月');
	data=data.replace(/(^|[^A-Za-z])(February)(?=[^A-Za-z]|$)/gi, '$1二月');
	data=data.replace(/(^|[^A-Za-z])(March)(?=[^A-Za-z]|$)/gi, '$1三月');
	data=data.replace(/(^|[^A-Za-z])(April)(?=[^A-Za-z]|$)/gi, '$1四月');
	data=data.replace(/(^|[^A-Za-z])(May)(?=[^A-Za-z]|$)/gi, '$1五月');
	data=data.replace(/(^|[^A-Za-z])(June)(?=[^A-Za-z]|$)/gi, '$1六月');
	data=data.replace(/(^|[^A-Za-z])(July)(?=[^A-Za-z]|$)/gi, '$1七月');
	data=data.replace(/(^|[^A-Za-z])(August)(?=[^A-Za-z]|$)/gi, '$1八月');
	data=data.replace(/(^|[^A-Za-z])(September)(?=[^A-Za-z]|$)/gi, '$1九月');
	data=data.replace(/(^|[^A-Za-z])(October)(?=[^A-Za-z]|$)/gi, '$1十月');
	data=data.replace(/(^|[^A-Za-z])(November)(?=[^A-Za-z]|$)/gi, '$1十一月');
	data=data.replace(/(^|[^A-Za-z])(December)(?=[^A-Za-z]|$)/gi, '$1十二月');

	data=data.replace(/(^|[^A-Za-z])(<th> Date)(?=[^A-Za-z]|$)/gi, '$1<th style="text-align:center;"> 日期');
	//data=data.replace(/(^|[^A-Za-z])(<th> Item)(?=[^A-Za-z]|$)/gi, '$1<th style="text-align:center;"> 材料');
	//data=data.replace(/(^|[^A-Za-z])(<th> Location)(?=[^A-Za-z]|$)/gi, '$1<th style="text-align:center;"> 地点');
	//data=data.replace(/(^|[^A-Za-z])(<th> Region)(?=[^A-Za-z]|$)/gi, '$1<th style="text-align:center;"> 地区');
	//data=data.replace(/(^|[^A-Za-z])(<th> Campaign)(?=[^A-Za-z]|$)/gi, '$1<th style="text-align:center;"> 章节');

	//data=data.replace(/(^|[^A-Za-z])(<th> Map)(?=[^A-Za-z]|$)/gi, '$1<th style="text-align:center;"> 地图');
	//data=data.replace(/(^|[^A-Za-z])(>Map<)(?=[^A-Za-z]|$)/gi, '$1>路线<');
	
	data=data.replace(/(^|[^A-Za-z])(>Zaishen Mission<)(?=[^A-Za-z]|$)/gi, '$1>战承主线任务<');
	data=data.replace(/(^|[^A-Za-z])(>Zaishen Bounty<)(?=[^A-Za-z]|$)/gi, '$1>战承悬赏任务<');
	data=data.replace(/(^|[^A-Za-z])(>Zaishen Combat<)(?=[^A-Za-z]|$)/gi, '$1>战承对战任务<');
	data=data.replace(/(^|[^A-Za-z])(>Zaishen Vanquish<)(?=[^A-Za-z]|$)/gi, '$1>战承清图任务<');
	data=data.replace(/(^|[^A-Za-z])(>Shining Blade<)(?=[^A-Za-z]|$)/gi, '$1>光刃通缉令<');
	data=data.replace(/(^|[^A-Za-z])(>Vanguard Quest<)(?=[^A-Za-z]|$)/gi, '$1>黑檀先锋队任务<');
	data=data.replace(/(^|[^A-Za-z])(>Nicholas Sandford<)(?=[^A-Za-z]|$)/gi, '$1>毁灭前旅行者<');
	
	data=data.replace(/(^|[^A-Za-z])(>Guild Versus Guild<)(?=[^A-Za-z]|$)/gi, '$1>公会战<');
	data=data.replace(/(^|[^A-Za-z])(>Alliance Battles<)(?=[^A-Za-z]|$)/gi, '$1>同盟战<');
	data=data.replace(/(^|[^A-Za-z])(>Heroes' Ascent<)(?=[^A-Za-z]|$)/gi, '$1>英雄之路<');
	data=data.replace(/(^|[^A-Za-z])(>Codex Arena<)(?=[^A-Za-z]|$)/gi, '$1>Codex竞技场<');
	data=data.replace(/(^|[^A-Za-z])(>Fort Aspenwood<)(?=[^A-Za-z]|$)/gi, '$1>杨木要塞<');
	data=data.replace(/(^|[^A-Za-z])(>Jade Quarry<)(?=[^A-Za-z]|$)/gi, '$1>翡翠矿场<');
	data=data.replace(/(^|[^A-Za-z])(>Random Arena<)(?=[^A-Za-z]|$)/gi, '$1>随机竞技场<');
	
	//主线任务
	data=data.replace(/(^|[^A-Za-z])(>Abaddon's Mouth<)(?=[^A-Za-z]|$)/gi, '$1>地狱隘口<');
	data=data.replace(/(^|[^A-Za-z])(>Divinity Coast<)(?=[^A-Za-z]|$)/gi, '$1>神圣海岸<');
	data=data.replace(/(^|[^A-Za-z])(>The Great Northern Wall<)(?=[^A-Za-z]|$)/gi, '$1>北方长城<');
	data=data.replace(/(^|[^A-Za-z])(>Chahbek Village<)(?=[^A-Za-z]|$)/gi, '$1>夏贝克村庄<');
	data=data.replace(/(^|[^A-Za-z])(>A Time for Heroes<)(?=[^A-Za-z]|$)/gi, '$1>英雄的光采年代<');
	
	data=data.replace(/(^|[^A-Za-z])(>Consulate Docks<)(?=[^A-Za-z]|$)/gi, '$1>领事馆码头<');
	data=data.replace(/(^|[^A-Za-z])(>Ring of Fire<)(?=[^A-Za-z]|$)/gi, '$1>火环群岛<');
	data=data.replace(/(^|[^A-Za-z])(>The Dragon's Lair<)(?=[^A-Za-z]|$)/gi, '$1>龙穴<');
	data=data.replace(/(^|[^A-Za-z])(>D'Alessio Seaboard<)(?=[^A-Za-z]|$)/gi, '$1>达雷西奥海滨<');
	data=data.replace(/(^|[^A-Za-z])(>Assault on the Stronghold<)(?=[^A-Za-z]|$)/gi, '$1>袭击根据地<');

	data=data.replace(/(^|[^A-Za-z])(>Warband of Brothers<)(?=[^A-Za-z]|$)/gi, '$1>战争军团之友<');
	data=data.replace(/(^|[^A-Za-z])(>Borlis Pass<)(?=[^A-Za-z]|$)/gi, '$1>柏里斯通道<');
	data=data.replace(/(^|[^A-Za-z])(>Moddok Crevice<)(?=[^A-Za-z]|$)/gi, '$1>摩多克裂缝<');
	data=data.replace(/(^|[^A-Za-z])(>Nolani Academy<)(?=[^A-Za-z]|$)/gi, '$1>若拉尼学院<');
	data=data.replace(/(^|[^A-Za-z])(>Destruction's Depths<)(?=[^A-Za-z]|$)/gi, '$1>破坏的深渊<');

	data=data.replace(/(^|[^A-Za-z])(>Venta Cemetery<)(?=[^A-Za-z]|$)/gi, '$1>凡特墓地<');
	data=data.replace(/(^|[^A-Za-z])(>A Gate Too Far<)(?=[^A-Za-z]|$)/gi, '$1>一道过远的门<');
	data=data.replace(/(^|[^A-Za-z])(>Finding the Bloodstone<)(?=[^A-Za-z]|$)/gi, '$1>寻找血石<');
	data=data.replace(/(^|[^A-Za-z])(>Vizunah Square<)(?=[^A-Za-z]|$)/gi, '$1>微茹广场<');
	data=data.replace(/(^|[^A-Za-z])(>G.O.L.E.M.<)(?=[^A-Za-z]|$)/gi, '$1>天才操控而让生活丰富迷人的表现<');
	
	data=data.replace(/(^|[^A-Za-z])(>Gate of Madness<)(?=[^A-Za-z]|$)/gi, '$1>疯狂之门<');
	data=data.replace(/(^|[^A-Za-z])(>The Elusive Golemancer<)(?=[^A-Za-z]|$)/gi, '$1>乌啦的实验室<');
	data=data.replace(/(^|[^A-Za-z])(>Hell's Precipice<)(?=[^A-Za-z]|$)/gi, '$1>地狱悬崖<');
	data=data.replace(/(^|[^A-Za-z])(>Ruins of Surmia<)(?=[^A-Za-z]|$)/gi, '$1>苏米亚废墟<');
	data=data.replace(/(^|[^A-Za-z])(>Curse of the Nornbear<)(?=[^A-Za-z]|$)/gi, '$1>诺恩熊的诅咒<');
	
	data=data.replace(/(^|[^A-Za-z])(>Gate of Pain<)(?=[^A-Za-z]|$)/gi, '$1>惩罚之门<');
	data=data.replace(/(^|[^A-Za-z])(>Blood Washes Blood<)(?=[^A-Za-z]|$)/gi, '$1>血债血偿<');
	data=data.replace(/(^|[^A-Za-z])(>Bloodstone Fen<)(?=[^A-Za-z]|$)/gi, '$1>血石沼泽<');
	data=data.replace(/(^|[^A-Za-z])(>Abaddon's Gate<)(?=[^A-Za-z]|$)/gi, '$1>亚霸顿之门<');
	data=data.replace(/(^|[^A-Za-z])(>The Frost Gate<)(?=[^A-Za-z]|$)/gi, '$1>寒霜之门<');

	data=data.replace(/(^|[^A-Za-z])(>Against the Charr<)(?=[^A-Za-z]|$)/gi, '$1>对抗夏尔<');
	
	//毁灭前旅者材料
	data=data.replace(/(^|[^A-Za-z])(Unnatural SeedS*?)(?=[^A-Za-z]|$)/gi, '$1古怪的种子');
	data=data.replace(/(^|[^A-Za-z])(Enchanted LodestoneS*?)(?=[^A-Za-z]|$)/gi, '$1附魔磁石');
	data=data.replace(/(^|[^A-Za-z])(Gargoyle SkullS*?)(?=[^A-Za-z]|$)/gi, '$1石像鬼头颅');
	data=data.replace(/(^|[^A-Za-z])(Dull CarapaceS*?)(?=[^A-Za-z]|$)/gi, '$1阴暗的甲壳');
	data=data.replace(/(^|[^A-Za-z])(Baked HuskS*?)(?=[^A-Za-z]|$)/gi, '$1烧焦外壳');
	data=data.replace(/(^|[^A-Za-z])(Spider LegS*?)(?=[^A-Za-z]|$)/gi, '$1蜘蛛腿');
	data=data.replace(/(^|[^A-Za-z])(Skeletal LimbS*?)(?=[^A-Za-z]|$)/gi, '$1骷髅手臂');
	data=data.replace(/(^|[^A-Za-z])(Grawl NecklaceS*?)(?=[^A-Za-z]|$)/gi, '$1穴居人项链');
	data=data.replace(/(^|[^A-Za-z])(Worn BeltS*?)(?=[^A-Za-z]|$)/gi, '$1破旧的腰带');

	//悬赏，光刃
	data=data.replace(/(^|[^A-Za-z])(>Havok Soulwail<)(?=[^A-Za-z]|$)/gi, '$1>霍克 灵叹<') ;
	data=data.replace(/(^|[^A-Za-z])(>Lev the Condemned<)(?=[^A-Za-z]|$)/gi, '$1>被诅咒的莉芙<');
	data=data.replace(/(^|[^A-Za-z])(>Ghial the Bone Dancer<)(?=[^A-Za-z]|$)/gi, '$1>骨之舞者 葛西<');
	data=data.replace(/(^|[^A-Za-z])(>Justiciar Marron<)(?=[^A-Za-z]|$)/gi, '$1>判官 马隆<');
	data=data.replace(/(^|[^A-Za-z])(>Murakai, Lady of the Night<)(?=[^A-Za-z]|$)/gi, '$1>夜之女 幕兰凯<');
	data=data.replace(/(^|[^A-Za-z])(>Justiciar Kasandra<)(?=[^A-Za-z]|$)/gi, '$1>判官 卡珊卓拉<');
	data=data.replace(/(^|[^A-Za-z])(>Rand Stormweaver<)(?=[^A-Za-z]|$)/gi, '$1>织暴者 硬皮<');
	data=data.replace(/(^|[^A-Za-z])(>Vess the Disputant<)(?=[^A-Za-z]|$)/gi, '$1>争论者 薇丝<');
	data=data.replace(/(^|[^A-Za-z])(>Verata(?: the Necromancer)?<)(?=[^A-Za-z]|$)/gi, '$1 >死灵法师 芙瑞达<');
	data=data.replace(/(^|[^A-Za-z])(>Justiciar Kimii<)(?=[^A-Za-z]|$)/gi, '$1>判官 绮米<');
	data=data.replace(/(^|[^A-Za-z])(>Droajam, Mage of the Sands<)(?=[^A-Za-z]|$)/gi, '$1>沙之法师 卓加姆<');
	data=data.replace(/(^|[^A-Za-z])(>Zaln the Jaded<)(?=[^A-Za-z]|$)/gi, '$1>精疲力竭的萨恩<');
	data=data.replace(/(^|[^A-Za-z])(>Royen Beastkeeper<)(?=[^A-Za-z]|$)/gi, '$1>野兽看守者罗彦<');
	data=data.replace(/(^|[^A-Za-z])(>Justiciar Sevaan<)(?=[^A-Za-z]|$)/gi, '$1>判官 席凡<');
	data=data.replace(/(^|[^A-Za-z])(>Eldritch Ettin<)(?=[^A-Za-z]|$)/gi, '$1>怪异双头巨人<');
	data=data.replace(/(^|[^A-Za-z])(>Insatiable Vakar<)(?=[^A-Za-z]|$)/gi, '$1>强欲者瓦卡<');
	data=data.replace(/(^|[^A-Za-z])(>Vengeful Aatxe<)(?=[^A-Za-z]|$)/gi, '$1>复仇牛头怪<' );
	data=data.replace(/(^|[^A-Za-z])(>Amalek the Unmerciful<)(?=[^A-Za-z]|$)/gi, '$1>残酷者阿莫列克<');
	data=data.replace(/(^|[^A-Za-z])(>Carnak the Hungry<)(?=[^A-Za-z]|$)/gi, '$1>饥饿者卡纳克<');
	data=data.replace(/(^|[^A-Za-z])(>Fronis Irontoe<)(?=[^A-Za-z]|$)/gi, '$1>铁趾 弗朗尼<');
	data=data.replace(/(^|[^A-Za-z])(>Urgoz<)(?=[^A-Za-z]|$)/gi, '$1>尔果<');
	data=data.replace(/(^|[^A-Za-z])(>Valis the Rampant<)(?=[^A-Za-z]|$)/gi, '$1>猖獗的瓦里斯<');
	data=data.replace(/(^|[^A-Za-z])(>Fenrir<)(?=[^A-Za-z]|$)/gi, '$1>芬瑞<');
	data=data.replace(/(^|[^A-Za-z])(>Cerris<)(?=[^A-Za-z]|$)/gi, '$1>瑟瑞丝<') ;
	data=data.replace(/(^|[^A-Za-z])(>Selvetarm<)(?=[^A-Za-z]|$)/gi, '$1>希维塔姆<');
	data=data.replace(/(^|[^A-Za-z])(>Sarnia the Red-Handed<)(?=[^A-Za-z]|$)/gi, '$1>染血之手萨妮亚<');
	data=data.replace(/(^|[^A-Za-z])(>Mohby Windbeak<)(?=[^A-Za-z]|$)/gi, '$1>莫比 风喙<');
	data=data.replace(/(^|[^A-Za-z])(>Destor the Truth Seeker<)(?=[^A-Za-z]|$)/gi, '$1>真实追寻者戴斯特<');
	data=data.replace(/(^|[^A-Za-z])(>Charged Blackness<)(?=[^A-Za-z]|$)/gi, '$1>暗黑幽灵<') ;
	data=data.replace(/(^|[^A-Za-z])(>Selenas the Blunt<)(?=[^A-Za-z]|$)/gi, '$1>直言者瑟列娜丝<');
	data=data.replace(/(^|[^A-Za-z])(>Rotscale<)(?=[^A-Za-z]|$)/gi, '$1>恶臭骨龙<') ;
	data=data.replace(/(^|[^A-Za-z])(>Justiciar Amilyn<)(?=[^A-Za-z]|$)/gi, '$1>判官 亚蜜琳<');
	data=data.replace(/(^|[^A-Za-z])(>Zoldark the Unholy<)(?=[^A-Za-z]|$)/gi, '$1>不洁 咒暗<');
	data=data.replace(/(^|[^A-Za-z])(>Maximilian the Meticulous<)(?=[^A-Za-z]|$)/gi, '$1>细心的马希米连<');
	data=data.replace(/(^|[^A-Za-z])(>Korshek the Immolated<)(?=[^A-Za-z]|$)/gi, '$1>宰杀者 科薛克<');
	data=data.replace(/(^|[^A-Za-z])(>Joh the Hostile<)(?=[^A-Za-z]|$)/gi, '$1>敌意 舟<');
	data=data.replace(/(^|[^A-Za-z])(>Myish, Lady of the Lake<)(?=[^A-Za-z]|$)/gi, '$1>湖之女 蜜希<');
	data=data.replace(/(^|[^A-Za-z])(>Barthimus the Provident<)(?=[^A-Za-z]|$)/gi, '$1>算计者巴希穆斯<');
	data=data.replace(/(^|[^A-Za-z])(>Frostmaw the Kinslayer<)(?=[^A-Za-z]|$)/gi, '$1>冻击 弑族者<');
	data=data.replace(/(^|[^A-Za-z])(>Calamitous<)(?=[^A-Za-z]|$)/gi, '$1>卡拉米托斯<');
	data=data.replace(/(^|[^A-Za-z])(>Kunvie Firewing<)(?=[^A-Za-z]|$)/gi, '$1>火翼 坤维<');
	data=data.replace(/(^|[^A-Za-z])(>Greves the Overbearing<)(?=[^A-Za-z]|$)/gi, '$1>傲慢的葛力斯<');
	data=data.replace(/(^|[^A-Za-z])(>Z'him Monns<)(?=[^A-Za-z]|$)/gi, '$1>晶蒙<');
	data=data.replace(/(^|[^A-Za-z])(>The Greater Darkness<)(?=[^A-Za-z]|$)/gi, '$1>巨大暗影<');
	data=data.replace(/(^|[^A-Za-z])(>TPS Regulator Golem<)(?=[^A-Za-z]|$)/gi, '$1>TPS调节高轮<');
	data=data.replace(/(^|[^A-Za-z])(>Plague of Destruction<)(?=[^A-Za-z]|$)/gi, '$1>疫之破坏者<');
	data=data.replace(/(^|[^A-Za-z])(>The Darknesses<)(?=[^A-Za-z]|$)/gi, '$1>暗影<');
	data=data.replace(/(^|[^A-Za-z])(>Admiral Kantoh<)(?=[^A-Za-z]|$)/gi, '$1>上将 坎托<');
	data=data.replace(/(^|[^A-Za-z])(>Borrguus Blisterbark<)(?=[^A-Za-z]|$)/gi, '$1>风吼 柏格斯<');
	
	
data=data.replace(/(^|[^A-Za-z])(>Forgewight<)(?=[^A-Za-z]|$)/gi, '$1>煉冶維特<');
data=data.replace(/(^|[^A-Za-z])(>Baubao Wavewrath<)(?=[^A-Za-z]|$)/gi, '$1>怒浪 保博<');
data=data.replace(/(^|[^A-Za-z])(>Joffs the Mitigator<)(?=[^A-Za-z]|$)/gi, '$1>緩和者 卓夫<');
data=data.replace(/(^|[^A-Za-z])(>Rragar Maneater<)(?=[^A-Za-z]|$)/gi, '$1>拉喀 食人者<');
data=data.replace(/(^|[^A-Za-z])(>Chung, the Attuned<)(?=[^A-Za-z]|$)/gi, '$1>得道者 村<');
data=data.replace(/(^|[^A-Za-z])(>Lord Jadoth<)(?=[^A-Za-z]|$)/gi, '$1>霸王 賈多司<');
data=data.replace(/(^|[^A-Za-z])(>Nulfastu, Earthbound<)(?=[^A-Za-z]|$)/gi, '$1>地縛 納法斯圖<');
data=data.replace(/(^|[^A-Za-z])(>(?:The )?Iron Forgeman<)(?=[^A-Za-z]|$)/gi, '$1>鋼鐵巨人<');
data=data.replace(/(^|[^A-Za-z])(>Magmus<)(?=[^A-Za-z]|$)/gi, '$1>麥格默斯<');
data=data.replace(/(^|[^A-Za-z])(>Mobrin, Lord of the Marsh<)(?=[^A-Za-z]|$)/gi, '$1>碎之主 魔兵<');
data=data.replace(/(^|[^A-Za-z])(>Duncan the Black<)(?=[^A-Za-z]|$)/gi, '$1>黑色 唐肯<');
data=data.replace(/(^|[^A-Za-z])(>Quansong Spiritspeak<)(?=[^A-Za-z]|$)/gi, '$1>通靈者 魁嵩<');
data=data.replace(/(^|[^A-Za-z])(>The Stygian Underlords<)(?=[^A-Za-z]|$)/gi, '$1>冥獄地王<');
data=data.replace(/(^|[^A-Za-z])(>Fozzy Yeoryios<)(?=[^A-Za-z]|$)/gi, '$1>凍 耀爾伊歐<');
data=data.replace(/(^|[^A-Za-z])(>The Black Beast of Arrgh<)(?=[^A-Za-z]|$)/gi, '$1>黑色野獸 阿爾古<');
return data;
}