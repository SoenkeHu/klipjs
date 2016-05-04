/*global $*/
console.log("init");

//CREATE CLOSURE
if (typeof klip == 'undefined')
klip = {};

//OBJECT.ASSIGN POLYFILL
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

//CREATE ANONYMOUS FUNCTION
(function(){

    //CREATE STAGE VARIABLEEEEEEEEE
    var settings = {
        //DETERMINES IF THE CANVAS IS FLEXIBLE OR FIXED
        flexHeight: true,

    };
    var stage = {
        //NORMALLY THE BG IMG
        img: {
            //SIZE IN X ANY Y
            size: {
                x: 0,
                y: 0,
            },
            // WIDTH RATIO OF THE STAGE
            ratio: 0,
        },
        //IMAGE SIZE
        size: { 
            x: 0,
            y: 0,
        },
        //ZOOM "RATIO"
        zoom: 1,
        //OFFSET OF THE STAGE RELATIVE TO THE CANVAS
        offset: {
            x: 0,
            y: 0,
        }
    };
    //SETTINGS OF THE CANVAS
    var canvas = {
        size: {
            x: 0,
            y: 0,
        },
        //CANVAS RATIO
        ratio: 0,
        //OFFSET OF CANVAS IN HTML PAGE
        offset: {
            x: 0,
            y: 0
        },
        //DRAG AND DROP SETTINGS
        dnd: {
            //STATUS OF DND. GETS CHANGED e.g. WHEN CLICKED
            stage: 0,
            //POSITION OF THE FIRST OBJECT IN RELATION TO CLICK
            fposx: 0,
            fposy: 0,
            //DRAGGED OBJ
            fobj: null,
        }
    };

    var objects = [{
        type: "connector",
        from: "0",
        to: "1",
    }, {
        type: "imgrect", //TODO: ROTATE
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
        onClick: [ //TODO: MORE THEN ONE CLICK ACTION
            {
                type: function() {
                    return getObjfromID("1").visible ? "hide" : "show";
                },
                id: "1"
            },
        ]
    }, {
        type: "rect", //TODO: TEXT
        color: [100, 100, 100, 0.8],
        //TODO: OPACITY FOR IMAGES
        id: "1",
        child: [{
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
        }, {
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
        }, {
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
            onClick: [{
                type: "hide",
                id: "1"
            }],
            animation: [{
                on: "show",
                type: "fadein",
                time: 200
            }, {
                on: "hide",
                type: "fadeout",
                time: 200
            }],

        }, ],
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

    //GET ELM FROM ID
    var c = $('#respondCanvas');
    //GET CONTEXT
    var ct = c.get(0).getContext('2d');
    //GET PARENT(CONTAINER)
    var container = $(c).parent();

    //CONSTANTS
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
    
    //EVENTS ANIMATIONS RELATIONS
    //FOR CALLING EVENTS FROM ANIMATIONS
    var eventAnimRel = {};

    eventAnimRel[constants.events.show] = [constants.animations.fadein, constants.animations.flyin];
    eventAnimRel[constants.events.hide] = [constants.animations.fadeout];

    //ADD BACKGROUND
    var background_img_url = (/^url\((['"]?)(.*)\1\)$/.exec($(".textimgs").css('background-image'))[2]);
    var background_img = new Image();

    //PRELOAD IMAGE
    background_img.src = background_img_url;
    
    //IF IMAGE HAS LOADED
    background_img.onload = function(e) {
        stage.size.x = background_img.width;
        stage.size.y = background_img.height;
        stage.img.size.x = background_img.width;
        stage.img.size.y = background_img.height;
        
        //INIT OBJECTS
        initObjects();
    };

    //ON RESIZE
    $(window).resize(respondCanvas);

    //RESPOND TO RESIZE
    function respondCanvas() {
        //CALCULATE OFFSET FOR CENTERED CANVAS
        canvas.offset.x = c.offset().left;
        canvas.offset.y = c.offset().top;
        
        //SET CANVAS WIDTH AND HEIGHT
        canvas.size.x = $(container).width();

        c.attr('width', $(container).width());
        
        if (settings.flexHeight) {
            //SET HEIGHT OF CANVAS BY RATIO
            var nheight = (stage.img.size.y / stage.img.size.x) * $(container).width();
            c.attr('height', nheight);
            canvas.size.y = nheight;
        }
        else {
            //SET HEIGHT TO PARENT HEIGHT
            c.attr('height', $(container).height());
            canvas.size.y = $(container).height();
        }
        
        //CALCULATE IMAGE RATIO
        stage.img.ratio = (stage.img.size.y / stage.img.size.x);
        canvas.ratio = (canvas.size.y / canvas.size.x);
        stage.size.y = 0;
        stage.size.x = 0;

        // GET RATIO RESOLUTION
        if (canvas.ratio > stage.img.ratio) {
            //IF LANDSCAPE
            stage.size.y = canvas.size.y;
            stage.size.x = (canvas.size.y / stage.img.ratio);
        }
        else {
            //IF PORTRAIT
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
<<<<<<< HEAD
=======
                //IF ELEMENT HAS CHILD CALL FUNCTION WITH CHILD
>>>>>>> parent of 502e1bd... added more comments
                if (el.hasOwnProperty("child")) {
                    goThroughelm(el.child, el);
                }

            }
        }
        respondCanvas();
    }

    //UPDATE EVERYTIME
    function updateCanvas() {
        //DRAW BACKGROUND
        ct.drawImage(background_img, stage.offset.x, stage.offset.y, stage.size.x, stage.size.y);
        //RENDER OBJECTS
        renderObjects(objects);
        //CALL FOR NEW FRAME
        requestAnimationFrame(updateCanvas);
    }

    //RENDER ARRAY
    function renderObjects(ary) {
        for (var i = 0; i < ary.length; i++) {
            var el = ary[i];
            //SKIP IS NOT VISIBLE AND HAS NO ANIMATION
            /*
            if (el.hasOwnProperty("visible"))
                if (el.visible == false)
                    //continue;
                    TODO: IF OBJECT HAS ANIMATION: DISPLAY
            */
            
            //DRAW OBJECT
            drawObject(el);
            
            //IF ELEMENT HAS CHILDS ADD TO RENDER QUEUE
            if (el.hasOwnProperty("child") && el.child.length > 0 && el.visible && el.visible == true) {
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
        if (el.__prnt) { //TODO: CHECK IF REL: FALSE
        
            //RUN FUNCTIONS WITH OBJECT
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
        var props = Object.assign({}, el);

        if (el.__anim && el.__anim.active.length > 0) {
            //WHEN OBJECT HAS ACTIVE ANIMATIONS RENDER ANIMATION
            drawAnimation(el);
            
            //MERGE ANIMATION PROPS
            props = Object.assign(props, el.__anim.props);
        }
        
        //IF VISIBLE IS FALSE DONT RENDER OBJECT
        if (el.hasOwnProperty("visible"))
            if (el.visible == false)
                return;
        //TODO: CLEAN UP


        //TODO: ALL FUNCTIONS TO OBJECT // EXTENSIONS
        //SWITCH AFTER TYPE
        switch (el.type) {
            
            //RECTANGLE
            case "rect":
                //TODO: GLOBAL ALPHA
                
                //GET SIZE AND POS
                var elmp = getObjPos(el);
                if (props.color) {
                    //USE OBJECT COLOR IF POSSIBLE
                    ct.fillStyle = getColorRGBA(props.color);
                }
                ct.fillRect(elmp.x, elmp.y, elmp.w, elmp.h);
                break;
                
            //IMAGE
            case "imgrect":
                
                //GET SIZE AND POS
                var elmp = getObjPos(el);
                
                if (!el.img) {
                    //IF IMG HAS NOT LOADED PRELOAD
                    el.img = new Image();
                    el.img.src = el.img_url;
                    el.img.onload = function() {
                        drawObject(el)
                    };
                }
                else {
                    if (props.alpha) {
                        //CHANGE GLOBAL ALPHA VALUE
                        ct.globalAlpha = props.alpha;
                    }
                    
                    //DRAW IMAGE
                    ct.drawImage(el.img, elmp.x, elmp.y, elmp.w, elmp.h);
                    
                    if (props.alpha) {
                        //RESET GLOBAL ALPHA VALUE
                        ct.globalAlpha = 1;
                    }
                }
                break;
                
            //CONNECTOR BETWEEN TWO OBJECTS
            case "connector":
                
                //GET OBJECTS
                var points = [],
                    obj1 = getObjfromID(el.from),
                    obj2 = getObjfromID(el.to);
                    
                    //GET POS OF FIRST OBJECT
                var pos1 = {
                        x: obj1.pos.x + (obj1.size.x / 2),
                        y: obj1.pos.y + (obj1.size.y / 2)
                    },
                    //GET POS OF SECOND OBJECT
                    pos2 = {
                        x: obj2.pos.x + (obj2.size.x / 2),
                        y: obj2.pos.y + (obj2.size.y / 2)
                    };
                    
                //GET POINT RELATIVE TO CANVAS AND ZOOM
                var pos1rel = getRelPoint(pos1.x, pos1.y),
                    pos2rel = getRelPoint(pos2.x, pos2.y);
                    
                //PUSH INTO POINTS
                points.push([pos1rel.x, pos1rel.y]);
                points.push([pos2rel.x, pos2rel.y]);
                
                //CALCULATE ANGLE PETWEEN OBJECT ONE AND TWO
                var angle = (getAngleBetweenPoints(points[0][0], points[0][1], points[1][0], points[1][1]));
                
                //BEGIN PATH
                ct.beginPath();
                ct.moveTo(points[0][0], points[0][1]);
                
                var angleR = angle //(roundToNearestNum(angle,toRan(360), toRan(45)))
                
                //CALCULATE DISTANCE BETWEEN OBJECT ONE AND TWO
                var distance = (getDistance(points[0][0], points[0][1], points[1][0], points[1][1]))
                var point2x = points[0][0] + ((distance / 2) * Math.cos(angleR))
                var point2y = points[0][1] + ((distance / 2) * Math.sin(angleR)) //(points[1][1]-points[0][1])

                var point2x2 = point2x + ((distance / 3) * Math.cos(angleR + toRan(Math.sign(points[0][0] - points[1][0]) * 90)))
                var point2y2 = point2y + ((distance / 3) * Math.sin(angleR + toRan(Math.sign(points[0][0] - points[1][0]) * 90)))

                ct.lineTo(point2x2, point2y2);

                ct.lineTo(points[1][0], points[1][1])
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
        var stepsInK = k / step;
        //console.log(stepsInK)
        return Math.round((stepsInK / k) * num) * step
    }

    function getDistance(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    function toRan(deg) {

        return deg * Math.PI / 180;

    }

    //SEARCH AND RETURN OBJECT FROM ID
    function getObjfromID(id, obj) { //TODO: SEARCH CHILD
        if(!obj) {
            obj = objects
        }
        if(!obj)
            return {}
        var foundObj = {}
        runOnArray(obj, function(e) {
            if (e.id == id) {
                foundObj = e
            }
        }, [])
        return foundObj
            /*return obj.filter(function(e) {
                return e.id == id;
                
                if(e.)
            })[0];*/
    }

    //DRAW ANIMATION FOR OBJECT
    function drawAnimation(el) {
        //console.log(el.id)
        for (var i = 0; i < el.__anim.active.length; i++) {
            var animation = el.animation.filter(function(e) {
                return e.type == el.__anim.active[i].type;
            })[0];


            switch (animation.type) {
                case constants.animations.fadein:
                    el.visible = true;

                    var process = ((Date.now() - el.__anim.active[i].time) / animation.time);

                    if (el.type == "imgrect") {
                        el.__anim.props.alpha = (process / 1);
                        if (process >= 1) {//TODO: CLEAN: IF IMGRECT AND FINISHED 
                            el.__anim.props.alpha = 1;
                            console.log(el.type)
                            el.__anim.active = el.__anim.active.filter(function(e) {
                                return e.type != animation.type;
                            });
                            el.visible = true;
                            return;
                        }
                        return;
                    }
                    //console.log(el)
                    el.__anim.props.color = [];
                    var color = el.__anim.props.color;
                    color = Object.assign(color, el.color);

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
                    var process = ((Date.now() - el.__anim.active[i].time) / animation.time);
                    if (el.type == "imgrect") {

                        el.__anim.props.alpha = 1 - (process / 1);
                        if (process >= 1) {
                            el.__anim.props.alpha = 0;
                            el.__anim.active = el.__anim.active.filter(function(e) {
                                return e.type != animation.type;
                            });
                            el.visible = false;
                            return;
                        }
                        return;
                    }
                    if (!el.color)
                        return
                    el.__anim.props.color = [];
                    var color = el.__anim.props.color;
                    color = Object.assign(color, el.color);


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
        }
        else {
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
            if (el.hasOwnProperty("child")) {
                runOnArray(el.child, fnct, params)
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
                if (hit && (!el.hasOwnProperty("clickable") || (el.hasOwnProperty("clickable") && el.clickable)) && (!el.hasOwnProperty("__anim") || (el.hasOwnProperty("__anim") && el.__anim.active.length == 0))) {
                    clickedObjects.push(el);
                    if (el.hasOwnProperty("child")) {
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
        for (var i = 0; obj.onClick.length > 0; i++) {
            if (!obj.onClick[i])
                return
            var el = obj.onClick[i];
            //console.log(el)
            execOnClick(el)
        }
        console.log("click");
    }

    
    function isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    function execOnClick(obj) {
        var type = obj.type;
        if(isFunction(obj.type)) {
            type = obj.type()
        }
        switch (type) {
            case 'show':
                var shObj = objects.filter(function(e) {
                    return e.id == obj.id;
                });
                if (shObj.length > 0 && !shObj[0].visible) {
                    //shObj[0].visible = true;
                    if (shObj[0].hasOwnProperty("child")) { // CHECK IF PARAM DOWN HIRACHIE
                        createAnimation(shObj[0], type);
                        runOnArray(shObj[0].child, createAnimation, [type])
                    }
                    createAnimation(shObj[0], type);
                    //console.log(shObj[0]);
                }
                break;
            case 'hide':
                var shObj = objects.filter(function(e) {
                    return e.id == obj.id;
                });
                if (shObj.length > 0 && shObj[0].visible) {
                    //shObj[0].visible = false;
                    if (shObj[0].hasOwnProperty("child")) { // CHECK IF PARAM DOWN HIRACHIE
                        createAnimation(shObj[0], type);
                        runOnArray(shObj[0].child, createAnimation, [type])
                    }
                    createAnimation(shObj[0], type);
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

        if (obj.hasOwnProperty("dragID")) {
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

}).call(klip);
