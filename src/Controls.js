/** @module Controls */

import * as Color from "./Color.js";
import * as Compatibility from "./Compatibility.js";
import * as Contents from "./Contents.js";
import * as Cursor from "./Cursor.js";
import * as Text from "./Text.js";
import * as Select from "./Select.js";
import Icons from "./img/icons.svg";
import * as Notification from "./Notification.js";

/** @type {module:Zoom~ZoomHandler} */
var zoomHandler;

/**
 * Initialize listeners and controls for display panel.
 * @param {module:Zoom~ZoomHandler} zHandler - An instantiated ZoomHandler.
 */
export function initDisplayControls (zHandler) {
    zoomHandler = zHandler;

    setZoomControls();
    setOpacityControls();
    setBackgroundOpacityControls();
    setSylControls();
    setHighlightControls();

    $("#toggleDisplay").on("click", () => {
        if ($("#displayContents").is(":hidden")) {
            $("#displayContents").css("display", "");
            $("#toggleDisplay").attr("xlink:href", Icons + "#dropdown-down");
        }
        else {
            $("#displayContents").css("display", "none");
            $("#toggleDisplay").attr("xlink:href", Icons + "#dropdown-side");
        }
    });
}

/**
 * Set zoom control listener for button and slider
 */
function setZoomControls() {
    $("#reset-zoom").click(() => {
        $("#zoomOutput").val(100);
        $("#zoomSlider").val(100);
        zoomHandler.resetZoomAndPan();
    });

    $(document).on("input change", "#zoomSlider", () => {
        zoomHandler.zoomTo($("#zoomOutput").val() / 100.0);
    });

    $("body").on("keydown", (evt) => {
        let currentZoom = parseInt($("#zoomOutput").val());
        if (evt.key === "+") { // increase zoom by 20
            let newZoom = Math.min(currentZoom + 20, parseInt($("#zoomSlider").attr("max")));
            zoomHandler.zoomTo(newZoom / 100.0);
            $("#zoomOutput").val(newZoom);
            $("#zoomSlider").val(newZoom);
        }
        else if (evt.key === "-") { // decrease zoom by 20
            let newZoom = Math.max(currentZoom - 20, parseInt($("#zoomSlider").attr("min")));
            zoomHandler.zoomTo(newZoom / 100.0);
            $("#zoomOutput").val(newZoom);
            $("#zoomSlider").val(newZoom);
        }
        else if (evt.key === "0") {
            $("#zoomOutput").val(100);
            $("#zoomSlider").val(100);
            zoomHandler.resetZoomAndPan();
        }
    });
}

/**
 * Set rendered MEI opacity button and slider listeners.
 */
function setOpacityControls() {
    $("#reset-opacity").click( function() {
        // Definition scale is the root element of what is generated by verovio
        $(".definition-scale").css("opacity", 1);

        $("#opacitySlider").val(100);
        $("#opacityOutput").val(100);
    });

    $(document).on('input change', '#opacitySlider', setOpacityFromSlider);
}

/** * Set background image opacity button and slider listeners.
 */
function setBackgroundOpacityControls() {
    $("#reset-bg-opacity").click( function() {
        $("#bgimg").css("opacity", 1);

        $("#bgOpacitySlider").val(100);
        $("#bgOpacityOutput").val(100);
    });

    $(document).on('input change', '#bgOpacitySlider', function () {
        $("#bgimg").css("opacity", $("#bgOpacityOutput").val() / 100.0);
    });
}

/**
 * Set listener on syllable visibility checkbox.
 */
export function setSylControls() {
    updateSylVisibility();
    $("#displayText").click(updateSylVisibility);
}

/**
 * Update MEI opacity to value from the slider.
 */
export function setOpacityFromSlider() {
    $(".definition-scale").css("opacity", $("#opacityOutput").val() / 100.0);
};


/**
 * Set listener on staff highlighting checkbox.
 */
