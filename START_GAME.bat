@echo off
cd /d "%~dp0"
start "Prism Rush Server" /min python -m http.server 4173
ping 127.0.0.1 -n 3 > nul
start http://localhost:4173
