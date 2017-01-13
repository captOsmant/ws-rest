/**
 * Created by CaptainOsmant on 12.01.2017.
 */
    // DUMP for 26.02.2015
    //28-07: fixed error with _.new + outerHTML in putAfter
    //20-08: All named events were made multiple with help of .event method.


RT = new Object();

RT = {

    all: function(selector){
        if (typeof selector !="string") return _.RT(selector);
        return $(selector);
    }

    ,$: function(selector){
        if (typeof selector !="string") return _.RT(selector);
        return new Core(document.querySelectorAll(selector), selector)
    }

    //@Core at: string attribute[, int|Array index]
    //@Осуществляет выборку по селектору selector и возвращает только те элементы, которые по счету находятся в позиции index в выборке.
    ,at: function(selector, index){

        if (typeof selector !="string") try {return new Core(selector[index]);}catch(e){return null;}

        if (index+0 == index)
            return new Core(document.querySelectorAll(selector)[index], selector)

        if(Array.isArray(index)){
            var res = new Array();
            var items = document.querySelectorAll(selector);
            for(i=0; i<index.length; i++)
                res.push(items[index[i]]);
            return new Core(res,selector);
        }

        return new Core(document.querySelectorAll(selector));

    }

    ,first: function(selector){
        if (typeof selector !="string") try {return new Core(selector[0]);}catch(e){return null;}
        return new Core(document.querySelectorAll(selector)[0], selector)
    }

    ,last: function(selector){
        if (typeof selector !="string") try {return new Core(selector[selector.length-1]);}catch(e){return null;}
        var arr = document.querySelectorAll(selector);
        return new Core(arr[arr.length-1], selector);
    }

    ,core: function(f){
        (new Core(document)).event("DOMContentLoaded",f);

    }

    //@Core RT: DOMElement | Array elements
    //@Создает ядро из переданных в метод DOM-элементов
    ,RT : function(el){
        if (Array.isArray(el))
            return new Core(el)
        return new Core([el])
    }

    //@Core new: string tagName [, Object Attributes [, string Content [, int amount]]]
    //@Создает ядро из новых элементов tagName с атрибутами attributes, содержимым content в количестве amount(или один)
    ,new: function(t,a,c,i){

        create = function(){
            var el = document.createElement(t);
            if (typeof a =="object"){
                for (var attr in a)
                    el.setAttribute(attr,a[attr]);
            }
            if (c) {el.innerHTML = c; el.value = c;}
            return el;
        }

        var C = new Array();
        if(i) for (var j=0; j<i; j++) C.push(create());
        else C.push(create());
        return new Core(C);

    }

    //@Geo: статический объект, хранящий методы работы с геолокацией
    ,Geo:{

        //@undefined Geo.get: Function onSuccess, Function onError, Object data
        //@Пытается получить доступ к геолокации устройства пользователя. При успешном получении вызывает функцию onSuccess, при ошибке - onError. Объект data содержит дополнительные параметры доступа к данным геолокации: {bool enableHighAccuracy, int timeout, int maximumAge}
        get: function(f,e,d){
            if (typeof e != "function") e=function(){};
            return navigator.geolocation.getCurrentPosition(f,e,d);
        }

        //int Geo.watch: Function onSuccess, Function onError, Object data
        //Периодически получает данные о геопозиции и при смене позиции вызывает функцию onSuccess, при ошибке - onError. Возвращает идентификатор наблюдателя.
        ,watch: function(f,e,d){
            if (typeof e != "function") e=function(){};
            return navigator.geolocation.watchPosition(f,e,d);
        }

        //undefined Geo.unwatch: int id
        //Останавливает прослушку геопозиции наблюдателем с идентификатором id
        ,unwatch: function(i){
            clearWatch(i);
        }
    }

    ,Visibility:{

        visible: function(){
            if ( document.hidden||document.msHidden || document.webKitHidden)
                return true;
            return false;
        }

        ,change: function(f){
            _.RT([document]).event("msvisibilitychange", f);
            _.RT([document]).event("mozvisibilitychange", f);
            _.RT([document]).event("webkitvisibilitychange", f);
            _.RT([document]).event("visibilitychange", f);
        }


    }

    ,Templates: {
        items:[]
        ,add: function(elem){
            el = _.$("#"+elem);
            if (this.items[elem]!=undefined) {
                return false;
            }
            if(!el.length){
                console.error("No such template found: "+elem);
                return;
            }
            this.items[el.attr("id")] = el.HTML();
            el.remove();
        }

        ,apply: function(tpl, data){

            tpl = this.items[tpl];

            var result = "";
            for (var i in data){
                var tp = tpl;
                for (var j in data[i]){
                    try{
                        tp = tp.split("{{"+j+"}}").join(data[i][j].toString().replace(/"/gi,"'"));

                    }catch(e){
                        console.error(data[i], j, data[i][j]);
                    }

                }
                result+=tp;
            }
            return result;
        }

    }

    ,postJSON: function(path, data, onSuccess, onError, onFatal){
        _.new("div").post(path, data, function(r){
            var d;
            try{
                d = JSON.parse(r);
            }catch(e){
                return onFatal(r);
            }

            if(!d,status) return onFatal(r);

            if(d.status.toUpperCase()=="OK"){
                return onSuccess(d.data);
            }

            if(d.status.toUpperCase()=="ERROR"){
                return onError(d.message);
            }

            return onFatal(d);

        })
    }


    ,Environment: new Object()

    //[!]
    ,launchEnvironment: function(){

        _.ELauncher = window.setInterval(function(){

            for (item in _.Environment){
                _.$("[core-var='"+item+"']").HTML(_.Environment[item]);
            }
        },100)

        handler = function(){
            RT.Environment[_.RT([this]).attr("core-controller")] = _.RT([this]).value();
        }
        _.$("[core-controller]").keyup(handler).keydown(handler).change(handler).blur(handler).focus(handler);


    }
    //[!]
    ,stopEnvironment: function(){
        window.clearInterval(_.ELauncher);
    }
    /*
     ███████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████_Методы_ядра_Core_█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

    //Методы ядра
    ,Core:{

        alert: {
            value: function(v){alert(v);},
            configurable: false,

        }

        /*
         ██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████Методы_ядра_для_манипуляции_объектами_ядра██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

        //@Core forEach: Function handler, bool noCore
        //@Проходит по всему вызывающему ядру и применяет функцию handler к каждому его элементу, передавая в нее ядро, состоящее из этого элемента, и его индекс в списке. Если noCore задано true, то в handler будет передаваться сам DOM-элемент.
        ,forEach: {

            value: function(f,c){
                for (var i=0; i<this.length; i++)
                    c ? f.call(this[i],this[i],i) : f.call(_.RT(this[i]),_.RT(this[i]),i);
                return this;
            }
        }


        ,map:{

            value: function(f,c){
                var r = new Array();
                this.forEach(function(){r.push(f.call(this,this))},c);
                return r;
            }
        }
        /*██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████Методы_ядра_для_манипуляции_HTML_и_текстом_напрямую████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

        //@HTML: [string val]
        //@Возвращает конкатенкацию внутреннего HTML каждого элемента Core с разделителем splitter. Если задано значение val, то переопределяет innerHTML каждого элемента в коллекции и возвращает ссылку на ядро.
        ,HTML: {

            value: function(v){
                if (v||(v==="")){
                    for (var i=0; i<this.length; i++){
                        if(this[i]) this[i].innerHTML=v;
                    }
                    return this;
                }
                var s="";
                for (var i=0; i<this.length; i++){
                    s+=this[i].innerHTML;
                }
                return s;
            }
        }

        //@appendHTML: [string val]
        //@Добавляет в конец к каждому элементу из ядра переданный в функцию HTML-код.
        ,appendHTML: {

            value: function(v){
                if (v)
                    for (var i=0; i<this.length; i++)
                        this[i].innerHTML+=v;
                return this;
            }
        }


        //@appendHTML: [string val]
        //@Добавляет в начало к каждому элементу из ядра переданный в функцию HTML-код.
        ,prependHTML: {

            value: function(v){
                if (v)
                    for (var i=0; i<this.length; i++)
                        this[i].innerHTML=v+this[i].innerHTML;
                return this;
            }
        }

        //@string appendHTML: [bool toArray]
        //@Возвращает текстовый контент всех элементов в виде  строки. Если параметр равен true, то вернется массив.
        ,text: {

            value: function(t){
                if (t===true){
                    s = new Array();
                    for (var i=0; i<this.length; i++) s.push(this[i].textContent);
                }else{
                    var s="";
                    for (var i=0; i<this.length; i++)
                        s+=this[i].textContent;
                }
                return s;
            }
        }

        //@[С] string|Core val [= string value]
        //@Свойство. При записи перезаписывает value у всех элементов ядра. При чтении возвращает конкатенкацию значений.
        ,val: {

            get: function(){
                var s="";
                for (var i=0; i<this.length; i++){
                    if(this[i].value)
                        s+=this[i].value;
                }
                return s;
            },

            set: function(v){
                for (var i=0; i<this.length; i++)
                    this[i].value=v;
                return this;
            }
        }

        //@string|Core value: [string val]
        //@Функциональная deprecated-реализация свойства value
        ,value: {
            value: function(v){
                if (v) this.val = v;
                else return this.val;
            }
        }

        /*██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████Методы_ядра_для_манипуляции_с_DOM_классами_элементов_ядра████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

        //@Core addClass: string className
        //@Добавляет каждому из элементов ядра класс className
        ,addClass:{

            value: function(c){
                for (var i=0; i<this.length; i++)
                    if(!this[i].classList.contains(c))
                        this[i].classList.add(c);
                return this;
            }
        }

        //@Core removeClass: string className
        //@Удаляет из каждого из  элементов ядра класс className
        ,removeClass: {

            value: function(c){
                for (var i=0; i<this.length; i++)
                    if(this[i].classList.contains(c))
                        this[i].classList.remove(c);
                return this;
            }
        }

        //@Core toogleClass: string className
        //@Переключает каждому из элементов ядра класс className
        ,toggleClass: {

            value: function(c){
                for (var i=0; i<this.length; i++)
                    this[i].classList.toggle(c);
                return this;
            }
        }

        ,hasClass: {

            value: function(c){
                return this[0].classList.contains(c);
            }
        }

        /*
         ██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████Методы_ядра_для_манипуляции_с_DOM_атрибутами_элементов_ядра█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

        //@Core|string attr: string attribute[, string value]
        //@Переопределяет атрибут attribute значением value или возвращает текущее значение атрибута, если value не задано
        ,attr:{

            value: function(a,v){
                if (v!==undefined){
                    for (var i=0; i<this.length; i++)
                        this[i].setAttribute(a, v);
                    return this;
                }else
                    return this[0].getAttribute(a);

            }
        }

        //@Core|string data: string attribute[, string value]
        //@Переопределяет атрибут data-attribute значением value или возвращает текущее значение атрибута, если value не задано
        ,data:{
            value: function(a, v){
                if(v!==undefined){
                    this.attr("data-"+a,v);
                    return this;
                }else
                    return this.attr("data-"+a);
            }
        }

        //@Core removeAttr: string attribute
        //@Удаляет атрибут attribute у всех элементов ядра
        ,removeAttr:{

            value: function(a){
                if (a!=undefined)
                    for (var i=0; i<this.length; i++)
                        if(this[i].hasAttribute(a)) this[i].removeAttribute(a);
                return this;

            }
        }

        ,removeAttribute:{

            value: function(a){
                if (a!=undefined)
                    for (var i=0; i<this.length; i++)
                        if(this[i].hasAttribute(a)) this[i].removeAttribute(a);
                return this;

            }
        }

        /*
         ██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████Методы_ядра_для_ориентирования_в_DOM_на_основе_ядра█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

        //@Core find: string selector
        //@Отыскивает все элементы, подпадающие под селектор selector и являющиеся потомком какого-либо из элементов Core, возвращает новое ядро, составленное из этих элементов.
        ,find:{

            value: function(s){
                var res = new Array();
                for(var i=0; i<this.length; i++){
                    t = this[i].querySelectorAll(s);
                    for(var j=0; j<t.length; res.push(t[j++]));
                }
                return new Core(res);
            }
        }

        //@Core parent: [int nest]
        //@Составляет ядро из потомков уровня nest каждого элемента текущего ядра. Если nest не указан. то в ядро будут добавлены прямые потомки каждого из элементов текущего ядра.
        ,parent:{

            value: function(d){
                if(!d)d=1;
                var res = new Array();
                for(var i=0; i<this.length; i++){
                    var t = this[i];
                    for(var j=0; j<d; j++) t = t.parentNode;
                    res.push(t);
                }
                return new Core(res);
            }
        }

        //@Core children:
        //@Составляет ядро, в которое входят прямые потомки каждого из элементов вызывающего ядра.
        ,children: {
            value: function(){
                var res = new Array();
                for(var i=0; i<this.length; i++){
                    t = this[i].children;
                    for(var j=0; j<t.length; res.push(t[j++]));
                }
                return new Core(res);
            }

        }



        /*
         ██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████Методы_ядра_для_обработки_событий███████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

        //@Core event: string event, Function func
        //@Создает для каждого элемента в Core обработчик func события event. Кроссбраузерная реализация.
        ,event: {

            value: function(e, f){
                for (i=0; i<this.length; i++)
                {
                    var item = this[i];
                    if (item.addEventListener){
                        item.addEventListener(e, f, false);
                    }
                    else if (document.attachEvent){
                        item.attachEvent("on"+e, f);
                    }
                    else {
                        item["on"+event] = f;
                    }
                }
                return this;
            }
        }

        ,unevent: {
            value: function(e, f){
                for (i=0; i<this.length; i++)
                {
                    var item = this[i];
                    if (item.addEventListener){
                        item.removeEventListener(e, f, false);
                    }
                    else if (document.attachEvent){
                        item.detachEvent("on"+e, f);
                    }
                    else {
                        item["on"+event] = f;
                    }
                }
                return this;
            }

        }

        //События клика мыши
        ,click: { value: function(f){return this.event("click",f);}}
        ,dblclick: { value: function(f){return this.event("dblclick",f);}}
        ,mousedown: { value: function(f){return this.event("mousedown",f);}}
        ,mouseup: { value: function(f){return this.event("mouseup",f);}}
        ,mouseclick: { value: function(f1, f2){this.event("mousedown",f1); return this.event("mouseup",f2s);}}

        //События мыши
        ,mouseover: { value: function(f){return this.event("mouseover",f);}}
        ,mouseenter: { value: function(f){return this.event("mouseenter",f);}}
        ,mouseout: { value: function(f){return this.event("mouseout",f);}}
        ,mouseleave: { value: function(f){return this.event("mouseout",f);}}
        ,mousemove: { value: function(f){return this.event("mousemove",f);}}
        ,mouse: { value: function(f1,f2){this.event("mouseover",f1); return this.event("mouseout",f2)}}
        ,mousewheel: { value: function(f){return this.event("mousewheel",f);}}

        //События клавиатуры
        ,keydown: { value: function(f){return this.event("keydown",f);}}
        ,keypress: { value: function(f){return this.event("keypress",f);}}
        ,keyup: { value: function(f){return this.event("keyup",f);}}
        ,key: { value: function(f1,f2){this.event("keydown",f1); return this.event("keyup",f2);}}

        //События элементов интерфейса
        ,blur: { value: function(f){return this.event("blur",f);}}
        ,focus: { value: function(f){return this.event("focus",f);}}
        ,select: { value: function(f){return this.event("select",f);}}
        ,submit: { value: function(f){return this.event("submit",f);}}
        ,change: { value: function(f){return this.event("change",f);}}
        ,resize: { value: function(f){return this.event("resize",f);}}
        ,scroll: { value: function(f){return this.event("scroll",f);}}
        ,textInput: { value: function(f){return this.event("textInput",f);}}
        ,contextmenu: { value: function(f){return this.event("contextmenu",f);}}

        //События загрузки
        ,error: { value: function(f){return this.event("error",f);}}
        ,load: { value: function(f){return this.event("load",f);}}
        ,unload: { value: function(f){return this.event("unload",f);}}
        ,beforeunload: { value: function(f){return this.event("beforeunload",f);}}
        ,contentLoaded: { value: function(f){return this.event("DOMContentLoaded",f);}}
        ,readystatechange: { value: function(f){return this.event("readystatechange",f);}}
        ,pageshow: { value: function(f){return this.event("pageshow",f);}}
        ,pagehide: { value: function(f){return this.event("pagehide",f);}}
        ,hashchange:{ value: function(f){return this.event("hashchange",f);}}

        //События изменения DOM-структуры
        ,subtreeModified: { value: function(f){return this.event("DOMSubtreeModified",f);}}
        ,nodeInserted: { value: function(f){return this.event("DOMNodeInserted",f);}}
        ,nodeRemoved: { value: function(f){return this.event("DOMNodeRemoved",f);}}

        //События для гаджетов
        ,deviceorientation: { value: function(f){return this.event("deviceorientation",f);}}
        ,devicemotion: { value: function(f){return this.event("devicemotion",f);}}
        ,touchstart: { value: function(f){return this.event("touchstart",f);}}
        ,touchmove: { value: function(f){return this.event("touchmove",f);}}
        ,touchend: { value: function(f){return this.event("touchend",f);}}
        ,touchcancel: { value: function(f){return this.event("touchcancel",f);}}

        /*
         ██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████Методы_ядра_для_управления_стилями██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

        ,style: {

            value: function(a,v){

                if (typeof a == "string")
                    if(typeof v == "string")
                        this.forEach(function(e,i){e.style.cssText+=a+":"+v;},true)
                    else
                        return window.getComputedStyle(this[0],null).getPropertyValue(a);
                else
                if (typeof a == "object"){
                    var cst = "";
                    for(var i in a) cst+=i+":"+a[i]+";";
                    this.forEach(function(e,i){e.style.cssText+=cst;},true)
                }else
                if(!a){
                    return window.getComputedStyle(this[0],null);
                }
                return this;
            }
        }

        ,background: {value: function(v){return this.style("background",v)}}
        ,backgroundAttachment: {value: function(v){return this.style("background-attachment",v)}}
        ,backgroundClip: {value: function(v){return this.style("background-clip",v)}}
        ,backgroundColor: {value: function(v){return this.style("background-color",v)}}
        ,backgroundImage: {value: function(v){return this.style("background-image",v)}}
        ,backgroundOrigin: {value: function(v){return this.style("background-origin",v)}}
        ,backgroundPosition: {value: function(v){return this.style("background-position",v)}}
        ,backgroundPositionX: {value: function(v){return this.style("background-position-x",v)}}
        ,backgroundPositionY: {value: function(v){return this.style("background-position-y",v)}}
        ,backgroundRepeat: {value: function(v){return this.style("background-repeat",v)}}
        ,backgroundRepeatX: {value: function(v){return this.style("background-repeat-x",v)}}
        ,backgroundRepeatY: {value: function(v){return this.style("background-repeat-y",v)}}
        ,backgroundSize: {value: function(v){return this.style("background-size",v)}}
        ,baselineShift: {value: function(v){return this.style("baseline-shift",v)}}
        ,border: {value: function(v){return this.style("border",v)}}
        ,borderBottom: {value: function(v){return this.style("border-bottom",v)}}
        ,borderBottomColor: {value: function(v){return this.style("border-bottom-color",v)}}
        ,borderBottomLeftRadius: {value: function(v){return this.style("border-bottom-left-radius",v)}}
        ,borderBottomRightRadius: {value: function(v){return this.style("border-bottom-right-radius",v)}}
        ,borderBottomStyle: {value: function(v){return this.style("border-bottom-style",v)}}
        ,borderBottomWidth: {value: function(v){return this.style("border-bottom-width",v)}}
        ,borderCollapse: {value: function(v){return this.style("border-collapse",v)}}
        ,borderColor: {value: function(v){return this.style("border-color",v)}}
        ,borderImage: {value: function(v){return this.style("border-image",v)}}
        ,borderImageOutset: {value: function(v){return this.style("border-image-outset",v)}}
        ,borderImageRepeat: {value: function(v){return this.style("border-image-repeat",v)}}
        ,borderImageSlice: {value: function(v){return this.style("border-image-slice",v)}}
        ,borderImageSource: {value: function(v){return this.style("border-image-source",v)}}
        ,borderImageWidth: {value: function(v){return this.style("border-image-width",v)}}
        ,borderLeft: {value: function(v){return this.style("border-left",v)}}
        ,borderLeftColor: {value: function(v){return this.style("border-left-color",v)}}
        ,borderLeftStyle: {value: function(v){return this.style("border-left-style",v)}}
        ,borderLeftWidth: {value: function(v){return this.style("border-left-width",v)}}
        ,borderRadius: {value: function(v){return this.style("border-radius",v)}}
        ,borderRight: {value: function(v){return this.style("border-right",v)}}
        ,borderRightColor: {value: function(v){return this.style("border-right-color",v)}}
        ,borderRightStyle: {value: function(v){return this.style("border-right-style",v)}}
        ,borderRightWidth: {value: function(v){return this.style("border-right-width",v)}}
        ,borderSpacing: {value: function(v){return this.style("border-spacing",v)}}
        ,borderStyle: {value: function(v){return this.style("border-style",v)}}
        ,borderTop: {value: function(v){return this.style("border-top",v)}}
        ,borderTopColor: {value: function(v){return this.style("border-top-color",v)}}
        ,borderTopLeftRadius: {value: function(v){return this.style("border-top-left-radius",v)}}
        ,borderTopRightRadius: {value: function(v){return this.style("border-top-right-radius",v)}}
        ,borderTopStyle: {value: function(v){return this.style("border-top-style",v)}}
        ,borderTopWidth: {value: function(v){return this.style("border-top-width",v)}}
        ,borderWidth: {value: function(v){return this.style("border-width",v)}}
        ,bottom: {value: function(v){return this.style("bottom",v)}}
        ,boxShadow: {value: function(v){return this.style("box-shadow",v)}}
        ,boxSizing: {value: function(v){return this.style("box-sizing",v)}}
        ,captionSide: {value: function(v){return this.style("caption-side",v)}}
        ,clear: {value: function(v){return this.style("clear",v)}}
        ,clip: {value: function(v){return this.style("clip",v)}}
        ,clipPath: {value: function(v){return this.style("clip-path",v)}}
        ,clipRule: {value: function(v){return this.style("clip-rule",v)}}
        ,color: {value: function(v){return this.style("color",v)}}
        ,colorInterpolation: {value: function(v){return this.style("color-interpolation",v)}}
        ,colorInterpolationFilters: {value: function(v){return this.style("color-interpolation-filters",v)}}
        ,colorProfile: {value: function(v){return this.style("color-profile",v)}}
        ,colorRendering: {value: function(v){return this.style("color-rendering",v)}}
        ,content: {value: function(v){return this.style("content",v)}}
        ,counterIncrement: {value: function(v){return this.style("counter-increment",v)}}
        ,counterReset: {value: function(v){return this.style("counter-reset",v)}}
        ,cursor: {value: function(v){return this.style("cursor",v)}}
        ,direction: {value: function(v){return this.style("direction",v)}}
        ,display: {value: function(v){return this.style("display",v)}}
        ,dominantBaseline: {value: function(v){return this.style("dominant-baseline",v)}}
        ,emptyCells: {value: function(v){return this.style("empty-cells",v)}}
        ,enableBackground: {value: function(v){return this.style("enable-background",v)}}
        ,fill: {value: function(v){return this.style("fill",v)}}
        ,fillOpacity: {value: function(v){return this.style("fill-opacity",v)}}
        ,fillRule: {value: function(v){return this.style("fill-rule",v)}}
        ,filter: {value: function(v){return this.style("filter",v)}}
        ,float: {value: function(v){return this.style("float",v)}}
        ,floodColor: {value: function(v){return this.style("flood-color",v)}}
        ,floodOpacity: {value: function(v){return this.style("flood-opacity",v)}}
        ,font: {value: function(v){return this.style("font",v)}}
        ,fontFamily: {value: function(v){return this.style("font-family",v)}}
        ,fontSize: {value: function(v){return this.style("font-size",v)}}
        ,fontStretch: {value: function(v){return this.style("font-stretch",v)}}
        ,fontStyle: {value: function(v){return this.style("font-style",v)}}
        ,fontVariant: {value: function(v){return this.style("font-variant",v)}}
        ,fontWeight: {value: function(v){return this.style("font-weight",v)}}
        ,glyphOrientationHorizontal: {value: function(v){return this.style("glyph-orientation-horizontal",v)}}
        ,glyphOrientationVertical: {value: function(v){return this.style("glyph-orientation-vertical",v)}}
        ,height: {value: function(v){return this.style("height",v)}}
        ,imageRendering: {value: function(v){return this.style("image-rendering",v)}}
        ,kerning: {value: function(v){return this.style("kerning",v)}}
        ,left: {value: function(v){return this.style("left",v)}}
        ,letterSpacing: {value: function(v){return this.style("letter-spacing",v)}}
        ,lightingColor: {value: function(v){return this.style("lightning-color",v)}}
        ,lineHeight: {value: function(v){return this.style("line-height",v)}}
        ,listStyle: {value: function(v){return this.style("list-style",v)}}
        ,listStyleImage: {value: function(v){return this.style("list-style-image",v)}}
        ,listStylePosition: {value: function(v){return this.style("list-style-position",v)}}
        ,listStyleType: {value: function(v){return this.style("list-style-type",v)}}
        ,margin: {value: function(v){return this.style("margin",v)}}
        ,marginBottom: {value: function(v){return this.style("margin-bottom",v)}}
        ,marginLeft: {value: function(v){return this.style("margin-left",v)}}
        ,marginRight: {value: function(v){return this.style("margin-right",v)}}
        ,marginTop: {value: function(v){return this.style("margin-top",v)}}
        ,marker: {value: function(v){return this.style("marker",v)}}
        ,markerEnd: {value: function(v){return this.style("marker-end",v)}}
        ,markerMid: {value: function(v){return this.style("marker-mid",v)}}
        ,markerStart: {value: function(v){return this.style("marker-start",v)}}
        ,mask: {value: function(v){return this.style("mask",v)}}
        ,maskType: {value: function(v){return this.style("mask-type",v)}}
        ,maxHeight: {value: function(v){return this.style("max-height",v)}}
        ,maxWidth: {value: function(v){return this.style("max-width",v)}}
        ,minHeight: {value: function(v){return this.style("min-height",v)}}
        ,minWidth: {value: function(v){return this.style("min-width",v)}}
        ,opacity: {value: function(v){return this.style("opacity",v)}}
        ,orphans: {value: function(v){return this.style("orphans",v)}}
        ,outline: {value: function(v){return this.style("outline",v)}}
        ,outlineColor: {value: function(v){return this.style("outline-color",v)}}
        ,outlineOffset: {value: function(v){return this.style("outline-offset",v)}}
        ,outlineStyle: {value: function(v){return this.style("outline-style",v)}}
        ,outlineWidth: {value: function(v){return this.style("outline-width",v)}}
        ,overflow: {value: function(v){return this.style("overflow",v)}}
        ,overflowWrap: {value: function(v){return this.style("overflow-wrap",v)}}
        ,overflowX: {value: function(v){return this.style("overflow-x",v)}}
        ,overflowY: {value: function(v){return this.style("overflow-y",v)}}
        ,padding: {value: function(v){return this.style("padding",v)}}
        ,paddingBottom: {value: function(v){return this.style("padding-bottom",v)}}
        ,paddingLeft: {value: function(v){return this.style("padding-left",v)}}
        ,paddingRight: {value: function(v){return this.style("padding-right",v)}}
        ,paddingTop: {value: function(v){return this.style("padding-tio",v)}}
        ,page: {value: function(v){return this.style("page",v)}}
        ,pageBreakAfter: {value: function(v){return this.style("page-break-after",v)}}
        ,pageBreakBefore: {value: function(v){return this.style("page-break-before",v)}}
        ,pageBreakInside: {value: function(v){return this.style("page-break-inside",v)}}
        ,parentRule: {value: function(v){return this.style("parent-rule",v)}}
        ,pointerEvents: {value: function(v){return this.style("pointer-events",v)}}
        ,position: {value: function(v){return this.style("position",v)}}
        ,quotes: {value: function(v){return this.style("quotes",v)}}
        ,resize: {value: function(v){return this.style("resize",v)}}
        ,right: {value: function(v){return this.style("right",v)}}
        ,shapeRendering: {value: function(v){return this.style("shape-rendering",v)}}
        ,size: {value: function(v){return this.style("size",v)}}
        ,speak: {value: function(v){return this.style("speak",v)}}
        ,src: {value: function(v){return this.style("src",v)}}
        ,stopColor: {value: function(v){return this.style("stop-color",v)}}
        ,stopOpacity: {value: function(v){return this.style("stop-opacity",v)}}
        ,stroke: {value: function(v){return this.style("stroke",v)}}
        ,strokeDasharray: {value: function(v){return this.style("stroke-dasharray",v)}}
        ,strokeDashoffset: {value: function(v){return this.style("stroke-dashoffset",v)}}
        ,strokeLinecap: {value: function(v){return this.style("stroke-linecap",v)}}
        ,strokeLinejoin: {value: function(v){return this.style("stroke-linejoin",v)}}
        ,strokeMiterlimit: {value: function(v){return this.style("stroke-miterlimit",v)}}
        ,strokeOpacity: {value: function(v){return this.style("stroke-opacity",v)}}
        ,strokeWidth: {value: function(v){return this.style("stroke-width",v)}}
        ,tabSize: {value: function(v){return this.style("tab-size",v)}}
        ,tableLayout: {value: function(v){return this.style("table-layout",v)}}
        ,textAlign: {value: function(v){return this.style("text-align",v)}}
        ,textAnchor: {value: function(v){return this.style("text-anchor",v)}}
        ,textDecoration: {value: function(v){return this.style("text-decoration",v)}}
        ,textIndent: {value: function(v){return this.style("text-indent",v)}}
        ,textLineThrough: {value: function(v){return this.style("text-line-through",v)}}
        ,textLineThroughColor: {value: function(v){return this.style("text-line-through-color",v)}}
        ,textLineThroughMode: {value: function(v){return this.style("text-line-through-mode",v)}}
        ,textLineThroughStyle: {value: function(v){return this.style("text-line-through-style",v)}}
        ,textLineThroughWidth: {value: function(v){return this.style("text-line-through-width",v)}}
        ,textOverflow: {value: function(v){return this.style("text-overflow",v)}}
        ,textOverline: {value: function(v){return this.style("text-overline",v)}}
        ,textOverlineColor: {value: function(v){return this.style("text-overline-color",v)}}
        ,textOverlineMode: {value: function(v){return this.style("text-overline-mode",v)}}
        ,textOverlineStyle: {value: function(v){return this.style("text-overline-style",v)}}
        ,textOverlineWidth: {value: function(v){return this.style("text-overline-width",v)}}
        ,textRendering: {value: function(v){return this.style("text-rendering",v)}}
        ,textShadow: {value: function(v){return this.style("text-shadow",v)}}
        ,textTransform: {value: function(v){return this.style("text-transform",v)}}
        ,textUnderline: {value: function(v){return this.style("text-underline",v)}}
        ,textUnderlineColor: {value: function(v){return this.style("text-underline-color",v)}}
        ,textUnderlineMode: {value: function(v){return this.style("text-underline-mode",v)}}
        ,textUnderlineStyle: {value: function(v){return this.style("text-underline-style",v)}}
        ,textUnderlineWidth: {value: function(v){return this.style("text-underline-width",v)}}
        ,top: {value: function(v){return this.style("top",v)}}
        ,transition: {value: function(v){
            this.style("-webkit-transition",v);
            this.style("-moz-transition",v);
            this.style("-o-transition",v);
            this.style("-ms-transition",v);
            this.style("-khtml-transition",v)
            return this.style("transition",v)}
        }
        ,transitionDelay: {value: function(v){return this.style("transition-delay",v)}}
        ,transitionDuration: {value: function(v){return this.style("transition-duratin",v)}}
        ,transitionProperty: {value: function(v){return this.style("transition-property",v)}}
        ,transitionTimingFunction: {value: function(v){return this.style("transition-timing-function",v)}}
        ,transform: {value: function(v){
            this.style("-webkit-transform",v);
            this.style("-moz-transform",v);
            this.style("-o-transform",v);
            this.style("-ms-transform",v);
            this.style("-khtml-transform",v)
            return this.style("transform",v)}
        }
        ,unicodeBidi: {value: function(v){return this.style("unicode-bidi",v)}}
        ,unicodeRange: {value: function(v){return this.style("unicode-range",v)}}
        ,vectorEffect: {value: function(v){return this.style("vector-effect",v)}}
        ,verticalAlign: {value: function(v){return this.style("vertical-align",v)}}
        ,visibility: {value: function(v){return this.style("visibility",v)}}
        ,whiteSpace: {value: function(v){return this.style("white-space",v)}}
        ,widows: {value: function(v){return this.style("widows",v)}}
        ,width: {value: function(v){return this.style("width",v)}}
        ,wordBreak: {value: function(v){return this.style("word-break",v)}}
        ,wordSpacing: {value: function(v){return this.style("word-spacing",v)}}
        ,wordWrap: {value: function(v){return this.style("word-wrap",v)}}
        ,writingMode: {value: function(v){return this.style("writing-mode",v)}}
        ,zIndex: {value: function(v){return this.style("z-index",v)}}
        ,zoom: {value: function(v){return this.style("zoom",v)}}


        //@Core size: [bool cssvalue, [bool all]]
        //@Возвращает объект, содержащий линейные размеры первого элемента ядра. Если параметр cssvalue задан как true, возвращает в единицах измерения px в строковом формате. Если второй параметр задан как true, возвращает массив с размерами для каждого элемента из ядра.
        ,size:{
            value: function(c,a){

                if(!a){
                    if(!c) return {width: _.RT(this[0]).width().match(/[\d\.]*/)*1,height: _.RT(this[0]).height().match(/[\d\.]*/)*1}
                    return {width: _.RT(this[0]).width(), height: _.RT(this[0]).height()}
                }
                var sizes = new Array();
                this.forEach(function(e,i){
                    if(c) sizes.push({width: e.width(),height: e.height()});
                    else sizes.push( {width: e.width().match(/[\d\.]*/)*1, height: e.height().match(/[\d\.]*/)*1});
                });
                return sizes;
            }
        }


        //@Core clearStyle: [string property]
        //@Убирает от каждого элемента ядра css-свойство property. Если не задано, очищает весь inline-стиль и стиль, заданный через js
        ,clearStyle:{

            value: function(a){
                if(a)
                    this.style(a,"initial")
                else
                    this.forEach(function(e){e.style.cssText="";},true)
                return this;
            }
        }

        /*
         ██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████Методы_ядра_для_осуществления_AJAX_запросов█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

        //@Core load: string path, [string method [, Object data [, Function callback]]]
        //@Создает и запускает AjAX-запрос на файл path методом method, отправляя на сервер данные data. После загрузки ответ выводит в HTML каждого элемента ядра и запускает функцию callback, передавая ей в качестве параметра ответ.
        ,load:{

            value: function(p, m, d, f){
                if (!m) m='GET';
                if(typeof m!="string") m='GET';
                if (m.toUpperCase()=="GET") m="GET"; else m="POST";
                var params = "";

                if (d)
                    if (typeof d !== "object") params="param="+encodeURIComponent(d); else{
                        for (var i in d) params+=encodeURIComponent(i)+"="+encodeURIComponent(d[i])+"&";
                    }

                var Request = new XMLHttpRequest();
                var Tmp = this;

                var callHandle = function(s){ if (f) f(s); }

                Request.onreadystatechange = function(){
                    if (Request.readyState == 4) {
                        if(Request.status == 200) {
                            Tmp.HTML(Request.responseText);
                            callHandle(Request.responseText);
                        }
                    }
                }
                if (m=="GET") {
                    Request.open("GET", p+"?"+params, true);
                    Request.send(null);
                }else{
                    Request.open("POST", p, true);
                    Request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    Request.send(params);
                }
                return this;
            }

        }

        //@Core post: string path [, Object data [, Function callback]]
        //@Создает и запускает AjAX-запрос на файл path методом POST, отправляя данные data и вызывая callback-функцию callback
        ,post:{
            value: function(p,d,f){
                return this.load(p,"POST",d,f);
            }
        }

        //@Core get: string path [, Object data [, Function callback]]
        //@Создает и запускает AjAX-запрос на файл path методом GET, отправляя данные data и вызывая callback-функцию callback
        ,get:{
            value: function(p,d,f){
                return this.load(p,"GET",d,f);
            }
        }

        //@[!]Core connection: string path [, string methog[, Object data [, Function proceed, [Function callback]]]
        //@Устанавливает AJAX Comet-соединение с теми же параметрами, что метод load. Функция proceed вызывается всякий раз при получении новой порции данных, в нее передаются новые данные. callback вызывается по закрытии соединения.
        ,connection:{
            value: function(p,m,d,fp,fc){
                if (!m) m='GET';
                if(typeof m!="string") m='GET';
                if (m.toUpperCase()=="GET") m="GET"; else m="POST";""
                var params = "";

                if (d)
                    if (typeof d !== "object") params="param="+encodeURIComponent(d); else{
                        for (var i in d) params+=encodeURIComponent(i)+"="+encodeURIComponent(d[i])+"&";
                    }
                var Request = new XMLHttpRequest();
                var Tmp = this;
                var received = 0;

                if (m=="GET")
                    Request.open("GET", p+"?"+params, true);
                else
                    Request.open("POST", p, true);

                Request.onprogress = function(){
                    var result = Request.responseText.substr(received);
                    Tmp.HTML(result);
                    fp(result);
                    received = Request.responseText.length;
                }

                Request.onreadystatechange = function(){
                    if (Request.readyState == 4) {
                        if(Request.status == 200) {
                            Tmp.HTML(Request.responseText);
                            fc(Request.responseText);
                        }
                    }
                    console.log(Request.readyState+" "+Request.responseText);
                }
                if (m=="GET") {
                    Request.send(null);
                }else{
                    Request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    Request.send(params);
                }
                return this;
            }
        }

        //@Core fileUpload: string formname, string path [, Object data [, Function callback]]
        //@Создает и запускает AjAX-запрос на файл path методом POST, отправляя файл из input с именем formname, данные data и вызывая callback-функцию callback
        ,fileUpload:{

            value: function(fn, p, d, f){

                var form = _.first("[name='"+fn+"']");
                var formData = form[0].files[0];
                var FD = new FormData();
                FD.append('file', formData);
                var params = "";

                if (d){
                    if (typeof d !== "object") params="param="+encodeURIComponent(d); else{
                        for (var i in d) FD.append(encodeURIComponent(i), encodeURIComponent(d[i]));
                    }
                }
                var Request= new XMLHttpRequest();
                var Temp=this;

                Request.onreadystatechange = function(){
                    if (Request.readyState == 4) {
                        if(Request.status == 200) {
                            Temp.HTML(Request.responseText);
                            f(Request.responseText);
                        }
                    }
                }
                Request.open("POST", p);
                Request.send(FD);

                return this;
            }
        }

        /*
         ██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████Методы_ядра_для_установки_hash_роутеров█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

        //@Core setRouter: string|RegExp hash, Function callback | string path
        //@Создает хэш-роутер. Срабатывает, если при загрузке страницы или во время ее работы хэш страницы изменился на hash, заданный строкой, либо проходит тест на регулярное выражение hash. Если задана функция, она будет вызвана,в качестве параметра ей будет передано ядро, вызвавшее этот метод; в этой же функции this будет указывать на ядро. Если задана строка, то будет вызван метод .get на данном ядре, с адресом path.
        ,setRouter:{

            value: function(h,f){

                var c = this;

                var callback = function(){
                    var hash = location.hash.substring(1);

                    if (typeof h == "string")
                        if(h==hash){
                            if (typeof f == "function") f.call(c,c);
                            if (typeof f == "string") c.get(f,{});
                        }
                    if ((typeof h =="object")||(typeof h == "function"))
                        if (h.test(hash)){
                            if (typeof f == "function")f.call(c,c);
                            if (typeof f == "string") c.get(f,{});
                        }
                }

                _.RT(window).hashchange(
                    function(e){
                        callback();
                    })
                callback();
                return this;

            }
        }

        //@Core router: Object data
        //Принимает объект вида {хэш: путь/функция,..} и применяет к каждой паре метод setRouter на вызвавшем ядре.
        ,router:{
            value: function(o){
                for (var i in o) this.setRouter(i, o[i]);
                return this;
            }
        }

        //@Core setDataRouter: RegExp | string hash, Function callback
        //Создает хэш-роутер аналогично setRouter, за несколькими исключениями. Второй параметр - только функция. В нее передается массив из шагов в хэше после переданного непосредственно в метод. например, вызвав метод с хэшем "/users/" при изменении адреса страницы на  "/users/39410/chat/394101" в callback будет передан массив ["39410","chat","394101"].
        ,setDataRouter:{

            value: function(h,f){
                var c = this;

                var callback = function(){

                    var proceed = function(h){
                        var p = hash.indexOf(h);
                        p = hash.substr(p+h.length);
                        f.call(c,p.split("/"));
                    }

                    var hash = location.hash.substring(1);
                    if (typeof h == "string")
                        if(hash.indexOf(h)!=-1){
                            proceed(h);
                        }
                    if ((typeof h =="object")||(typeof h == "function"))
                        if (h.test(hash)){
                            h = hash.match(h)[0];
                            proceed(h);
                        }
                }

                _.RT(window).hashchange(
                    function(e){
                        callback();
                    })
                callback();
                return this;
            }
        }

        //@Core dataRouter: Object data
        //Принимает объект вида {хэш: путь/функция,..} и применяет к каждой паре метод setDataRouter на вызвавшем ядре.
        ,dataRouter:{
            value: function(o){
                for (var i in o) this.setDataRouter(i, o[i]);
                return this;
            }
        }
        /*
         ██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████Методы_ядра_для_работы_с_DOM█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

        //@Core appendTo: Core target
        //Вставляет копию всех элементов из ядра в конец каждого элемента ядра-аргумента метода.
        ,appendTo:{

            value:function(c){
                var t = this;
                t.forEach(function(el){
                    c.forEach(function(e){

                        e.appendChild(el);

                    },true)
                },true)
                return this;
            }
        }

        //@Core prependTo: Core target
        //Вставляет копию всех элементов из ядра в начало каждого элемента ядра-аргумента метода.
        ,prependTo:{

            value:function(c){
                var t = this;
                t.forEach(function(el){
                    c.forEach(function(e){

                        e.innerHTML=el.outerHTML+e.innerHTML;

                    },true)
                },true)
                return this;
            }
        }

        //@Core putAfter: Core target
        //Вставляет копию элементов из ядра после каждого элемента ядра-аргумента метода.
        ,putAfter:{

            value:function(c){
                var t = this;
                c.forEach(function(e){
                    var o = e.outerHTML;
                    t.forEach(function(el){
                        o+=el.outerHTML;

                    },true)
                    e.outerHTML = o;
                },true)
                return this;
            }
        }

        //@Core putBefore: Core target
        //Вставляет копию элементов из ядра до каждого элемента ядра-аргумента метода.
        ,putBefore:{

            value:function(c){
                var t = this;
                c.forEach(function(e){
                    var o = e.outerHTML;
                    t.forEach(function(el){
                        o = el.outerHTML+o;

                    },true)
                    e.outerHTML = o;
                },true)
                return this;
            }
        }

        //@bool remove:
        //Удаляет все элементы ядра из документа. В случае успеха вернет true, в случае ошибки-false
        ,remove:{

            value:function(w){
                try{
                    if(!w)
                        this.forEach(function(e){e.parentNode.removeChild(e)},true)
                    else
                        this.forEach(function(e){e.outerHTML = e.innerHTML;},true)
                }catch(e){return false;}
                return true;
            }
        }


        //@bCore replace: Core target
        //Замещает каждый элемент ядра-аргумента всеми элементами из ядра, вызвавшего метод. Возвращает оригинальное ядро.
        ,replace:{

            value: function(c){
                var t = this;
                c.forEach(function(e){
                    var o="";
                    t.forEach(function(el){
                        o+=el.outerHTML;

                    },true)
                    e.outerHTML = o;
                },true)
                return this;
            }
        }
        /*
         ██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████Методы_ядра_для_анимации_элементов█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

        ,hide:{

            value: function(i){
                var t = this;
                if(!i) {
                    this.display("none");
                }else{
                    a = function(c,i){
                        var t = this;
                        if (c<i){
                            c+=10;
                            this.opacity((1-c/i)+"");
                            console.log(c/i);
                            window.setTimeout(function(){a.call(t,c,i)},10);
                        }else{
                            this.display("none");
                            this.opacity("initial");
                        }

                    }
                    window.setTimeout(function(){a.call(t,10,i)},10);
                }

                return this;
            }
        }

        ,show:{

            value: function(i){

                this.display("block");
                return this;
            }

        }

        ,hide:{

            value: function(i){
                this.display("none");
                return this;
            }
        }


        //========================================
        //========================================
        //========================================

        ,fromTemplate:{
            value: function(tpl, data){
                return this.HTML(_.Templates.apply(tpl,data));
            }
        }

    }


}


function Core(elements, selector){
    if(!selector) selector="#Object";
    if (elements.length === undefined) elements = [elements];

    var core = elements;

    Object.defineProperties(core, RT.Core)

    core.Container = elements;
    core.Selector = selector;
    return core;
}





_ = RT;
_.E = _.Environment;
_._ = _.Environment;

