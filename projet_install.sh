#!/bin/sh
echo ""
echo "ServU Installer started."

if hash git 1>/dev/null 2>&1
then
    echo ""
    echo "Git Installed."
else
    echo ""
    echo "Git is not installed. Please install Git."
    exit 1
fi

if hash npm 1>/dev/null 2>&1
then
	echo ""
	echo "Npm Installed"
else
	echo ""
	echo "Npm not Installed"
	exit 1
fi

if hash pm2 1>/dev/null 2>&1
then
        echo ""
        echo "pm2 Installed"
else
        echo ""
        echo "pm2 not Installed"
        exit 1
fi


root=$(pwd)
tmpdir=$root/Projet_tmp



if [ $(pm2 jlist) == '[]' ]
then
	echo "1st install"
else
	pm2 stop servu
fi




mkdir $tmpdir

cd $tmpdir

echo ""
echo "Downloading ServU, please wait."
git clone -b dev --recursive --depth 1 https://github.com/Taknok/Projet_S8.git

if [ ! -d $root/Server ]
then
	cp -R $tmpdir/Projet_S8/Server $root
else
	rm -rf $root/Server
	cp -R $tmpdir/Projet_S8/Server $root
fi
rm -rf $tmpdir

echo "" 
echo "ServU downloaded." 
echo ""

echo ""
echo "Building ServU"

cd $root/Server
npm install

echo ""
echo "Building done. Moving ServU"

cd $root

pm2 start Server/app.js --name servu >/dev/null 2>&1

if [ $(pm2 jlist) == '[]' ]
then
        pm2 startup
fi


sleep 2

pm2 status

exit 0
