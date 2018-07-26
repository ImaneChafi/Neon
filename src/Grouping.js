/** @module Grouping */

import * as Contents from "./Contents.js";
import * as Warnings from "./Warnings.js";
import InfoBox from "./InfoBox.js";

/**
 * The NeonView parent to access editor actions.
 * @type {NeonView}
 */
var neonView;

/**
 * Set the neonView member.
 */
export function initNeonView(view) {
    neonView = view;
}

/**
 * Trigger the grouping selection menu.
 */
export function triggerGrouping(type) {
    $("#moreEdit").removeClass("is-invisible");
    $("#moreEdit").append(Contents.groupingMenu[type]);
    initGroupingListeners();
};

/**
 * Remove the grouping selection menu.
 */
export function endGroupingSelection () {
    $("#moreEdit").empty();
    $("#moreEdit").addClass("is-invisible");
}

/**
 * The grouping dropdown listener.
 */
export function initGroupingListeners(){
    $("#mergeSyls").on("click", function() {
        var elementIds = getChildrenIds();
        groupingAction("group", "neume", elementIds);
    });

    $("#groupNeumes").on("click", function() {
        var elementIds = getIds();
        groupingAction("group", "neume", elementIds);
    });

    $("#groupNcs").on("click", function() {
        var elementIds = getIds();
        groupingAction("group", "nc", elementIds);
    });

    $("#ungroupNeumes").on("click", function () {
        var elementIds = getChildrenIds();
        groupingAction("ungroup", "neume", elementIds);
    });

    $("#ungroupNcs").on("click", function() {
        var elementIds = getChildrenIds();
        groupingAction("ungroup", "nc", elementIds);
    });
    $("#toggle-ligature").on("click", function () {
        var elementIds = getIds();
        var isLigature;
        let ligatureRegex = /#E99[016]/
        if (!ligatureRegex.test(document.getElementById(elementIds[0]).children[0].getAttribute("xlink:href"))) { // SMUFL codes for ligature glyphs
            isLigature = true;
        } else {
            isLigature = false;
        }

        let editorAction1 = {
            "action": "set",
            "param": {
                "elementId": elementIds[0],
                "attrType": "ligature",
                "attrValue": (!isLigature).toString()
            }
        };
        let editorAction2 = {
            "action": "set",
            "param": {
                "elementId": elementIds[1],
                "attrType": "ligature",
                "attrValue": (!isLigature).toString()
            }
        };

        let chain = {
            "action": "chain",
            "param": [
                editorAction1,
                editorAction2
            ]
        };
        console.log(chain);
        neonView.edit(chain);
        neonView.refreshPage();
    });
}

/**
 * Form and execute a group/ungroup action.
 * @param {string} action - The action to execute. Either "group" or "ungroup".
 * @param {string} groupType - The type of elements to group. Either "neume" or "nc".
 * @param {string[]} elementIds - The IDs of the elements.
 */
function groupingAction(action, groupType, elementIds) {
    let editorAction = {
        "action": action,
        "param": {
            "groupType": groupType,
            "elementIds": elementIds
        }
    };
    neonView.edit(editorAction);
    neonView.refreshPage();

    //Prompt user to confirm if Neon does not recognize contour
    if(groupType == "nc"){
        var neumeParent = $("#" + elementIds[0]).parent();
        var ncs = $(neumeParent).children();
        var contour = InfoBox.getContour((ncs));
        if(contour == undefined){
            Warnings.groupingNotRecognized();
        }
    }
}

/**
 * Get the IDs of selected elements.
 */
function getIds() {
    var ids = [];
    var elements = Array.from($(".selected"));
    elements.forEach(el => {
        ids.push($(el)[0].id);
    });
    return ids;
}

/**
 * Get the IDs of the selected elements' children.
 */
function getChildrenIds() {
    var childrenIds = [];
    var elements = Array.from($(".selected"));
    elements.forEach(el => {
        var children = Array.from($(el).children());
        children.forEach(ch => {
            childrenIds.push($(ch)[0].id);
        });
    });
    return childrenIds;
}
