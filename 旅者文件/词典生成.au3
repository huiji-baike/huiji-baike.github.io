#include-once
#include <FileConstants.au3>
#include <MsgBoxConstants.au3>
#include <WinAPIFiles.au3>
#include <Array.au3>
#include <File.au3>
#include <WinAPI.au3>


Local $fileNames=_FileListToArray(@ScriptDir, "*.au3")
for $i=1 to $fileNames[0]

	Local $yuanFileOpen = FileOpen("旅者中文原文.html", 128)
	Local $dFileOpen=FileOpen("词典(需加尺寸及删末尾逗号).au3", 138)

	FileWriteLine($dFileOpen, "Global $Dictionary[][] = _") ;需自己填入矩阵大小
	FileWriteLine($dFileOpen, "[ _")

	Local $readY = FileRead($yuanFileOpen)

	;msgbox(0,"测试", $readY)
	Local $rawResults = StringSplit($readY,'">gw',$STR_ENTIRESPLIT)
	;msgbox(0,"测试", "stringsplit generated this number of strings: "&$rawResults[0])

	 For $i = 1 To $rawResults[0]
		if StringInStr($rawResults[$i], "w:") then
			Local $ProcessedOnce = StringRegExp($rawResults[$i],'(?i)w:(.+?)</span>"&gt;</span>(.+?)<span',$STR_REGEXPARRAYMATCH)
			#cs
			For $j = 0 To UBound($ProcessedOnce) - 1
				MsgBox(0, "测试", $ProcessedOnce[$j])
			Next
			#ce
			if UBound($ProcessedOnce) > 1 then FileWriteLine($dFileOpen, "["&'"'&$ProcessedOnce[0]&'"'&", "&'"'&$ProcessedOnce[1]&'"'&"], _")
		EndIf
	 Next

	FileWriteLine($dFileOpen, "]")

#cs
	while @error <> -1

		if $readY = "" then
			FileWriteLine($dFileOpen, "")
		Else
			FileWriteLine($dFileOpen, Convert($readY))
		EndIf

		$readY = FileReadLine($yuanFileOpen)


	Wend
#ce



	FileClose($yuanFileOpen)

	FileClose($dFileOpen)
Next

msgbox(0,"提示", "步骤1/2完毕")

Func Convert($yuan)

	Local $part1 = StringSplit($yuan, '"')
	Local $part2 = StringSplit($ci, '"')

	return 'data=data.replace(/(^|[^A-Za-z])('&$part1[2]&')(?=[^A-Za-z]|$)/gi, '&"'"&'$1'&$part2[2]&"');" ;&'"'

EndFunc   ;==>Convert
