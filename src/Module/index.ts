import SummernoteBragi from './SummernoteBragi'

export default class BragiPlugin {
    protected summernote_bragi: any
    constructor(options: any) {
        this.summernote_bragi = new SummernoteBragi(options);
    }

    getPlugin() {
        let plugin = {};
        let _this = this;
        let options = this.summernote_bragi.options

        // @ts-ignore
        plugin[options.name] = function(context) {

            let sgOptions = context.options[options.name] || {}
            let buttonLabel = sgOptions.buttonLabel || _this.summernote_bragi.options.buttonLabel

            _this.summernote_bragi.options.buttonLabel = buttonLabel

            // add bragi button
            context.memo('button.' + options.name, _this.createButton());

            this.events = {
                'summernote.keyup': function(we: any, e: any)
                {
                    _this.summernote_bragi.saveLastFocusedElement();
                }
            };

            this.initialize = function() {
                _this.summernote_bragi.initBragi(context);
            };
        }

        return plugin;
    }

    createButton() {
        return this.summernote_bragi.createButton();
    }
}