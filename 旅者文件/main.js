jQuery.ajax = (function(_ajax){

    var protocol = location.protocol,
        hostname = location.hostname,
        exRegex = RegExp(protocol + '//' + hostname),
        YQL = 'http' + (/^https/.test(protocol)?'s':'') + '://query.yahooapis.com/v1/public/yql?callback=?&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys',
        query = 'select * from htmlstring where url="{URL}" and xpath="*"';

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
var generateNow = new Date();
var urlSuffix = "%3F"+generateNow.getTime();
$.ajax({
    url: 'http://wiki.guildwars.com/wiki/Nicholas_the_Traveler/Cycle'+urlSuffix,
    type: 'GET',
    success: function(res) {

        document.getElementById("NeiRong").innerHTML = parseTranslate(res.responseText);

		//需放在ajax内，否则浏览器将在表格出现前试图改色+上链接

		//在生成表格后，换表格第一行颜色；
		var list = document.getElementsByTagName("th");
		var indexArray = 0;
		while (indexArray < list.length){
			list[indexArray].style.background = "#CBEAC0";
			indexArray = indexArray+1;
		}

		//in html need to add class fixed-tipbox (you could have an alt attribute here for title), followed immediately by a div with tooltiptext
		$('.fixed-tipbox').each(function () {
			$(this).qtip({
				content:  {
					text: $(this).next('.tooltiptext'),
					title: function(event, api) {
						return $(this).attr('alt');
					},
				},
				hide: {
					fixed: true,
					delay: 300
				},
				position: {
                   my: 'top left',
                   at: 'bottom right',
				   viewport: $(window)
				},
                show: {
                    effect: function(offset) {
						$(this).slideDown(250); // "this" refers to the tooltip
					}
                },

				style: {
					classes: "qtip-tipped qtip-shadow",
				},
			});
		});

		set_loading(false);

    }
});

function set_loading(loading) {
    $('#loading-indicator').toggleClass('hide', !loading);
    $('#result-wrapper').toggleClass('hide', loading);
}


function parseTranslate(data){

	//擦掉表格前后的内容
	var temp = data.split("</dd></dl>");
    var temp1 = temp[1];

	temp = temp1.split("NewPP limit report");
    data = temp[0];

	//擦掉NewPP limit report前的<!--
	data=data.replace(/(^|[^A-Za-z])(<!--)(?=[^A-Za-z]|$)/gi, '');

	//插入说明 | 已删
	//data=data.replace(/(^|[^A-Za-z])(<\/th><\/tr>)(?=[^A-Za-z]|$)/gi, '$1$2<tr><td style="text-align: center;" colspan = "6">  每周循环 于以下各晚11点起 生效   <b>|</b>   内容与激战网同步、名目或未尽校   <\/td><\/tr>');

	//修饰材料个数
	data=data.replace(/(^|[^A-Za-z])<td> (\d) <a(?=[^A-Za-z]|$)/gi, '$1<td>  [ $2 ]  <a');

	//修饰表格 | 重要
	data=data.replace(/(^|[^A-Za-z])<table.*?cellpadding="3".*?>(?=[^A-Za-z]|$)/gi, '<table class="table table-condensed table-bordered table-striped" id="display">');

	//内容居中
	data=data.replace(/(^|[^A-Za-z])<td style="text-align: right;">(?=[^A-Za-z]|$)/gi, '$1<td style="text-align: center;">'); //日期
	//data=data.replace(/(^|[^A-Za-z])<td>(?=[^A-Za-z]|$)/gi, '$1<td style="text-align: right;">');

	data = translate(data);

		//加上解说
	//TravelerData["key"]
	/*格式
	function replacer(match, p1, p2, p3, offset, string) {
		// p1 is nondigits, p2 digits, and p3 non-alphanumerics
		return [p1, p2, p3].join(' - ');
	}
	var newString = 'abc12345#$*%'.replace(/([^\d]*)(\d*)([^\w]*)/, replacer);
	*/
	//var re;
	//var pattern;
	//for (var mat in TravelerData) {
	//alert("test");
	//alert(TravelerData["畸形的种子"]);

	data=data.replace(/(\[ \d \].{0,5}<a .{0,30}?href=.*?title=")(.*?)(")(>.*?<\/a>)/gi, qTipReplace);

		//pattern = "[ \d ] \".{0,5}<a href=.*?title=\"(.*?)\">.*?<\/a>"
		//re = new RegExp("[","gi");
		//alert(mat + " = " + TravelerData[mat]);
	//}
	return data;
}

//简易加入
function simpleTooltipReplace(m, p1, p2, p3, off, sttr) {

		//因title已转换为文字，所以不再需要以下段落

		//因以下翻译功能含><，所以需插入><，再去除
		//var tKey=translate(">"+p2+"<");
		//tKey=tKey.replace(/>(.*?)</gi,'$1');
		return p1+TravelerData[p2]+p3;
}

function qTipReplace(m, p1, p2, p3, p4, off, sttr) {

		//因title已转换为文字，所以不再需要以下段落

		//因以下翻译功能含><，所以需插入><，再去除
		//var tKey=translate(">"+p2+"<");
		//tKey=tKey.replace(/>(.*?)</gi,'$1');
		//alert(p1+p2+p3+'class="fixed-tipbox" alt="'+p2+'"'+p4+TravelerDataLong[p2]);
		return p1+p2+p3+'class="fixed-tipbox" alt="'+p2+'"'+p4+TravelerDataLong[p2];
		//寄生虫皮革，长尾冠毛,骨制护符,柳树枝
}

//totally stopped caring
var highlight_Color = "darksalmon";

function translate(data){

	data=data.replace(/(^|[^A-Za-z])(<a href="\/wiki)(?=[^A-Za-z]|$)/gi, '<a href="http://wiki.guildwars.com/wiki/');
	data=data.replace(/((>|")Prophecies(<|"))(?=[^A-Za-z]|$)/gi, '$2一章$3');
	data=data.replace(/((>|")Factions(<|"))(?=[^A-Za-z]|$)/gi, '$2二章$3');
	data=data.replace(/((>|")Nightfall(<|"))(?=[^A-Za-z]|$)/gi, '$2三章$3');
	data=data.replace(/((>|")Eye of the North(<|"))(?=[^A-Za-z]|$)/gi, '$2四章$3');

	data=data.replace(/((>|")Kryta(<|"))(?=[^A-Za-z]|$)/gi, '$2科瑞塔$3');
	data=data.replace(/((>|")Shing Jea Island(<|"))(?=[^A-Za-z]|$)/gi, '$2星岬岛$3');
	data=data.replace(/((>|")Northern Shiverpeaks(<|"))(?=[^A-Za-z]|$)/gi, '$2北席娃山脉$3');
	data=data.replace(/((>|")Southern Shiverpeaks(<|"))(?=[^A-Za-z]|$)/gi, '$2南席娃山脉$3');
	data=data.replace(/((>|")Far Shiverpeaks(<|"))(?=[^A-Za-z]|$)/gi, '$2远北席娃山脉(四章)$3');
	data=data.replace(/((>|")Ring of Fire Islands(<|"))(?=[^A-Za-z]|$)/gi, '$2火环岛$3');
	data=data.replace(/((>|")maguuma jungle(<|"))(?=[^A-Za-z]|$)/gi, '$2梅古玛丛林$3');
	data=data.replace(/((>|")kourna(<|"))(?=[^A-Za-z]|$)/gi, '$2高楠$3');
	data=data.replace(/((>|")vabbi(<|"))(?=[^A-Za-z]|$)/gi, '$2瓦贝$3');
	data=data.replace(/((>|")the jade sea(<|"))(?=[^A-Za-z]|$)/gi, '$2碧玉海$3');
	data=data.replace(/((>|")crystal desert(<|"))(?=[^A-Za-z]|$)/gi, '$2水晶沙漠$3');
	data=data.replace(/((>|")tarnished coast(<|"))(?=[^A-Za-z]|$)/gi, '$2灰暗海岸$3');
	data=data.replace(/((>|")the desolation(<|"))(?=[^A-Za-z]|$)/gi, '$2硫磺地带$3');
	data=data.replace(/((>|")charr homelands(<|"))(?=[^A-Za-z]|$)/gi, '$2夏尔故乡$3');
	data=data.replace(/((>|")istan(<|"))(?=[^A-Za-z]|$)/gi, '$2艾斯坦$3');

    //旅行者 相关语句，含材料，城镇，及敌人名称
    data=data.replace(/((>|")Ice Tooth CaveS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2冰牙洞穴$3');
    data=data.replace(/((>|")Anvil RockS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2铁砧石$3');
    data=data.replace(/((>|")Frostfire DryderS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2霜火蛛化精灵$3');
    data=data.replace(/((>|")Frostfire FangS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2霜火尖牙$3');
	data=data.replace(/((>|")Boreas SeabedS*? \(explorable area\)(<|"))(?=[^A-Za-z]|$)/gi, '$2风神海床 (探索区)$3');
    data=data.replace(/((>|")Boreas SeabedS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2风神海床$3');
    data=data.replace(/((>|")Pongmei ValleyS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2朋美谷$3');
    data=data.replace(/((>|")Rot Wallow TuskS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2腐败兽獠牙$3');
    data=data.replace(/((>|")Rot WallowS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2腐败兽$3');
    data=data.replace(/((>|")Elona Reach(<|"))(?=[^A-Za-z]|$)/gi, '$2伊洛那流域$3');
    data=data.replace(/((>|")Diviner's Ascent(<|"))(?=[^A-Za-z]|$)/gi, '$2预言者之坡$3');
    data=data.replace(/((>|")Sand DrakeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2沙龙兽$3');
    data=data.replace(/((>|")Topaz CrestS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2黄宝石颈脊$3');
    data=data.replace(/((>|")Rata Sum(<|"))(?=[^A-Za-z]|$)/gi, '$2洛达顶点$3');
    data=data.replace(/((>|")Magus Stones(<|"))(?=[^A-Za-z]|$)/gi, '$2玛古斯之石$3');
    data=data.replace(/((>|")LifeweaverS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2织命者$3');
    data=data.replace(/((>|")BloodweaverS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2织血者$3');
    data=data.replace(/((>|")VenomweaverS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2织恨者$3');
    data=data.replace(/((>|")SpiderS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2蜘蛛$3');
    data=data.replace(/((>|")Weaver LegS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2编织者的腿$3');
    data=data.replace(/((>|")Yahnur MarketS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2雅诺尔市集$3');
    data=data.replace(/((>|")Vehtendi Valley(<|"))(?=[^A-Za-z]|$)/gi, '$2巍天帝峡谷$3');
    data=data.replace(/((>|")Storm JacarandaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2暴风荆棘$3');
    data=data.replace(/((>|")Mirage IbogaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2幻象伊波枷$3');
    data=data.replace(/((>|")Enchanted Brambles(<|"))(?=[^A-Za-z]|$)/gi, '$2魔法树根$3');
    data=data.replace(/((>|")Whistling ThornbrushS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2荆棘之藤$3');
    data=data.replace(/((>|")Sentient SporeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2知觉孢子$3');
    data=data.replace(/((>|")AhojS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2亚禾$3');
    data=data.replace(/((>|")Bottle of Vabbian WineS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2瓦贝红酒$3');
    data=data.replace(/((>|")Jarimiya the Unmerciful(<|"))(?=[^A-Za-z]|$)/gi, '$2残酷 贾米里$3');
    data=data.replace(/((>|")Blacktide Den(<|"))(?=[^A-Za-z]|$)/gi, '$2黑潮之穴$3');
    data=data.replace(/((>|")Lahtenda Bog(<|"))(?=[^A-Za-z]|$)/gi, '$2洛天帝沼泽$3');
    data=data.replace(/((>|")Mandragor ImpS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2曼陀罗恶魔$3');
    data=data.replace(/((>|")Mandragor SlitherS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2曼陀罗之藤$3');
    data=data.replace(/((>|")Stoneflesh MandragorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2曼陀罗石根$3');
    data=data.replace(/((>|")Mandragor SwamprootS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2曼陀罗根$3');
    data=data.replace(/((>|")Vasburg Armory(<|"))(?=[^A-Za-z]|$)/gi, '$2维思柏兵营$3');
	data=data.replace(/((>|")The Eternal GroveS*? \(explorable area\)(<|"))(?=[^A-Za-z]|$)/gi, '$2永恒之林 (探索区)$3');
    data=data.replace(/((>|")The Eternal Grove(<|"))(?=[^A-Za-z]|$)/gi, '$2永恒之林$3');
    data=data.replace(/((>|")Skill Hungry GakiS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2灵巧的饿鬼$3');
    data=data.replace(/((>|")Pain Hungry GakiS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2痛苦的饿鬼$3');
    data=data.replace(/((>|")The Time EaterS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2时间吞噬者$3');
    data=data.replace(/((>|")The Scar EaterS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2疤痕吞噬者$3');
    data=data.replace(/((>|")Quarrel Falls(<|"))(?=[^A-Za-z]|$)/gi, '$2怨言瀑布$3');
    data=data.replace(/((>|")SilverwoodS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2银树$3');
    data=data.replace(/((>|")Maguuma WarriorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2梅古玛战士$3');
    data=data.replace(/((>|")Maguuma HunterS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2梅古玛猎人$3');
    data=data.replace(/((>|")Maguuma ProtectorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2梅古玛守护者$3');
    data=data.replace(/((>|")Maguuma ManeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2梅古玛鬃毛$3');
    data=data.replace(/((>|")Seeker's PassageS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2探索者通道$3');
    data=data.replace(/((>|")Salt FlatsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2盐滩$3');
    data=data.replace(/((>|")The Amnoon OasisS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2安奴绿洲$3');
    data=data.replace(/((>|")Prophet's PathS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2先知之路$3');
    data=data.replace(/((>|")Jade ScarabS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2翡翠圣甲虫$3');
    data=data.replace(/((>|")Jade MandibleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2翡翠下颚骨$3');
    data=data.replace(/((>|")Temple of the AgesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2世纪神殿$3');
    data=data.replace(/((>|")Sunjiang DistrictS*? \(explorable area\)(<|"))(?=[^A-Za-z]|$)/gi, '$2孙江行政区 (探索区)$3');
    data=data.replace(/((>|")Sunjiang DistrictS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2孙江行政区$3');
    data=data.replace(/((>|")Shenzun TunnelsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2申赞通道$3');
    data=data.replace(/((>|")AfflictedS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2被感染的$3');
    data=data.replace(/((>|")Putrid CystS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2腐败胞囊$3');
    data=data.replace(/((>|")Temple of the AgesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2世纪神殿$3');
    data=data.replace(/((>|")The Black CurtainS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2黑色帷幕$3');
    data=data.replace(/((>|")Kessex PeakS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2凯席斯山峰$3');
    data=data.replace(/((>|")Talmark WildernessS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2突马克荒地$3');
    data=data.replace(/((>|")Forest MinotaurS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2森林牛头怪$3');
    data=data.replace(/((>|")Forest Minotaur HornS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2森林牛头怪的角$3');
    data=data.replace(/((>|")The AstralariumS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2亚斯特拉利姆$3');
    data=data.replace(/((>|")Zehlon ReachS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2列隆流域$3');
    data=data.replace(/((>|")Beknur HarborS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2别克诺港$3');
    data=data.replace(/((>|")Issnur IslesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2伊斯诺岛$3');
    data=data.replace(/((>|")Skale BlighterS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2黑暗鳞怪$3');
    data=data.replace(/((>|")Frigid SkaleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2寒冰鳞怪$3');
    data=data.replace(/((>|")Ridgeback SkaleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2脊背鳞怪$3');
    data=data.replace(/((>|")Skale FinS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2鳞怪鳍$3');
    data=data.replace(/((>|")Chef PanjohS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2大厨 潘乔$3');
    data=data.replace(/((>|")Bowl of Skalefin SoupS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2鳞怪鳍汤$3');
    data=data.replace(/((>|")Sage LandsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2荒原$3');
    data=data.replace(/((>|")Mamnoon LagoonS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2玛奴泻湖$3');
    data=data.replace(/((>|")Henge of DenraviS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2丹拉维圣地$3');
    data=data.replace(/((>|")Tangle RootS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2纠结之根$3');
    data=data.replace(/((>|")Dry TopS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2干燥高地$3');
    data=data.replace(/((>|")Root BehemothS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2根巨兽$3');
    data=data.replace(/((>|")Behemoth JawS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2巨兽颚$3');
    data=data.replace(/((>|")SifhallaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2袭哈拉$3');
    data=data.replace(/((>|")Jaga MoraineS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2亚加摩瑞恩$3');
    data=data.replace(/((>|")Berserking BisonS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2海冶克狂战士$3');
    data=data.replace(/((>|")Berserking MinotaurS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2牛头怪狂战士$3');
    data=data.replace(/((>|")Berserking WendigoS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2狂战士 纹帝哥$3');
    data=data.replace(/((>|")Berserking AurochsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2棘狼狂战士$3');
    data=data.replace(/((>|")Berserker HornS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2狂战士的角$3');
    data=data.replace(/((>|")Brauer AcademyS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2巴尔学院$3');
    data=data.replace(/((>|")Drazach ThicketS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2德瑞扎灌木林$3');
    data=data.replace(/((>|")Tanglewood CopseS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2谭格坞树林$3');
    data=data.replace(/((>|")Pongmei ValleyS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2朋美谷$3');
    data=data.replace(/((>|")UndergrowthS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2矮树丛$3');
    data=data.replace(/((>|")Dragon MossS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2龙苔$3');
    data=data.replace(/((>|")Dragon RootS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2龙根$3');
    data=data.replace(/((>|")Fishermen's HavenS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2渔人避风港$3');
    data=data.replace(/((>|")Stingray StrandS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2魟鱼湖滨$3');
    data=data.replace(/((>|")Tears of the FallenS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2战死者之泪$3');
    data=data.replace(/((>|")Grand DrakeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2强龙兽$3');
    data=data.replace(/((>|")Sanctum CayS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2神圣沙滩$3');
    data=data.replace(/((>|")Lightning DrakeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2闪光龙兽$3');
    data=data.replace(/((>|")Spiked CrestS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2尖刺的颈脊$3');
    data=data.replace(/((>|")Imperial SanctumS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2帝国圣所$3');
	data=data.replace(/((>|")Raisu PalaceS*? \(explorable area\)(<|"))(?=[^A-Za-z]|$)/gi, '$2莱苏皇宫 (探索区)$3');
    data=data.replace(/((>|")Raisu PalaceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2莱苏皇宫$3');
    data=data.replace(/((>|")Soul StoneS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2灵魂石$3');
    data=data.replace(/((>|")Tihark OrchardS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2提亚克林地$3');
    data=data.replace(/((>|")Forum HighlandsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2高地广场$3');
    data=data.replace(/((>|")Skree WingS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2鸟妖翅膀$3');
    data=data.replace(/((>|")SkreeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2鸟妖$3');
    data=data.replace(/((>|")Serenity TempleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2宁静神殿$3');
    data=data.replace(/((>|")Pockmark FlatsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2麻点平原$3');
    data=data.replace(/((>|")Storm RiderS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2暴风驾驭者$3');
    data=data.replace(/((>|")Stormy EyeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2暴风之眼$3');
    data=data.replace(/((>|")Gates of KrytaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2科瑞塔之门$3');
    data=data.replace(/((>|")Scoundrel's RiseS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2恶汉山丘$3');
    data=data.replace(/((>|")Griffon's MouthS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2狮鹭兽隘口$3');
    data=data.replace(/((>|")Spiritwood PlankS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2心灵之板$3');
    data=data.replace(/((>|")Tsumei VillageS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2苏梅村$3');
    data=data.replace(/((>|")Panjiang PeninsulaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2班让半岛$3');
    data=data.replace(/((>|")Naga HideS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2纳迦皮$3');
    data=data.replace(/((>|")NagaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2纳迦$3');
    data=data.replace(/((>|")SifhallaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2袭哈拉$3');
    data=data.replace(/((>|")Drakkar LakeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2卓卡湖$3');
    data=data.replace(/((>|")Frozen ElementalS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2冰元素$3');
    data=data.replace(/((>|")Piles*? of Elemental DustS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2元素之土$3');
    //data=data.replace(/((>|")Leviathan PitsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2卑尔根温泉$3');
    //data=data.replace(/((>|")Silent SurfS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2尼伯山丘$3');
    //data=data.replace(/((>|")OniS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2柯瑞塔北部$3');
    //data=data.replace(/((>|")Keen Oni TalonS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2硬瘤$3');
    data=data.replace(/((>|")Leviathan PitsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2利拜亚森矿场$3');
    data=data.replace(/((>|")Silent SurfS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2寂静之浪$3');
    data=data.replace(/((>|")Seafarer's RestS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2航海者休憩处$3');
    data=data.replace(/((>|")OniS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2鬼$3');
    data=data.replace(/((>|")Keen Oni TalonS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2鬼爪$3');
    data=data.replace(/((>|")Ice Caves of SorrowS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2悲伤冰谷$3');
    data=data.replace(/((>|")IcedomeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2冰顶$3');
    data=data.replace(/((>|")Siege Ice GolemS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2攻城冰高仑$3');
    data=data.replace(/((>|")Icy LodestoneS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2冰磁石$3');
    data=data.replace(/((>|")Augury RockS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2占卜之石$3');
    data=data.replace(/((>|")Skyward ReachS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2天际流域$3');
    data=data.replace(/((>|")Destiny's GorgeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2命运峡谷$3');
    data=data.replace(/((>|")Prophet's PathS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2探索者通道/先知通道$3');
    data=data.replace(/((>|")Salt FlatsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2盐滩$3');
    data=data.replace(/((>|")Storm KinS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2风暴魔$3');
    data=data.replace(/((>|")Shriveled EyeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2干枯的眼睛$3');
    data=data.replace(/((>|")Camp HojanuS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2何加努营地$3');
    data=data.replace(/((>|")Barbarous ShoreS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2野蛮河岸$3');
    data=data.replace(/((>|")CorsairS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2海盗$3');
    data=data.replace(/((>|")Gold DoubloonS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2金古币$3');
    data=data.replace(/((>|")Dragon's ThroatS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2龙喉$3');
    data=data.replace(/((>|")Shadow's PassageS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2阴暗通道$3');
    data=data.replace(/((>|")rare material traderS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2稀有材料商$3');
    data=data.replace(/((>|")Luxon factionS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2勒克森荣誉值$3');
    data=data.replace(/((>|")Jadeite ShardS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2硬玉$3');
    data=data.replace(/((>|")Port SledgeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2雪橇港$3');
    data=data.replace(/((>|")Witman's FollyS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2威特曼的怪异建筑$3');
    data=data.replace(/((>|")GrawlS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2穴居人$3');
    data=data.replace(/((>|")Grawl CroneS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2穴居人巫婆$3');
    data=data.replace(/((>|")Intricate Grawl NecklaceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2精细的穴居人项链$3');
    data=data.replace(/((>|")The Mouth of TormentS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2苦痛之地隘口$3');
    data=data.replace(/((>|")Crystal OverlookS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2水晶高地$3');
    data=data.replace(/((>|")Ruins of MorahS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2摩拉废墟$3');
    data=data.replace(/((>|")Mandragor Sand DevilS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2曼陀罗沙恶魔$3');
    data=data.replace(/((>|")Mandragor TerrorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2惊骇曼陀罗$3');
    data=data.replace(/((>|")Ravenous MandragorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2曼陀罗贪婪者$3');
    data=data.replace(/((>|")Luminous StoneS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2发亮的石头$3');
    data=data.replace(/((>|")Dzagonur BastionS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2萨岗诺棱堡$3');
    data=data.replace(/((>|")Wilderness of BahdzaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2巴萨荒野$3');
    data=data.replace(/((>|")Behemoth GravebaneS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2剧毒巨兽$3');
    data=data.replace(/((>|")Scytheclaw BehemothS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2镰刀爪巨兽$3');
    data=data.replace(/((>|")Behemoth HideS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2巨兽皮革$3');
    data=data.replace(/((>|")Rata SumS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2洛达顶点$3');
    data=data.replace(/((>|")Riven EarthS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2撕裂大地$3');
    data=data.replace(/((>|")RaptorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2毒瑞克斯$3');
    data=data.replace(/((>|")AngorodonS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2安哥罗顿$3');
    data=data.replace(/((>|")Saurian BoneS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2蜥蜴骨头$3');
    data=data.replace(/((>|")Sanctum CayS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2神圣沙滩$3');
    data=data.replace(/((>|")Stingray StrandS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2魟鱼湖滨$3');
    data=data.replace(/((>|")Fishermen's HavenS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2渔人避风港$3');
    data=data.replace(/((>|")Talmark WildernessS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2突马克荒地$3');
    data=data.replace(/((>|")Inferno ImpS*?|FIRE IMPS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2地狱小恶魔$3');
    data=data.replace(/((>|")Glowing HeartS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2灼热的心脏$3');
    data=data.replace(/((>|")House zu HeltzerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2凤核议院$3');
    data=data.replace(/((>|")FerndaleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2厥谷$3');
    data=data.replace(/((>|")Rare crafting materialS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2稀有材料$3');
    data=data.replace(/((>|")Amber ChunkS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2琥珀$3');
    data=data.replace(/((>|")Kurzick BureaucratS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2库兹柯理事$3');
    data=data.replace(/((>|")Kodlonu HamletS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2克拓奴‧哈姆雷特$3');
    data=data.replace(/((>|")Issnur IslesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2伊斯诺岛$3');
    data=data.replace(/((>|")Irontooth DrakeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2钢牙龙兽$3');
    data=data.replace(/((>|")Rilohn RefugeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2里欧恩难民营$3');
    data=data.replace(/((>|")Steelfang DrakeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2硬甲龙兽$3');
    data=data.replace(/((>|")Chunk of Drake FleshS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2大块龙兽肉$3');
    data=data.replace(/((>|")Chef LonbahnS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2大厨 萝韩$3');
    data=data.replace(/((>|")Drake KabobS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2烤龙兽肉$3');
    data=data.replace(/((>|")Beacon's PerchS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2毕肯高地$3');
    data=data.replace(/((>|")Lornar's PassS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2洛拿斯通道$3');
    data=data.replace(/((>|")Tomb of the Primeval KingsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2先王之墓$3');
    data=data.replace(/((>|")Banished Dream RiderS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2被放逐的梦想骑士$3');
    data=data.replace(/((>|")Phantom ResidueS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2幻影残留物$3');
    //data=data.replace(/((>|")Zos Shivros ChannelS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2山吉之街$3');
    data=data.replace(/((>|")Nahpui QuarterS*? \(explorable area\)(<|"))(?=[^A-Za-z]|$)/gi, '$2纳普区 (探索区)$3');
    data=data.replace(/((>|")Nahpui QuarterS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2纳普区$3');
    data=data.replace(/((>|")Essence of DragonS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2龙之质体$3');
    data=data.replace(/((>|")Essence of KirinS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2麒麟之质体$3');
    data=data.replace(/((>|")Essence of PhoenixS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2凤之质体$3');
    data=data.replace(/((>|")Essence of TurtleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2龟之质体$3');
    data=data.replace(/((>|")Celestial EssenceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2天神质体$3');
    data=data.replace(/((>|")The Granite CitadelS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2花岗岩堡垒$3');
    data=data.replace(/((>|")Spearhead PeakS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2尖枪山$3');
    data=data.replace(/((>|")Ice ImpS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2冰小恶魔$3');
    data=data.replace(/((>|")Frigid HeartS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2冰冻的心脏$3');
    data=data.replace(/((>|")Thirsty RiverS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2干枯河流$3');
    data=data.replace(/((>|")The ScarS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2断崖$3');
    data=data.replace(/((>|")Destiny's GorgeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2命运峡谷$3');
    data=data.replace(/((>|")Augury RockS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2占卜之石$3');
    data=data.replace(/((>|")Skyward ReachS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2天际流域$3');
    data=data.replace(/((>|")HydraS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2三头龙$3');
    data=data.replace(/((>|")Dessicated Hydra ClawS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2干燥的三头龙爪$3');
    data=data.replace(/((>|")Umbral GrottoS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2阴影石穴$3');
    data=data.replace(/((>|")Verdant CascadesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2远野瀑布$3');
    data=data.replace(/((>|")Skelk ReaperS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2司怪收割者$3');
    data=data.replace(/((>|")Skelk ScourgerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2司怪严惩者$3');
    data=data.replace(/((>|")Skelk AfflictorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2司怪折磨者$3');
    data=data.replace(/((>|")Skelk ClawS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2司怪爪$3');
    data=data.replace(/((>|")Vasburg ArmoryS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2维思柏兵营$3');
    data=data.replace(/((>|")Morostav TrailS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2摩洛神秘通道$3');
    data=data.replace(/((>|")Durheim ArchivesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2杜汉姆卷藏室$3');
    data=data.replace(/((>|")Fungal WallowS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2泥泞兽$3');
    data=data.replace(/((>|")TruffleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2松露$3');
    data=data.replace(/((>|")Kodlonu HamletS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2克拓奴 哈姆雷特$3');
    data=data.replace(/((>|")Mehtani KeysS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2梅坦尼之钥$3');
    data=data.replace(/((>|")CorsairS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2海盗$3');
    data=data.replace(/((>|")Silver Bullion CoinS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2银铸币$3');
    data=data.replace(/((>|")Camp RankorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2蓝口营地$3');
    data=data.replace(/((>|")Snake DanceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2蛇舞$3');
    data=data.replace(/((>|")Blessed GriffonS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2被祝福的狮鹫兽$3');
    data=data.replace(/((>|")Frosted Griffon WingS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2冻结的狮鹫兽翅膀$3');
    data=data.replace(/((>|")Augury RockS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2占卜之石$3');
    data=data.replace(/((>|")Prophet's PathS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2先知之路$3');
    data=data.replace(/((>|")Minotaur (Crystal Desert)S*?(<|"))(?=[^A-Za-z]|$)/gi, '$2牛头怪$3');
    data=data.replace(/((>|")Minotaur HornS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2牛头怪角$3');
    data=data.replace(/((>|")Zin Ku CorridorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2辛库走廊$3');
    data=data.replace(/((>|")Tahnnakai TempleS*? \(explorable area\)(<|"))(?=[^A-Za-z]|$)/gi, '$2谭纳凯神殿 (探索区)$3');
	data=data.replace(/((>|")Tahnnakai TempleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2谭纳凯神殿$3');
    data=data.replace(/((>|")Jade BrotherhoodS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2翡翠兄弟会$3');
    data=data.replace(/((>|")Jade BraceletS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2翡翠手镯$3');
    data=data.replace(/((>|")Zen DaijunS*? \(explorable area\)(<|"))(?=[^A-Za-z]|$)/gi, '$2祯台郡 (探索区)$3');
	data=data.replace(/((>|")Zen DaijunS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2祯台郡$3');
    data=data.replace(/((>|")Haiju LagoonS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2海幽泻湖$3');
    data=data.replace(/((>|")Crimson Skull Spirit LordS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2红颅灵王$3');
    data=data.replace(/((>|")Crimson Skull LongbowS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2红颅长弓手$3');
    data=data.replace(/((>|")Crimson Skull MentalistS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2红颅心灵使$3');
    data=data.replace(/((>|")Crimson Skull PriestS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2红颅祭司$3');
    data=data.replace(/((>|")Gold Crimson Skull CoinS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2红颅金币$3');
    data=data.replace(/((>|")Mihanu TownshipS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2米哈努小镇$3');
    data=data.replace(/((>|")Holdings of ChokhinS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2舟克辛卷藏室$3');
    data=data.replace(/((>|")Bull Trainer GiantS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2Bull Trainer Giant$3');
    data=data.replace(/((>|")Pillaged GoodsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2掠夺的货品$3');
    data=data.replace(/((>|")Lion's ArchS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2狮子拱门$3');
    data=data.replace(/((>|")North Kryta ProvinceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2科瑞塔北部$3');
    data=data.replace(/((>|")Caromi Tengu BraveS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2卡洛米天狗勇士$3');
    data=data.replace(/((>|")Caromi Tengu WildS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2卡洛米天狗野人$3');
    data=data.replace(/((>|")Caromi Tengu ScoutS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2卡洛米天狗射手$3');
    data=data.replace(/((>|")Feathered Caromi ScalpS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2卡洛米羽毛头皮$3');
    data=data.replace(/((>|")Altrumm RuinsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2奥楚兰废墟$3');
    data=data.replace(/((>|")ArborstoneS*? \(explorable area\)(<|"))(?=[^A-Za-z]|$)/gi, '$2亭石 (探索区)$3');
    data=data.replace(/((>|")ArborstoneS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2亭石$3');
    data=data.replace(/((>|")Vasburg ArmoryS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2维思柏兵营$3');
    data=data.replace(/((>|")Morostav TrailS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2摩洛神秘通道$3');
    data=data.replace(/((>|")Stone ReaperS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2石之收割者$3');
    data=data.replace(/((>|")Stone RainS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2石之雨$3');
    data=data.replace(/((>|")Stone SoulS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2石之灵$3');
    data=data.replace(/((>|")Stone CarvingS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2石雕品$3');
    data=data.replace(/((>|")Honur HillS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2霍奴尔丘陵$3');
    data=data.replace(/((>|")Resplendent MakuunS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2奢华之城．莫肯$3');
    data=data.replace(/((>|")Dasha VestibuleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2达沙走廊$3');
    data=data.replace(/((>|")Key of AhdashimS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2哈达辛之钥$3');
    data=data.replace(/((>|")The Hidden City of AhdashimS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2隐藏之城．哈达辛$3');
    data=data.replace(/((>|")Sapphire DjinnS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2蓝宝石巨灵$3');
    data=data.replace(/((>|")Sapphire Djinn EssenceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2蓝宝石巨灵精华$3');
    data=data.replace(/((>|")Henge of DenraviS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2丹拉维圣地$3');
    data=data.replace(/((>|")Tangle RootS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2纠结之恨$3');
    data=data.replace(/((>|")Jungle TrollS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2丛林巨魔$3');
    data=data.replace(/((>|")Jungle Troll TuskS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2丛林巨魔獠牙$3');
    data=data.replace(/((>|")Wehhan TerracesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2薇恩平台$3');
    data=data.replace(/((>|")Bahdok CavernsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2巴多克洞穴$3');
    data=data.replace(/((>|")Pogahn PassageS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2波甘驿站$3');
    data=data.replace(/((>|")Dejarin EstateS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2达贾林庄园$3');
    data=data.replace(/((>|")Cracked MesaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2疯狂梅萨$3');
    data=data.replace(/((>|")Stone Shard CragS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2巨大岩石怪$3');
    data=data.replace(/((>|")Sentient LodestoneS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2知觉磁石$3');
    data=data.replace(/((>|")Marhan's GrottoS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2马翰洞穴$3');
    data=data.replace(/((>|")Ice FloeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2浮冰$3');
    data=data.replace(/((>|")Thunderhead KeepS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2雷云要塞$3');
    data=data.replace(/((>|")MursaatS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2马赛特$3');
    data=data.replace(/((>|")Mursaat TokenS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2马赛特记号$3');
    data=data.replace(/((>|")Eye of the NorthS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2极地之眼$3');
    data=data.replace(/((>|")Ice Cliff ChasmsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2冰崖裂口$3');
    data=data.replace(/((>|")Gwen's gardenS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2关的庭园$3');
    data=data.replace(/((>|")BattledepthsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2战斗深渊$3');
    data=data.replace(/((>|")Chromatic DrakeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2染色龙兽$3');
    data=data.replace(/((>|")Chromatic ScaleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2染色的麟片$3');
    data=data.replace(/((>|")Augury RockS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2占卜之石$3');
    data=data.replace(/((>|")The Arid SeaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2枯竭之海$3');
    data=data.replace(/((>|")Dunes of DespairS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2绝望沙丘$3');
    data=data.replace(/((>|")Sand GiantS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2沙巨人$3');
    data=data.replace(/((>|")Massive JawboneS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2粗大下颚骨$3');
    data=data.replace(/((>|")Leviathan PitsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2利拜亚森矿场$3');
    data=data.replace(/((>|")Gyala HatcheryS*? \(explorable area\)(<|"))(?=[^A-Za-z]|$)/gi, '$2盖拉孵化所 (探索区)$3');
	data=data.replace(/((>|")Gyala HatcheryS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2盖拉孵化所$3');
    data=data.replace(/((>|")Leviathan ClawS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2利拜亚森之爪$3');
    data=data.replace(/((>|")Leviathan EyeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2利拜亚森之眼$3');
    data=data.replace(/((>|")Leviathan MouthS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2利拜亚森之口$3');
    data=data.replace(/((>|")Moon ShellS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2月贝$3');
    data=data.replace(/((>|")Frontier GateS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2边境关所$3');
    data=data.replace(/((>|")Eastern FrontierS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2东方边境$3');
    data=data.replace(/((>|")Carrion DevourerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2腐肉蝎$3');
    data=data.replace(/((>|")Whiptail DevourerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2鞭尾蝎$3');
    data=data.replace(/((>|")Plague DevourerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2瘟疫蝎$3');
    data=data.replace(/((>|")Fetid CarapaceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2恶臭的甲壳$3');
    data=data.replace(/((>|")Beacon's PerchS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2毕肯高地$3');
    data=data.replace(/((>|")Deldrimor BowlS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2戴尔狄摩盆地$3');
    data=data.replace(/((>|")Shiverpeak WarriorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2席娃山脉战士$3');
    data=data.replace(/((>|")Shiverpeak LongbowS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2席娃山脉弓手$3');
    data=data.replace(/((>|")Shiverpeak ProtectorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2席娃山脉守护者$3');
    data=data.replace(/((>|")Shiverpeak ManeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2席娃山脉鬃毛$3');
    data=data.replace(/((>|")The MarketplaceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2市集$3');
    data=data.replace(/((>|")Bukdek BywayS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2巴德克小径$3');
    data=data.replace(/((>|")Branche*?s*? of Juni BerrieS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2柳树枝$3');
    data=data.replace(/((>|")Sunspear SanctuaryS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2日戟避难所$3');
    data=data.replace(/((>|")Marga CoastS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2马加海岸$3');
    data=data.replace(/((>|")RonjokS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2罗鸠村$3');
    data=data.replace(/((>|")ChunoS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2周纳$3');
    data=data.replace(/((>|")Insatiable AppetiteS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2贪得无厌的食欲$3');
    data=data.replace(/((>|")TomaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2托玛$3');
    data=data.replace(/((>|")Tihark OrchardS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2提亚克林地$3');
    data=data.replace(/((>|")Garden of SeborhinS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2希伯欣花园$3');
    data=data.replace(/((>|")Forum HighlandsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2高地广场$3');
    data=data.replace(/((>|")Roaring EtherS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2苍穹咆哮者$3');
    data=data.replace(/((>|")Roaring Ether ClawS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2苍穹咆哮者之爪$3');
    data=data.replace(/((>|")Seitung HarborS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2青函港$3');
    data=data.replace(/((>|")Zen DaijunS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2祯邰郡$3');
    data=data.replace(/((>|")Rolls*? of ParchmentS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2羊皮纸卷$3');
	data=data.replace(/((>|")Kaineng CityS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2凯宁城$3');
    data=data.replace(/((>|")Kaineng CenterS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2凯宁中心$3');
    data=data.replace(/((>|")Xue YiS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2薛易$3');
    data=data.replace(/((>|")Wood PlankS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2树木$3');
    data=data.replace(/((>|")Rolls*? of ParchmentS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2羊皮纸卷$3');
    data=data.replace(/((>|")Doomlore ShrineS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2末日传说神殿$3');
    data=data.replace(/((>|")Dalada UplandsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2达拉达山地$3');
    data=data.replace(/((>|")Charr SeekerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2夏尔追寻者$3');
    data=data.replace(/((>|")Charr BlademasterS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2夏尔剑术大师$3');
    data=data.replace(/((>|")Charr ProphetS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2夏尔先知$3');
    data=data.replace(/((>|")Charr FlameshielderS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2夏尔避燃者$3');
    data=data.replace(/((>|")Superb Charr CarvingS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2超级夏尔雕刻品$3');
    data=data.replace(/((>|")OlafsteadS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2欧拉夫之地$3');
    data=data.replace(/((>|")Varajar FellsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2维拉戛阵地$3');
    data=data.replace(/((>|")Modniir BerserkerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2莫得米狂战士$3');
    data=data.replace(/((>|")Modniir HunterS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2莫得米猎人$3');
    data=data.replace(/((>|")Modniir ManeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2莫得米鬃毛$3');
    data=data.replace(/((>|")Leviathan PitsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2利拜亚森矿场$3');
    data=data.replace(/((>|")Rhea's CraterS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2席亚火山口$3');
    data=data.replace(/((>|")Outcast WarriorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2被流放的战士$3');
    data=data.replace(/((>|")Outcast AssassinS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2被流放的暗杀者$3');
    data=data.replace(/((>|")Outcast RitualistS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2被流放的祭祀者$3');
    data=data.replace(/((>|")Majesty's RestS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2王者安息地$3');
    data=data.replace(/((>|")Druid's OverlookS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2德鲁伊高地$3');
    data=data.replace(/((>|")Temple of the AgesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2世纪神殿$3');
    data=data.replace(/((>|")Thorn DevourerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2棘刺蝎$3');
    data=data.replace(/((>|")Fevered DevourerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2热病蝎$3');
    data=data.replace(/((>|")Thorny CarapaceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2多刺的甲壳$3');
    data=data.replace(/((>|")Bone PalaceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2白骨宫殿$3');
    data=data.replace(/((>|")The Alkali PanS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2金属熔炉$3');
    data=data.replace(/((>|")Ruby DjinnS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2红宝石巨灵$3');
    data=data.replace(/((>|")Ruby Djinn EssenceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2红宝石巨灵精华$3');
    data=data.replace(/((>|")Piken SquareS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2派肯广场$3');
    data=data.replace(/((>|")The BreachS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2缺口$3');
	data=data.replace(/((>|")Old AscalonS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2旧阿斯卡隆$3');
	data=data.replace(/((>|")Ascalon FoothillsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2阿斯卡隆丘陵$3');
    data=data.replace(/((>|")AscalonS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2阿斯卡隆$3');
    data=data.replace(/((>|")CharrS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2夏尔$3');
    data=data.replace(/((>|")Charr HideS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2夏尔皮$3');
    data=data.replace(/((>|")Ventari's RefugeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2凡特里庇护所$3');
    data=data.replace(/((>|")The FallsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2陷落区$3');
    data=data.replace(/((>|")The Fissure of WoeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2灾难裂痕$3');
    data=data.replace(/((>|")Forest of the Wailing LordS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2悲鸣领主区$3');
    data=data.replace(/((>|")Gloom SeedS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2黑暗种子$3');
    data=data.replace(/((>|")Breaker HollowS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2断崖谷$3');
    data=data.replace(/((>|")Mount QinkaiS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2今凯山$3');
    data=data.replace(/((>|")Naga WarriorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2迦纳战士$3');
    data=data.replace(/((>|")Naga ArcherS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2迦纳弓手$3');
    data=data.replace(/((>|")Naga RitualistS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2迦纳祭祀者$3');
    data=data.replace(/((>|")Naga SkinS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2迦纳外皮$3');
    data=data.replace(/((>|")Riverside ProvinceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2河畔地带$3');
    data=data.replace(/((>|")Twin Serpent LakesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2双头蛇湖泊$3');
    data=data.replace(/((>|")Lion's ArchS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2狮子拱门$3');
    data=data.replace(/((>|")Bog SkaleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2泥鳞怪$3');
    data=data.replace(/((>|")Twin Serpent LakesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2双头蛇湖泊$3');
    data=data.replace(/((>|")Gruhn the FisherS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2渔人古露恩$3');
    data=data.replace(/((>|")Bog Skale FinS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2泥鳞怪的鳍$3');
    data=data.replace(/((>|")HerringS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2鲱鱼$3');
    data=data.replace(/((>|")Doomlore ShrineS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2末日传说神殿$3');
    data=data.replace(/((>|")Sacnoth ValleyS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2圣诺谷$3');
    data=data.replace(/((>|")Grawl ChampionS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2穴居人冠军$3');
    data=data.replace(/((>|")Grawl Dark PriestS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2穴居人黑暗祭司$3');
    data=data.replace(/((>|")Stone Grawl NecklaceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2石穴居人项链$3');
    data=data.replace(/((>|")Jokanur DiggingsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2卓坎诺挖掘点$3');
    data=data.replace(/((>|")Fahranur, The First CityS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2旧城 法兰努尔$3');
    data=data.replace(/((>|")Beautiful IbogaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2美丽伊波枷$3');
    data=data.replace(/((>|")Fanged IbogaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2毒牙伊波枷$3');
    data=data.replace(/((>|")Sentient SeedS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2知觉种子$3');
    data=data.replace(/((>|")Seitung HarborS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2青函港$3');
    data=data.replace(/((>|")Saoshang TrailS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2绍商小径$3');
    data=data.replace(/((>|")Mantid DarkwingS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2螳螂黑翼$3');
    data=data.replace(/((>|")Mantid GlitterfangS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2螳螂锐牙$3');
    data=data.replace(/((>|")Mantid PincerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2螳螂镰$3');
    data=data.replace(/((>|")Ember Light CampS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2残火营地$3');
    data=data.replace(/((>|")Perdition RockS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2破灭石$3');
    data=data.replace(/((>|")Mahgo HydraS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2码果三头龙$3');
    data=data.replace(/((>|")Mahgo ClawS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2码果的爪$3');
    data=data.replace(/((>|")Yohlon HavenS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2犹朗避难所$3');
    data=data.replace(/((>|")Arkjok WardS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2阿尔科监禁区$3');
    data=data.replace(/((>|")Mandragor ImpS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2曼陀罗恶魔$3');
    data=data.replace(/((>|")Mandragor SlitherS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2曼陀罗撕裂者$3');
    data=data.replace(/((>|")Mandragor RootS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2曼陀罗根$3');
    data=data.replace(/((>|")Yohlon HavenS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2犹朗避难所$3');
    data=data.replace(/((>|")YajideS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2叶吉达$3');
    data=data.replace(/((>|")Mandragor Root CakeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2曼陀罗根糕点$3');
    data=data.replace(/((>|")Mandragor RootS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2曼陀罗根$3');
    data=data.replace(/((>|")Snake DanceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2蛇舞$3');
    data=data.replace(/((>|")Dreadnought's DriftS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2无惧者之丘$3');
    data=data.replace(/((>|")Beacon's PerchS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2毕肯高地$3');
    data=data.replace(/((>|")Deldrimor War CampS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2戴尔狄摩兵营$3');
    data=data.replace(/((>|")Azure ShadowS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2湛蓝阴影$3');
    data=data.replace(/((>|")Azure RemainS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2湛蓝残留物$3');
    data=data.replace(/((>|")The MarketplaceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2市集$3');
    data=data.replace(/((>|")Wajjun BazaarS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2瓦江市场$3');
    data=data.replace(/((>|")Am FahS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2安费$3');
    data=data.replace(/((>|")Plague IdolS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2瘟疫法器$3');
    data=data.replace(/((>|")Tarnished HavenS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2灰暗避难所$3');
    data=data.replace(/((>|")Alcazia TangleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2纠结之艾卡滋亚$3');
    data=data.replace(/((>|")Umbral GrottoS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2阴影石穴$3');
    data=data.replace(/((>|")Verdant CascadesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2原野瀑布$3');
    data=data.replace(/((>|")Quetzal CrestS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2长尾冠毛$3');
	data=data.replace(/((>|")QuetzalS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2长尾$3');
    data=data.replace(/((>|")The Mouth of TormentS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2苦痛之地隘口$3');
    data=data.replace(/((>|")Poisoned OutcropsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2剧毒地表$3');
    data=data.replace(/((>|")MargoniteS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2玛骨奈$3');
    data=data.replace(/((>|")Margonite MaskS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2玛骨奈面具$3');
    data=data.replace(/((>|")The Granite CitadelS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2花岗岩堡垒$3');
    data=data.replace(/((>|")Tasca's DemiseS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2塔斯加之死$3');
    data=data.replace(/((>|")Mineral SpringsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2矿物泉源$3');
    data=data.replace(/((>|")TenguS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2天狗$3');
    data=data.replace(/((>|")AvicaraS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2阿比卡拉$3');
    data=data.replace(/((>|")Feathered Avicara ScalpS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2阿比卡拉头皮羽毛$3');
    data=data.replace(/((>|")Fort RanikS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2瑞尼克要塞$3');
    data=data.replace(/((>|")Regent ValleyS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2统治者之谷$3');
    data=data.replace(/((>|")Red Iris FlowerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2红色鸢尾花$3');
    data=data.replace(/((>|")Grendich CourthouseS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2葛兰迪法院$3');
    data=data.replace(/((>|")Flame Temple CorridorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2夏尔火焰神殿$3');
    data=data.replace(/((>|")CharrS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2夏尔$3');
    data=data.replace(/((>|")Charr CarvingS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2夏尔雕刻品$3');
    data=data.replace(/((>|")Yak's BendS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2牦牛村$3');
    data=data.replace(/((>|")Traveler's ValeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2旅人谷$3');
    data=data.replace(/((>|")Rare material traderS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2稀有材料商人$3');
    data=data.replace(/((>|")Bolts*? of LinenS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2亚麻布$3');
    data=data.replace(/((>|")ArtisanS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2工匠$3');
    data=data.replace(/((>|")Plant FiberS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2植物纤维$3');
    data=data.replace(/((>|")Gunnar's HoldS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2甘拿的占领地$3');
    data=data.replace(/((>|")Norrhart DomainsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2诺恩之心领地$3');
    data=data.replace(/((>|")Dreamroot MandragorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2梦之根曼陀罗$3');
    data=data.replace(/((>|")Mandragor ScavengerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2拾荒曼陀罗$3');
    data=data.replace(/((>|")Mystic MandragorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2秘教曼陀罗$3');
    data=data.replace(/((>|")Ulcerous MandragorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2已腐蚀曼陀罗$3');
    data=data.replace(/((>|")Frigid Mandragor HuskS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2呆板曼陀罗外壳$3');
    data=data.replace(/((>|")Champion's DawnS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2勇士曙光$3');
    data=data.replace(/((>|")Cliffs of DohjokS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2杜夏悬崖$3');
    data=data.replace(/((>|")CorsairS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2海盗$3');
    data=data.replace(/((>|")Copper ShillingS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2铜先令$3');
    data=data.replace(/((>|")The WildsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2荒原$3');
    data=data.replace(/((>|")Sage LandsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2贤者领地$3');
    data=data.replace(/((>|")Wind Rider (Maguuma Jungle)S*?(<|"))(?=[^A-Za-z]|$)/gi, '$2驭风者$3');
    data=data.replace(/((>|")Ancient EyeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2远古之眼$3');
    data=data.replace(/((>|")Sunspear SanctuaryS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2日戟避难所$3');
    data=data.replace(/((>|")Sunward MarchesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2向阳边境$3');
    data=data.replace(/((>|")Mirage IbogaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2幻象伊波枷$3');
    data=data.replace(/((>|")Murmuring ThornbrushS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2荆棘之藤$3');
    data=data.replace(/((>|")Sentient SporeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2知觉孢子$3');
    data=data.replace(/((>|")Gates of KrytaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2科瑞塔关所$3');
    data=data.replace(/((>|")Scoundrel's RiseS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2恶汉山丘$3');
    data=data.replace(/((>|")Bog Skale FinS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2泥鳞怪的鳍$3');
    data=data.replace(/((>|")Bog SkaleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2泥鳞怪$3');
    data=data.replace(/((>|")Zos Shivros ChannelS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2佐席洛斯水道$3');
    data=data.replace(/((>|")Kraken SpawnS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2海妖卵$3');
    data=data.replace(/((>|")Kraken EyeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2海妖之眼$3');
    data=data.replace(/((>|")Grendich CourthouseS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2葛兰迪法院$3');
    data=data.replace(/((>|")Flame Temple CorridorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2夏尔火焰神殿$3');
    data=data.replace(/((>|")Dragon's GulletS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2巨龙峡谷$3');
    data=data.replace(/((>|")Abomination (NPC)S*?(<|"))(?=[^A-Za-z]|$)/gi, '$2憎恨者$3');
    data=data.replace(/((>|")Gruesome RibcageS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2可怕的胸腔$3');
    data=data.replace(/((>|")Longeye's LedgeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2长眼岩脉$3');
    data=data.replace(/((>|")Grothmar WardownsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2古斯玛战争丘陵地$3');
    data=data.replace(/((>|")Mandragor Dust DevilS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2曼陀罗尘魔$3');
    data=data.replace(/((>|")Mandragor Smoke DevilS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2曼陀罗烟魔$3');
    data=data.replace(/((>|")Vile MandragorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2暗黑曼陀罗$3');
    data=data.replace(/((>|")Fibrous Mandragor RootS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2纤维曼陀罗根$3');
    data=data.replace(/((>|")Chantry of SecretsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2隐密教堂$3');
    data=data.replace(/((>|")Yatendi CanyonsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2亚天帝峡谷$3');
    data=data.replace(/((>|")Rain BeetleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2雨甲虫$3');
    data=data.replace(/((>|")Rock BeetleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2石甲虫$3');
    data=data.replace(/((>|")GeodeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2晶石$3');
    data=data.replace(/((>|")Vizunah Square (Local Quarter)S*?(<|"))(?=[^A-Za-z]|$)/gi, '$2薇茹广场本地$3');
    data=data.replace(/((>|")The UndercityS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2地下城$3');
    data=data.replace(/((>|")Kappa (level 20)S*?(<|"))(?=[^A-Za-z]|$)/gi, '$2河童$3');
    data=data.replace(/((>|")Ancient Kappa ShellS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2古河童壳$3');
    data=data.replace(/((>|")Temple of the AgesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2世纪神殿$3');
    data=data.replace(/((>|")The Black CurtainS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2黑色帷幕$3');
    data=data.replace(/((>|")Fog NightmareS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2迷雾梦靥$3');
    data=data.replace(/((>|")Shadowy RemnantsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2阴影残留物$3');
    data=data.replace(/((>|")Remains of SahlahjaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2萨拉迦遗址$3');
    data=data.replace(/((>|")The Sulfurous WastesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2硫磺荒地$3');
    data=data.replace(/((>|")Awakened CavalierS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2觉醒的骑士$3');
    data=data.replace(/((>|")Mummy WrappingS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2木乃伊裹尸布$3');
    data=data.replace(/((>|")Tsumei VillageS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2苏梅村$3');
    data=data.replace(/((>|")Sunqua ValeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2桑泉谷$3');
    data=data.replace(/((>|")SensaliS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2圣沙利天狗$3');
    data=data.replace(/((>|")Feathered ScalpS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2羽头皮$3');
    data=data.replace(/((>|")Bone PalaceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2白骨宫殿$3');
    data=data.replace(/((>|")Joko's DomainS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2杰格领地$3');
    data=data.replace(/((>|")Gate of TormentS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2苦痛之门$3');
    data=data.replace(/((>|")Nightfallen JahaiS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2夜蚀暗殒 夏亥$3');
    data=data.replace(/((>|")Graven MonolithS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2铭刻石雕$3');
    data=data.replace(/((>|")Inscribed ShardS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2铭刻碎片$3');
    data=data.replace(/((>|")Vlox's FallsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2弗洛克斯瀑布$3');
    data=data.replace(/((>|")Arbor BayS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2亚伯湾$3');
    data=data.replace(/((>|")Krait SkinS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2环蛇皮$3');
    data=data.replace(/((>|")KraitS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2环蛇$3');
    data=data.replace(/((>|")The Granite CitadelS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2花岗岩堡垒$3');
    data=data.replace(/((>|")Tasca's DemiseS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2塔斯加之死$3');
    data=data.replace(/((>|")Stone Summit BadgeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2石峰标志$3');
    data=data.replace(/((>|")Stone SummitS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2石峰矮人$3');
    data=data.replace(/((>|")Defend Droknar's ForgeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2保卫卓克纳熔炉$3');
    data=data.replace(/((>|")Lutgardis ConservatoryS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2路嘉蒂斯温室$3');
    data=data.replace(/((>|")Melandru's HopeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2梅兰朵的盼望$3');
    data=data.replace(/((>|")Echovald ForestS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2科凡德森林$3');
    data=data.replace(/((>|")Dredge IncisorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2挖掘者之牙$3');
    data=data.replace(/((>|")DredgeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2挖掘者$3');
    data=data.replace(/((>|")Grendich CourthouseS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2葛兰迪法院$3');
    data=data.replace(/((>|")Diessa LowlandsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2底耶沙低地$3');
    data=data.replace(/((>|")GargoyleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2石像鬼$3');
    data=data.replace(/((>|")Flash GargoyleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2迅速石像鬼$3');
    data=data.replace(/((>|")Shatter GargoyleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2破碎石像鬼$3');
    data=data.replace(/((>|")Resurrect GargoyleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2复活石像鬼$3');
    data=data.replace(/((>|")Singed Gargoyle SkullS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2烧焦的石像鬼头颅$3');
    data=data.replace(/((>|")Pogahn PassageS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2波甘驿站$3');
    data=data.replace(/((>|")Gandara, the Moon FortressS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2弦月要塞 干达拉$3');
    data=data.replace(/((>|")Kournan militaryS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2高楠士兵$3');
    data=data.replace(/((>|")Kournan PendantS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2高楠垂饰$3');
    data=data.replace(/((>|")Sunjiang DistrictS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2孙江行政区$3');
    data=data.replace(/((>|")Shenzun TunnelsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2申赞通道$3');
    data=data.replace(/((>|")Plant FiberS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2植物纤维$3');
    data=data.replace(/((>|")Tempered Glass VialS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2调合后的玻璃瓶$3');
    data=data.replace(/((>|")Kaineng CenterS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2凯宁中心$3');
    data=data.replace(/((>|")Vials*? of InkS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2小瓶油水$3');
    data=data.replace(/((>|")Camp RankorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2蓝口营地$3');
    data=data.replace(/((>|")Talus ChuteS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2碎石坡道$3');
    data=data.replace(/((>|")Mountain TrollS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2山巨魔$3');
    data=data.replace(/((>|")Mountain Troll TuskS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2山巨魔獠牙$3');
    data=data.replace(/((>|")Kodonur CrossroadsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2科登诺路口$3');
    data=data.replace(/((>|")Dejarin EstateS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2达贾林庄$3');
    data=data.replace(/((>|")Blue Tongue HeketS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2蓝舌哈克蛙$3');
    data=data.replace(/((>|")Beast Sworn HeketS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2野性哈克蛙$3');
    data=data.replace(/((>|")Blood Cowl HeketS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2冷血哈克蛙$3');
    data=data.replace(/((>|")Heket TongueS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2哈克蛙舌$3');
    data=data.replace(/((>|")Longeye's LedgeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2长眼岩脉$3');
    data=data.replace(/((>|")Bjora MarchesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2碧拉边境$3');
    data=data.replace(/((>|")Jotun SkullsmasherS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2碎骨角顿$3');
    data=data.replace(/((>|")Jotun MindbreakerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2断绪角顿$3');
    data=data.replace(/((>|")Jotun BladeturnerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2转刃角顿$3');
    data=data.replace(/((>|")Jotun PeltS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2角顿皮毛$3');
    data=data.replace(/((>|")Harvest TempleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2丰收神殿$3');
    data=data.replace(/((>|")Unwaking WatersS*? \(explorable area\)(<|"))(?=[^A-Za-z]|$)/gi, '$2沉睡之水 (探索区)$3');
	data=data.replace(/((>|")Unwaking WatersS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2沉睡之水$3');
    data=data.replace(/((>|")Saltspray DragonS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2盐雾之龙$3');
    data=data.replace(/((>|")Rockhide DragonS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2岩皮之龙$3');
    data=data.replace(/((>|")Azure CrestS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2湛蓝羽冠$3');
    data=data.replace(/((>|")Yak's BendS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2牦牛村$3');
    data=data.replace(/((>|")HydraS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2三头龙$3');
    data=data.replace(/((>|")Leathery ClawS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2强韧的爪$3');
    data=data.replace(/((>|")Grand Court of SebelkehS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2希贝克大宫廷$3');
    data=data.replace(/((>|")The Mirror of LyssS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2丽之镜湖$3');
    data=data.replace(/((>|")Roaring Ether HeartS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2苍穹咆啸者之心$3');
    data=data.replace(/((>|")Roaring EtherS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2苍穹咆啸者$3');
    data=data.replace(/((>|")Senji's CornerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2山吉之街$3');
    data=data.replace(/((>|")Xaquang SkywayS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2夏安便道$3');
    data=data.replace(/((>|")Vermin HideS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2寄生虫皮革$3');
	data=data.replace(/((>|")VerminS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2寄生虫$3');
    data=data.replace(/((>|")Sunspear Great HallS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2日戟大会堂$3');
    data=data.replace(/((>|")Plains of JarinS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2贾林平原$3');
    data=data.replace(/((>|")Fanged IbogaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2尖牙伊波茄$3');
    data=data.replace(/((>|")Iboga PetalS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2伊波茄花瓣$3');
    data=data.replace(/((>|")Champion's DawnS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2勇士曙光$3');
    data=data.replace(/((>|")Chef VolonS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2大厨 瓦隆$3');
    data=data.replace(/((>|")Pahnai SaladS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2伊波茄沙拉$3');
    data=data.replace(/((>|")Seitung HarborS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2青函港$3');
    data=data.replace(/((>|")Jaya BluffsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2蛇野断崖$3');
    data=data.replace(/((>|")Mountain YetiS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2山雪怪$3');
    data=data.replace(/((>|")Longhair YetiS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2长毛雪怪$3');
    data=data.replace(/((>|")Red YetiS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2红雪怪$3');
    data=data.replace(/((>|")Stolen SuppliesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2失窃的补给品$3');
    data=data.replace(/((>|")Aurora GladeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2欧若拉林地$3');
    data=data.replace(/((>|")Ettin's BackS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2双头怪隐匿地$3');
    data=data.replace(/((>|")Dry TopS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2干燥高地$3');
    data=data.replace(/((>|")Nicholas the TravelerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2地图$3');
    data=data.replace(/((>|")Thorn StalkerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2棘刺潜行者$3');
    data=data.replace(/((>|")Tangled SeedS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2纠结的种子$3');
    data=data.replace(/((>|")Iron Mines of MoladuneS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2莫拉登矿山$3');
    data=data.replace(/((>|")Frozen ForestS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2冰冻森林$3');
    data=data.replace(/((>|")PinesoulS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2松木怪$3');
    data=data.replace(/((>|")Alpine SeedS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2柏木种子$3');
    data=data.replace(/((>|")Gadd's EncampmentS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2盖德营区$3');
    data=data.replace(/((>|")Sparkfly SwampS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2火星蝇沼泽$3');
    data=data.replace(/((>|")Bogroot GrowthsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2泥塘根源地$3');
    data=data.replace(/((>|")HeketS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2青蛙族群$3');
    data=data.replace(/((>|")Rata SumS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2洛达顶点$3');
    data=data.replace(/((>|")Magus StonesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2马古斯之石$3');
    data=data.replace(/((>|")Oola's LabS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2呜拉实验室$3');
    data=data.replace(/((>|")Hylek AminiS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2海格克 阿纳尼$3');
    data=data.replace(/((>|")Hylek NahualliS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2海格克 纳猾里$3');
    data=data.replace(/((>|")Hylek TlamatiniS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2海格克 拉玛提尼$3');
    data=data.replace(/((>|")Amphibian TongueS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2双面人的舌头$3');
    data=data.replace(/((>|")Kodonur CrossroadsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2科登诺路口$3');
    data=data.replace(/((>|")The Floodplain of MahnkelonS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2曼克隆泛滥平原$3');
    data=data.replace(/((>|")Embark BeachS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2征途海滩$3');
    data=data.replace(/((>|")MerchantS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2杂货商人$3');
    data=data.replace(/((>|")Dwarven AleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2矮人啤酒$3');
    data=data.replace(/((>|")Gunnar's HoldS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2甘拿的占领地$3');
    data=data.replace(/((>|")Kilroy StonekinS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2基罗伊石族$3');
    data=data.replace(/((>|")Fronis Irontoe's LairS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2铁趾 佛朗尼的巢穴$3');
    data=data.replace(/((>|")Irontoe'*?s*? ChestS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2最终宝箱$3');
    data=data.replace(/((>|")Eredon TerraceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2雷尔登平地$3');
    data=data.replace(/((>|")Maishang HillsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2麦尚山丘$3');
    data=data.replace(/((>|")Pongmei ValleyS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2朋美谷$3');
    data=data.replace(/((>|")Islands*? GuardianS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2岛屿守护者$3');
    data=data.replace(/((>|")Guardian MossS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2守护者苔$3');
    data=data.replace(/((>|")Gate of DesolationS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2荒芜之地入口$3');
    data=data.replace(/((>|")Turai's ProcessionS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2托雷长廊$3');
    data=data.replace(/((>|")Water Djinn EssenceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2水巨灵精华$3');
    data=data.replace(/((>|")Water DjinnS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2水巨灵$3');
    data=data.replace(/((>|")Hulking Stone ElementalS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2巨石元素$3');
    data=data.replace(/((>|")Scorched LodestoneS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2烧焦的磁石$3');
    data=data.replace(/((>|")Amatz BasinS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2亚马兹盆地$3');
    data=data.replace(/((>|")Mourning Veil FallsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2哀伤之幕瀑布$3');
    data=data.replace(/((>|")Rare material traderS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2稀有材料商$3');
    data=data.replace(/((>|")Tempered Glass VialS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2调和后的玻璃瓶$3');
    data=data.replace(/((>|")Bergen Hot SpringsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2卑尔根温泉$3');
    data=data.replace(/((>|")Nebo TerraceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2尼伯山丘$3');
    data=data.replace(/((>|")Cursed LandsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2诅咒之地$3');
    data=data.replace(/((>|")Skeleton RangerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2骷髅游侠$3');
    data=data.replace(/((>|")Skeleton SorcererS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2骷髅巫师$3');
    data=data.replace(/((>|")Grasping GhoulS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2贪婪的食尸鬼$3');
    data=data.replace(/((>|")Zombie WarlockS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2僵尸法魔$3');
    data=data.replace(/((>|")Skeleton BowmasterS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2骷髅弓箭手$3');
    data=data.replace(/((>|")Decayed Orr EmblemS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2腐烂的欧尔纹章$3');
    data=data.replace(/((>|")BeetletunS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2甲虫镇$3');
    data=data.replace(/((>|")Watchtower CoastS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2瞭望塔海岸$3');
    data=data.replace(/((>|")Gates of KrytaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2科瑞塔关所$3');
    data=data.replace(/((>|")Scoundrel's RiseS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2恶汉山丘$3');
    data=data.replace(/((>|")Mergoyle WavebreakerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2碎浪石像魔$3');
    data=data.replace(/((>|")Mergoyle SkullS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2石像魔头颅$3');
    data=data.replace(/((>|")Nundu BayS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2纳度湾$3');
    data=data.replace(/((>|")Marga CoastS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2马加海岸$3');
    data=data.replace(/((>|")Yohlon HavenS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2犹朗避难所$3');
    data=data.replace(/((>|")Arkjok WardS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2阿尔科监禁区$3');
    data=data.replace(/((>|")Bladed Veldt TermiteS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2利刃草原蚁$3');
    data=data.replace(/((>|")Veldt Beetle LanceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2草原尖刺甲虫$3');
    data=data.replace(/((>|")Veldt Beetle QueenS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2草原甲虫后$3');
    data=data.replace(/((>|")Insect CarapaceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2甲虫壳$3');
    data=data.replace(/((>|")CavalonS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2卡瓦隆$3');
    data=data.replace(/((>|")ArchipelagosS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2群岛$3');
    data=data.replace(/((>|")Creeping CarpS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2爬行鲤鱼$3');
    data=data.replace(/((>|")Scuttle FishS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2甲板鱼$3');
    data=data.replace(/((>|")IrukandjiS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2毒水母$3');
    data=data.replace(/((>|")Black PearlS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2黑珍珠$3');
    data=data.replace(/((>|")Bone PalaceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2白骨宫殿$3');
    data=data.replace(/((>|")Joko's DomainS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2杰格领地$3');
    data=data.replace(/((>|")The Shattered RavinesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2碎裂沟谷$3');
    data=data.replace(/((>|")Basalt GrottoS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2玄武岩石穴$3');
    data=data.replace(/((>|")Sandstorm CragS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2沙风暴．克雷格$3');
    data=data.replace(/((>|")Shambling MesaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2震颤者．梅萨$3');
    data=data.replace(/((>|")Sandblasted LodestoneS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2喷沙磁石$3');
    data=data.replace(/((>|")Yak's BendS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2牦牛村$3');
    data=data.replace(/((>|")Traveler's ValeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2旅人谷$3');
    data=data.replace(/((>|")Iron Horse MineS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2铁马矿山$3');
    data=data.replace(/((>|")Beacon's PerchS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2毕肯高地$3');
    data=data.replace(/((>|")Deldrimor BowlS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2戴尔迪摩盆地$3');
    data=data.replace(/((>|")Griffon's MouthS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2狮鹫兽隘口$3');
    data=data.replace(/((>|")Snow EttinS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2冰雪双头巨人$3');
    data=data.replace(/((>|")Icy HumpS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2冰雪瘤$3');
    data=data.replace(/((>|")Ran Musu GardensS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2岚穆苏花园$3');
    data=data.replace(/((>|")Minister Cho's EstateS*? \(explorable area\)(<|"))(?=[^A-Za-z]|$)/gi, '$2周大臣庄园 (探索区)$3');
	data=data.replace(/((>|")Minister Cho's EstateS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2周大臣庄园$3');
    data=data.replace(/((>|")Sickened ServantS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2病变的使者$3');
    data=data.replace(/((>|")Sickened PeasantS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2病变的书记$3');
    data=data.replace(/((>|")Sickened Guard (warrior)S*?(<|"))(?=[^A-Za-z]|$)/gi, '$2病变的警卫$3');
    data=data.replace(/((>|")Forgotten Trinket Boxe*?S*?(<|"))(?=[^A-Za-z]|$)/gi, '$2被遗忘的小箱子$3');
    data=data.replace(/((>|")Ventari's RefugeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2凡特里庇护所$3');
    data=data.replace(/((>|")Ettin's BackS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2双头怪隐匿第$3');
    data=data.replace(/((>|")Reed BogS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2芦苇沼泽地$3');
    data=data.replace(/((>|")The FallsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2陷落区$3');
    data=data.replace(/((>|")Maguuma SpiderS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2梅古玛蜘蛛$3');
    data=data.replace(/((>|")Maguuma Spider WebS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2梅古玛蜘蛛丝$3');
    data=data.replace(/((>|")Jennur's HordeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2征纳群落$3');
    data=data.replace(/((>|")Vehjin MinesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2威金矿坑$3');
    data=data.replace(/((>|")Cobalt ScabaraS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2深蓝斯卡巴拉$3');
    data=data.replace(/((>|")Cobalt MokeleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2深蓝魔克雷$3');
    data=data.replace(/((>|")Cobalt ShriekerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2深蓝尖啸者$3');
    data=data.replace(/((>|")Cobalt TalonS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2深蓝之爪$3');
    data=data.replace(/((>|")Sunspear SanctuaryS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2日戟避难所$3');
    data=data.replace(/((>|")Command PostS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2指挥所$3');
    data=data.replace(/((>|")Jahai BluffsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2夏亥峭壁$3');
    data=data.replace(/((>|")Rare material traderS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2稀有材料商人$3');
    data=data.replace(/((>|")Elonian Leathers*(?: SquareS*?)?(<|"))(?=[^A-Za-z]|$)/gi, '$2伊洛那皮革$3');
    data=data.replace(/((>|")Deldrimor War CampS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2戴尔狄摩兵营$3');
    data=data.replace(/((>|")Grenth's FootprintS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2古兰斯的足迹$3');
    data=data.replace(/((>|")Sorrow's FurnaceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2哀伤熔炉$3');
    data=data.replace(/((>|")Priest of SorrowsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2哀伤祭司$3');
    data=data.replace(/((>|")Summit WardenS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2石峰看守者$3');
    data=data.replace(/((>|")Summit SurveyorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2石峰测量员$3');
    data=data.replace(/((>|")Summit Dark BinderS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2石峰黑暗束缚者$3');
    data=data.replace(/((>|")Summit Deep KnightS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2石峰深渊骑士$3');
    data=data.replace(/((>|")Summit TaskmasterS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2石峰工头$3');
    data=data.replace(/((>|")Enslavement StoneS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2奴隶石$3');
    data=data.replace(/((>|")Ventari's RefugeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2凡特里避难所$3');
    data=data.replace(/((>|")Ettin's BackS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2双头怪隐匿地$3');
    data=data.replace(/((>|")The WildsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2荒原$3');
    data=data.replace(/((>|")Moss ScarabS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2苔圣甲虫$3');
    data=data.replace(/((>|")Mossy MandibleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2生苔下颚骨$3');
    data=data.replace(/((>|")Ran Musu GardensS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2岚穆苏花园$3');
    data=data.replace(/((>|")Kinya ProvinceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2欣弥领地$3');
    data=data.replace(/((>|")Panjiang PeninsulaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2班让半岛$3');
    data=data.replace(/((>|")Crimson SkullS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2红颅$3');
    data=data.replace(/((>|")Copper Crimson Skull CoinS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2红颅铜币$3');
    data=data.replace(/((>|")Dunes of DespairS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2绝望沙丘$3');
    data=data.replace(/((>|")Vulture DriftsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2秃鹰沙丘$3');
    data=data.replace(/((>|")Enchanted HammerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2附魔巨锤兵$3');
    data=data.replace(/((>|")Enchanted SwordS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2附魔长剑兵$3');
    data=data.replace(/((>|")Enchanted BowS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2附魔弓兵$3');
    data=data.replace(/((>|")Forgotten SealS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2遗忘者图章$3');
    data=data.replace(/((>|")Dasha VestibuleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2达沙走廊$3');
    data=data.replace(/((>|")The Hidden City of AhdashimS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2隐藏之城 哈达辛$3');
    data=data.replace(/((>|")Key of AhdashimS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2哈达辛之钥$3');
    data=data.replace(/((>|")Diamond Djinn EssenceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2钻石巨灵精华$3');
    data=data.replace(/((>|")Diamond DjinnS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2钻石巨灵$3');
    data=data.replace(/((>|")Temple of the AgesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2世纪神殿$3');
    data=data.replace(/((>|")Talmark WildernessS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2突马克荒地$3');
    data=data.replace(/((>|")Bergen Hot SpringsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2卑尔根温泉$3');
    data=data.replace(/((>|")Cursed LandsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2诅咒之地$3');
    data=data.replace(/((>|")Ancient OakheartS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2古老橡树妖$3');
    data=data.replace(/((>|")OakheartS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2橡树妖$3');
    data=data.replace(/((>|")Spined AloeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2突刺芦荟$3');
    data=data.replace(/((>|")Reed StalkerS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2芦苇潜行者$3');
    data=data.replace(/((>|")Abnormal SeedS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2畸形的种子$3');
    data=data.replace(/((>|")The Mouth of TormentS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2苦痛之地隘口$3');
    data=data.replace(/((>|")The Ruptured HeartS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2破裂之心$3');
    data=data.replace(/((>|")Gate of TormentS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2苦痛之门$3');
    data=data.replace(/((>|")Realm of TormentS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2苦痛领域$3');
    data=data.replace(/((>|")Nightfallen JahaiS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2夜蚀暗殒 夏亥$3');
    data=data.replace(/((>|")Arm of InsanityS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2狂乱武装$3');
    data=data.replace(/((>|")Scythe of ChaosS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2混沌镰刀$3');
    data=data.replace(/((>|")Blade of CorruptionS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2堕落之刃$3');
    data=data.replace(/((>|")Shadow of FearS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2恐惧暗影$3');
    data=data.replace(/((>|")Rain of TerrorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2惊骇之雨$3');
    data=data.replace(/((>|")Herald of NightmaresS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2梦靥使者$3');
    data=data.replace(/((>|")Spear of TormentS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2苦痛之矛$3');
    data=data.replace(/((>|")Word of MadnessS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2疯狂话语$3');
    data=data.replace(/((>|")Demonic RelicS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2恶魔残片$3');
    data=data.replace(/((>|")Ice Tooth CaveS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2冰牙洞穴$3');
    data=data.replace(/((>|")Anvil RockS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2铁砧石$3');
    data=data.replace(/((>|")Frostfire DryderS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2霜火蛛化精灵$3');
    data=data.replace(/((>|")Frostfire FangS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2霜火尖牙$3');
    data=data.replace(/((>|")Pongmei ValleyS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2朋美谷$3');
    data=data.replace(/((>|")Rot WallowS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2腐败兽$3');
    data=data.replace(/((>|")Rot Wallow TuskS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2腐败兽獠牙$3');
    data=data.replace(/((>|")Elona ReachS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2伊洛那流域$3');
    data=data.replace(/((>|")Diviner's AscentS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2预言者之坡$3');
    data=data.replace(/((>|")Sand DrakeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2沙龙兽$3');
    data=data.replace(/((>|")Topaz CrestS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2黄宝石颈脊$3');
    data=data.replace(/((>|")Rata SumS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2洛达顶点$3');
    data=data.replace(/((>|")Magus StonesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2玛古斯之石$3');
    data=data.replace(/((>|")LifeweaverS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2织命者$3');
    data=data.replace(/((>|")BloodweaverS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2织血者$3');
    data=data.replace(/((>|")VenomweaverS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2织恨者$3');
    data=data.replace(/((>|")SpiderS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2蜘蛛$3');
    data=data.replace(/((>|")Weaver LegS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2编织者的腿$3');
    data=data.replace(/((>|")Yahnur MarketS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2雅诺尔市集$3');
    data=data.replace(/((>|")Vehtendi ValleyS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2巍天帝峡谷$3');
    data=data.replace(/((>|")Storm JacarandaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2暴风荆棘$3');
    data=data.replace(/((>|")Mirage IbogaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2幻象伊波枷$3');
    data=data.replace(/((>|")Enchanted BramblesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2魔法树根$3');
    data=data.replace(/((>|")Whistling ThornbrushS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2荆棘之藤$3');
    data=data.replace(/((>|")Sentient SporeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2知觉孢子$3');
    data=data.replace(/((>|")AhojS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2亚禾$3');
    data=data.replace(/((>|")Bottle of Vabbian WineS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2瓦贝红酒$3');
    data=data.replace(/((>|")Jarimiya the UnmercifulS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2残酷 贾米里$3');
    data=data.replace(/((>|")Blacktide DenS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2黑潮之穴$3');
    data=data.replace(/((>|")Lahtenda BogS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2洛天帝沼泽$3');
    data=data.replace(/((>|")Mandragor ImpS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2曼陀罗恶魔$3');
    data=data.replace(/((>|")Mandragor SlitherS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2曼陀罗之藤$3');
    data=data.replace(/((>|")Stoneflesh MandragorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2曼陀罗石根$3');
    data=data.replace(/((>|")Mandragor SwamprootS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2曼陀罗根$3');
    data=data.replace(/((>|")Vasburg ArmoryS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2维思柏兵营$3');

    data=data.replace(/((>|")Skill Hungry GakiS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2灵巧的饿鬼$3');
    data=data.replace(/((>|")Pain Hungry GakiS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2痛苦的饿鬼$3');
    data=data.replace(/((>|")Quarrel FallsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2怨言瀑布$3');
    data=data.replace(/((>|")SilverwoodS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2银树$3');
    data=data.replace(/((>|")Maguuma WarriorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2梅古玛战士$3');
    data=data.replace(/((>|")Maguuma HunterS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2梅古玛猎人$3');
    data=data.replace(/((>|")Maguuma ProtectorS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2梅古玛守护者$3');
    data=data.replace(/((>|")Maguuma ManeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2梅古玛鬃毛$3');
    data=data.replace(/((>|")Seeker's PassageS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2探索者通道$3');
    data=data.replace(/((>|")Salt FlatsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2盐滩$3');
    data=data.replace(/((>|")The Amnoon OasisS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2安努绿洲$3');
    data=data.replace(/((>|")Prophet's PathS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2先知之路$3');
    data=data.replace(/((>|")Jade ScarabS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2翡翠圣甲虫$3');
    data=data.replace(/((>|")Jade MandibleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2翡翠下颚骨$3');
    data=data.replace(/((>|")Temple of the AgesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2辛库走廊$3');
    data=data.replace(/((>|")Sunjiang DistrictS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2孙江行政区$3');
    data=data.replace(/((>|")Sunjiang DistrictS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2孙江行政区$3');
    data=data.replace(/((>|")Shenzun TunnelsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2申赞通道$3');
    data=data.replace(/((>|")AfflictedS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2被感染的$3');
    data=data.replace(/((>|")Putrid CystS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2腐败胞囊$3');
    data=data.replace(/((>|")The AstralariumS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2世纪神殿$3');
    data=data.replace(/((>|")Zehlon ReachS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2黑色帷幕$3');
    data=data.replace(/((>|")Beknur HarborS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2突马克荒地$3');
    data=data.replace(/((>|")Skale BlighterS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2森林牛头怪$3');
    data=data.replace(/((>|")Skale FinS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2森林牛头怪的角$3');
    data=data.replace(/((>|")The AstralariumS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2亚斯特拉利姆$3');
    data=data.replace(/((>|")Zehlon ReachS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2列隆流域$3');
    data=data.replace(/((>|")Beknur HarborS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2别克诺港$3');
    data=data.replace(/((>|")Issnur IslesS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2伊斯诺岛$3');
    data=data.replace(/((>|")Skale BlighterS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2黑暗鳞怪$3');
    data=data.replace(/((>|")Frigid SkaleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2寒冰鳞怪$3');
    data=data.replace(/((>|")Ridgeback SkaleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2脊背鳞怪$3');
    data=data.replace(/((>|")Skale FinS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2鳞怪鳍$3');
    data=data.replace(/((>|")Chef PanjohS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2大厨 潘乔$3');
    data=data.replace(/((>|")Bowl of Skalefin SoupS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2鳞怪鳍汤$3');
    data=data.replace(/((>|")Sage LandsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2荒原$3');
    data=data.replace(/((>|")Mamnoon LagoonS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2玛奴泻湖$3');
    data=data.replace(/((>|")Henge of DenraviS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2丹拉维圣地$3');
    data=data.replace(/((>|")Tangle RootS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2纠结之根$3');
    data=data.replace(/((>|")Dry TopS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2干燥高地$3');
    data=data.replace(/((>|")Behemoth JawS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2巨兽颚$3');
    data=data.replace(/((>|")Root BehemothS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2根巨兽$3');
    data=data.replace(/((>|")Brauer AcademyS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2袭哈拉$3');
    data=data.replace(/((>|")Jaga MoraineS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2亚加摩瑞恩$3');
    data=data.replace(/((>|")UndergrowthS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2海冶克狂战士$3');
    data=data.replace(/((>|")Dragon MossS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2牛头怪狂战士$3');
    data=data.replace(/((>|")Dragon MossS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2狂战士 纹帝哥$3');
    data=data.replace(/((>|")Dragon MossS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2棘狼狂战士$3');
    data=data.replace(/((>|")Berserker HornS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2狂战士的角$3');
    data=data.replace(/((>|")Brauer AcademyS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2巴尔学院$3');
    data=data.replace(/((>|")Drazach ThicketS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2德瑞扎灌木林$3');
    data=data.replace(/((>|")Tanglewood CopseS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2谭格坞树林$3');
    data=data.replace(/((>|")Pongmei ValleyS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2朋美谷$3');
    data=data.replace(/((>|")UndergrowthS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2矮树丛$3');
    data=data.replace(/((>|")Dragon MossS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2龙苔$3');
    data=data.replace(/((>|")Dragon RootS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2龙根$3');
    data=data.replace(/((>|")Fishermen's HavenS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2渔人避风港$3');
    data=data.replace(/((>|")Stingray StrandS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2魟鱼湖滨$3');
    data=data.replace(/((>|")Tears of the FallenS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2战死者之泪$3');
    data=data.replace(/((>|")Grand DrakeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2强龙兽$3');
    data=data.replace(/((>|")Sanctum CayS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2神圣沙滩$3');
    data=data.replace(/((>|")Lightning DrakeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2闪光龙兽$3');
    data=data.replace(/((>|")Spiked CrestS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2尖刺的颈脊$3');
    data=data.replace(/((>|")Imperial SanctumS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2帝国圣所$3');
    data=data.replace(/((>|")Soul StoneS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2灵魂石$3');
    data=data.replace(/((>|")Tihark OrchardS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2提亚克林地$3');
    data=data.replace(/((>|")Forum HighlandsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2高地广场$3');
    data=data.replace(/((>|")Skree WingS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2鸟妖翅膀$3');
    data=data.replace(/((>|")SkreeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2鸟妖$3');
    data=data.replace(/((>|")Serenity TempleS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2宁静神殿$3');
    data=data.replace(/((>|")Pockmark FlatsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2麻点平原$3');
    data=data.replace(/((>|")Storm RiderS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2暴风驾驭者$3');
    data=data.replace(/((>|")Stormy EyeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2暴风之眼$3');
    data=data.replace(/((>|")Gates of KrytaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2科瑞塔之门$3');
    data=data.replace(/((>|")Scoundrel's RiseS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2恶汉山丘$3');
    data=data.replace(/((>|")Griffon's MouthS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2狮鹭兽隘口$3');
    data=data.replace(/((>|")Spiritwood PlankS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2心灵之板$3');
    data=data.replace(/((>|")Tsumei VillageS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2苏梅村$3');
    data=data.replace(/((>|")Panjiang PeninsulaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2班让半岛$3');
    data=data.replace(/((>|")NagaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2纳迦$3');
    data=data.replace(/((>|")Naga HideS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2纳迦皮$3');
    data=data.replace(/((>|")SifhallaS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2袭哈拉$3');
    data=data.replace(/((>|")Drakkar LakeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2卓卡湖$3');
    data=data.replace(/((>|")Frozen ElementalS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2冰元素$3');
    data=data.replace(/((>|")Pile of Elemental DustS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2元素之土$3');
    data=data.replace(/((>|")Bergen Hot SpringsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2卑尔根温泉$3');
    data=data.replace(/((>|")Nebo TerraceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2尼伯山丘$3');
    data=data.replace(/((>|")North Kryta ProvinceS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2科瑞塔北部$3');
    data=data.replace(/((>|")Gypsie EttinS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2流浪双头巨人$3');
    data=data.replace(/((>|")Hardened HumpS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2硬瘤$3');
    data=data.replace(/((>|")Leviathan PitsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2利拜亚森矿场$3');
    data=data.replace(/((>|")Silent SurfS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2寂静之浪$3');
    data=data.replace(/((>|")Seafarer's RestS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2航海者休憩处$3');
    data=data.replace(/((>|")OniS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2鬼$3');
    data=data.replace(/((>|")Keen Oni TalonS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2锐利细鬼爪$3');
    data=data.replace(/((>|")Ice Caves of SorrowS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2悲伤冰谷$3');
    data=data.replace(/((>|")IcedomeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2冰点$3');
    data=data.replace(/((>|")Ice ElementalS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2冰元素$3');
    data=data.replace(/((>|")Ice GolemS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2冰高仑$3');
    data=data.replace(/((>|")Icy LodestoneS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2冰磁石$3');
    data=data.replace(/((>|")Augury RockS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2占卜之石$3');
    data=data.replace(/((>|")Skyward ReachS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2天际流域$3');
    data=data.replace(/((>|")Destiny's GorgeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2命运峡谷$3');
    data=data.replace(/((>|")Prophet's PathS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2探索者通道$3');
    data=data.replace(/((>|")Salt FlatsS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2盐滩$3');
    data=data.replace(/((>|")Storm KinS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2风暴魔$3');
    data=data.replace(/((>|")Shriveled EyeS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2干枯的眼睛$3');
    data=data.replace(/((>|")Skull JujuS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2头骨土符$3');
    data=data.replace(/((>|")Skull JujuS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2颅骨土符$3');
    data=data.replace(/((>|")Bone CharmS*? \(trophy\)(<|"))(?=[^A-Za-z]|$)/gi, '$2骨制护符$3');
	data=data.replace(/((>|")Bone CharmS*?(<|"))(?=[^A-Za-z]|$)/gi, '$2骨制护符$3');

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

	data=data.replace(/(^|[^A-Za-z])(<th> Week)(?=[^A-Za-z]|$)/gi, '$1<th style="text-align:center;"> 日期');
	data=data.replace(/(^|[^A-Za-z])(<th> Item)(?=[^A-Za-z]|$)/gi, '$1<th style="text-align:center;"> 材料');
	data=data.replace(/(^|[^A-Za-z])(<th> Location)(?=[^A-Za-z]|$)/gi, '$1<th style="text-align:center;"> 地点');
	data=data.replace(/(^|[^A-Za-z])(<th> Region)(?=[^A-Za-z]|$)/gi, '$1<th style="text-align:center;"> 地区');
	data=data.replace(/(^|[^A-Za-z])(<th> Campaign)(?=[^A-Za-z]|$)/gi, '$1<th style="text-align:center;"> 章节');

	data=data.replace(/(^|[^A-Za-z])(<th> Map)(?=[^A-Za-z]|$)/gi, '$1<th style="text-align:center;"> 所在地');
	data=data.replace(/(^|[^A-Za-z])(>Map<)(?=[^A-Za-z]|$)/gi, '$1>路线<');

	//处理粗体字
	//console.log(data);
	data=data.replace(/<tr .{0,15}style="font-weight: bold">(?=[^A-Za-z]|$)/gi, '<tr>');

	var tNow = new Date();
	var tDay = tNow.getUTCDay();

	var tYearNow = tNow.getUTCFullYear();
	var tMonthNow = tNow.getUTCMonth()+1;
	var tDateNow = tNow.getUTCDate() - tDay + (tDay == 0 ? -6:1)


	var tCutoff = new Date(Date.UTC(tYearNow, tMonthNow-1, tDateNow, 15, 0, 0));
	var tCutoff2 = new Date(Date.UTC(tYearNow, tMonthNow-1, tDateNow-7, 15, 0, 0));

	console.log(tCutoff);
	console.log(tCutoff2);

	//加文字日期
	var tSNow = tCutoff.getUTCDate() + ' ' + monthConversion(tCutoff.getUTCMonth()+1) + ' ' + tCutoff.getUTCFullYear();
	var tSLast = tCutoff2.getUTCDate() + ' ' + monthConversion(tCutoff2.getUTCMonth()+1) + ' ' + tCutoff2.getUTCFullYear();

	console.log(tSNow);
	console.log(tSLast);

	if (tNow > tCutoff) {
		var regExString = "<tr.{0,45}>(<td(.|\\n){0,50}"+tSNow+"(.|\\n)*?)<\\/tr>";
		console.log(regExString);
		var reg_Ex = new RegExp(regExString,"gi");
		data=data.replace(reg_Ex, fReplacer);
	}
	else {
		var regExString = "<tr.{0,45}>(<td(.|\\n){0,50}"+tSLast+"(.|\\n)*?)<\\/tr>";
		console.log(regExString);
		var reg_Ex = new RegExp(regExString,"gi");
		data=data.replace(reg_Ex, fReplacer);
	}

    return data;
}

function fReplacer(match, p1, p2, p3, offset, string) {
  //match should be the entire match containing <tr> and </tr>
  //p1 should be the stuff in between
  console.log(p1);
  return '<tr style="font-weight: bold;color: '+highlight_Color+';">'+p1.replace(/<a/gi, '<a style="color: '+highlight_Color+';" ')+'</tr>';
}

function monthConversion(data){

	switch(data){
		case 1:
			data = "一月";
			break;
		case 2:
			data = "二月";
			break;
		case 3:
			data = "三月";
			break;
		case 4:
			data = "四月";
			break;
		case 5:
			data = "五月";
			break;
		case 6:
			data = "六月";
			break;
		case 7:
			data = "七月";
			break;
		case 8:
			data = "八月";
			break;
		case 9:
			data = "九月";
			break;
		case 10:
			data = "十月";
			break;
		case 11:
			data = "十一月";
			break;
		case 12:
			data = "十二月";
			break;
		default:
			break;
	}

	return data;
}
