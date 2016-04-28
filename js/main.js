/*global $*/
console.log("init");
Object.assign = function assign(target, source) {
    for (var index = 1, key, src; index < arguments.length; ++index) {
        src = arguments[index];
        for (key in src) {
            if (Object.prototype.hasOwnProperty.call(src, key)) {
                target[key] = src[key];
            }
        }
    }
    return target;
};

$(document).ready(function() {

    //CREATE STAGE VARIABLEEEEEEEEE
    var settings = {
        flexHeight: true,

    };
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
        size: { //IMAGE SIZE
            x: 0,
            y: 0,
        },
        zoom: 1,
        offset: {
            x: 0,
            y: 0,
        }
    };
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
            fposx: 0,
            fposy: 0,
            fobj: null,
        }
    };

    var objects = [
        {
            type: "connector",
            from: "0",
            to: "1",
        },
        {
        type: "imgrect",//TODO: ROTATE
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
        onClick: {//TODO: MORE THEN ONE CLICK ACTION
            type: "show",
            id: "1"
        }
    }, {
        type: "rect",//TODO: TEXT
        color: [100, 100, 100, 0.8],
        //TODO: OPACITY FOR IMAGES
        id: "1",
        child: [
            {
                type: "rect",
                visible: true,
                clickable: true,
                draggable: true,
                dragID: "1",
                color: [255, 255, 255, 0.5],
                //TODO: OPACITY FOR IMAGES
                id: "4",
                animation: [{
                    on: "show",
                    type: "fadein",
                    time: 200
                }, {
                    on: "hide",
                    type: "fadeout",
                    time: 200
                }],
                size: {
                    x: 500,
                    y: 40,
                },
                pos: {
                    x: 0,
                    y: 0,
                },
            },
            {
                type: "rect",
                visible: true,
                clickable: false,
                //dragID: "1",
                color: [255, 255, 255, 0.8],
                //TODO: OPACITY FOR IMAGES
                id: "5",
                animation: [{
                    on: "show",
                    type: "fadein",
                    time: 2000
                }, {
                    on: "hide",
                    type: "fadeout",
                    time: 200
                }],
                size: {
                    x: 500,
                    y: 110,
                },
                pos: {
                    x: 0,
                    y: 40,
                },
            },
            {
                type: "imgrect",
                id: "3",
                clickable: true,
                visible: true,
                img_url: "./images/button_interaktiv.png",
                size: {
                    x: 40,
                    y: 40,
                },
                pos: {
                    x: 460,
                    y: 0,
                },
                onClick: {
                    type: "hide",
                    id: "1"
                }
            },
        ],
        //draggable: true,
        animation: [{
            on: "show",
            type: "fadein",
            time: 200
        }, {
            on: "hide",
            type: "fadeout",
            time: 200
        }],
        visible: false,
        size: {
            x: 500,
            y: 150,
        },
        pos: {
            x: 1020,
            y: 450,
        },
    }];

    //CREATE
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
    };
    var eventAnimRel = {};

    eventAnimRel[constants.events.show] = [constants.animations.fadein, constants.animations.flyin];
    eventAnimRel[constants.events.hide] = [constants.animations.fadeout];

    console.log(eventAnimRel);

    //ADD BACKGROUND
    var background_img_url = (/^url\((['"]?)(.*)\1\)$/.exec($(".textimgs").css('background-image'))[2]);
    var background_img = new Image();
    //TODO: no global vars
    background_img.src = background_img_url;
    background_img.onload = function(e) {
        stage.size.x = background_img.width;
        stage.size.y = background_img.height;
        stage.img.size.x = background_img.width;
        stage.img.size.y = background_img.height;
        console.log("loaded");
        initObjects();
    };

    //ON RESIZE
    $(window).resize(respondCanvas);
    
    //RESPOND TO RESIZE
    function respondCanvas() {
        canvas.offset.x = c.offset().left;
        canvas.offset.y = c.offset().top;

        canvas.size.x = $(container).width();

        c.attr('width', $(container).width());
        if (settings.flexHeight) {
            var nheight = (stage.img.size.y / stage.img.size.x) * $(container).width();
            c.attr('height', nheight);
            canvas.size.y = nheight;
        }
        else {
            c.attr('height', $(container).height());
            canvas.size.y = $(container).height();
        }

        stage.img.ratio = (stage.img.size.y / stage.img.size.x);
        canvas.ratio = (canvas.size.y / canvas.size.x);
        stage.size.y = 0;
        stage.size.x = 0;

        // GET RATIO RESOLUTIONEEE
        if (canvas.ratio > stage.img.ratio) {
            stage.size.y = canvas.size.y;
            stage.size.x = (canvas.size.y / stage.img.ratio);
        }
        else {
            stage.size.x = canvas.size.x;
            stage.size.y = (canvas.size.x * stage.img.ratio);
        }

        stage.zoom = ((100 / stage.img.size.x) * stage.size.x) / 100;
        stage.offset.y = getCenteroffsety();
        stage.offset.x = getCenteroffsetx();

        updateCanvas();
    }
    
    //GET CANVASOFFSET Y
    function getCenteroffsety() {
        var zmoffset = Math.max(canvas.size.y - (stage.size.y), 0);
        var offsety = (-1 * (((stage.size.y) - canvas.size.y) / 2)) - (zmoffset / 2);
        return (offsety);
    }

    //GET CANVASOFFSET X
    function getCenteroffsetx() {
        var zmoffset = (canvas.size.x - (stage.size.x));
        return (zmoffset / 2);
    }

    //PREPARE OBJECTS
    function initObjects() {
        goThroughelm(objects, null);

        function goThroughelm(obj, parent) {
            for (var i = 0; i < obj.length; i++) {
                var el = obj[i];
                if (parent) {
                    el.__prnt = parent;
                }
                if (el.hasOwnProperty("child")) {
                    goThroughelm(el.child, el);
                }

            }
        }
        console.dir(objects);
        respondCanvas();
    }

    //UPDATE EVERYTIME
    function updateCanvas() {

        ct.drawImage(background_img, stage.offset.x, stage.offset.y, stage.size.x, stage.size.y);
        renderObjects(objects);
        requestAnimationFrame(updateCanvas);
    }

    //RENDER OBJECTS
    function renderObjects(ary) {
        //console.log(ary)
        for (var i = 0; i < ary.length; i++) {

            var el = ary[i];
            if (el.hasOwnProperty("visible"))
                if (el.visible == false&&!el.__anim)
                    continue;

            drawObject(el);
            if (el.hasOwnProperty("child") && el.child.length > 0&& el.visible && el.visible == true) {
                renderObjects(el.child);
            }
        }
    }

    //GET POINT RELATIVE TO OFFSET OF CANVAS
    function getRelPoint(x, y) {
        return {
            x: stage.offset.x + (x * stage.zoom),
            y: stage.offset.y + (y * stage.zoom),
        };
    }

    //RESOLVE RELATIVE POINT
    function resRelPoint(x, y) {
        return {
            x: ((x - stage.offset.x) / stage.zoom),
            y: (y / stage.zoom) - stage.offset.y
        };
    }

    //GET RELATIVE POSITION OF OBJECT 
    function getRelPos(el) {
        return {
            x: stage.offset.x + (el.pos.x * stage.zoom),
            y: stage.offset.y + (el.pos.y * stage.zoom),
            w: el.size.x * stage.zoom,
            h: el.size.y * stage.zoom
        };
    }

    //GET RELATIVE POSITION OF OBJECT AND CHILD OBJECT
    function getObjPos(el) {
        if (el.__prnt) {//TODO: CHECK IF REL: FALSE
            return getRelPos({
                pos: {
                    x: el.__prnt.pos.x + el.pos.x,
                    y: el.__prnt.pos.y + el.pos.y
                },
                size: {
                    x: el.size.x,
                    y: el.size.y
                }
            });
        }
        else {
            return getRelPos(el);
        }

    }

    //DRAW OBJECT
    function drawObject(el) {
        //console.log("DRAWOBJECT", el.id)
        var props = Object.assign({}, el);

        if (el.__anim && el.__anim.active.length > 0) {
            drawAnimation(el);
            //console.log(el.__anim.active)
            //console.log(el.__anim.props.color, el.visible)

            props = Object.assign(props, el.__anim.props);
            //return
        }

        if (el.hasOwnProperty("visible"))
            if (el.visible == false)
                return;
            //TODO: schöner machen

            //console.dir(props)

        switch (el.type) {
            case "rect":
                //TODO: global alpha
                var elmp = getObjPos(el);
                if (props.color) {
                    ct.fillStyle = getColorRGBA(props.color);
                }
                ct.fillRect(elmp.x, elmp.y, elmp.w, elmp.h);
                break;
            case "imgrect":
                /*
                    context.globalAlpha = 0.5;
                    context.drawImage(image, x, y);
                    context.globalAlpha = 1.0;
                */
                var elmp = getObjPos(el);
                if (!el.img) {
                    el.img = new Image();
                    el.img.src = el.img_url;
                    el.img.onload = function() {
                        ct.drawImage(el.img, elmp.x, elmp.y, elmp.w, elmp.h);
                    };
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
                        x: obj1.pos.x + (obj1.size.x / 2),
                        y: obj1.pos.y + (obj1.size.y / 2)
                    },
                    pos2 = {
                        x: obj2.pos.x + (obj2.size.x / 2),
                        y: obj2.pos.y + (obj2.size.y / 2)
                    };
                var pos1rel = getRelPoint(pos1.x, pos1.y),
                    pos2rel = getRelPoint(pos2.x, pos2.y);
                points.push([pos1rel.x, pos1rel.y]);
                points.push([pos2rel.x, pos2rel.y]);
                var angle = (getAngleBetweenPoints(points[0][0], points[0][1], points[1][0], points[1][1]));
                ct.beginPath();
                ct.moveTo(points[0][0], points[0][1]);
                var angleR = angle//(roundToNearestNum(angle,toRan(360), toRan(45)))
                var distance = (getDistance(points[0][0],points[0][1],points[1][0],points[1][1]))
                var point2x = points[0][0] + ((distance/2) * Math.cos(angleR))
                var point2y = points[0][1] + ((distance/2) * Math.sin(angleR))//(points[1][1]-points[0][1])
                
                var point2x2 = point2x + ((distance/3) * Math.cos(angleR+toRan(Math.sign(points[0][0]-points[1][0])*90)))
                var point2y2 = point2y + ((distance/3) * Math.sin(angleR+toRan(Math.sign(points[0][0]-points[1][0])*90)))
                
                ct.lineTo(point2x2,point2y2);
                
                ct.lineTo(points[1][0],points[1][1])
                ct.lineWidth = 3;
                ct.strokeStyle = "#FFFFFF";
                ct.stroke();

            default:


        }

    }

    function getAngleBetweenPoints(x1, y1, x2, y2) {
        var deltaY = y2 - y1;
        var deltaX = x2 - x1;
        return angle_trunc(Math.atan2(deltaY, deltaX));
        
        function angle_trunc(a) {
            while (a < 0.0) {
                a += Math.PI * 2;
            }
            return a;
        }
    }
    
    function roundToNearestNum(num, k, step) { //k = 360 num = 60 step = 45
        var stepsInK = k/step;
        //console.log(stepsInK)
        return Math.round((stepsInK/k)*num)*step
    }
    
    function getDistance(x1,y1,x2,y2) {
        return Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
    }
    
    function toRan(deg) {
        
        return deg * Math.PI / 180;

    }

    //SEARCH AND RETURN OBJECT FROM ID
    function getObjfromID(id) {//TODO: SEARCH CHILD
        return objects.filter(function(e) {
            return e.id == id;
        })[0];
    }
    
    //DRAW ANIMATION FOR OBJECT
    function drawAnimation(el) {
        //console.log(el.id)
        for (var i = 0; i < el.__anim.active.length; i++) {
            var animation = el.animation.filter(function(e) {
                return e.type == el.__anim.active[i].type;
            })[0];

            //console.log(el.__anim)

            switch (animation.type) {
                case constants.animations.fadein:
                    el.visible = true;
                    //console.log(el)
                    el.__anim.props.color = [];
                    var color = el.__anim.props.color;
                    color = Object.assign(color, el.color);
                    var process = ((Date.now() - el.__anim.active[i].time) / animation.time);
                    //console.log(el.__anim.active[i].time)
                    if (process >= 1) {
                        color[3] = el.color[3];
                        el.__anim.active = el.__anim.active.filter(function(e) {
                            return e.type != animation.type;
                        });
                        return;
                    }
                    color[3] = (process / 1) * el.color[3];

                    break;

                case constants.animations.fadeout:
                    el.__anim.props.color = [];
                    var color = el.__anim.props.color;
                    color = Object.assign(color, el.color);

                    var process = ((Date.now() - el.__anim.active[i].time) / animation.time);
                    //console.log(el.__anim.active[i].time)
                    if (process >= 1) {
                        console.log("fin");
                        color[3] = 0;
                        el.__anim.active = el.__anim.active.filter(function(e) {
                            return e.type != animation.type;
                        });
                        el.visible = false;
                        return;
                    }
                    color[3] = el.color[3] - ((process / 1) * el.color[3]);
                    break;

                default:
            }
        }
    }
    
    //START ANIMATION ON OBJECT FROM EVENT
    function createAnimation(el, event) {
        //console.log("EVENT",event, el.id);
        //console.log("CREATEANIMATION", el.id)
        if (el.animation) {
            if (!el.__anim) {
                el.__anim = {
                    active: [],
                    props: {}
                };
            }
        } else {
            return
        }
        
        var anims = el.animation.filter(function(e) {
            return e.on == event;
        });
        
        //TODO: clean and error handling
        for (var i = 0; i < anims.length; i++) {
            var animation = anims[i];
            switch (animation.type) {
                case constants.animations.fadein:
                    addToActiveAnimation(el, {
                        type: animation.type,
                        time: Date.now()
                    });
                    break;
                case constants.animations.fadeout:
                    addToActiveAnimation(el, {
                        type: animation.type,
                        time: Date.now()
                    });
                    break;
                default:
            }
        }
        
        console.log(el)
    }
    
    function runOnArray(obj, fnct, params) {
        for (var i = 0; i < obj.length; i++) {
            var el = obj[i];
            var nparams = params.slice(0)
            nparams.unshift(el)
            fnct.apply(this, nparams)
            if(el.hasOwnProperty("child")) {
                runOnChild(el.child, fnct, params)
            }
            
        }
    }

    //ADD TO ACTIVE ANIMATIONS
    function addToActiveAnimation(el, obj) {
        //TODO: dont push if allready
        el.__anim.active.push(obj);
    }

    //RETURN CLICKED OBJECTS
    function getClickedObj(event) {
        var clickedObjects = [];
        function checkObjs(obj) {
            for (var i = 0; i < obj.length; i++) {
                var el = obj[i];
                if (el.hasOwnProperty("visible"))
                    if (el.visible == false)
                        continue;
                var hit = checkClick(el, event.pageX - canvas.offset.x, event.pageY - canvas.offset.y);
                
                //TODO: CLEAN UP
                if (hit && (!el.hasOwnProperty("clickable") || (el.hasOwnProperty("clickable") && el.clickable))&&(!el.hasOwnProperty("__anim")||(el.hasOwnProperty("__anim")&&el.__anim.active.length==0))) {
                    clickedObjects.push(el);
                    if(el.hasOwnProperty("child")) {
                        checkObjs(el.child)
                    }
                }
            }
        }
        checkObjs(objects);

        return clickedObjects;
    }

    //CHECK IF CLICK HIT AN OBJECT
    function checkClick(obj, x, y) {
        if (!obj.pos) {
            return;
        }
        var elmp = getObjPos(obj);

        if (y > elmp.y && y < elmp.y + elmp.h && x > elmp.x && x < elmp.x + elmp.w) {
            return true;
        }
        else {
            return false;
        }
    }

    //DECIDE WHAT HAPPENS IF AN OBJECT IS CLICKED
    function clickAction(obj) {
        if (!obj.onClick)
            return;

        console.log("click");
        switch (obj.onClick.type) {
            case 'show':
                var shObj = objects.filter(function(e) {
                    return e.id == obj.onClick.id;
                });
                if (shObj.length > 0 && !shObj[0].visible) {
                    //shObj[0].visible = true;
                    if(shObj[0].hasOwnProperty("child")) {// CHECK IF PARAM DOWN HIRACHIE
                        createAnimation(shObj[0], obj.onClick.type);
                        runOnArray(shObj[0].child, createAnimation, [obj.onClick.type])
                    }
                    createAnimation(shObj[0], obj.onClick.type);
                    console.log(shObj[0]);
                }
                break;
            case 'hide':
                var shObj = objects.filter(function(e) {
                    return e.id == obj.onClick.id;
                });
                if (shObj.length > 0 && shObj[0].visible) {
                    //shObj[0].visible = false;
                    if(shObj[0].hasOwnProperty("child")) {// CHECK IF PARAM DOWN HIRACHIE
                        createAnimation(shObj[0], obj.onClick.type);
                        runOnArray(shObj[0].child, createAnimation, [obj.onClick.type])
                    }
                    createAnimation(shObj[0], obj.onClick.type);
                }
                break;
            default:
        }
    }
    
    //GET RGBA STRING FROM COLOR ARRAY
    function getColorRGBA(el_color, opacity) {
        return "rgba(" + el_color[0] + "," + el_color[1] + "," + el_color[2] + "," + (opacity || el_color[3]) + ")";
    }


    //CLICK
    c.on('click', function(event) {
        var clickedObjects = getClickedObj(event);
        if (clickedObjects.length > 0) {
            clickAction(clickedObjects[clickedObjects.length - 1], true);
        }
    });
    c.on('mousedown', function(event) {

        var clickedObjects = getClickedObj(event);
        if (clickedObjects.length > 0) {
            var obj = (clickedObjects[clickedObjects.length - 1]);
            if (obj.draggable) {
                canvas.dnd.stage = 1;
            }
            else {
                return;
            }
        }
        else {
            return;
        }
        
        if(obj.hasOwnProperty("dragID")) {
            obj = getObjfromID(obj.dragID)
        }

        var relPos = getRelPos(obj);
        canvas.dnd.fposx = (event.pageX - canvas.offset.x) - relPos.x;
        canvas.dnd.fposy = (event.pageY - canvas.offset.y) - relPos.y;
        canvas.dnd.fobj = obj;
    });
    c.on('mousemove', function(event) {
        if (canvas.dnd.stage == 1) {
            canvas.dnd.stage = 2;
        }
        if (canvas.dnd.stage == 2) {
            var npos = resRelPoint((event.pageX - canvas.offset.x) - canvas.dnd.fposx, (event.pageY - canvas.offset.y) - canvas.dnd.fposy);
            canvas.dnd.fobj.pos.x = npos.x;
            canvas.dnd.fobj.pos.y = npos.y;
        }
    });
    c.on('mouseup', function(event) {
        canvas.dnd.stage = 0;
    });

});