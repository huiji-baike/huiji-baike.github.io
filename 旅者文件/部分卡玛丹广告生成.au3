#include-once
#include <FileConstants.au3>
#include <MsgBoxConstants.au3>
#include <WinAPIFiles.au3>
#include <Array.au3>
#include <File.au3>
#include <WinAPI.au3>
#include "简体词典.au3"

Local $dFileOpen=FileOpen("部分卡玛丹广告.au3", 138)

For $j = 0 To UBound($Dictionary) - 1

	FileWriteLine($dFileOpen, "data=data.replace(/(^|[^A-Za-z])("&$Dictionary[$j][0]&")(?=[^A-Za-z]|$)/gi, '$1"&$Dictionary[$j][1]&"');")

Next

FileClose($dFileOpen)

msgbox(0,"提示", "广告步骤完毕")
