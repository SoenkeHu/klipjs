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
        }
    }

    var objects = [{
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
            x: 720,
            y: 150,
        },
        onClick: {
            type: "hide",
            id: "1"
        }
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
        if (el.__anim) {
            drawAnimation(el)
            //console.log(el.__anim.active)
            if (el.__anim)
                props = Object.assign(props, el.__anim.props)
                //return
        }
        //console.dir(props)
        var elmp = getRelPos(el)
        switch (el.type) {
            case "rect":
                if (props.color) {
                    ct.fillStyle = getColorRGBA(props.color);
                }
                ct.fillRect(elmp.x, elmp.y, elmp.w, elmp.h)
                break
            default:
            case "imgrect":
                if (!el.img) {
                    el.img = new Image()
                    el.img.src = el.img_url;
                    el.img.onload = function() {
                        //console.log("ok")
                        ct.drawImage(el.img, elmp.x, elmp.y, elmp.w, elmp.h);
                    }
                }
                else {
                    ct.drawImage(el.img, elmp.x, elmp.y, elmp.w, elmp.h);
                }

        }

    }

    function drawAnimation(el) {
        for (var i = 0; i < el.__anim.active.length; i++) {
            var animation = el.animation.filter(function(e) {
                return e.type == el.__anim.active[i].type
            })[0]
            
            //console.log(el.__anim)

            switch (animation.type) {
                case constants.animations.fadein:
                    var color = el.__anim.props.color;
                    color = el.color;
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
        //console.log(event.pageX - canvas.offset.x, event.pageY - canvas.offset.y)
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

        if (clickedObjects.length > 0) {
            clickAction(clickedObjects[clickedObjects.length - 1])
        }

    })

    function checkClick(obj, x, y) {
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
        switch (obj.onClick.type) {
            case 'show':
                var shObj = objects.filter(function(e) {
                    return e.id == obj.onClick.id
                })
                if (shObj.length > 0) {
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
                if (shObj.length > 0) {
                    shObj[0].visible = false;
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
                    el.__anim.active.push({type:animation.type, time: Date.now()})
                    break;
                case constants.animations.fadeout:
                    el.__anim.active.push({type:animation.type, time: Date.now()})
                    break;
                default:
            }

        }
        
        console.log(el.__anim)

    }

});