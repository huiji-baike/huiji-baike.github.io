#include-once
#include <FileConstants.au3>
#include <MsgBoxConstants.au3>
#include <WinAPIFiles.au3>
#include <Array.au3>
#include <File.au3>
#include <WinAPI.au3>
#include "简体词典.au3"

#cs

==> 需自行加入以下改动:

<a href="/wiki 换为 <a href="http://wiki.guildwars.com/wiki

加以下内容:
<head>
<meta charset="UTF-8">
<meta name="robots" content="noindex" />
</head>

#ce

Local $yuanFileOpen = FileOpen("旅者表格原文.html", 128)
Local $dFileOpen=FileOpen("旅者.html", 138)

Local $readY = FileRead($yuanFileOpen)

$readY=StringReplace($readY, "Prophecies", "一章")
$readY=StringReplace($readY, "Factions", "二章")
$readY=StringReplace($readY, "Nightfall", "三章")
$readY=StringReplace($readY, "Eye of the North", "四章")

For $i = 0 to 916
	$readY = StringReplace($readY, ">"&$Dictionary[$i][0]&"<", ">"&$Dictionary[$i][1]&"<")
	$readY = StringReplace($readY, ">"&$Dictionary[$i][0]&"s<", ">"&$Dictionary[$i][1]&"<")
Next

$readY=StringReplace($readY, "Skull Juju", "头骨土符")
$readY=StringReplace($readY, "Skull Juju", "颅骨土符")
$readY=StringReplace($readY, "Bone Charms", "骨制护符")

$readY=StringReplace($readY,"Note:","注:")
$readY=StringReplace($readY,"Nicholas' location and requested item changes weekly on Monday at 15:00 UTC.","旅者位置及所需材料 于以下各晚11点 生效")
$readY=StringReplace($readY,'If your browser does not update the item and location, you can <a rel="nofollow" class="external text" href="http://wiki.guildwars.com/index.php?title=Nicholas_the_Traveler/Cycle&amp;action=purge">refresh the list</a>.',"")

$readY=StringReplace($readY, "January", "一月")
$readY=StringReplace($readY, "February", "二月")
$readY=StringReplace($readY, "March", "三月")
$readY=StringReplace($readY, "April", "四月")
$readY=StringReplace($readY, "May", "五月")
$readY=StringReplace($readY, "June", "六月")
$readY=StringReplace($readY, "July", "七月")
$readY=StringReplace($readY, "August", "八月")
$readY=StringReplace($readY, "September", "九月")
$readY=StringReplace($readY, "October", "十月")
$readY=StringReplace($readY, "November", "十一月")
$readY=StringReplace($readY, "December", "十二月")

$readY=StringReplace($readY, "Week", "日期")
$readY=StringReplace($readY, "Item", "材料")
$readY=StringReplace($readY, "Location", "地点")
$readY=StringReplace($readY, "Region", "地区")
$readY=StringReplace($readY, "Campaign", "章节")

;Angled brackets below are necessary b/c the source is an html file

$readY=StringReplace($readY, "<th> Map", "<th> 地图")
$readY=StringReplace($readY, ">Map<", ">路线<")

$readY=StringReplace($readY, ">Kryta<",">科瑞塔<")
$readY=StringReplace($readY, ">Shing Jea Island<",">星岬岛<")
$readY=StringReplace($readY, ">Northern Shiverpeaks<",">北席娃山脉<")
$readY=StringReplace($readY, ">Southern Shiverpeaks<",">南席娃山脉<")
$readY=StringReplace($readY, ">Far Shiverpeaks<",">极北席娃山脉(四章)<")
$readY=StringReplace($readY, ">Ring of Fire Islands<",">火环岛<")
$readY=StringReplace($readY, ">maguuma jungle<",">梅古玛丛林<")
$readY=StringReplace($readY, ">kourna<",">高楠<")
$readY=StringReplace($readY, ">vabbi<",">瓦贝<")
$readY=StringReplace($readY, ">the jade sea<",">翡翠海<")
$readY=StringReplace($readY, ">crystal desert<",">水晶沙漠<")
$readY=StringReplace($readY, ">tarnished coast<",">灰暗海岸<")
$readY=StringReplace($readY, ">the desolation<",">硫磺地带<")
$readY=StringReplace($readY, ">charr homelands<",">夏尔故乡<")
$readY=StringReplace($readY, ">istan<",">艾斯坦<")

FileWrite($dFileOpen, $readY)

FileClose($yuanFileOpen)

FileClose($dFileOpen)

msgbox(0,"提示", "表格步骤完毕")