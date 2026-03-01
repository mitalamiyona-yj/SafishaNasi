@echo off
title Safi Shanasi Installer
color 0A

echo ========================================
echo    SAFI SHANASI - INSTALLATION
echo ========================================
echo.
echo This will install Safi Shanasi on your PC
echo.
echo Project by: [Jina lako]
echo Version: 1.0
echo.

pause
cls

echo [1/5] Creating installation folder...
mkdir "C:\Program Files\Safi Shanasi" 2>nul
if exist "C:\Program Files\Safi Shanasi" (
    echo ✅ Folder created successfully!
) else (
    echo ❌ Failed to create folder!
    pause
    exit
)

echo.
echo [2/5] Copying project files...
xcopy /E /I /Y "%~dp0..\*" "C:\Program Files\Safi Shanasi\" >nul
echo ✅ Files copied successfully!

echo.
echo [3/5] Creating desktop shortcut...
set SCRIPT="%TEMP%\shortcut.vbs"
(
    echo Set oWS = WScript.CreateObject("WScript.Shell")
    echo sLinkFile = oWS.SpecialFolders("Desktop") + "\Safi Shanasi.lnk"
    echo Set oLink = oWS.CreateShortcut(sLinkFile)
    echo oLink.TargetPath = "C:\Program Files\Safi Shanasi\index.html"
    echo oLink.WorkingDirectory = "C:\Program Files\Safi Shanasi"
    echo oLink.Description = "Safi Shanasi - Cleaning Service"
    echo oLink.IconLocation = "C:\Program Files\Safi Shanasi\installer\icon.ico"
    echo oLink.Save
) > %SCRIPT%
cscript /nologo %SCRIPT%
del %SCRIPT%
echo ✅ Desktop shortcut created!

echo.
echo [4/5] Creating start menu shortcut...
set SCRIPT="%TEMP%\startmenu.vbs"
(
    echo Set oWS = WScript.CreateObject("WScript.Shell")
    echo sLinkFile = oWS.SpecialFolders("StartMenu") + "\Programs\Safi Shanasi.lnk"
    echo Set oLink = oWS.CreateShortcut(sLinkFile)
    echo oLink.TargetPath = "C:\Program Files\Safi Shanasi\index.html"
    echo oLink.WorkingDirectory = "C:\Program Files\Safi Shanasi"
    echo oLink.Description = "Safi Shanasi - Cleaning Service"
    echo oLink.IconLocation = "C:\Program Files\Safi Shanasi\installer\icon.ico"
    echo oLink.Save
) > %SCRIPT%
cscript /nologo %SCRIPT%
del %SCRIPT%
echo ✅ Start menu shortcut created!

echo.
echo [5/5] Creating uninstaller...
copy "C:\Program Files\Safi Shanasi\installer\uninstall.bat" "C:\Program Files\Safi Shanasi\" >nul
echo ✅ Uninstaller created!

echo.
echo ========================================
echo    INSTALLATION COMPLETE! 
echo ========================================
echo.
echo ✅ Safi Shanasi installed successfully!
echo.
echo 📍 Location: C:\Program Files\Safi Shanasi
echo 📍 Desktop shortcut: Safi Shanasi
echo 📍 Start menu: Safi Shanasi
echo.
echo To uninstall: Run uninstall.bat
echo.
echo Press any key to launch Safi Shanasi...
pause >nul

start "" "C:\Program Files\Safi Shanasi\index.html"

exit