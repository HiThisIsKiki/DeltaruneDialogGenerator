let canvas, ctx;

let fontSize = 24;
let canvasFont = "Determination"
let borderSize = 4;

let gifBlob = undefined;

let globalDefaultDelay = 80;

var textX = 150;
var portraitGap = 30;
var textPos = {
	top:{x:textX,y:17},
	middle:{x:textX,y:55},
	bottom:{x:textX,y:95}
} 
var textPadding = 30;

var loadedEmotes = {};
var loadedImgs = {};

var chars = {
	"alphys":["neutral","blush"],
	"asgore":["default","happy"],
	"birb":["default","smile"],
	"burgerpants":["default","fatface"],
	"cat":["default","smile"],
	"bratty":["default","silly"],
	"rudy":["default","happy"],
	"noelle":["default","happy"],
	"king":["default","tongue"],
	"catty":["default","happy"],
	"lancer":["blank","toothy"],
	"ralsie":["default","happyblush"],
	"rk":["default","happy"],
	"sans":["default","wink"],
	"snek":["default","default"],
	"susie":["default","grin"],
	"toriel":["default","blush"],
	"undyne":["default","happy"]
};

function init()
{
	canvas = document.getElementById('textcanvas')
	ctx = canvas.getContext('2d')
	//Handlers
	$("#go").click(function(){		
		var text = $('textarea').val();
		if (text != '')
		{
			var char = $('.chosen').attr('name');
			$('#generate').removeClass('hide');		
			scrollTo($("#generate"));
			prepareGif(char,text);					
		}
	});
	$('.choice').click(function(){		
		$('.stop').removeClass('stop');
		if ($(this).hasClass('chosen')){
			$("#text").addClass('hide')
			$("#generate").addClass('hide')
			$(this).removeClass('chosen')	
			$('.emote').remove();		
		}
		else
		{
			$('.emote').remove();
			$("#text").removeClass('hide')
			var name = $(this).attr('name');
			preloadImages(name);
			$('.chosen').removeClass('chosen')
			$(this).addClass('chosen')
			setTimeout(scrollTo,300,$('#text'))
			scrolled = true;
			//Special
			if ($(this).attr('name') == 'sans')
			{
				var rand = Math.floor(Math.random()*20);
				if (rand == 1)
				{
					$(this).addClass('stop')
				}
			}
		}
	});
	//Fill choices with loaders		
	$('.choice').html("<div class='loader'></div>")
	loadChoices();
}
function emoteInfo(char)
{
	var elem = $(".emoteInfo");
	var emotes = loadedEmotes[char];
	for (let i in emotes)
	{
		if (i != "default")
		{
			var em = $('<div class="emote"></div>');
			var url = "sprites/"+char+"/"+emotes[i]+".png";
			var text = $('<span class="emotetext">'+i+'</span>')
			
			var img = $('<img class="emoteimg" src='+url+'></img>');
			em.append(img)
			em.append(text);
			elem.append(em);
		}
	}
}
function scrollTo(elem)
{
	if (!elem.hasClass('hide'))
	{
		$("html, body").animate({scrollTop:elem.offset().top});	
	}	
}
function loadChoices()
{
	//Load all of the opening images, before the alternate ones.
	for (let i in chars)
	{
		let name = i;
		let expression = chars[i][0];
		let url = 'sprites/'+name+"/"+expression+'.png';
		loadImage(url,function(){
			$('.choice[name='+name+"]").html("<img src='"+url+"'>")
		});		
	}
	//Load the alternate images.
	for (let i in chars)
	{
		let name = i;
		let expression = chars[i][1];
		let url = 'sprites/'+name+"/"+expression+'.png';
		loadImage(url,function(){
			$('.choice[name='+name+"]").append("<img class='secondary' src='"+url+"'>")
		});		
	}
	//Special
	loadImage("sprites/sans/unused.png",function(){
		$('.choice[name=sans]').append("<img class='special' src='sprites/sans/unused.png'>")
	});
}
function loadEmotes(char, callback)
{
	var folder = "sprites/"+char;
	//Get the emote list.
	var emotes = folder+"/emotes.txt"
	$.ajax({
  		url: emotes,
  	}).done(function(text){
  		lines = text.split('\n');
  		arr = {};
  		for (i in lines)
  		{
  			var pair = lines[i].split(" ");
  			if (pair[1])
  			{
  				arr[pair[1].trim()] = pair[0].trim();	
  			}  			
  		}
  		callback(arr)
  	});
}
function preloadImages(char)
{
	loadEmotes(char, function(emotes){
		//Store the emotes for later use.
		loadedEmotes[char] = emotes;
		loadedImgs[char] = {};
		//Use the list to load images.		
		for (var i in emotes)
		{
			var url = "sprites/"+char+"/"+emotes[i]+".png"
			loadedImgs[char][i] = loadImage(url);
		}
		//Show the emote info
		emoteInfo(char);
	});
}
function loadImage(url, callback)
{
	var img = new Image();
	img.src = url;
	img.onload = callback;
	return img;
}
function saveGif()
{
	var char = $('.chosen').attr('name');
	saveBlobAsFile(imageBlob,char+".gif");
}
function saveBlobAsFile(blob, fileName) {

    var reader = new FileReader();

    reader.onloadend = function () {    
        var base64 = reader.result ;
        var link = document.createElement("a");

        link.setAttribute("href", base64);
        link.setAttribute("download", fileName);
        link.click();
    };

    reader.readAsDataURL(blob);
}