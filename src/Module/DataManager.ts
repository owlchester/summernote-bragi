import EventManager from './EventManager'
import DataManagerOptionsInterface from "./Interfaces/DataManagerOptionsInterface";

export default class DataManager {
    private fetch_type?: string;
    private options: DataManagerOptionsInterface;
    private current_page: number;
    private is_fetching_locked: boolean;
    private event: EventManager;
    private fetch_url: string;

    constructor(options: DataManagerOptionsInterface) {
        this.options = {
            ...{
                // full http url for fetching data
                url: null,

                // array of objects with 'src' and 'title' keys
                data: [],

                // the key name that holds the data array
                responseDataKey: 'data',

                // the key name that holds the next page link
                nextPageKey: 'links.next',
            }, ...options
        }

        this.init();
    }

    init() {
        this.current_page = 0;
        this.is_fetching_locked = false;
        this.event = new EventManager();
        this.fetch_url = this.options.url;
        this.fetch_type = this.options.data.length ? 'data' : (this.fetch_url ? 'url' : null);
    }

    // stop data fetching if neither next page link nor data were found
    setNextFetch(response: any) {
        if (response.next_link && response.data.length) {
            this.fetch_url = response.next_link;
        } else {
            this.lockFetching();
        }
    }

    lockFetching() {
        this.is_fetching_locked = true;
    }

    unlockFetching() {
        this.is_fetching_locked = false;
    }

    parseResponse(response: any) {

        return {
            response
        };
    }

    fetchData() {
        const _this = this;

        if (this.fetch_type == 'data') {

            this.event.trigger('beforeFetch');
            this.event.trigger('fetch', [_this.options.data]);
            this.event.trigger('afterFetch');

        } else if (this.fetch_type == 'url') {

            // Prevent simultaneous requests.
            // Because we need to get the next page link from each request,
            // they must be synchronous.
            if (this.is_fetching_locked) return;

            const current_link = _this.fetch_url;

            this.event.trigger('beforeFetch');

            this.lockFetching();

            $.ajax({
                url: current_link,
                beforeSend:function(xhr: any){
                    // set the request link to get it afterwards in the response
                    xhr.request_link = current_link;
                },
            })
            .always(function () {
                // this is the first callback to be called when the request finises
                _this.unlockFetching();
            })
            .done(function(response, status_text, xhr: any){
                _this.event.trigger('fetch', [
                    response,
                    _this.current_page,
                    xhr.request_link,
                ]);
            })
            .fail(function() {
                _this.event.trigger('error', ["problem loading from " + current_link]);
            })
            .always(function () {
                _this.event.trigger('afterFetch');
            });

        } else {
            _this.event.trigger('error', ["options 'data' or 'url' must be set"]);
        }
    }

    generate(prompt: any,  fields: any) {
        console.log('DataManager', 'generate');
        const _this = this;
        this.event.trigger('beforeGenerating');
        const current_link = _this.fetch_url;
        fields.prompt = prompt;

        $.ajax({
            url: current_link,
            method: 'POST',
            data: fields,
            beforeSend:function(xhr: any){
                // set the request link to get it afterwards in the response
                xhr.request_link = current_link;
            },
        })
            .always(function () {
                // this is the first callback to be called when the request finises
                _this.unlockFetching();
            })
            .done(function(response, status_text, xhr: any){
                _this.event.trigger('generate', [
                    response,
                    xhr.request_link,
                ]);
            })
            .fail(function(error: any) {
                _this.event.trigger('error', [error.responseJSON.message]);
            })
            .always(function () {
                _this.event.trigger('afterGenerating');
            });
    }
}
