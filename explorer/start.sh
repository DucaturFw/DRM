./stop.sh

rm -rf log_*.txt

nohup yarn eth &> log_eth.txt & echo $! > last_eth.pid

