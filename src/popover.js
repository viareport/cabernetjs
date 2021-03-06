Cabernet.Popover = Ember.View.extend({
    linkText: '',
    defaultLinkTemplate: '<a {{action "toggle"}}>{{linkText}}</a>',
    linkTemplate: null,
    contentTemplate: '',
    placement: 'below',
    collision: 'flip',
    withArrow: true,

    init: function() {
        this.set('template', this.generateTemplate());
        return this._super();
    },

    toggle: function(e) {
        if (e !== undefined && e.type == 'clickoutside' || $('div.popover.active').length == 0) {
            e.stopPropagation();
        }
        
        var popover = this.$('div.popover');
        popover.toggle();
        if (popover.is(':visible')) {
            popover.addClass('active');
            
            this.reposition();
            var that = this;
            //this.$().parents('th').on('resize', function() { that.reposition(); });
            
            popover.bind('clickoutside', function(e) {
                that.toggle(e);
                //$(this).removeClass('active').hide().unbind('clickoutside');
            });
            
        } else {
            popover.removeClass('active');
            popover.unbind('clickoutside');
            /*var that = this;
            this.$().parents('th').off('resize', function() { that.reposition(); });*/
        }
    },

    reposition: function() {
        var popover = this.$('div.popover');
        var params = this.getPositionParams(popover);
        popover.position({
            of: this.positionRelativeTo(),
            my : params.my,
            at: params.at,
            offset: params.offset,
            collision: this.get('collision')
        });
        if (this.get('withArrow') && params.arrowLeft !== undefined) popover.children('div.arrow').css('left', params.arrowLeft);

        // Be sure that after repositioning the popover, it fit in the viewport
        var datagridRightOffset = ($(window).width() - (popover.parents(".datagrid").offset().left + popover.parents(".datagrid").outerWidth()));
        var popoverRightOffset = ($(window).width() - (popover.offset().left + popover.outerWidth()));
        var popoverOffset = popover.offset();
        popoverOffset.right = popoverRightOffset;
        var datagridOffset = popover.parents(".datagrid").offset();
        datagridOffset.right = datagridRightOffset;


        var reposition = false;
        var newPlacement;
        if (popoverOffset.left < datagridOffset.left) {
            newPlacement  = "below right";
            reposition = true;
        } else if (popoverOffset.top < datagridOffset.top ) {
            newPlacement = "below";
            reposition = true;
        } else if (popoverOffset.right < datagridOffset.right) {
            newPlacement = "below left";
            reposition = true;
        }

        if (reposition) {
            this.set("placement", newPlacement);
            this.reposition();
        }
    },

    positionRelativeTo: function() {
        return this.$('a');
    },

    generateTemplate: function() {
        var linkTmpl = Ember.none(this.get('linkTemplate')) ? this.get('defaultLinkTemplate') : this.get('linkTemplate');
        var placementClass = this.get('placement');
        if (placementClass == 'below left' || placementClass == 'below right') placementClass = 'below';
        else if (placementClass == 'above left' || placementClass == 'above right') placementClass = 'above';
        return Ember.Handlebars.compile(
            linkTmpl +
            '<div class="popover ' + placementClass + '">' +
                (this.get('withArrow') ? '<div class="arrow"></div>' : '') +
                '<div class="inner"> \
                    <div class="content">' +
                        this.get('contentTemplate') +
                    '</div> \
                </div> \
            </div>');
    },

    getPositionParams: function(popoverElt) {
        var width = popoverElt.width();
        var params = {
            'right': { my: 'left', at: 'right', offset: '0' },
            'below': { my: 'top', at: 'bottom', offset: '0' },
            'above': { my: 'bottom', at: 'center', offset: '0' },
            'left': { my: 'right', at: 'left', offset: '0' },
            'below right': { my: 'left top', at: 'center bottom', offset: '0', arrowLeft: '20px' },
            'below left' : { my: 'right top', at: 'right bottom', offset: '0', arrowLeft: width - 20 + 'px' },
            'above right': { my: 'left bottom', at: 'center top', offset: '0', arrowLeft: '20px' }
        }
        return params[this.get('placement')];
    }
});