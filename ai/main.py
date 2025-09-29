import subprocess

if __name__ == "__main__":
    # data_saver.py 실행
    subprocess.run(["python", "ai/data/data_saver.py"], check=True)
    # train_main.py 실행
    subprocess.run(["python", "ai/training/train_main.py"], check=True)
