import EventManager from './EventManager'

export default class BragiModal {
    private $css: JQuery;
    private event: EventManager;
    private template: string;
    private readonly $modal: any;
    private options: any;

    constructor(options: any) {
        this.options = $.extend({
            // modal max height
            maxHeight: 500,

            // modal title
            title: 'Kanka Bragi',

            // close button text
            close_text: 'Close',

            // save button text
            ok_text: 'Add',
        }, options);

        this.event = new EventManager();

        this.template = this.getModalTemplate();
        this.$modal = $(this.template).hide();

        this.addStyleToDom();
        this.setOptions();

        this.attachEvents();
    }

    setOptions() {
        this.$modal.find('.modal-body').css('max-height', this.options.maxHeight);
        this.$modal.find('.modal-title').html(this.options.title);
        this.$modal.find('#close').html(this.options.close_text);
    }

    // append data to the modal with data object
    addData(data: any) {

        //console.log('bragi', 'addData', data);

        this.$modal.find('.header-text').html(data.header);

        if (data.error) {
            //console.log('bradi', 'error', data.error);
            this.showError(data.message, true);
            return;
        }

        this.showForm(data);
        return;
    }
    // append generated data to the modal with data object
    addGenerated(data: any) {

        //console.log('bragi', 'addGenerated', data);

        this.availableTokens(data.tokens);

        if (data.error) {
            this.showError(data.message, true);
            return;
        }

        this.$modal.find('.generated').html(data.result).show();
        this.$modal.find('.modal-footer').show();

        if (data.tokens === 0) {
            this.$modal.find('form').hide();
            this.showError(data.message, true);
        }
    }

    showError(message_text: any, permanent: any = false) {
        let $message = this.$modal.find('.message');

        $message.html('<p class="alert alert-danger">' + message_text + '</p>');
        $message.show();

        if (!permanent) {
            setTimeout(function () {
                $message.html('').hide();
            }, 5000);
        }
    }

    showForm(data: any) {
        // Inject placeholders and stuff
        this.$modal.find('input').attr('placeholder', data.texts.placeholder);
        this.$modal.find('input').attr('maxlength', data.limits.prompt);
        this.$modal.find('button[name="submit"]').html(data.texts.submit);
        this.$modal.find('button[name="insert"]').html(data.texts.insert);
        this.$modal.find('.bragi-loading').html(data.texts.loading);
        this.$modal.find('.token-count').html(data.tokens);
        this.$modal.find('.token-text').html(data.texts.tokens);
        this.$modal.find('input').focus();
        this.availableTokens(data.tokens);

        var $form = this.$modal.find('form[name="bragi-form"]');
        $form.show();
    }

    showLoading () {
        this.$modal.find('.bragi-loader').show();
    }

    hideLoading () {
        this.$modal.find('.bragi-loader').hide();
    }

    showGenerating () {
        this.$modal.find('.bragi-loader').show();
        this.$modal.find('input').prop('disabled', true);
        this.$modal.find('button[name="submit"]').prop('disabled', true);
        this.$modal.find('.modal-footer').hide();
        this.$modal.find('.generated').hide();
    }

    hideGenerating () {
        this.$modal.find('.bragi-loader').hide();
        this.$modal.find('input').removeAttr('disabled').focus();
        this.$modal.find('button[name="submit"]').removeAttr('disabled');
    }

    hideErrors () {
        this.$modal.find('.message').html('');
    }

    attachEvents() {
        var _this = this;
        var $modal = this.$modal;

        // Submitting the form
        $modal.find('form').submit(function (event: any) {
            let prompt = $modal.find('input').val();

            // Adding context is optional
            let nameField = $('[name="name"]');
            let context:{[k: string]: any} = {};
            if (nameField) {
                let bragiName = nameField.data('bragi-name');
                context.name = bragiName ? bragiName : nameField.val();
            }

            let genderField = $('[name="sex"]');
            if (genderField) {
                context.gender = genderField.val();
            }
            let pronounsField = $('[name="pronouns"]');
            if (pronounsField) {
                context.pronouns = pronounsField.val();
            }

            _this.hideErrors();
            _this.event.trigger('generate', [_this, prompt, context]);
            return false;
        });

        $modal.find('button[name="insert"]').click(function(event: any) {
            _this.event.trigger('beforeSave', [_this]);
            $modal.modal('hide');
            _this.event.trigger('save', [_this, $modal.find('.generated').html()]);
            _this.event.trigger('afterSave', [this]);
        });

        /*$modal.find("button#save").click(function(event: any) {
            var $selected_img = $modal.find('.img-item img.' + _this.select_class);

            if (! $selected_img.length) {
                _this.showError(_this.options.noImageSelected_msg);
                return;
            }

            $modal.modal('hide')

            _this.event.trigger('beforeSave', [_this]);

            $selected_img.each(function(index: any, el: any) {
                _this.event.trigger('save', [_this, $(this)]);

                $(this).removeClass(_this.select_class);
            });

            _this.event.trigger('afterSave', [this]);
        });*/

        $modal.on('hidden.bs.modal', function () {
            _this.event.trigger('close')
        })
    }

    open() {
        this.$modal.modal();
    }

    clearContent() {
        // Reset the initial html
        this.$modal.find('.images-list').html('');
    }

    getModalTemplate() {

        var bootsrap_version = parseInt(($ as any).fn.modal.Constructor.VERSION);
        var header_content = [
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>',
            '<h4 class="modal-title">[bragi title]</h4>'
        ];

        var modal_html = ''+
            '<div class="modal summernote-bragi fade" tabindex="-1" role="dialog">'
                + '<div class="modal-lg modal-dialog ">'
                    + '<div class="modal-content">'
                        + '<div class="modal-header">'
                            + (bootsrap_version == 3 ? header_content.join('') : header_content.reverse().join(''))
                        + '</div>'
                        + '<div class="modal-body p-8 flex flex-col gap-4 md:gap-5">'
                            + '<div class="flex gap-5">'
                                + '<img src="/images/bragi/bragi.png" alt="Bragi" class="flex-none w-40 h-40" />'
                                + '<div class="flex-grow flex flex-col gap-2">'
                                    + '<p class="text-neutral-content header-text"></p>'
                                    + '<p class="text-neutral-content token-text"></p>'
                                + '</div>'
                            + '</div>'
                            + '<form method="GET" action="" name="bragi-form" class="flex gap-1" style="display: none">'
                                + '<input type="text" name="prompt" class="w-full" data-skip-unsaved="true" />'
                                + '<button type="submit" name="submit" class="btn2 btn-primary"></button>'
                            + '</form>'
                            + '<div class="message" style="display: none"></div >'
                            + '<div class="generated text-break" style="display: none"></div>'
                            + '<div class="text-center bragi-loader" style="display: none">'
                                + '<i class="fa-solid fa-spinner fa-spin fa-3x" aria-hidden="true"></i>'
                                + '<p class="bragi-loading"></p>'
                            + '</div>'
                        + '</div>'
                        + '<div class="modal-footer" style="display: none">'
                            + '<button name="insert" class="btn2 btn-primary"></button>'
                        + '</div>'
                    + '</div>'
                + '</div>'
            + '</div>';

        return modal_html;
    }

    addStyleToDom() {
        this.$css = $('<style>'
                        +'.modal.summernote-bragi .modal-body{'
                            +'overflow: scroll;'
                        +'}'
                    +'</style>');
        this.$css.appendTo('body');
    }

    availableTokens(tokens: any) {
        this.$modal.find('.token-amount').html(tokens);
    }
}