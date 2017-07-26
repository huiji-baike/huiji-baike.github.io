#include-once
#include <FileConstants.au3>
#include <MsgBoxConstants.au3>
#include <WinAPIFiles.au3>
#include <Array.au3>
#include <File.au3>
#include <WinAPI.au3>

;GetEffectsPtr vs GetEffects: no longer returns simply a struct, always an array

Local $fileNames=_FileListToArray(@ScriptDir, "*.au3")
for $i=1 to $fileNames[0]

	;==> 如需更新下行中的文件，擦掉以下与其对应的部分 <==

	if $fileNames[$i] = "gwa2.au3" or $fileNames[$i] = "gwApi.au3" or $fileNames[$i] = "Convert2Ptr.au3" or _
	   $fileNames[$i] = "底层.au3" or $fileNames[$i] = "接口.au3" or $fileNames[$i] = "换版.au3" then continueloop

	Local $yuanFileOpen = FileOpen("原文.au3", 128)
	Local $ciFileOpen = FileOpen("词典.au3", 128)

	Local $dFileOpen=FileOpen("结果.au3", 138)


	Local $readLineY = FileReadLine($yuanFileOpen)
	Local $readLineC = FileReadLine($ciFileOpen)

	while @error <> -1

		if $readLineY = "" then
			FileWriteLine($dFileOpen, "")
		Else
			FileWriteLine($dFileOpen, Convert($readLineY, $readLineC))
		EndIf

		$readLineY = FileReadLine($yuanFileOpen)
		$readLineC = FileReadLine($ciFileOpen)

	Wend

	FileClose($yuanFileOpen)
	FileClose($ciFileOpen)
	FileClose($dFileOpen)
Next

msgbox(0,"提示", "换版完毕")

Func Convert($yuan, $ci)

	Local $part1 = StringSplit($yuan, '"')
	Local $part2 = StringSplit($ci, '"')

	return 'data=data.replace(/(^|[^A-Za-z])('&$part1[2]&')(?=[^A-Za-z]|$)/gi, '&"'"&'$1'&$part2[2]&"');" ;&'"'

EndFunc   ;==>Convert