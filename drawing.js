function prepareGif(char,text)
{
	//Show loading sign.
	$('#generate').html("<div class='bigloader'></div>")
	createGif(char,text,function(blob)
	{
		var html = $('#generateTemplate').html();
		$('#generate').html(html);
		displayImage(blob);
	});
}
function createGif(char,text,callback)
{
	var gif = new GIF({
	  workers: 2,
	  quality: 10,
	  repeat:0,
	  /*debug:true,*/
	  height:canvas.height,
	  width:canvas.width
	});
	setFont();	
	sentences = formatSentences(text, loadedEmotes[char]);

	emote = "default";
	for (var num = 0; num < sentences.length;num++)
	{			
		//If this is a starter sentence, change emote		
		if (sentences[num].starter)
		{
			emote = sentences[num].emote;			
		}
		//Convert the emote to the image
		var emoteimg = loadedImgs[char][emote];
		//Special case: empty line on the last line.
		if (num%3 == 2 && sentences[num].text == '')
		{			
			addFrame(gif,300)
		}
		for (var letter = 1;letter<=sentences[num].text.length;letter++)
		{			
			//Choose the image to use.
			clearCanvas(emoteimg);			
			if (num% 3 == 0)
			{
				//First sentence, draw it at the top.
				writeSentence(sentences[num].text,letter,"top",sentences[num].starter);
			}
			else if (num % 3 == 1)				
			{
				//Second sentence, draw the first one, then the second below it.
				writeSentence(sentences[num-1].text,sentences[num-1].text.length,"top",sentences[num-1].starter);
				writeSentence(sentences[num].text,letter,"middle",sentences[num].starter);
			}
			else
			{
				//Third sentence, draw the two previous ones then this one.
				writeSentence(sentences[num-2].text,sentences[num-2].text.length,"top",sentences[num-2].starter);
				writeSentence(sentences[num-1].text,sentences[num-1].text.length,"middle",sentences[num-1].starter);
				writeSentence(sentences[num].text,letter,"bottom",sentences[num].starter);							
			}		
			var delay = 80;	
			if (letter == sentences[num].text.length)				
			{
				if (num == sentences.length-1) //Last sentence, lots of delay.
				{
					delay = 3000;
				}
				else //A bit bigger delay on the end of a sentence.
				{					
					if (sentences[num+1] && sentences[num+1].starter)
					{
						delay = 300;
					}
					
				}
			}
			addFrame(gif,delay)
		}
	}

	gif.on('finished', callback);

	gif.render();
	
}
function formatSentences(str,emotes)
{
	var writeOrder = [];
	var width = canvas.width - borderSize*2 - textPos.top.x - textPadding;
	//Split into sentences.	
	var instances = str.split(/([\.\?!] |\n)/g);

	//Combine the punctuation with the sentence in the array.
	var sentences = [];
	//Go through the array and merge the punctuation with the sentences before it.
	for (var i = 0; i<instances.length;i++)
	{
		if (i % 2 == 0) //Sentence
		{
			sentences.push(instances[i])
		}
		else //Punctuation
		{
			if (instances[i] != "\n")
			{
				sentences[sentences.length-1] += instances[i];
			}
		}
	}
	let starting = true;
	for (var i=0;i<sentences.length;i++)
	{					
		var em = "default";
		//Check for emotes first.
		for (var emote in emotes)
		{
			var index = sentences[i].indexOf(emote);
			if (index != -1 && emote != "default")
			{
				em = emote;
				//If there is a space, remove it too.
				if (sentences[i][index+emote.length] == " "){
					add = " "
				}
				else
				{
					add = ""
				}
				sentences[i] = sentences[i].replace(emote+add,'');
				break;
			}
		}
		if (ctx.measureText(sentences[i]).width  > width)
		{
			//Sentence is too long, we'll have to split it.
			var result =  cutOff(sentences[i], width);
			sentences.splice(i+1,0,result[1])
			writeOrder.push({text:result[0],starter:starting,emote:em});
					
			starting = false;
		}
		else
		{						
			if (sentences[i] != '')			
			{
				writeOrder.push({text:sentences[i],starter:starting,emote:em}); //Sentence is short, we're all good!										
			}
			else
			{
				writeOrder.push({text:sentences[i],starter:false,emote:em});
			}
			starting = true;
		}		
	}
	return writeOrder;
}
function cutOff(str,width)
{
	//Jump upwards until we're above the threshold.	
	var c = 1;
	var words = str.split(' ');
	var cut = words.slice(0,c).join(' ')
	while (ctx.measureText(cut).width < width && c <= words.length)
	{
		c++;		
		cut = words.slice(0,c).join(' ')
	}
	if (c == 1)
	{
		//Uh oh. The very first word is too long. Let's try that again, this time splitting on letters.
		c = 0;
		cut =''
		while (ctx.measureText(cut).width < width && c <= str.length)
		{
			cut = str.substring(0,c);
			c++;
		}
		var ret = str.substring(0,c-1);
		var leftover = str.substring(c-1,str.length);
	}
	else
	{
		var ret = words.slice(0,c-1).join(' ') //Back down one.
		var leftover =  words.slice(c-1,words.length).join(' ') 
	}
	

	return [ret,leftover];
}
function writeSentence(str, index, position, starter)
{
	let x,y;
	if (position == "top"){
		x = textPos.top.x;
		y = textPos.top.y;		
		if (starter)
		{
			//Draw the asterisk first
			writeToCanvas("*",x-25,y);
		}		
	}
	else if (position == "middle"){
		x = textPos.middle.x;
		y = textPos.middle.y;
		if (starter)
		{
			//Draw the asterisk first
			writeToCanvas("*",x-25,y);
		}
	}
	else if (position == 'bottom')
	{
		x = textPos.bottom.x;
		y = textPos.bottom.y;
		if (starter)
		{
			//Draw the asterisk first
			writeToCanvas("*",x-25,y);
		}
	}
	else
	{
		console.log("ERROR! Unrecognized position was passed to writeSentence.")
		return;
	}
	writeToCanvas(str.slice(0,index),x,y);
}
function setFont()
{
	ctx.fillStyle = "white";
	ctx.font = fontSize+"px "+canvasFont;	
}
function writeToCanvas(text,x,y)
{			
	setFont();
	x+=borderSize;
	y+=borderSize;
	y+= fontSize//Make the origin the top left, instead of default bottom left.
	//Draw the text
	ctx.fillText(text,x,y)
}
function addFrame(gif, delay){
	gif.addFrame(ctx,{copy:true, delay:delay})
}
function clearCanvas(img)
{
	ctx.fillStyle = "black";	
	ctx.fillRect(0,0,canvas.width,canvas.height)	
	//Draw portrait
	var portraitX = textX - img.width - portraitGap;
	var portraitY = ((canvas.height - borderSize*2) /2) - (img.height/2);//Centered
	ctx.drawImage(img, portraitX, portraitY);
	//Draw border last
	ctx.strokeStyle = "white";
	ctx.lineWidth = borderSize*2;
	ctx.strokeRect(0,0,canvas.width,canvas.height);
}
function displayImage(blob)
{	
	var url = URL.createObjectURL(blob);
	var img = document.getElementById('resultimg');
	img.src = url;
	imageBlob = blob;
}