export function setHighlightControls() {
    $("#highlight-button").on("click", (evt) => {
        evt.stopPropagation();
        $("#highlight-dropdown").toggleClass("is-active");
        if ($("#highlight-dropdown").hasClass("is-active")) {
            $("body").one("click", highlightClickaway);
            $("#highlight-staff").on("click", () => {
                $("#highlight-dropdown").removeClass("is-active");
                $(".highlight-selected").removeClass("highlight-selected");
                $("#highlight-staff").addClass("highlight-selected");
                $("#highlight-type").html("&nbsp;- Staff");
                Color.setGroupingHighlight("staff");
            });
            $("#highlight-syllable").on("click", () => {
                $("#highlight-dropdown").removeClass("is-active");
                $(".highlight-selected").removeClass("highlight-selected");
                $("#highlight-syllable").addClass("highlight-selected");
                $("#highlight-type").html("&nbsp;- Syllable");
                Color.setGroupingHighlight("syllable");
            });
            $("#highlight-neume").on("click", () => {
                $("#highlight-dropdown").removeClass("is-active");
                $(".highlight-selected").removeClass("highlight-selected");
                $("#highlight-neume").addClass("highlight-selected");
                $("#highlight-type").html("&nbsp;- Neume");
                Color.setGroupingHighlight("neume");
            });
            $("#highlight-none").on("click", () => {
                $("#highlight-dropdown").removeClass("is-active");
                $(".highlight-selected").removeClass("highlight-selected");
                $("#highlight-type").html("&nbsp;- Off");
                Color.unsetGroupingHighlight();
            });
        }
        else {
            $("body").off("click", highlightClickaway);
        }
    });
}

function highlightClickaway () {
    $("body").off("click", highlightClickaway);
    $("#highlight-dropdown").removeClass("is-active");
}

/**
 * Update the visibility of the text box and set handlers.
 */
export function updateSylVisibility() {
    if ($("#displayText").is(":checked")) {
        $("#syl_text").css("display", "");
        $("#syl_text").html("<p>" + Text.getSylText() + "</p>");
        let spans = Array.from($("#syl_text").children("p").children("span"));
        spans.forEach(span => {
            $(span).on("mouseenter", () => {
                let syllable = $("#" + $(span).attr("class"));
                syllable.addClass("syl-select");
                syllable.attr("fill", "#d00");
            });
            $(span).on("mouseleave", () => {
                $("#" + $(span).attr("class")).removeClass("syl-select").attr("fill", null);
            });
        });

        if (Text.editText) {
            setTextEdit();
        }
    } else {
        $("#syl_text").css("display", "none");
    }
}

/**
 * Set text to edit mode.
 */
export function setTextEdit() {
    let spans = Array.from($("#syl_text").children("p").children("span"));
    spans.forEach(span => {
        $(span).off("click");
        $(span).on("click", update);
        function update() {
            Text.updateSylText(span);
        }
    });
}

/**
 * Reset the highlight for different types based on the 'highlight-selected' class in the DOM.
 */
export function updateHighlight() {
    let highlightId = $(".highlight-selected").attr("id");
    switch (highlightId) {
        case "highlight-staff":
            Color.setGroupingHighlight("staff");
            break;
        case "highlight-syllable":
            Color.setGroupingHighlight("syllable");
            break;
        case "highlight-neume":
            Color.setGroupingHighlight("neume");
            break;
        default:
            Color.unsetGroupingHighlight();
    }
}


/**
 * Initialize Edit and Insert control panels.
 * @param {NeonView} neonView - The NeonView parent.
 */
