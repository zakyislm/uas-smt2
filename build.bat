@echo off
echo Compiling SwiftExpedition GUI Server...
g++ -std=c++17 -O2 server.cpp -o server.exe -lws2_32
if %errorlevel% neq 0 (
    echo Compilation failed!
    pause
    exit /b %errorlevel%
)
echo Done! Run server.exe to start.
pause
