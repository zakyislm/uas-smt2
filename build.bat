@echo off
echo Compiling SwiftExpedition GUI Server...
g++ -std=c++17 -O2 -Iexternal/lib/libsodium/include -Lexternal/lib/libsodium/lib server.cpp -o server.exe -lws2_32 -lsodium
if %errorlevel% neq 0 (
    echo Compilation failed!
    pause
    exit /b %errorlevel%
)
echo Done! Run server.exe to start.
pause
