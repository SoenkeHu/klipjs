/*global $*/
console.log("init")

$(document).ready(function() {

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
        size: { //IMAGE SIZEEEEEEEEE
            x: 0,
            y: 0,
        },
        zoom: 1,
        offset: {
            x: 0,
            y: 0,
        }
    }
    var canvas = {
        size: {
            x: 0,
            y: 0,
        },
        ratio: 0,
        offset: {
            x: 0,
            y: 0
        },
        dnd: {
            stage: 0,
            fposx:0,
            fposy:0,
            fobj: null,
        }
    }

    var objects = [
    {
      type:"connector",
      from:"0",
      to:"1",
    },
    {
        type: "imgrect",
        id: "0",
        visible: true,
        img_url: "./images/button_interaktiv.png",
        size: {
            x: 100,
            y: 100,
        },
        pos: {
            x: 600,
            y: 150,
        },
        onClick: {
            type: "show",
            id: "1"
        }
    }, {
        type: "rect",
        color: [255, 255, 255, 1],
        id: "1",
        draggable: true,
        animation: [
            {
                type: "fadein",
                time: 200
            },
            {
                type: "fadeout",
                time: 200
            }
        ],
        visible: false,
        size: {
            x: 500,
            y: 150,
        },
        pos: {
            x: 1020,
            y: 450,
        },
        /*onClick: {
            type: "hide",
            id: "1"
        }*/
    }]

    //CREATEEEEEEEEEEEEEEEEEEEEEEEE
    var c = $('#respondCanvas');
    var ct = c.get(0).getContext('2d');
    var container = $(c).parent();
    
    var constants = {
        animations: {
            fadein: "fadein",
            flyin: "flyin",
            fadeout: "fadeout"
        },
        events: {
            show: "show",
            hide: "hide"
        }
    }
    var eventAnimRel = {}
    
    eventAnimRel[constants.events.show] = [constants.animations.fadein,constants.animations.flyin]
    eventAnimRel[constants.events.hide] = [constants.animations.fadeout]
    
    console.log(eventAnimRel)

    //IMAGEEEEEEEEEEEEEEEEEEEEEEEEE
    var background_img_url = (/^url\((['"]?)(.*)\1\)$/.exec($(".textimgs").css('background-image'))[2])
    var background_img = new Image();
    background_img.src = background_img_url;
    //console.dir(background_img)
    background_img.onload = function(e) {
        stage.size.x = background_img.width;
        stage.size.y = background_img.height;
        stage.img.size.x = background_img.width;
        stage.img.size.y = background_img.height;
        console.log("loaded")
        respondCanvas();
    }

    //RESIZEEEEEEEEEEEEEEEEEEEEEEEE
    $(window).resize(respondCanvas);

    function respondCanvas() {
        canvas.offset.x = c.offset().left;
        canvas.offset.y = c.offset().top;

        canvas.size.x = $(container).width()

        c.attr('width', $(container).width());
        if (settings.flexHeight) {
            var nheight = (stage.img.size.y / stage.img.size.x) * $(container).width()
            c.attr('height', nheight)
            canvas.size.y = nheight
        }
        else {
            c.attr('height', $(container).height());
            canvas.size.y = $(container).height()
        }

        stage.img.ratio = (stage.img.size.y / stage.img.size.x)
        canvas.ratio = (canvas.size.y / canvas.size.x)
        stage.size.y = 0
        stage.size.x = 0

        // GET RATIO RESOLUTIONEEE
        if (canvas.ratio > stage.img.ratio) {
            stage.size.y = canvas.size.y
            stage.size.x = (canvas.size.y / stage.img.ratio)
        }
        else {
            stage.size.x = canvas.size.x
            stage.size.y = (canvas.size.x * stage.img.ratio)
        }

        stage.zoom = ((100 / stage.img.size.x) * stage.size.x) / 100;
        stage.offset.y = getCenteroffsety()
        stage.offset.x = getCenteroffsetx()

        updateCanvas()
    }

    //UPDATE EVERYTIMEEEEEEEEEEEEEE
    function updateCanvas() {
        requestAnimationFrame(updateCanvas);
        ct.drawImage(background_img, stage.offset.x, stage.offset.y, stage.size.x, stage.size.y)

        for (var i = 0; i < objects.length; i++) {
            var el = objects[i];
            if (el.hasOwnProperty("visible"))
                if (el.visible == false)
                    continue
            
            drawObject(el)

        }
    }
    
    function getRelPoint(x,y) {
        return {
            x: stage.offset.x + (x * stage.zoom),
            y: stage.offset.y + (y * stage.zoom),
        }
    }
    function resRelPoint(x,y) {
        return {
            x:((x-stage.offset.x)/stage.zoom),
            y:(y/stage.zoom)-stage.offset.y
        }
    }

    function getRelPos(el) {
        return {
            x: stage.offset.x + (el.pos.x * stage.zoom),
            y: stage.offset.y + (el.pos.y * stage.zoom),
            w: el.size.x * stage.zoom,
            h: el.size.y * stage.zoom
        }
    }

    function drawObject(el) {
        var props = Object.assign({}, el);
        

        if (el.__anim && el.__anim.active.length>0) {
            drawAnimation(el)
            //console.log(el.__anim.active)
            //console.log(el.__anim.props.color, el.visible)
        
            props = Object.assign(props, el.__anim.props)
                //return
        }
        
        if (el.hasOwnProperty("visible"))
            if (el.visible == false)
                return
        //TODO: schöner machen
        
        //console.dir(props)
        
        switch (el.type) {
            case "rect":
                //TODO: global alpha
                var elmp = getRelPos(el)
                if (props.color) {
                    ct.fillStyle = getColorRGBA(props.color);
                }
                ct.fillRect(elmp.x, elmp.y, elmp.w, elmp.h)
                break
            case "imgrect":
                /*
                    context.globalAlpha = 0.5;
                    context.drawImage(image, x, y);
                    context.globalAlpha = 1.0;
                */
                var elmp = getRelPos(el)
                if (!el.img) {
                    el.img = new Image()
                    el.img.src = el.img_url;
                    el.img.onload = function() {
                        ct.drawImage(el.img, elmp.x, elmp.y, elmp.w, elmp.h);
                    }
                }
                else {
                    ct.drawImage(el.img, elmp.x, elmp.y, elmp.w, elmp.h);
                }
                break;
            case "connector":
                var points = [],
                    obj1 = getObjfromID(el.from),
                    obj2 = getObjfromID(el.to);
                var pos1 = {
                        x: obj1.pos.x+(obj1.size.x/2),
                        y: obj1.pos.y+(obj1.size.y/2)
                    },
                    pos2 = {
                        x: obj2.pos.x+(obj2.size.x/2),
                        y: obj2.pos.y+(obj2.size.y/2)
                    };
                var pos1rel = getRelPoint(pos1.x,pos1.y),
                    pos2rel = getRelPoint(pos2.x,pos2.y);
                points.push([pos1rel.x,pos1rel.y]);
                points.push([pos2rel.x,pos2rel.y]);
                var angle = (getAngleBetweenPoints(points[0][0],points[0][1],points[1][0],points[1][1]) )
                ct.beginPath();
                ct.moveTo(points[0][0],points[0][1]);
                ct.lineTo(points[0][0]+(2000*Math.cos(angle)), points[0][1]+(2000*Math.sin(angle)))
                ct.strokeStyle="#FFFFFF";
                ct.stroke();
            default:


        }

    }
    
    function getAngleBetweenPoints(x1, y1, x2, y2) {
        var deltaY = y2 - y1
        var deltaX = x2 - x1
        return angle_trunc(Math.atan2(deltaY, deltaX))
    }
    
    function angle_trunc(a) {
        while (a < 0.0) {
            a += Math.PI * 2
        }
            
        return a
    }
    
    function getObjfromID(id) {
        return objects.filter(function(e) {
            return e.id == id;
        })[0]
    }

    function drawAnimation(el) {
        for (var i = 0; i < el.__anim.active.length; i++) {
            var animation = el.animation.filter(function(e) {
                return e.type == el.__anim.active[i].type
            })[0]
            
            //console.log(el.__anim)

            switch (animation.type) {
                case constants.animations.fadein:
                    el.__anim.props.color = [];
                    var color = el.__anim.props.color
                    color = Object.assign(color,el.color);
                    var process = ((Date.now() - el.__anim.active[i].time) / animation.time)
                    //console.log(el.__anim.active[i].time)
                    if (process >= 1) {
                        color[3] = 1
                        el.__anim.active = el.__anim.active.filter(function(e) {
                            return e.type != animation.type
                        });
                        return
                    }
                    color[3] = process
                    break;
                    
                case constants.animations.fadeout:
                    el.__anim.props.color = [];
                    var color = el.__anim.props.color
                    color = Object.assign(color,el.color);
                    
                    var process = ((Date.now() - el.__anim.active[i].time) / animation.time)
                    //console.log(el.__anim.active[i].time)
                    if (process >= 1) {
                        console.log("fin")
                        color[3] = 0
                        el.__anim.active = el.__anim.active.filter(function(e) {
                            return e.type != animation.type
                        });
                        el.visible = false;
                        return
                    }
                    color[3] = 1-process
                    break;
    
                default:
            }
        }
    }

    function getColorRGBA(el_color, opacity) {
        return "rgba(" + el_color[0] + "," + el_color[1] + "," + el_color[2] + "," + (opacity || el_color[3]) + ")";
    }

    function getCenteroffsety() {
        var zmoffset = Math.max(canvas.size.y - (stage.size.y), 0)
        var offsety = (-1 * (((stage.size.y) - canvas.size.y) / 2)) - (zmoffset / 2)
        return (offsety)
    }

    function getCenteroffsetx() {
        var zmoffset = (canvas.size.x - (stage.size.x))
        return (zmoffset / 2)
    }

    //INITIALIZEEEEEEEEEEEEEEEEEEEE

    //CLICK
    c.on('click', function(event) {
        console.log(canvas.dnd.stage)
        //console.log(event.pageX - canvas.offset.x, event.pageY - canvas.offset.y)
        var clickedObjects = getClickedObj(event)

        if (clickedObjects.length > 0) {
            clickAction(clickedObjects[clickedObjects.length - 1])
        }
    })
    c.on('mousedown', function(event) {
        
        var clickedObjects = getClickedObj(event)

        if (clickedObjects.length > 0) {
            var obj = (clickedObjects[clickedObjects.length - 1])
            if(obj.draggable) {
                canvas.dnd.stage = 1;
            } else {
                return
            }
        } else {
            return
        }
        console.log(obj.pos.x,obj.pos.y)

        var relPos = getRelPos(obj);
        canvas.dnd.fposx = (event.pageX - canvas.offset.x) - relPos.x;
        canvas.dnd.fposy = (event.pageY - canvas.offset.y) - relPos.y;
        canvas.dnd.fobj = obj;
    })
    c.on('mousemove', function(event) {
        if(canvas.dnd.stage == 1) {
            canvas.dnd.stage = 2;
        }
        if(canvas.dnd.stage == 2) {
            var npos = resRelPoint((event.pageX - canvas.offset.x)-canvas.dnd.fposx,(event.pageY - canvas.offset.y)-canvas.dnd.fposy)
            canvas.dnd.fobj.pos.x = npos.x
            canvas.dnd.fobj.pos.y = npos.y
        }
        //console.log(canvas.dnd.fposx)
        //console.log(resRelPoint(canvas.dnd.fposx + (event.pageX - canvas.offset.x)).x)
        
        //canvas.dnd.fobj.pos.x = resRelPoint(canvas.dnd.fposx,canvas.dnd.fposy) + (event.pageX - canvas.offset.x)


    })
    c.on('mouseup', function(event) {
        canvas.dnd.stage = 0;
        

    })
    
    function getClickedObj(event) {
        var clickedObjects = [];
        for (var i = 0; i < objects.length; i++) {
            if (objects[i].hasOwnProperty("visible"))
                if (objects[i].visible == false)
                    continue
            var hit = checkClick(objects[i], event.pageX - canvas.offset.x, event.pageY - canvas.offset.y)
                //console.log(hit)
            if (hit)
                clickedObjects.push(objects[i])
        }
        return clickedObjects
    }

    function checkClick(obj, x, y) {
        if(!obj.pos){
            return
        }
        var elmp = getRelPos(obj);

        if (y > elmp.y && y < elmp.y + elmp.h && x > elmp.x && x < elmp.x + elmp.w) {
            return true
        }
        else {
            return false
        }
    }

    function clickAction(obj) {
        if (!obj.onClick)
            return
        /*if (obj.__anim)
            return*/
            console.log("click")
        switch (obj.onClick.type) {
            case 'show':
                var shObj = objects.filter(function(e) {
                    return e.id == obj.onClick.id
                })
                if (shObj.length > 0&& !shObj[0].visible) {
                    shObj[0].visible = true;
                    createAnimation(shObj[0], obj.onClick.type)
                    console.log(shObj[0])
                }
                //updateCanvas()
                break;
            case 'hide':
                var shObj = objects.filter(function(e) {
                    return e.id == obj.onClick.id
                })
                if (shObj.length > 0 && shObj[0].visible) {
                    //shObj[0].visible = false;
                    createAnimation(shObj[0], obj.onClick.type)
                }
                //updateCanvas()
                break;

            default:
                // code
        }
    }

    function createAnimation(el, event) {
        console.log(event)
        if(el.animation) {
            if(!el.__anim) {
                el.__anim = {
                    active: [],
                    props: {
                    }
                }
            }

        }
        var anims = el.animation.filter(function(e) {
            return eventAnimRel[event].filter(function(ee) {
                return e.type == ee
            })[0]
        })
        //TODO: clean and error handling
        console.log(anims)
        for (var i = 0; i < anims.length; i++) {
            var animation = anims[i];
            console.log(animation.type)
            switch (animation.type) {
                case constants.animations.fadein:
                    addToActiveAnimation(el,{type:animation.type, time: Date.now()})
                    break;
                case constants.animations.fadeout:
                    addToActiveAnimation(el,{type:animation.type, time: Date.now()})
                    break;
                default:
            }

        }
        
        console.log(el.__anim)

    }
    
    function addToActiveAnimation(el, obj) {
        //TODO: dont push if allready
        el.__anim.active.push(obj)
    }

});