#!/bin/bash
# Start the YouQingGong Mock API
cd /srv/youqinggong/backend

# Compile if needed
if [ ! -f out/com/youqinggong/api/Main.class ]; then
    echo "Compiling Java sources..."
    mkdir -p out
    javac -encoding UTF-8 -d out $(find src -name "*.java" 2>/dev/null) 2>&1
fi

# Stop any existing instance
pkill -f "com.youqinggong.api.Main" 2>/dev/null || true
sleep 1

# Start the API in background
nohup java -cp out com.youqinggong.api.Main > /var/log/youqinggong/api.log 2>&1 &
echo "API started, PID=$!, log at /var/log/youqinggong/api.log"
sleep 2
curl -s http://127.0.0.1:8080/api/landing | head -c 200 && echo ""
echo "API is running!"

