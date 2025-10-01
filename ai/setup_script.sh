#!/bin/bash

# 간단한 Cron 설정 스크립트

SCRIPT_PATH="$(pwd)/run_notebook.sh"

echo "매일 새벽 4시 자동 실행 설정"

# 실행 권한 부여
chmod +x training_automation.sh

# 기존 crontab에 추가
(crontab -l 2>/dev/null; echo "0 4 * * * cd $(pwd) && ./run_notebook.sh") | crontab -

echo "✓ Cron 등록 완료"
echo "등록된 작업 확인:"
crontab -l | grep training_automation.sh

echo ""
echo "수동 테스트: ./training_automation.sh"
echo "Cron 제거: crontab -e (해당 줄 삭제)"