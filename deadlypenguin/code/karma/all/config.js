/*jslint browser: true, regexp: true */
/*global*/

var config = {};

config.DATE_FORMAT = 'YYYY-MM-DD';
config.MIN_DATE = '2012-10-26';

config.BASE_URL = 'https://da56fe52-708f-4acb-8890-af3178f0960d-bluemix.cloudant.com/karma';
config.URL_SINGLE_NICK_TEMPLATE = config.BASE_URL + '/_design/karma/_view/single_nick/?startkey=[{{{nick}}}{{#if startdate}},"{{startdate}}"{{/if}}]&endkey=[{{{nick}}},{{#if enddate}}"{{enddate}}"{{else}}{}{{/if}}]';
config.URL_MULTI_NICK_TEMPLATE = config.BASE_URL + '/_design/karma/_view/by_nick/?keys=[{{{nicks}}}]';
config.SEARCH_TEMPLATE = '?nick={{nick}}{{#if to}}&to={{to}}{{/if}}{{#if from}}&from={{from}}{{/if}}';
config.URL_MOST_RECENT = config.BASE_URL + '/_design/karma/_view/all?limit=1&descending=true';

config.VALUE_LIST_URL = config.BASE_URL + '/_design/karma/_view/nick_list/?group=true';