console.log("init")

$(document).ready( function(){
    
    //CREATE STAGE VARIABLEEEEEEEEE
    var settings = {
        flexHeight: true,
    }
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
        offset: {
            x: 0,
            y:0
        }
    }
    
    var objects = [
            {
                type: "imgrect",
                visible: true,
                img_url: "../images/button_interaktiv.png",
                size: {
                    x: 100,
                    y: 100,
                },
                pos: {
                    x: 600,
                    y: 150,
                },
                onClick:{
                    
                }
            }
        ]
    
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
        console.log("loaded")
        respondCanvas();
    }
    
    //var circle_img = new Image();
    //circle_img.src = 
    
    //ct.fillText("Loading",10,50);
    
    
    //RESIZEEEEEEEEEEEEEEEEEEEEEEEE
    $(window).resize( respondCanvas );
    function respondCanvas(){
        canvas.offset.x = c.offset().left;
        canvas.offset.y = c.offset().top;
        //console.log("respond")
        
        canvas.size.x = $(container).width()
        
        c.attr('width', $(container).width());
        if(settings.flexHeight) {
            var nheight = (stage.img.size.y/stage.img.size.x)* $(container).width()
            c.attr('height', nheight)
            canvas.size.y = nheight
        } else {
            c.attr('height', $(container).height());
            canvas.size.y = $(container).height()
        }
        
        stage.img.ratio = (stage.img.size.y / stage.img.size.x)       // original img ratio
        canvas.ratio = (canvas.size.y / canvas.size.x)     // container ratio
        stage.size.y = 0
        stage.size.x = 0
        
        // GET RATIO RESOLUTIONEEE
        if (canvas.ratio > stage.img.ratio) {
            stage.size.y = canvas.size.y
            stage.size.x = (canvas.size.y / stage.img.ratio)
        } else {
            stage.size.x = canvas.size.x
            stage.size.y = (canvas.size.x * stage.img.ratio)
        }
        
        stage.zoom = ( ( 100 / stage.img.size.x  ) * stage.size.x ) / 100;
        stage.offset.y = getCenteroffsety()
        stage.offset.x = getCenteroffsetx()
        
        
        
        
        
        updateCanvas()
    }
    
    //UPDATE EVERYTIMEEEEEEEEEEEEEE
    function updateCanvas() {
        ct.drawImage(background_img, stage.offset.x, stage.offset.y, stage.size.x, stage.size.y)//, background_img.width, background_img.height);

        for (var i = 0; i < objects.length; i++) {
            var el = objects[i];
            if(el.hasOwnProperty("visible"))
                if(el.visible == false)
                    continue
           drawObject(el)
            
        }
    }
    
    function getRelPos(el) {
        return {
            x: stage.offset.x + (el.pos.x*stage.zoom),
            y: stage.offset.y + (el.pos.y*stage.zoom),
            w: el.size.x*stage.zoom,
            h: el.size.y*stage.zoom
        }
    }
    
    function drawObject(el, type) {
        var elmp = getRelPos(el)
         switch(objects.type) {
                case "rect":
                    ct.fillRect(elmp.x,elmp.y,elmp.w,elmp.h)
                
                default:
                case "imgrect":
                    if(!el.img) {
                        el.img = new Image()
                        el.img.src = el.img_url;
                        el.img.onload = function() {
                            //console.log("ok")
                            ct.drawImage(el.img,elmp.x,elmp.y,elmp.w,elmp.h);
                        }
                    } else {
                        ct.drawImage(el.img,elmp.x,elmp.y,elmp.w,elmp.h);
                    }
                
        }
        
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
    
    
    
    //CLICK
    
    c.on('click', function(event) {
        //console.log(event.pageX - canvas.offset.x, event.pageY - canvas.offset.y)
        var clickedObjects = [];
        for (var i = 0; i < objects.length; i++) {
            var hit = checkClick(objects[i],event.pageX - canvas.offset.x, event.pageY - canvas.offset.y)
            //console.log(hit)
            if(hit)
                clickedObjects.push(objects[i])
        }
        
        if(clickedObjects.length>0) {
            clickAction(clickedObjects[clickedObjects.length-1])
        }
        
    })
    
    function checkClick(obj,x,y) {
        var elmp = getRelPos(obj);
        
         if (y > elmp.y && y < elmp.y + elmp.h 
            && x > elmp.x && x < elmp.x + elmp.w) {
                return true
            } else {
                return false
            }
    }
    
    function clickAction(obj) {
        console.log(obj)
    }
    
}); 