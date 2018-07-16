if [ -e last_eth.pid ]
then
    pstree -p $(cat last_eth.pid) | grep -o '([0-9]\+)' | grep -o '[0-9]\+' | xargs kill
    rm last_eth.pid
    echo "killed ETH"
fi
