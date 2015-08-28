if [ "$1" = "reset" ]
then
	rm -rf v-*
	node updater 0
else
	node updater 0 &
fi
