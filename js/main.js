console.log("init")

$(document).ready( function(){
    
    //CREATE STAGE VARIABLEEEEEEEEE
    var stage = {
        img: {
            size: {
                x: 0,
                y: 0,
            },
            ratio: 0,
        },
        zpos: {
            x: 0,
            y: 0,
        },
        size: {//IMAGE SIZEEEEEEEEE
            x: 0,
            y: 0,
        },
        zoom: 1,
        offset: {
            x:0,
            y:0,
        }
    }
    var canvas = {
        size: {
            x:0,
            y:0,
        },
        ratio: 0,
    }
    
    //CREATEEEEEEEEEEEEEEEEEEEEEEEE
    var c = $('#respondCanvas');
    var ct = c.get(0).getContext('2d');
    var container = $(c).parent();
    
    //IMAGEEEEEEEEEEEEEEEEEEEEEEEEE
    var background_img_url = (/^url\((['"]?)(.*)\1\)$/.exec($(".textimgs").css('background-image'))[2])
    var background_img = new Image();
    background_img.src = background_img_url;
    console.dir(background_img)
    background_img.onload = function (e) {
        stage.size.x = background_img.width;
        stage.size.y = background_img.height;
        stage.img.size.x = background_img.width;
        stage.img.size.y = background_img.height;
        console.log(background_img_url)
        console.log(stage.img.size)
        respondCanvas();
    }
    
    //ct.fillText("Loading",10,50);
    
    
    //RESIZEEEEEEEEEEEEEEEEEEEEEEEE
    $(window).resize( respondCanvas );
    function respondCanvas(){ 
        c.attr('width', $(container).width() ); //max width
        c.attr('height', $(container).height() ); //max height
        canvas.size.x = $(container).width()
        canvas.size.y = $(container).height()
        updateCanvas()
    }
    
    //UPDATE EVERYTIMEEEEEEEEEEEEEE
    /*function updateCanvas() {
        //console.log(-1*((stage.size.x-canvas.size.x)/2))
        //console.log(stage.size.x, canvas.size.x, ((100/stage.size.x)*canvas.size.x)/100)
        
        var faktor = (-1*((stage.size.x-canvas.size.x)/2))
        //console.log( -1 * (faktor*(-1*stage.zoom)))
        //console.log(stage.size.x*stage.zoom)+((stage.size.x*stage.zoom)-stage.size.x)
        //stage.zoom = Math.max(stage.zoom, 0.5)
        stage.zoom = ( ( 100 / stage.size.x ) * canvas.size.x ) / 100;
        var zmoffset = Math.max( canvas.size.y - (stage.size.y*stage.zoom), 0 )
        
        console.log( canvas.size.y - (stage.size.y*stage.zoom) < 0 ? false : true )
        //console.log(zmoffset)
        if(canvas.size.y - (stage.size.y*stage.zoom) < 0) {
            var width = (stage.size.x *stage.zoom)//((stage.size.x*stage.zoom)-stage.size.x)+stage.size.x
            var height = (stage.size.y*stage.zoom)+ zmoffset
            var offsety = (-1*(((stage.size.y*stage.zoom)-canvas.size.y)/2)) - (zmoffset /2)
        }
        
        ct.drawImage(background_img, 0, offsety,width, height)//, background_img.width, background_img.height);
        
        //console.log(stage, canvas)
    }*/
    function updateCanvas() {        
        stage.img.ratio = (stage.img.size.y / stage.img.size.x)       // original img ratio
        canvas.ratio = (canvas.size.y / canvas.size.x)     // container ratio
        stage.size.y = 0
        stage.size.x = 0
        if (canvas.ratio > stage.img.ratio) 
        {
            stage.size.y = canvas.size.y
            stage.size.x = (canvas.size.y / stage.img.ratio)
        } 
        else 
        {
            stage.size.x = canvas.size.x
            stage.size.y = (canvas.size.x * stage.img.ratio)
        }
        
        stage.zoom = ( ( 100 / stage.img.size.x  ) * stage.size.x ) / 100;
        stage.offset.y = getCenteroffsety()
        stage.offset.x = getCenteroffsetx()
        ct.drawImage(background_img, stage.offset.x, stage.offset.y, stage.size.x, stage.size.y)//, background_img.width, background_img.height);
        console.log(stage.zoom)
        //console.log(stage, canvas)
    }
    
    function getCenteroffsety() {
        var zmoffset = Math.max( canvas.size.y - (stage.size.y), 0 )
        var offsety = (-1*(((stage.size.y)-canvas.size.y)/2)) - (zmoffset /2)
        //console.log(offsety)
        return (offsety)
    }
    function getCenteroffsetx() {
        //console.log(canvas.size.x - stage.size.x, stage.zoom)
        var zmoffset =  (canvas.size.x - (stage.size.x ))
        //var offsetx = ( -1 * ( ( ( stage.size.x ) - canvas.size.x ) / 2) ) - ( zmoffset / 2 )
        //console.log(zmoffset)
        return (zmoffset / 2)
    }

    //INITIALIZEEEEEEEEEEEEEEEEEEEE
    
    
}); 