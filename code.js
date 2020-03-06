setTimeout(function () {
    function runPlugin() {
        const nodes = figma.currentPage.selection;
        let selectedLayers = nodes;
        let nodesParent = nodes;
        let troubleFound = false;
        let arrayError = [];
        let arrayIssue = [];
        let arrayMasterComponent = [];
        let arrayUniqueName = [];
        function errorMsg() {
            figma.closePlugin('⚠️ Please select a master component ⚠️');
        }
        if (selectedLayers.length === 0) {
            // nothing selected, show error
            errorMsg();
        }
        else {
            nodesParent.forEach(mainParent => {
                // make sure its a component we are checking
                if (mainParent.type === 'COMPONENT') {
                    // show UI
                    figma.showUI(__html__, { width: 380, height: 550 });
                    // instance checker
                    const searchAll = figma.root.findAll();
                    searchAll.forEach(item => {
                        if (item.type === 'INSTANCE' && item.masterComponent === mainParent) {
                            arrayMasterComponent.push(1);
                        }
                    });
                    if (arrayMasterComponent.length === 0) {
                        arrayError.push("No instance description");
                        figma.ui.postMessage({
                            'noFoundInstance': true,
                            'troubleFound': true
                        });
                    }
                    else {
                        // console.log("has instance")
                    }
                    // unique name checker
                    searchAll.forEach(item => {
                        if (item.type === 'COMPONENT') {
                            if (item.name === mainParent.name) {
                                // console.log("component found: " + item.name)
                                arrayUniqueName.push(item.name);
                            }
                        }
                    });
                    // console.log(arrayUniqueName.length)
                    const uniqueNameLength = arrayUniqueName.length;
                    if (uniqueNameLength >= 2) {
                        // console.log("Theres more than 1")
                        arrayError.push("Duplicate name");
                        figma.ui.postMessage({
                            'badName': true,
                            'badNameFound': mainParent.name,
                            'troubleFound': true
                        });
                    }
                    // component desc checker
                    const descriptionLength = mainParent.description.length;
                    if (descriptionLength === 0) {
                        arrayIssue.push("No component description");
                        figma.ui.postMessage({
                            'badDesc': true,
                            'troubleFound': true
                        });
                    }
                    function componentChildren(children) {
                        children.forEach(child => {
                            if (child.type === 'TEXT') {
                                // font family checker
                                if (child.fontName.family != "Roboto"
                                    && child.fontName.family != "Aktiv Grotesk"
                                    && child.fontName.family != "San Francisco"
                                    && child.fontName.family != "San Francisco Text"
                                    && child.fontName.family != "SF Pro Text") {
                                    arrayError.push(child.fontName.family);
                                    figma.ui.postMessage({
                                        'badFont': true,
                                        'badFontType': child.fontName.family,
                                        'troubleFound': true
                                    });
                                }
                                // text global style checker
                                const hasStyle = child.textStyleId;
                                const hasStyleLength = hasStyle.length;
                                if (hasStyleLength === 0) {
                                    arrayError.push("Missing global text style: " + child.name);
                                    figma.ui.postMessage({
                                        'badFontStyle': true,
                                        'badFontStyleType': child.name,
                                        'troubleFound': true
                                    });
                                }
                            }
                            // frame checker
                            if (child.type === 'FRAME') {
                                arrayIssue.push("Nested Frame: " + child.name);
                                figma.ui.postMessage({
                                    'badFrame': true,
                                    'badFrameName': child.name,
                                    'troubleFound': true
                                });
                            }
                            if (child.type === 'RECTANGLE') {
                                // fill global style checker
                                const hasStyle = child.fillStyleId;
                                const hasStyleLength = hasStyle.length;
                                if (hasStyleLength === 0) {
                                    arrayError.push("Missing global fill style: " + child.name);
                                    figma.ui.postMessage({
                                        'badFill': true,
                                        'badFillLayer': child.name,
                                        'troubleFound': true
                                    });
                                }
                                // outside stroke checker
                                const strokeAttached = child.strokes;
                                const strokeAttachedLength = strokeAttached.length;
                                if (strokeAttachedLength === 1) {
                                    if (child.strokeAlign === 'CENTER' || child.strokeAlign === 'INSIDE') {
                                        arrayIssue.push("Stroke not outside: " + child.name);
                                        figma.ui.postMessage({
                                            'badStroke': true,
                                            'badStrokeLayer': child.name,
                                            'troubleFound': true
                                        });
                                    }
                                    // // border global style checker
                                    // const hasBorderStyle = child.strokeStyleId
                                    // const hasBorderStyleLength = hasBorderStyle.length
                                    // if (hasBorderStyleLength === 0) {
                                    //   arrayIssue.push("Missing global border style: " + child.name)
                                    //   figma.ui.postMessage({
                                    //     'badBorderFill': true,
                                    //     'badBorderFillLayer': child.name,
                                    //     'troubleFound': true
                                    //   }) 
                                    // }
                                }
                            }
                            if ("children" in child)
                                componentChildren(child.children);
                        });
                    }
                    componentChildren(nodes);
                    // console.log(arrayError)
                    // console.log(arrayIssue)
                    const arrayErrorLength = arrayError.length;
                    const arrayIssueLength = arrayIssue.length;
                    figma.ui.postMessage({
                        'errorLength': arrayErrorLength,
                        'errorArray': arrayError,
                        'issueLength': arrayIssueLength
                    });
                } // end if component
                // throw error if isnt a component
                else {
                    errorMsg();
                }
            });
        } // end else
    } // end function
    runPlugin();
    figma.ui.onmessage = msg => {
        if (msg.type === 'recheck') {
            runPlugin();
        }
    };
}, 100);
