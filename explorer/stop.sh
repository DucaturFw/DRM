if [ -e last_eth.pid ]
then
    pstree -p $(cat last_eth.pid) | grep -o '([0-9]\+)' | grep -o '[0-9]\+' | xargs kill
    rm last_eth.pid
    echo "killed ETH"
fi

if [ -e last_eos.pid ]
then
    pstree -p $(cat last_eos.pid) | grep -o '([0-9]\+)' | grep -o '[0-9]\+' | xargs kill
    rm last_eos.pid
    echo "killed EOS"
fi

if [ -e last_neo.pid ]
then
    pstree -p $(cat last_neo.pid) | grep -o '([0-9]\+)' | grep -o '[0-9]\+' | xargs kill
    rm last_neo.pid
    echo "killed NEO"
fi

if [ -e last_api.pid ]
then
    pstree -p $(cat last_api.pid) | grep -o '([0-9]\+)' | grep -o '[0-9]\+' | xargs kill
    rm last_api.pid
    echo "killed api"
fi