export function initInsertEditControls(neonView) {
    $("#toggleInsert").on("click", () => {
        if ($("#insertContents").is(":hidden")) {
            $("#insertContents").css("display", "");
            $("#toggleInsert").attr("xlink:href", Icons + "#dropdown-down");

        } else {
            $("#insertContents").css("display", "none");
            $("#toggleInsert").attr("xlink:href", Icons + "#dropdown-side");
        }
    });

    $("#toggleEdit").on("click", () => {
        if ($("#editContents").is(":hidden")) {
            $("#editContents").css("display", "");
            $("#toggleEdit").attr("xlink:href", Icons + "#dropdown-down");
        } else {
            $("#editContents").css("display", "none");
            $("#toggleEdit").attr("xlink:href", Icons + "#dropdown-side");
        }
    });

    $("#undo").on("click", undoHandler);
    $("body").on("keydown", (evt) => {
        if (evt.key === "z" && (evt.ctrlKey || evt.metaKey)) {
            undoHandler(evt);
        }
    });

    $("#redo").on("click", redoHandler);
    $("body").on("keydown", (evt) => {
        if ((evt.key === "Z" || (evt.key === "z" && evt.shiftKey)) && (evt.ctrlKey || evt.metaKey)) {
            redoHandler(evt);
        }
    });

    $("#delete").on("click", removeHandler);
    $("body").on("keydown", (evt) => {
        if (evt.key === "d" || evt.key === "Backspace")
            removeHandler(evt);
    });

    function undoHandler () {
        if (!neonView.undo()) {
            console.error("Failed to undo action.");
        } else {
            neonView.refreshPage();
        }
    }

    function redoHandler () {
        if (!neonView.redo()) {
            console.error("Failed to redo action");
        } else {
            neonView.refreshPage();
        }
    }

    function removeHandler () {
        let toRemove = [];
        var selected = Array.from(document.getElementsByClassName("selected"));
        selected.forEach(elem => {
            toRemove.push(
                {
                    "action": "remove",
                    "param": {
                        "elementId": elem.id
                    }
                }
            );
        });
        let chainAction = {
            "action": "chain",
            "param": toRemove
        };
        neonView.edit(chainAction);
        neonView.refreshPage();
    }
}

/**
 * Bind listeners to insert tabs.'
 * @param {InsertHandler} insertHandler - An InsertHandler to run the tasks.
 */
export function bindInsertTabs(insertHandler) {
    var insertTabs = $(".insertTab");
    var tabIds = $.map(insertTabs, function(tab, i) {
        return tab.id;
    });

    $.each(tabIds, function(i, tab) {
        $("#" + tab).on("click", () => {
            deactivate(".insertTab");
            activate(tab, insertHandler);
            Cursor.resetCursor();
            $("#insert_data").empty();
            $("#insert_data").append(Contents.insertTabHtml[tab]);
            bindElements(insertHandler);
        });
    });
}

/**
 * Bind listeners to insert tab elements.
 * @param {InsertHandler} insertHandler - An InsertHandler object.
 */
function bindElements(insertHandler) {
    var insertElements = $(".insertel");
    var elementIds = $.map(insertElements, function(el, i){
        return el.id;
    });
    $.each(elementIds, function(i, el){
        $('#' + el).on('click', function(){
            deactivate('.insertel');
            activate(el, insertHandler);
            Cursor.updateCursor();
        });
    });
}

/**
 * Activate a certain insert action.
 * @param {string} id - The ID of the insert action tab.
 * @param {InsertHandler} insertHandler - An InsertHandler object.
 */
function activate(id, insertHandler) {
    $("#" + id).addClass("is-active");
    insertHandler.insertActive(id);
}

/**
 * Deactivate a certain insert action.
 * @param {string} type - A JQuery selector for the action tab.
 */
function deactivate(type) {
    var elList = Array.from($(type));
    elList.forEach((el, i) => {
        $(elList[i]).removeClass("is-active");
    })
}

/**
 * Set listener on switching EditMode button to File dropdown in the navbar.
 * @param {string} filename - The name of the MEI file.
 * @param {NeonView} neonView
 */
