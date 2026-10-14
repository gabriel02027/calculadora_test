@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Cambiar proveedor Codex.ps1"
if errorlevel 1 pause
