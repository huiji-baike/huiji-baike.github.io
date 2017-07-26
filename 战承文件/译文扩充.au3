#include-once
#include <FileConstants.au3>
#include <MsgBoxConstants.au3>
#include <WinAPIFiles.au3>
#include <Array.au3>
#include <File.au3>
#include <WinAPI.au3>
#include <INet.au3>
#include <Array.au3>
Opt("MustDeclareVars", 1)

Global $yuanwen1="NONE"
Global $yiwen1="NONE"
Global $yuanwen2="NONE"
Global $yiwen2="NONE"
Global $output1="NONE"
Global $output2="NONE"

Global $fBackup, $yuanFileOpen, $dFileOpen

UpdateTranslation()

Func UpdateTranslation()

	;备份原文件
	$fBackup = "backup\main"&"_"&@MON&"_"&@MDAY&"_"&@HOUR&"_"&@MIN&"_"&@SEC&".js"
	FileCopy("main.js", $fBackup)

	;打开文件
	$yuanFileOpen = FileOpen($fBackup, 128)


	;get the terms from website
	obtainTranslation()

	if $yuanwen1 == "NONE" or $yuanwen2 == "NONE" or $yiwen1 == "NONE" or $yiwen2 == "NONE" Then
		msgbox(0,"失败", "转换词失寻", 7)
		ExitNoBackup()
	EndIf

	Local $readY = FileRead($yuanFileOpen)

	Local $zUpdateFlag = StringInStr($readY, ">"&$yuanwen1&"<")
	Local $sUpdateFlag = StringInStr($readY, ">"&$yuanwen2&"<")

	if $zUpdateFlag and $sUpdateFlag then
		msgbox(0, "提示", "无需更新", 7)
		ExitNoBackup()
	else
		$dFileOpen=FileOpen("main.js", 138)
		$readY = StringTrimRight($readY,15)
		FileWrite($dFileOpen, $readY)
		if NOT $zUpdateFlag Then FileWriteLine($dFileOpen, $output1)
		if NOT $sUpdateFlag Then FileWriteLine($dFileOpen, $output2)
		FileWriteLine($dFileOpen, "return data;")
		FileWrite($dFileOpen, "}")
		FileClose($dFileOpen)
	EndIf

	FileClose($yuanFileOpen)
	MsgBox(0,"完毕","更新结束", 7)

EndFunc

Func ExitNoBackup()
	FileClose($yuanFileOpen)
	FileDelete($fBackup)
	exit
EndFunc


