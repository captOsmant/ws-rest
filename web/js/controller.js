/**
 * Created by CaptainOsmant on 12.01.2017.
 */
_.core(function(){

    App.init();

})
var App = {
    init: function(){
        App.Map.init();
        App.Cities.init();
        _.Templates.add("placeInfoWindow");
        _.Templates.add("review");
        App.Popups.init();
        App.Login.init();
    }

    ,Data:{
        getJSON: function(p,f,e,d){
            _.new('div').get(p,(d)?d:{},function(r){
                var d;
                try{
                    d = JSON.parse(r);

                }catch(ex){
                    e(r);
                }
                f(d);
            })
        }
        ,postJSON: function(p,f,e,d){
            _.new('div').post(p,(d)?d:{},function(r){
                var d;
                try{
                    d = JSON.parse(r);

                }catch(ex){
                    e(r);
                }
                f(d);
            })
        }

        ,serialize: function(obj) {
            var str = [];
            for(var p in obj)
                if (obj.hasOwnProperty(p)) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
            return str.join("&");
        }

        ,doHead: function(p, d, f){
            var xhr = new XMLHttpRequest();
            var datastr = App.Data.serialize(d);

            xhr.open("HEAD", p+"?"+datastr, true);
            xhr.onload = function(e){
                f(this, e);
            };
            xhr.send(datastr);
        }

        ,doPut: function(p,d,f){
            var xhr = new XMLHttpRequest();
            var datastr = (this.serialize(d));

            console.log(datastr);

            xhr.open("PUT",p+"?"+datastr,true);
            xhr.onload = function(e){
                f(e);
            }
            xhr.send(datastr);
        }

        ,doDelete: function(p, d, f){
            var xhr = new XMLHttpRequest();
            var datastr = this.serialize(d);
            xhr.open("DELETE",p+"?"+datastr,true);
            xhr.onload = function(){
                f(this.responseText);
            }
            xhr.send();
        }


        ,doOptions: function(p, f){
            var xhr = new XMLHttpRequest();
            xhr.open("OPTIONS", p+"?token="+localStorage.token, true);
            xhr.onload = function(e){
                f(this, e.responseText);
            };
            xhr.send();
        }

        ,markers:[]
        ,iw: []
    }

    ,Login:{
        init: function(){
            if(localStorage.token){
                console.info("Checking up token found locally");
                App.Data.doHead("/api/token/", {token: localStorage.token}, function(x,e){

                    var role = x.getResponseHeader("X-Role");
                    if(role*1) {
                        _.E.token = localStorage.token;
                        _.E.name = x.getResponseHeader("X-Username");
                        App.Login.enter();
                    }else{
                        localStorage.removeItem("token");
                        App.Login.init();
                    }
                })
                return;
            }
            _.$("form#admin")[0].addEventListener("submit", function(e){
                e.preventDefault();

                var s = {
                    login : _.$("#login").val
                    ,password : _.$("#password").val
                };
                console.log(s);

                App.Data.doHead("/api/token/",s, function(x, d){

                    var token = x.getResponseHeader("X-Auth-Token");
                    if(token){
                        _.E.token = token;
                        _.E.role = x.getResponseHeader("X-Role");
                        _.E.name = x.getResponseHeader("X-Username");
                        App.Login.enter();
                    }
                });
            })
        }
        ,ROLE_ADMINISTRATOR : 2
        ,ROLE_MODERATOR : 1

        ,enter: function(){
            localStorage.token = _.E.token;
            _.$("#username_label").HTML(_.E.name);
            _.$("header form label").display("none");
            _.$("aside").display("block").opacity("1");

            App.Login.Aside.init();
        }

        ,Aside:{
            init: function(){
                this.Cities.init();
                this.Reviews.init();
                this.Countries.init();

                App.Login.Aside.hideSections();

                var t = this;
                _.$("aside .cities").click(function(){
                    App.Login.Aside.hideSections();
                    t.Cities.open();
                })

                _.$("aside .reviews").click(function(){
                    App.Login.Aside.hideSections();
                    t.Reviews.open();
                })

                _.$("aside .countries").click(function(){
                    App.Login.Aside.hideSections();
                    t.Countries.open();
                })
            }

            ,hideSections: function(){
                _.$("aside section>*").display("none");
            }

            ,Countries: {
                init: function(){
                    _.Templates.add("adminCountry");
                    this.reloadList();
                    this.initForm();
                }

                ,reloadList: function(){
                    App.Data.getJSON("/api/countries/",function(d){
                        console.log(d);
                        _.$("aside .countries .items").fromTemplate("adminCountry", d);
                        App.Login.Aside.Countries.initList();

                    },function(e){
                        console.error(e);
                    },{});
                }

                ,initList: function(){
                    _.$("aside .countries .removeCountry").click(function(e){
                        var id= _.$(this).parent(1).data("id");
                        //alert(id);

                        App.Data.doDelete("/api/countries/",{id:id, token: _.E.token}, function(d){
                            console.log(d);
                            App.Login.Aside.Countries.reloadList();
                        });

                    })
                }

                ,initForm: function(){
                    _.$("#createCountry").click(function(){
                        var s = {
                            name: _.$("#countryName").val
                            ,ru_name: _.$("#countryRuName").val
                            ,code: _.$("#countryCode").val
                            ,token: _.E.token
                        }

                        App.Data.postJSON("/api/countries/",function(d){
                            var text = d.message;


                            _.$("#adminCountryStatus").HTML(text);
                            App.Login.Aside.Countries.reloadList();
                        },function(r){
                            console.error(r);
                        } , s);
                    })
                }

                ,open: function(){
                    _.$("aside section .countries").display("block");
                }
            }

            ,Cities: {
                init: function(){

                }

                ,open: function(){
                    _.$("aside section .cities").display("block");
                }
            }

            ,Reviews: {
                init: function(){

                }

                ,open: function(){
                    _.$("aside section .reviews").display("block");
                }
            }
        }
    }



    ,Map:{
        init:function(){
            var latlng = new google.maps.LatLng(53, 15);
            _.E.map = new google.maps.Map(_.$("#map")[0],{
                zoom: 5
                ,center: latlng
                ,mapTypeId: google.maps.MapTypeId.ROADMAP
            })
        }

        ,startCities: function(){
            _.E.map.setZoom(6);
        }

        ,addCityMarker: function(d){
            var marker = new google.maps.Marker({
                position: {lat: d.lat*1, lng: d.lon*1}
                ,map: _.E.map
                ,title: d.ru_name
                ,icon: "/img/marker.png"
            });
            App.Data.markers.push(marker);

            var infowindow = new google.maps.InfoWindow({
                content: "<div class='infowindow'>" +
                "<hgroup>" +
                "<h3>"+ d.ru_name+"</h3>" +
                "<h4>Население: "+ d.population+"</h4>" +
                "</hgroup>" +
                "<article>" +
                d.description +
                "</article>" +
                "<input type='button' class='details button' value='Войти в город' onclick='App.Cities.open("+ d.id +")'/>" +
                "</div>"
            });

            App.Data.iw.push(infowindow);

            marker.addListener('click',function(){
                App.Map.closeWindows();
                infowindow.open(_.E.map, marker);
            })
        }

        ,closeWindows: function(){
            App.Data.iw.forEach(function (e) {
                e.close();
            })
        }

        ,removeMarkers: function(){
            App.Data.markers.forEach(function(e){
                e.setMap(null);
            })
        }

        ,openCity: function(e){

            App.Map.removeMarkers()
            App.Map.closeWindows();

            console.log(e);

            _.E.map.setZoom(13);
            _.E.map.setCenter({lat: e.lat*1, lng: e.lon*1});
        }

        ,addPlaceMarker: function(d){
            var m = new google.maps.Marker({
                position: {lat: d.lat*1, lng: d.lon*1}
                ,map: _.E.map
                ,icon: "/img/marker.png"
                ,title: d.ru_name
            })

            App.Data.markers.push(m);


            var i = new google.maps.InfoWindow({
                content: _.new("div").fromTemplate("placeInfoWindow",[d]).HTML()
            })
            App.Data.iw.push(i);

            m.addListener('click', function(){
                i.open(_.E.map, m);
            })
        }
    }

    ,Cities:{
        init: function(){
            App.Data.getJSON("/api/cities/",function(d){
                _.E.cities = d;
                App.Map.startCities()
                d.forEach(function(e){
                    console.log(e);
                    App.Map.addCityMarker(e);
                });

            }, function(e){
                console.error(e);
            })
        }

        ,open: function(id){
            var e = App.Cities.findByID(id);
            console.log(e);
            App.Map.openCity(e);
            App.City.init(e);
        }

        ,findByID: function(id){
            return _.E.cities.filter(function(e){ return (e.id==id) })[0];
        }
    }

    ,City: {
        init: function(e){
            _.E.cityData = e;
            App.Data.getJSON("/api/places/",function(d){
                console.log(d);
                _.E.cityData = d;
                d.forEach(function(e){
                    App.Map.addPlaceMarker(e);
                })
            }, function(e){
                console.error(e);
            },{id: e.id});
        }

        ,Reviews:{
            list: function(id){
                App.Data.getJSON("/api/reviews/", function(d){
                    _.$("#reviewList .reviews").fromTemplate("review", d);
                    console.log(d);

                }, function(e){
                    console.error(e)
                },{id:id});

                App.Popups.ReviewList.open(function(){

                    App.Popups.ReviewList.hide();
                })
            }

            ,add: function(id){
                App.Popups.AddReview.open(function(){
                    var s = {
                        name: _.$("#reviewName").val
                        ,content: _.$("#reviewText").val
                        ,mark: _.$("#reviewMark").val
                        ,place: id
                    }
                    App.Data.postJSON("/api/reviews/",function(d){
                        _.$("#reviewStatus").HTML(d.message);
                        console.log(d.message)
                        setTimeout(function(){
                            App.Popups.AddReview.hide();
                            _.$("#reviewStatus").HTML("");
                        }, 1500)
                    },function(e){

                    }, s);
                   // App.Popups.AddReview.hide()
                })
            }
        }
    }

    ,Popups:{
        AddReview:{
            open: function(f){
                _.$("#reviewPopup").display("block");
                _.$("#reviewClick")[0].onclick = f;
            }

            ,hide: function(){
                _.$("#reviewPopup").display("none");
            }


        }

        ,ReviewList: {
            open: function(f){
                _.$("#reviewList").display('block');
                _.$("#reviewListClose")[0].onclick = f;
            }

            ,hide: function(){

                _.$("#reviewList").display("none");
            }
        }

        ,init: function(){
            _.$(".popup").click(function(e){
                if(e.target==this){
                    _.$(this).display("none");
                }
            })
        }
    }
}