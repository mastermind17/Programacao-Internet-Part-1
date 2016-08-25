'use strict';


function initPage(titleText, stylePath){
    let initPage = '<!DOCTYPE html>' + tag('html') + tag('head') + tagContent('title', titleText);

    if(stylePath != null){
        initPage += linkStyle(stylePath);
    }
    /*
    for (var i = 1; i < arguments.length; i++) {
        if (arguments[i] != null)
            initPage += linkStyle(arguments[i]);
    }
    */
    return (initPage + closeTag('head'));
}

/**
 * Returns the main html elements that usually close an html page.
 * Namelly, /body and /html.
 *       
 * @return {String}     Html close string of body and html tags.        
 */
function closePage(){ return closeTag('body') + closeTag('html'); }

/**
 * The open tag element.
 * @param  {String} name Tag's name
 * @return {String}      Html open tag element
 */
function tag(name) { return '<'+name+'>'; }

/**
 * The close tag element.
 * @param  {String} name Tag's name
 * @return {String}      Html close tag element
 */
function closeTag(name){return '</' + name + '>';}

/**
 * Build and anchor tag based upon a given uri.
 * @param  {String} url  The resource to reference
 * @param  {String} text The placeholder text
 * @return {String}      Html anchor tag
 */
function anchor (url, text){ return '<a href="' + url + '">' + text + '</a>';}

/**
 * Html tag element with content inside.
 * @param  {String} name       Name of the tag.
 * @param  {String} content    The content inside the element
 * @return {String}            Html tag with content
 */
function tagContent(name, content){ return tag(name) + content + closeTag(name); }


function linkStyle(filename){
    return '<link rel="stylesheet" type="text/css" href="' + filename + '">';
}

function buildImageTag(uri, size){
    size = size || 100;
    return '<img src="'+ uri +'" alt="image" height=' + size + ' width=' + size + ' />'
}


/**
 * The exported functions. Some were defined since they are used
 * to build others. In order to be used, they must be defined first.
 * 
 */
module.exports.utils = {
    initPage : initPage,
    closePage : closePage,
    anchor : anchor,
    closeTag : closeTag,
    tag : tag,
    selfClosedTag : (name) => {return '<' + name + '/>'},
    tagContent : tagContent,
    tagWithClass : (name, classe) => { return '<'+name+' class="'+classe+'">'},
    wrapWithClass : (name, classe, content) => {
        return '<'+name+' class="'+classe+'">' + content + '</'+name+'>'
    },
    imageTag : buildImageTag,
    linkCSS : linkStyle
};

