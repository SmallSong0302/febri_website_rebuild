@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul
pushd "%~dp0" || exit /b 1

set "port=%~1"
if not defined port set "port=8000"

py -3 -c "import http.server, sys; sys.exit(sys.version_info < (3, 4))" >nul 2>&1
if not errorlevel 1 (
    set "python=py"
    set "versionFlag=-3"
    goto serve
)

set "versionFlag="
for %%P in (python python3) do (
    %%P -c "import http.server, sys; sys.exit(sys.version_info < (3, 4))" >nul 2>&1
    if not errorlevel 1 (
        set "python=%%P"
        goto serve
    )
)

set "python=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if exist "%python%" goto serve

echo 找不到 Python 3。請安裝 Python 3 並啟用 py 或將 python 加入 PATH，再重新執行。
goto failed

:serve
echo 預覽網址為 http://127.0.0.1:%port%/
echo 保持這個視窗開啟，按 Ctrl+C 即可停止。
"%python%" %versionFlag% -m http.server "%port%" --bind 127.0.0.1
if not errorlevel 1 (
    popd
    exit /b 0
)
echo 啟動失敗。若連接埠已被使用，可在終端機執行 preview.cmd 8001 改用其他連接埠。

:failed
popd
pause
exit /b 1
