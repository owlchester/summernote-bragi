import BragiModal from './BragiModal'
import DataManager from './DataManager'

export default class SummernoteBragi {
    private options: any;
    private plugin_default_options: {};
    private editor: any;
    private editable: any;
    private context: any;
    private plugin_options: any;
    private modal: any;
    private data_manager: any;
    constructor(options: any) {
        this.options = $.extend({
            name: 'bragi',
            buttonLabel: '<i class="fa-solid fa-robot"></i>',
            tooltip: 'Bragi'
        }, options);

        this.plugin_default_options = {}
    }

    // set the focus to the last focused element in the editor
    recoverEditorFocus() {
        var last_focused_el = $(this.editor).data('last_focused_element');
        if(typeof last_focused_el !== "undefined") {
            var editor = this.editable;
            var range = document.createRange();
            var sel = window.getSelection();
            var cursor_position =  last_focused_el.length;

            range.setStart(last_focused_el, cursor_position);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            editor.focus();
        }
    }

    saveLastFocusedElement() {
        var focused_element: any = window.getSelection().focusNode;
        var parent = $(this.editable).get(0);
        if ($.contains(parent, focused_element)) {
            $(this.editor).data('last_focused_element', focused_element)
        }
    }

    attachEditorEvents() {
        var _this = this;

        $(this.editable).on('keypress, mousemove', function() {
            _this.saveLastFocusedElement();
        })

        $(this.editable).on('click', 'summernote-bragi-brick .delete', function () {
            // delete brick
        })

        $(this.editable).on('click', 'summernote-bragi-brick .edit', function () {
            let $brick = $(this).parents('summernote-bragi-brick');
            let data = $brick.data('brick'); // json

            _this.modal.open(data);
        })
    }

    initBragi(context: any) {
        this.context = context;
        this.editor = this.context.layoutInfo.note;
        this.editable = this.context.layoutInfo.editable;
        this.plugin_options = $.extend(
            this.plugin_default_options,
            this.context.options[this.options.name] || {}
        )

        this.modal = new BragiModal(this.plugin_options.modal);
        this.data_manager = new DataManager(this.plugin_options.source);

        this.attachModalEvents();
        this.attachEditorEvents();
    }

    attachModalEvents() {
        var _this = this;

        this.modal.event.on('beforeSave', function (bragi_modal: any) {
            _this.recoverEditorFocus();
        });

        this.modal.event.on('save', function (bragi_modal: any, generatedText: any) {
            // add selected images to summernote editor
            _this.context.invoke(
                'editor.pasteHTML',
                '<p>' + generatedText + '</p>'
            );
        });
        this.modal.event.on('generate', function (random: any, prompt: any, name: any) {
            console.log('event triggered', prompt, name);
            _this.data_manager.generate(prompt, name);
        });

        this.modal.event.on('close', function (bragi_modal: any) {
            _this.data_manager.init();
            _this.modal.clearContent();
        });
    }

    createButton() {
        var _this = this;

        var button = ($ as any).summernote.ui.button({
            className: 'w-100',
            contents: this.options.buttonLabel,
            tooltip: this.options.tooltip,
            click: function() {
                _this.openBragi();
            }
        });

        // create jQuery object from button instance.
        return button.render();
    }

    attachDataEvents() {
        var _this = this;

        this.data_manager.event
        .on('beforeFetch', function () {
            _this.modal.showLoading();
        })
        .on('beforeGenerating', function () {
            _this.modal.showGenerating();
        })
        .on('fetch', function (data: any) {
            _this.modal.addData(data);
        })
        .on('generate', function (data: any) {
            _this.modal.addGenerated(data);
        })
        .on('afterFetch', function () {
            _this.modal.hideLoading();
        })
        .on('afterGenerating', function () {
            _this.modal.hideGenerating();
        })
        .on('error', function (error: any) {
            _this.modal.showError(error, true);
        })
        .on('generateError', function (error: any) {
            _this.modal.showError(error);
        });
    }

    openBragi() {
        this.attachDataEvents();
        this.data_manager.fetchData();
        this.modal.open();
    }
}