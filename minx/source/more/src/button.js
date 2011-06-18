/* 

Button registered as button
===========================




each button contains the following html....

<div class="button bordered back">
    <span class="pointer"></span>
    <div class="content">
        <span class="label">Blah</span>
    </div>
</div>






*/

Minx.Button = my.Class(Minx.PinnedPanel, {
    
    constructor: function(parent, id) {
        Minx.Button.Super.call(this, parent, id);

        this.setSize(70, 30);
        this.setPos(10, 10);
        
        this.addClass('button-up');

        // register my events in Minx.eq wrapper 
        Minx.eq.subscribe(this, null, 'mousedown'); // null means whatever node I get made
        Minx.eq.subscribe(this, null, 'mouseup');

        this._type = 'none';

        // must give me a default type to create the label node
        this.setType('normal');

    },
    
    // last thing called in the construction - so overrides stuff
    _onCreation: function() {
        // buttons just stay within thier parents
        this.setAnimate(false);
    },

    // special one for buttons
    onClick: function(fn) {
        this._clickEvent  = fn; 
    },

    // this is what gets called by the event 
    eventFired: function(ev) {
        console.log(ev);

        // call my behaviour
        if(ev.type == 'mousedown') this.buttonPressed(ev);
        if(ev.type == 'mouseup') this.buttonReleased(ev);

        // then call super to trigger any external listener
        Minx.Button.Super.prototype.eventFired(this, ev);
    },

    buttonPressed: function(e) {
        this.removeClass('button-up');
        this.addClass('button-down');
        this.show();
    },

    buttonReleased: function(e) {
        this.removeClass('button-down');
        this.addClass('button-up');
        this.show();
        if(this._clickEvent) {
                this._clickEvent(this, e);
        }
    },

    setText: function(text) {
        this._textNode.data = text;
    },

    setType: function(type) {
        var me  = this;

        // remove any inner nodes - if the type is changing 
        if(type !== me._type) {
            // remove any specific classes
            this.removeClass('back');
            this.removeClass('next');
             
            while(me._node.lastChild) {
                me._node.removeChild(me._node.lastChild);
            }
        }

        var text = "Button";

        if(type == 'back') {
    
            // default text
            text = 'Back';    

            // create stuff for the button
            this.addClass('back');

            // create the pointer span
            var sp = document.createElement('span');
            sp.setAttribute('class', 'pointer');
            this._node.appendChild(sp);
        
            // calculate my maths for dynamic sizing of pointer  
            var h = this.getNewDims().h - 0.5;

            
            // legth of side is sqrt(2) * h/2 + r(1 - tan(2.5))
            // i.e. .707 * h + .585 * r
            var r = 8;          // fixed in css
            var nw = (0.707 * (h)) + (.585 * r) + 0.5;   

            var offTop = (h - nw)/2;
            var offLeft = nw/2 ;

            // add sizing to the span element
            sp.style.cssText = 'width: ' + nw + 'px; height: ' + nw + 'px; top:' + offTop + 'px; left: -' + offLeft + 'px;'; 

            // TODO: if i'm pinned left then increase my offset for a back button
            if(this._pPin.l >= 0) {
                this._pPin.l = this._pPin.l + offLeft;
            }
                // same if pinned to a sibling
            if(this._sPin.l != null) {
                this._sPin.l.off =this._sPin.l.off + offLeft;
            }

        }
        else { 
                // do nothing special for a vanilla button
        }

        // add the text span
        addTextSpan(text);

        me._type = type;

        // utility nested functions 
        function addTextSpan(text) {  
            
            
            me._label = document.createElement('span');
            me._label.setAttribute('class', 'label');
            
            me._node.appendChild(me._label);  

            me._textNode = document.createTextNode(text);
            me._label.appendChild(me._textNode);  

            // calculate my maths for dynamic sizing of pointer  

            var h = me.getNewDims().h - 0.5;

            me._label.style.cssText = "visibility: inherited; line-height: " + h + "px";


        }
    },

    getClassName: function() {
        return 'button';
    },
    
    getMyElement: function() {
        return 'div';
    },
});


Minx.pm.register('button', Minx.Button);


    