/*global $*/
/*global Image*/

//CREATE CLOSURE
if (typeof klip == 'undefined')
    var klip = {};

//OBJECT.ASSIGN POLYFILL
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
if (typeof Object.assign != 'function') {
  (function () {
    Object.assign = function (target) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var output = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source !== undefined && source !== null) {
          for (var nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }
      return output;
    };
  })();
}

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

    var objects = [];
    
    var __klip = {
        
    }
    
   //var c,ct,container,constants;
    
    this.create = function(conID,bgIMGurl, objs) {
        //GET ELM FROM ID
        __klip.container = document.getElementById(conID)
        
        __klip.container.innerHTML = '';
        
        var cnvElm = document.createElement("CANVAS")
        cnvElm.id = "klipElm"
        document.getElementById(conID).appendChild(cnvElm)
        
        __klip.c = document.getElementById(cnvElm.id);
        //GET CONTEXT
        __klip.ct = __klip.c.getContext('2d');
        //GET PARENT(CONTAINER)

        objects = objs;
    
        //CONSTANTS
        __klip.constants = {
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
        __klip.eventAnimRel = {};
    
        __klip.eventAnimRel[__klip.constants.events.show] = [__klip.constants.animations.fadein, __klip.constants.animations.flyin];
        __klip.eventAnimRel[__klip.constants.events.hide] = [__klip.constants.animations.fadeout];
    
        //ADD BACKGROUND

        __klip.background_img = new Image();
        
        __klip.background_img_url = bgIMGurl;
    
        //PRELOAD IMAGE
        __klip.background_img.src = __klip.background_img_url;
        
        //IF IMAGE HAS LOADED
        __klip.background_img.onload = function(e) {
            stage.size.x = __klip.background_img.width;
            stage.size.y = __klip.background_img.height;
            stage.img.size.x = __klip.background_img.width;
            stage.img.size.y = __klip.background_img.height;
            
            //INIT OBJECTS
            initObjects();
        };
        createClick();
    
        //ON RESIZE
        window.addEventListener('resize', respondCanvas);
    }

    //http://youmightnotneedjquery.com/#offset
    function getOffset(el) {
        var rect = el.getBoundingClientRect();
        return {
            top: rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft
        }
    }

    //RESPOND TO RESIZE
    function respondCanvas() {
        //CALCULATE OFFSET FOR CENTERED CANVAS
        
        
        canvas.offset.x = getOffset(__klip.c).left;
        canvas.offset.y = getOffset(__klip.c).top;
        
        //SET CANVAS WIDTH AND HEIGHT
        canvas.size.x = __klip.container.offsetWidth;

        __klip.c.setAttribute('width', __klip.container.offsetWidth);
        
        if (settings.flexHeight) {
            //SET HEIGHT OF CANVAS BY RATIO
            var nheight = (stage.img.size.y / stage.img.size.x) * __klip.container.offsetWidth;
            __klip.c.setAttribute('height', nheight);
            canvas.size.y = nheight;
        }
        else {
            //SET HEIGHT TO PARENT HEIGHT
            __klip.c.setAttribute('height', __klip.container.offsetHeight);
            canvas.size.y = __klip.container.offsetHeight;
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

                //IF ELEMENT HAS CHILD CALL FUNCTION WITH CHILD
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
        __klip.ct.drawImage(__klip.background_img, stage.offset.x, stage.offset.y, stage.size.x, stage.size.y);
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
                    __klip.ct.fillStyle = getColorRGBA(props.color);
                }
                __klip.ct.fillRect(elmp.x, elmp.y, elmp.w, elmp.h);
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
                        __klip.ct.globalAlpha = props.alpha;
                    }
                    
                    //DRAW IMAGE
                    __klip.ct.drawImage(el.img, elmp.x, elmp.y, elmp.w, elmp.h);
                    
                    if (props.alpha) {
                        //RESET GLOBAL ALPHA VALUE
                        __klip.ct.globalAlpha = 1;
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
                __klip.ct.beginPath();
                __klip.ct.moveTo(points[0][0], points[0][1]);
                
                var angleR = angle //(roundToNearestNum(angle,toRan(360), toRan(45)))
                
                //CALCULATE DISTANCE BETWEEN OBJECT ONE AND TWO
                var distance = (getDistance(points[0][0], points[0][1], points[1][0], points[1][1]))
                var point2x = points[0][0] + ((distance / 2) * Math.cos(angleR))
                var point2y = points[0][1] + ((distance / 2) * Math.sin(angleR)) //(points[1][1]-points[0][1])
                
                //SET POINT AT HALF OF LINE ONE THIRD PERPENDICULAR TO LINE
                var point2x2 = point2x + ((distance / 3) * Math.cos(angleR + toRan(Math.sign(points[0][0] - points[1][0]) * 90)))
                var point2y2 = point2y + ((distance / 3) * Math.sin(angleR + toRan(Math.sign(points[0][0] - points[1][0]) * 90)))

                __klip.ct.lineTo(point2x2, point2y2);

                __klip.ct.lineTo(points[1][0], points[1][1])
                __klip.ct.lineWidth = 3;
                __klip.ct.strokeStyle = "#FFFFFF";
                __klip.ct.stroke();
                break;
            case "textbox":
                //console.log(el)
                var elmp = getObjPos(el);
                var fillStyle = "#000000";
                if (props.color) {
                    //USE OBJECT COLOR IF POSSIBLE
                    fillStyle = getColorRGBA(props.color);
                }
                create_text_wrap(__klip.ct,elmp.x,elmp.y,elmp.w,elmp.h,el.text,10,2, fillStyle)
                break;
            default:
        }
    }

    //CALCULATE ANGLE BETWEEN POINTS IN RAD
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
    
    //ROUND TO NEAREST NUMBER (NUMBER, SCOPE, STEP)
    function roundToNearestNum(num, k, step) { //k = 360 num = 60 step = 45
        var stepsInK = k / step;
        return Math.round((stepsInK / k) * num) * step
    }

    //GET DISTANCE BETWEEN POINTS
    function getDistance(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    //CONVERT DEGREE TO RAN
    function toRan(deg) {
        return deg * Math.PI / 180;
    }

    //SEARCH AND RETURN OBJECT FROM ID
    function getObjfromID(id, obj) { //TODO: SEARCH CHILD
        //IF OBJ IS NOT SPECIFIED CHOOSE OBJECTS
        if(!obj) {
            obj = objects
        }
        //IF OBJ STILL NULL RETURN EMPTY OBJECT FUN
        if(!obj)
            return {}
            
        //OBJECT FOR FOUND OBJECT
        var foundObj = {}
        //RUN FUNCTION ON OBJ
        runOnArray(obj, function(e) {
            if (e.id == id) {
                foundObj = e
            }
        }, [])
        return foundObj
    }

    //DRAW ANIMATION FOR OBJECT
    function drawAnimation(el) {
        //FOR ALL ACTIVE ANIMATIONS ON OBJECT
        for (var i = 0; i < el.__anim.active.length; i++) {
            //RETURN ANIMATION SETTINGS FOR ACTIVE ANIMATION
            var animation = el.animation.filter(function(e) {
                return e.type == el.__anim.active[i].type;
            })[0];

            //SWITCH FOR ANIMATION TYPE
            switch (animation.type) {
                case __klip.constants.animations.fadein:
                    //SET ELEMENT TO VISIBLE
                    el.visible = true;

                    //GET PROGRESS 0/1
                    var process = ((Date.now() - el.__anim.active[i].time) / animation.time);
                    
                    //IF OBJECT TYPE IS RECTANGLE
                    //BECAUSE ALPHA AND RGBA ALPHA ARE DIFFERENT
                    if (el.type == "imgrect") {
                        el.__anim.props.alpha = (process / 1);
                        
                        //IF "PROCESS" IS FINISHED
                        if (process >= 1) {//TODO: CLEAN: IF IMGRECT AND FINISHED 
                            el.__anim.props.alpha = 1;
                            
                            //FILTER OUT CURRENT ANIMATION
                            el.__anim.active = el.__anim.active.filter(function(e) {
                                return e.type != animation.type;
                            });
                            el.visible = true;
                            return;
                        }
                        return;
                    }
                    
                    //IF RECTANGLE
                    el.__anim.props.color = [];
                    var color = el.__anim.props.color;
                    color = Object.assign(color, el.color);

                    //IF "PROCESS" IS FINISHED
                    if (process >= 1) {
                        color[3] = el.color[3];
                        el.__anim.active = el.__anim.active.filter(function(e) {
                            return e.type != animation.type;
                        });
                        return;
                    }
                    color[3] = (process / 1) * el.color[3];

                    break;

                case __klip.constants.animations.fadeout:
                    //LOOK ABOVE
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

                    if (process >= 1) {
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
        //CREATE __ANIM OBJECT IF NOT AVAILABLE
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
        
        //GET ANIMATIONS FOR EVENT
        var anims = el.animation.filter(function(e) {
            return e.on == event;
        });

        //TODO: clean and error handling
        //FOR EVERY ANIMATION CORRESPONDING TO EVENT
        for (var i = 0; i < anims.length; i++) {
            var animation = anims[i];
            switch (animation.type) {
                case __klip.constants.animations.fadein:
                    //ADD ANIMATION TO OBJECT
                    addToActiveAnimation(el, {
                        type: animation.type,
                        time: Date.now()
                    });
                    break;
                case __klip.constants.animations.fadeout:
                    addToActiveAnimation(el, {
                        type: animation.type,
                        time: Date.now()
                    });
                    break;
                default:
            }
        }
    }

    //RUN FUNCTION ON OBJECTS IN ARRAY
    function runOnArray(obj, fnct, params) {
        for (var i = 0; i < obj.length; i++) {
            var el = obj[i];
            var nparams = params.slice(0)
            
            //PREPEND OBJ TO PARAMS
            nparams.unshift(el)
            
            //RUN FUNCTION
            fnct.apply(this, nparams)
            
            //IF OBJ HAS CHILD RUN THIS FUNCTION ON CHILD
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
            
            //
            for (var i = 0; i < obj.length; i++) {
                var el = obj[i];
                if (el.hasOwnProperty("visible"))
                    if (el.visible == false)
                        continue;
                
                //CHECK IF MOUSE CLICK OVERLAPS WITH OBJECT
                var hit = checkClick(el, event.pageX - canvas.offset.x, event.pageY - canvas.offset.y);

                //TODO: CLEAN UP
                //IF OBJECT IS CLICKABLE
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
        //FOR ONCLICK ACTIONS RUN EXECONCLICK
        for (var i = 0; obj.onClick.length > 0; i++) {
            if (!obj.onClick[i])
                return
            var el = obj.onClick[i];
            execOnClick(el)
        }
    }
    
    //http://stackoverflow.com/questions/5999998/how-can-i-check-if-a-javascript-variable-is-function-type
    function isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    //EXECUTE EVENT ON OBJECT
    function execOnClick(obj) {
        var type = obj.type;
        if(isFunction(obj.type)) {
            type = obj.type(getObjfromID)
        }
        switch (type) {
            case 'show':
                var shObj = objects.filter(function(e) {
                    return e.id == obj.id;
                });
                if (shObj.length > 0 && !shObj[0].visible) {
                    //TODO: CHECK IF PARAM DOWN HIRACHIE
                    if (shObj[0].hasOwnProperty("child")) { 
                        createAnimation(shObj[0], type);
                        runOnArray(shObj[0].child, createAnimation, [type])
                    }
                    createAnimation(shObj[0], type);
                }
                break;
            case 'hide':
                var shObj = objects.filter(function(e) {
                    return e.id == obj.id;
                });
                if (shObj.length > 0 && shObj[0].visible) {
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
    
    //http://stackoverflow.com/questions/6348494/addeventlistener-vs-onclick
    function addEvent(element, evnt, funct){
        if (element.attachEvent)
            return element.attachEvent('on'+evnt, funct);
        else
            return element.addEventListener(evnt, funct, false);
    }


    function createClick() {
        //CLICK
        
        addEvent(__klip.c, "click",function(event) {
            //RUN CLICK FUNCTION ON CLICKED OBJECT
            var clickedObjects = getClickedObj(event);
            if (clickedObjects.length > 0) {
                clickAction(clickedObjects[clickedObjects.length - 1], true);
            }
        })

        addEvent(__klip.c, "mousedown",function(event) {
            //EDIT DND STATE IF ENABLED
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
            
            //IF DRAGID SPECIFIED. IF ON OBJECT DRAG DRAG OTHER OBJ
            if (obj.hasOwnProperty("dragID")) {
                obj = getObjfromID(obj.dragID)
            }
    
            var relPos = getRelPos(obj);
            canvas.dnd.fposx = (event.pageX - canvas.offset.x) - relPos.x;
            canvas.dnd.fposy = (event.pageY - canvas.offset.y) - relPos.y;
            canvas.dnd.fobj = obj;
        })
        addEvent(__klip.c, "mousemove",function(event) {
            
            //PROGRESS TO DNG STAGE 2 IF DRAGGED
            if (canvas.dnd.stage == 1) {
                canvas.dnd.stage = 2;
            }
            if (canvas.dnd.stage == 2) {
                var npos = resRelPoint((event.pageX - canvas.offset.x) - canvas.dnd.fposx, (event.pageY - canvas.offset.y) - canvas.dnd.fposy);
                canvas.dnd.fobj.pos.x = npos.x;
                canvas.dnd.fobj.pos.y = npos.y;
            }
        })

        addEvent(__klip.c, "mouseup",function(event) {
            canvas.dnd.stage = 0;
        })
    }
    
    
    //http://sourcoder.blogspot.de/2012/12/text-wrapping-in-html-canvas.html
    /**
     * @param canvas : The canvas object where to draw . 
     *                 This object is usually obtained by doing:
     *                 canvas = document.getElementById('canvasId');
     * @param x     :  The x position of the rectangle.
     * @param y     :  The y position of the rectangle.
     * @param w     :  The width of the rectangle.
     * @param h     :  The height of the rectangle.
     * @param text  :  The text we are going to centralize.
     * @param fh    :  The font height (in pixels).
     * @param spl   :  Vertical space between lines
     */
    function create_text_wrap(ctx, x, y, w, h, text, fh, spl, fillStyle) {
        //console.log(x,y,w,h,text,fh,spl)
        var Paint = {
            //RECTANGLE_STROKE_STYLE : 'black',
            //RECTANGLE_LINE_WIDTH : 1,
            VALUE_FONT : fh+'px Arial',
        }
        /*
         * @param mw    : The max width of the text accepted
         * @param font  : The font used to draw the text
         * @param text  : The text to be splitted   into 
         */
        var split_lines = function( mw, font, text) {
            mw = mw;
            // We setup the text font to the context (if not already)
            ctx.font = font;
            ctx.fillStyle = fillStyle;
            // We split the text by words 
            var words = text.split(' ');
            var new_line = words[0];
            var lines = [];
            for(var i = 1; i < words.length; ++i) {
               if (ctx.measureText(new_line + " " + words[i]).width < mw) {
                   new_line += " " + words[i];
               } else {
                   lines.push(new_line);
                   new_line = words[i];
               }
            }
            lines.push(new_line);
            // DEBUG 
            // for(var j = 0; j < lines.length; ++j) {
            //    console.log("line[" + j + "]=" + lines[j]);
            // }
            return lines;
        }
        // Obtains the context 2d of the canvas 
        // It may return null
        if (ctx) {
            // draw rectangular
            //ctx2d.strokeStyle=Paint.RECTANGLE_STROKE_STYLE;
            //ctx2d.lineWidth = Paint.RECTANGLE_LINE_WIDTH;
            //ctx2d.strokeRect(x, y, w, h);
            // Paint text
            var lines = split_lines(w, Paint.VALUE_FONT, text);
            // Block of text height
            var both = lines.length * (fh + spl);
            if (both >= h) {
                // We won't be able to wrap the text inside the area
                // the area is too small. We should inform the user 
                // about this in a meaningful way
            } else {

                // We determine the y of the first line
                var ly = (h - both)/2 + y + spl*lines.length;
                var lx = 0;
                for (var j = 0, ly; j < lines.length; ++j, ly+=fh+spl) {
                    // We continue to centralize the lines
                    if(false) {
                        lx = x+w/2-ctx.measureText(lines[j]).width/2;
                    } else {
                        lx = x
                    }
                    
                    // DEBUG 
                    //console.log("ctx2d.fillText('"+ lines[j] +"', "+ lx +", " + ly + ")");
                    ctx.fillText(lines[j], lx, ly);
                }
            }
        } else {
        // Do something meaningful
        }
    }

   

}).call(klip);

