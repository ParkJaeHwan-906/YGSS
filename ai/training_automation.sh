#!/bin/bash

TRAIN_FILE="main.py"  # 실행할 파이썬 스크립트 파일명

echo "$(date): 파이썬 스크립트 실행 시작 - $TRAIN_FILE"

# 이전 실행 프로세스 강제 종료
if [ -f notebook.pid ]; then
    OLD_PID=$(cat notebook.pid)
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo "이전 프로세스($OLD_PID) 강제 종료"
        kill -9 $OLD_PID 2>/dev/null
    fi
    rm -f notebook.pid
fi

# 현재 프로세스 PID 저장
echo $$ > notebook.pid

# 스크립트 실행 (최대 3회 재시도)
for i in {1..3}; do
    echo "시도 $i/3"
    
    if python3 "$TRAIN_FILE"; then
        echo "$(date): 실행 성공!"
        rm -f notebook.pid
        exit 0
    else
        echo "$(date): 실행 실패, 10분 후 재시도..."
        [ $i -lt 3 ] && sleep 600
    fi
done

echo "$(date): 모든 재시도 실패"
rm -f notebook.pid
exit 1