Func obtainTranslation()

	;下载代码
	Local $cacheBuster=@MON&@MDAY&@HOUR&@MIN&@SEC
	Local $url = "http://zh-tw.guildwars.wikia.com?maxAge="&$cacheBuster
	Local $HTMLSource = _InetGetSourceEx($url)

	;第一步:

	#cs
	&gt;</noscript></a> <b><a href="/wiki/%E6%88%B0%E6%89%BF%E4%BB%BB%E5%8B%99" title="戰承任務"   [1壹.[[>戰承任務<]]   /a>
	</b>：<a href="http://guildwars.wikia.com/wiki/Tahnnakai_Temple_(mission)" class="extiw" title="w:c:guildwars:Tahnnakai Temple (mission)">譚納凱神殿
	</a   [2贰.[[>、<]]]   a href="http://guildwars.wikia.com/wiki/Havok_Soulwail" class="extiw" title="w:c:guildwars   [5伍.[[:]]]   Havok Soulwail   [4肆.[[">]]]   霍克 靈嘆   [3叄.[[</a]]]   [2贰.[[>、<]]]
	a href="http://guildwars.wikia.com/wiki/Fort_Aspenwood"
	class="extiw" title="w:c:guildwars:Fort Aspenwood">楊木要塞</a>。[[[...后续编码]]]
	#ce

	;第一步开始:

	;1. 劈 >戰承任務< ，拿后一整段
	Local $rawSplit = StringSplit($HTMLSource, ">戰承任務<", 1)
	Local $yiZhengHouDuan = $rawSplit[2] ;$rawSplit[1]应含前一段
	;复制这一段，第二步有用
	Local $partTwoRaw = $rawSplit[2]

	;2. 劈 >、<，拿[后面][第一]段
	Local $temp = StringSplit($yiZhengHouDuan, ">、<", 1)
	Local $erHouDiYiDuan = $temp[2]
	;$erHouDiyiDuan |->|->| a href="http://guildwars.wikia.com/wiki/Havok_Soulwail" class="extiw" title="w:c:guildwars   [5伍.[[:]]]   Havok Soulwail   [4肆.[[">]]]   霍克 靈嘆   [3叄.[[</a]]]

	;3. 劈 </a, 拿前一段
	$temp =StringSplit($erHouDiYiDuan, "</a", 1)
	Local $sanQianDuan = $temp[1]
	;$sanQianDuan |->|->| a href="http://guildwars.wikia.com/wiki/Havok_Soulwail" class="extiw" title="w:c:guildwars   [5伍.[[:]]]   Havok Soulwail   [4肆.[[">]]]   霍克 靈嘆

	;4. 劈 ">, 拿后一段
	$temp = StringSplit($sanQianDuan, '">', 1)
	$yiwen1= $temp[2]
	;yiwen1 |->|->| 霍克 靈嘆
	;temp[1] |->|->| a href="http://guildwars.wikia.com/wiki/Havok_Soulwail" class="extiw" title="w:c:guildwars   [5伍.[[:]]]   Havok Soulwail

	;5. 劈 :, 拿最后一段
	$yuanwen1 = StringSplit($temp[1], ":", 1)
	$yuanwen1 = $yuanwen1[$yuanwen1[0]]
	;yuanwen1 |->|->| Havok Soulwail

	$output1 = 'data=data.replace(/(^|[^A-Za-z])(>'&$yuanwen1&"<)(?=[^A-Za-z]|$)/gi, '$1>"&$yiwen1&"<');"

	;第二步:

	#cs
	<b><a href="/wiki/%E5%85%89%E5%88%83%E9%80%9A%E7%B7%9D%E4%BB%A4" title="光刃通緝令"   [1壹.[[>光刃通緝令<]]]   /a></b>：<a
	href="http://guildwars.wikia.com/wiki/Wanted:_Lev_the_Condemned" class="extiw"
	title="w:c:guildwars:Wanted   [3叁.[[: ]]]   Lev the Condemned   [4肆.[[">]]]   Lev the Condemned    [5伍.[[(]]]   被詛咒的莉芙)</a>
	   [2贰.[[</p>]]]   <p>明天是：<a href="http://guildwars.wikia.com/wiki/Wanted:_Justiciar_Marron" class="extiw" title="w:c:guildwars:Wanted: Justiciar Marron">Justiciar Marron (判官 馬隆)</a>
	[[[...后续编码]]]
	#ce

	;第二步开始:

	;1. 劈 >光刃通緝令<，拿后一整段
	$rawSplit = StringSplit($partTwoRaw, ">光刃通緝令<", 1)
	$yiZhengHouDuan = $rawSplit[2]

	;2. 劈 </p>, 拿第一段
	$temp = StringSplit($yiZhengHouDuan, "</p>", 1)
	Local $erQianYiDuan = $temp[1]
	;$erQianYiDuan |->|->| /a></b>：<a href="http://guildwars.wikia.com/wiki/Wanted:_Lev_the_Condemned" class="extiw"
	;title="w:c:guildwars:Wanted   [3叁.[[: ]]]   Lev the Condemned   [4肆.[[">]]]   Lev the Condemned    [5伍.[[(]]]   被詛咒的莉芙)</a>

	;3. 劈 : 拿后一段， 擦</a>
	$temp =StringSplit($erQianYiDuan, ": ", 1)
	Local $sanHouDuan = $temp[2]
	;$sanHouDuan |->|->| Lev the Condemned   [4肆.[[">]]]   Lev the Condemned    [5伍.[[(]]]   被詛咒的莉芙)</a>

	;因是最后改动的，所以此处无注解 (发现</a>后方有显示不出的字符，所以改用StringSplit)
	$temp = StringSplit($sanHouDuan, "</a>", 1)
	$sanHouDuan = $temp[1]
	;$sanHouDuan |->|->| Lev the Condemned   [4肆.[[">]]]   Lev the Condemned    [5伍.[[(]]]   被詛咒的莉芙)

	;4. 劈 ">, 拿前一段，</a>已经去
	$temp = StringSplit($sanHouDuan, '">', 1)
	$yuanwen2 = $temp[1]
	;temp[2] |->|->| Lev the Condemned    [5伍.[[(]]]   被詛咒的莉芙)
	;$yuanwen2 |->|->| Lev the Condemned

	;5. 如有(, 劈 (, 拿后一段；否则，直接取以上temp的后一段
	if StringInStr($temp[2], "(") then
		$temp = StringSplit($temp[2], "(", 1)
		$yiwen2 = $temp[2]
		;$yiwen2 |->|->| 被詛咒的莉芙)
		$yiwen2 = StringReplace($yiwen2, ")", "")
		;$yiwen2 |->|->| 被詛咒的莉芙
	Else
		$yiwen2 = $temp[2]
	EndIf

	$output2 = 'data=data.replace(/(^|[^A-Za-z])(>'&$yuanwen2&"<)(?=[^A-Za-z]|$)/gi, '$1>"&$yiwen2&"<');"

EndFunc

;下载功能
Func _INetGetSourceEx($s_URL, $bString = True)
    Local $sString = InetRead($s_URL, 1)
    Local $nError = @error, $nExtended = @extended
    If $bString Then $sString = BinaryToString($sString,4)
    Return SetError($nError, $nExtended, $sString)
EndFunc   ;==>_INetGetSource