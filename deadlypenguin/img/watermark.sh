#!/bin/bash

# Takes all images in the specified directory and resizes them, and watermarks them.

WATERMARK="$HOME/practicalSurvivor-watermark.png"

#######################################################
############ DO NOT EDIT PAST THIS POINT ##############
#######################################################

WATERMARK_URL="http://www.deadlypenguin.com/img/practicalSurvivor-watermark.png"

echo ""

if [ $# != 2 ]
then
	echo "Usage: $0 pathToImages pathToSave"
	exit -1
fi

if [ ! -d $1 ]
then
	echo "Path: $1 is not a directory"
	exit -1
fi

if [ ! -d $2 ]
then
	echo "Path: $2 is not a directory"
fi

SRCDIR=$1
DSTDIR=$2

if [ ! -e $WATERMARK ]
then
	echo "$WATERMARK does not exist"
	echo "Downloading watermark"
	echo ""
	/usr/bin/wget -q $WATERMARK_URL -O $WATERMARK
	if [ $? == 0 ]
	then
		echo "Success"
		echo ""
	else
		echo "Could not download watermark"
		exit -1
	fi
fi

find $SRCDIR -maxdepth 1 -iname "*.jpg" -printf '%f\n'| while read FILE
do
	echo "Processing '$FILE'"

	FNAME=`echo $FILE | awk -F/ {'print $NF'}`

	if [ -e $DSTDIR/$FILE ]
	then
		echo "$DSTDIR/$FILE exists.  Skipping..."
	else
		SIZE=`identify $SRCDIR/$FILE | awk {'print $3'}`
		WIDTH=`echo $SIZE | awk -Fx {'print $1'}`
		HEIGHT=`echo $SIZE | awk -Fx {'print $2'}`
	
		if [ $WIDTH > $HEIGHT ]		#landscape
		then
				convert $SRCDIR/$FILE -resize '1100x825>' - | composite -gravity SouthWest $WATERMARK - $DSTDIR/$FNAME
		else						#portrait
				convert $SRCDIR/$FILE -resize '825x1100>' - | composite -gravity SouthWest $WATERMARK - $DSTDIR/$FNAME
		fi
	fi
done
