
//layout namespace

if (typeof Minx.Layout === "undefined") {
    Minx.Layout = {};
}

// shim layer with setTimeout fallback
          window.requestAnimFrame = (function(){
            return  window.requestAnimationFrame || 
                    window.webkitRequestAnimationFrame || 
                    window.mozRequestAnimationFrame || 
                    window.oRequestAnimationFrame || 
                    window.msRequestAnimationFrame || 
                    function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element){
                      window.setTimeout(callback, 1000 / 60);
                    };
          })();


Minx.Layout.SplitLayout = my.Class({

    constructor: function(main, lnw, pnw) {



        this._navSlideTimer = null;        // clearable timeout so can cancel delayed hides
        this._stuffSlideTimer = null;        // clearable timeout so can cancel delayed hides

        if( typeof lnw == 'undefined') {
            lnw = 300;             // 30% by default - in landscape mode
        }

        if( typeof pnw == 'undefined') {
            pnw = 300;            // 300 px by default
        }

        this.setNavLandWidth(lnw);
        this.setNavPortWidth(pnw);


        var me = this;
        var touch = Minx.pm.isTouch();

        // ---   navigation panel
        this._navPanel = Minx.pm.add(main,'title-panel');
        this._navPanel.setAnimate(200);

        // make it lighter
        this._navPanel.getTitle().removeClass('dark-bar');
        this._navPanel.getTitle().addClass('light-bar');

        // and give the panel a rouncded bum
        this._navPanel.getContentPanel().addClass('round-bottom');

        
        
        // --- right hand  panel of stuff
        this._stuff = Minx.pm.add(main,'title-panel');
        this._stuff.setAnimate(200);


        if(!touch) {
            //dock it right as well
            this._stuff.pinParent({'l': -1, 't': 0, 'r': 0, 'b': 0});
        }

        // add button to pop up the navigation when in portrait
        this._navPopButton = this._stuff.getTitle().addButton('l', 10, 'Menu');
        
        //TODO Check this and a handler - client should do this
        this._navPopButton.onClick(function(panel,e){
             me._popNavigation();
        });


        // orientation
        this._isPort = 'doit';
        this.inChange = false;
        this.reOrient(true);            // initial = true so dont do timers and dont call show
        
        // hook into window resize 
        Minx.eq.subscribe(this, window, 'resize', '_resizeEvent');

        Minx.eq.subscribe(this, window, 'orientationchange', '_resizeEvent');

    },

    _resizeEvent: function(e) {
        if(!this.inChange) {
            this.inChange = true;
            Minx.pm.calcDims();
            this.reOrient(false);           // true ro draw it all
            this.inChange = false;
        }
    },

    reOrient: function(initial) {
        
        var nisPort = (Minx.pm.dims.or === 'p');
        console.log('or = ' + Minx.pm.dims.or);

        if(nisPort !== this._isPort){
            
            this._isPort = nisPort;
            if(nisPort) {
                this._setPortrait(initial);
            }
            else {
                this._setLandscape(initial);
            }
        }
    },

    getMainPanel: function() {
        return this._stuff;
    },

    getNavPanel: function() {
        return this._navPanel;  
    },

    // set nav width in landscape - only takes effect on next orientation change
    setNavLandWidth: function(width) {
        this._navLandWidth = width;          // nav width in landscape
        if(this._navLandWidth < 1) {        // then it is a ratio
            this._navLandWidth = Minx.pm.dims.lw * this._navLandWidth;
        }
    },

    // set nav width in portrait - only takes effect on next orientation change
    setNavPortWidth: function(width) {
        this._navPortWidth = width;            // nav width in portrait
        if(this._navPortWidth < 1) {        // then it is a ratio
            this._navPortWidth = Minx.pm.dims.pw * this._navPortWidth;
        }
    },

    show: function() {
        this._navPanel.show();
        this._stuff.show();
    },

    _setLandscape: function(initial) {
        var me = this;
        var nw = Minx.pm.dims.w;
        var nh = Minx.pm.dims.h;
        var touch = Minx.pm.isTouch();

        window.scrollTo(0, 0);

        // pin it to the nav panel
        this._stuff.setSiblingPin(this._navPanel, 'l');

        this._navPanel.unPin();

        if(!touch) {
            // set the nav panel to docked in width    
            

            // and dock it left
            this._navPanel.pinParent({'l': 0, 't': 0, 'r': -1, 'b': 0});

            
        }
        
            //setTimeout(function() {
                me._stuff.setSize(nw - this._navLandWidth, nh);        
            //    me._stuff.show();    
            //}, 300);

            this._navPanel.setSize(this._navLandWidth, nh);

            this._navPanel.setPos(0, 0);

        
    

        // TODO: handle this in the panel manager
        this._navPanel.setStyle('z-index', '1');

        // stop it being rendered like a popup
        this._navPanel.removeClass('pop-up');

        

        // want to lay it all out and dump it onscreen with no geometry animation
        if(!initial) {
            this._navPanel.show();

            me._stuff.show();    
        }

        // have to hide instantly else it can finish the hide transition after the show
        me._navPopButton.hide(true); // instant = true
        
    },

    _setPortrait: function(initial) {
        var me = this;

        // need to know current width to slide left that much
        var navp = this._navPanel.getDims();

        var nw = Minx.pm.dims.w;
        var nh = Minx.pm.dims.h;
        
        var touch = Minx.pm.isTouch();

        var startTime = undefined;
        var time = undefined;
        var startPos = 0;
        

        function render(time) {
          time = Date.now();
          // time difference in 10ths of secconds - divide by 10 - one second - divide by 2 (as below) = (10/2) 10ths of a second or half a second
          var npos = startPos - (time - startTime)/1.5;

          if(npos < 0) {
              npos = 0;
          }

          window.scrollTo(npos, 0);

          return npos > 0;
        }

        // slide the nav panel out to left
        this._navPanel.unsetParentPin('l');

        

        // make stuff full size off dom

        //this._stuff.domReCreate();

        this._stuff.setSize(nw, nh);
        this._stuff.show();

        //this._stuff.domReAttach();

/*
        setTimeout(function() {    
        }, 1000);
*/


        if(!touch) {
            
            me._navPanel.setPos((0 - this._navLandWidth) - 1 , 0);
            me._navPanel.show();
        }
        else {


            //TODO scroll theview


            setTimeout(function() {
            //    window.scrollTo(0, 0);    
                startPos = window.scrollX;
                startTime = Date.now();
                
                (function animloop(){
                    if(render()) {
                      requestAnimFrame(animloop);
                    }
                })();

            }, 90);

          
            // 390  400 and 1.5 - for 300 

            setTimeout(function() {
                me._navPanel.setPos((0 - me._navLandWidth) - 1 , 0);
                me._navPanel.show();

            }, 100);

        }

        
/*

        if(!initial) {

            this._stuff.show();

            this._navPanel.show();                
        }
*/
        me._navPopButton.show(); 
        
    },

    // in portrait the nav pops up
    _popNavigation: function() {

        var left = this._navPanel.getDims().l;
        
        if(left < 0) {
            this._navPanel.hide();
        }

        // set hidden or offscreen
        if(this._navPanel.isHidden() || left < 0) {

            
            // un pin main from the nav panel
            this._stuff.unsetSiblingPin('l');
            
            // set a popup size
            this._navPanel.setSize(this._navPortWidth, 600);

            // unpin it
            this._navPanel.unPin();

            // repin it with offsets
            this._navPanel.setParentPin('l', 20);
            this._navPanel.setParentPin('t', 50);

            // force it on top - but this will be managed by the panel manger eventually
            this._navPanel.setStyle('z-index', '10');

            // give it the pop-up style
            this._navPanel.addClass('pop-up');

            
            // fade only animation - on pop
            this._navPanel.addClass('anim-fade-only');
            this._navPanel.removeClass('anim-geom');
            
            // does this move it into place 
            this._navPanel.render();

            // boom!
            this._navPanel.show();

            // slide animation back
            this._navPanel.removeClass('anim-fade-only');
            this._navPanel.addClass('anim-geom');
        }
        else {
            this._navPanel.hide();
        }
    }
});