export function initNavbar(filename, neonView) {
    // setup navbar listeners
    $("#save").on("click", () => {
        neonView.saveMEI();
        Notification.queueNotification("File Saved");
    });

    $("#revert").on("click", function(){
        if (confirm("Reverting will cause all changes to be lost. Press OK to continue.")) {
            Compatibility.revertFile(filename);
        }
    });

    //mei download link
    $("#getmei").attr("href", filename);

    //png download setup
    let regex = /\/uploads\/mei\/([-\.\w]+)\.mei/;
    var pngFile = "/uploads/png/" + filename.replace(regex, '$1') + ".png";
    $("#getpng").attr("href", pngFile);

    if (Compatibility.getMode() === Compatibility.modes.rodan) {
        $("#finalize").on("click", () => {
            if (confirm("Finalizing will save your work and end the job. You will not be able to resume it. Continue?")) {
                Compatibility.finalize(neonView.rodanGetMei());
            }
        });
    }
}

/**
 * Set listener on EditMode button.
 * @param {EditMode} editMode - The EditMode object.
 */
export function initEditMode(editMode) {
    $("#edit_mode").on("click", function(){
        $("#dropdown_toggle").empty();
        $("#dropdown_toggle").append(Contents.navbarDropdownMenu);
        if (Compatibility.getMode() === Compatibility.modes.rodan) {
            $("#navbar-dropdown-options").append(Contents.navbarFinalize);
        }
        $("#insert_controls").append(Contents.insertControlsPanel);
        $("#edit_controls").append(Contents.editControlsPanel);

        editMode.init();
    });
}

/**
 * Set listeners on the buttons to change selection modes.
 */
export function initSelectionButtons() {
    $("#selBySyl").on("click", selectBySylHandler);
    $("body").on("keydown", (evt) => {
        if (evt.key === "1") {
            selectBySylHandler(evt);
        }
    });

    function selectBySylHandler() {
        if (!$("#selBySyl").hasClass("is-active")) {
            Select.unselect();
            $("#moreEdit").empty();
            $("#selBySyl").addClass("is-active");
            $("#selByNeume").removeClass("is-active");
            $("#selByNc").removeClass("is-active");
            $("#selByStaff").removeClass("is-active");
        }
    }

    $("#selByNeume").on("click", selectByNeumeHandler);
    $("body").on("keydown", (evt) => {
        if (evt.key === "2") {
            selectByNeumeHandler(evt);
        }
    });

    function selectByNeumeHandler() {
        if (!$("#selByNeume").hasClass("is-active")){
            Select.unselect();
            $("#moreEdit").empty();
            $("#selByNeume").addClass("is-active");
            $("#selByNc").removeClass("is-active");
            $("#selByStaff").removeClass("is-active");
            $("#selBySyl").removeClass("is-active");
        }
    }

    $("#selByNc").on("click", selectByNcHandler);
    $("body").on("keydown", (evt) => {
        if (evt.key === "3") {
            selectByNcHandler(evt);
        }
    });

    function selectByNcHandler() {
        if (!$("#selByNc").hasClass("is-active")) {
            Select.unselect();
            $("#moreEdit").empty();
            $("#selByNc").addClass("is-active");
            $("#selByNeume").removeClass("is-active");
            $("#selByStaff").removeClass("is-active");
            $("#selBySyl").removeClass("is-active");
        }
    }

    $("#selByStaff").on("click", selectByStaffHandler);
    $("body").on("keydown", (evt) => {
        if (evt.key === "4") {
            selectByStaffHandler(evt);
        }
    });

    function selectByStaffHandler() {
        if (!$("#selByStaff").hasClass("is-active")) {
            Select.unselect();
            $("#moreEdit").empty();
            $("#selByStaff").addClass("is-active");
            $("#selByNc").removeClass("is-active");
            $("#selByNeume").removeClass("is-active");
            $("#selBySyl").removeClass("is-active");
        }
    }
}
