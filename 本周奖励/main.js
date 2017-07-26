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
var generateNow = new Date();
var urlSuffix = "%3F"+generateNow.getTime();
$.ajax({
    url: 'http://wiki.guildwars.com/wiki/Weekly_bonuses'+urlSuffix,
    type: 'GET',
    success: function(res) {

        DisplayData(res.responseText);

		set_loading(false);
    }
});

function set_loading(loading) {
    $('#loading-indicator').toggleClass('hide', !loading);
    $('#result-wrapper').toggleClass('hide', loading);
}


function DisplayData(data){

	//===> 注: 转换次序可产生意外效果； 务须按网页源代码制定转换规则，亦要小心后续规则改动了早些已转换完毕的字句  <===
	//===> 注: 转换次序可产生意外效果； 务须按网页源代码制定转换规则，亦要小心后续规则改动了早些已转换完毕的字句  <===
	//===> 注: 转换次序可产生意外效果； 务须按网页源代码制定转换规则，亦要小心后续规则改动了早些已转换完毕的字句  <===
	//===> 例: data=data.replace(/(^|[^A-Za-z])(<a href="\/wiki)(?=[^A-Za-z]|$)/gi, '<a href="http://wiki.guildwars.com/wiki/');

	//擦掉表格前后的内容
	var temp = data.split(">Trivia<");//
    var temp1 = temp[1];

	temp = temp1.split(">PvE<");
    data = temp[0];

	//抽出数据 data[0]，data[1]
	data=data.match(/<b>.*?<\/b>.*?<i>.*?<\/i>/gi);

	//不会用.match，所以用replace
	var pveCopy1 = data[0];
	var pveCopy2 = data[0];

	var pvpCopy1 = data[1];
	var pvpCopy2 = data[1];

	//今日PvE循环
	temp = pveCopy1.replace(/<b>(.*?)<\/b>.*/gi, '$1');
	temp1 = pveCopy2.replace(/.*<i>(.*?)<\/i>/gi, '$1');

	document.getElementById("NeiRong1").innerHTML = parseTranslate(temp);
	document.getElementById("NeiRong2").innerHTML = parseTranslate(temp1);

	//今日PvP循环
	temp = pvpCopy1.replace(/<b>(.*?)<\/b>.*/gi, '$1');
	temp1 = pvpCopy2.replace(/.*<i>(.*?)<\/i>/gi, '$1');

	document.getElementById("NeiRong3").innerHTML = parseTranslate(temp);
	document.getElementById("NeiRong4").innerHTML = parseTranslate(temp1);

	return data;
}


function parseTranslate(data){

	data=data.replace(/(^|[^A-Za-z])(Extra Luck Bonus)(?=[^A-Za-z]|$)/gi, '$1份外运气奖');
	data=data.replace(/(^|[^A-Za-z])(Elonian Support Bonus)(?=[^A-Za-z]|$)/gi, '$1支援伊洛那奖');
	data=data.replace(/(^|[^A-Za-z])(Zaishen Bounty Bonus)(?=[^A-Za-z]|$)/gi, '$1战承悬赏奖');
	data=data.replace(/(^|[^A-Za-z])(Factions Elite Bonus)(?=[^A-Za-z]|$)/gi, '$1二章精英奖');
	data=data.replace(/(^|[^A-Za-z])(Northern Support Bonus)(?=[^A-Za-z]|$)/gi, '$1四章支援奖');

	data=data.replace(/(^|[^A-Za-z])(Zaishen Mission Bonus)(?=[^A-Za-z]|$)/gi, '$1战承主线奖');
	data=data.replace(/(^|[^A-Za-z])(Pantheon Bonus)(?=[^A-Za-z]|$)/gi, '$1神殿奖');
	data=data.replace(/(^|[^A-Za-z])(Faction Support Bonus\*?)(?=[^A-Za-z]|$)/gi, '$1二章支援奖');
	data=data.replace(/(^|[^A-Za-z])(Zaishen Vanquishing Bonus)(?=[^A-Za-z]|$)/gi, '$1战承清图奖');
	data=data.replace(/(^|[^A-Za-z])(Random Arenas Bonus)(?=[^A-Za-z]|$)/gi, '$1随机竞技奖');

	data=data.replace(/(^|[^A-Za-z])(Guild Versus Guild Bonus)(?=[^A-Za-z]|$)/gi, '$1公会战奖');
	data=data.replace(/(^|[^A-Za-z])(Competitive Mission Bonus)(?=[^A-Za-z]|$)/gi, '$1二章竞技奖');
	data=data.replace(/(^|[^A-Za-z])(Heroes' Ascent Bonus)(?=[^A-Za-z]|$)/gi, '$1英雄之路奖');
	data=data.replace(/(^|[^A-Za-z])(Codex Arena Bonus)(?=[^A-Za-z]|$)/gi, '$1Codex竞技奖');
	data=data.replace(/(^|[^A-Za-z])(Alliance Battle Bonus)(?=[^A-Za-z]|$)/gi, '$1同盟战奖');

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

    return data;
}
