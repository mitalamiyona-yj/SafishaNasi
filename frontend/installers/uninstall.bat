@echo off
title Safi Shanasi Uninstaller
color 0C

echo ========================================
echo    SAFI SHANASI - UNINSTALL
echo ========================================
echo.
echo Are you sure you want to uninstall Safi Shanasi?
echo.
echo This will remove:
echo   - Program files
echo   - Desktop shortcut
echo   - Start menu shortcut
echo.
echo Your data will NOT be affected.
echo.

set /p confirm="Type YES to confirm: "

if not "%confirm%"=="YES" (
    echo.
    echo ❌ Uninstall cancelled.
    pause
    exit
)

cls
echo.
echo [1/3] Removing program files...
rmdir /S /Q "C:\Program Files\Safi Shanasi" 2>nul
echo ✅ Program files removed!

echo.
echo [2/3] Removing desktop shortcut...
del "%USERPROFILE%\Desktop\Safi Shanasi.lnk" 2>nul
echo ✅ Desktop shortcut removed!

echo.
echo [3/3] Removing start menu shortcut...
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Safi Shanasi.lnk" 2>nul
echo ✅ Start menu shortcut removed!

echo.
echo ========================================
echo    UNINSTALL COMPLETE!
echo ========================================
echo.
echo ✅ Safi Shanasi has been uninstalled.
echo.
echo Thank you for using Safi Shanasi!
echo.

pause